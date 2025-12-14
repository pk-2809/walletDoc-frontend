import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { authSignals } from '../../../state/auth-signals';
import { AuthService } from '../../auth/auth';
import { form } from '@angular/forms/signals';
import { UserService } from '../../../core/services/user';
import { User } from '../../../core/models/user.model';
import { isValidEmail, isValidMobile } from '../../../shared/utils/validators';
import { Utility } from '../../../shared/utils/utility';
import { ToastComponent } from '../../../shared/components/toast/toast';
import { ToastService } from '../../../shared/services/toast';
import { env } from '../../../../environments/environment';
import { LoadingService } from '../../../core/services/loading';
import { QrIdCardComponent, QrUser } from '../../../shared/components/qr-id-card/qr-id-card';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, QrIdCardComponent],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private utility = inject(Utility);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private loadingService = inject(LoadingService);
  private env = env.BASE_URL;

  auth = authSignals;

  // ... (rest of the file)



  profile = signal({
    profilePic: '',
    name: '',
    mobileNumber: '',
    email: '',
    masterPin: '',
    qrData: '',
    sizeUsed: '',
    totalSize: 50,
    usedPercentage: 0,
    joinedAt: '',
    updatedAt: ''
  });

  profileForm = form(this.profile);

  // Computed QrUser for the shared component
  qrUser = computed<QrUser>(() => ({
    name: this.profileForm.name().value() || '',
    email: this.profileForm.email().value() || '',
    qrData: this.profileForm.qrData().value() || '',
    joinedAt: this.profileForm.joinedAt().value() || '',
    profilePic: this.profileForm.profilePic().value() || ''
  }));

  // State
  showQrPopup = signal(false);
  isLoggingOut = signal(false);
  isUploading = signal(false);

  // M-PIN State
  showPinPopup = signal(false);
  isUpdatingPin = signal(false);
  newPin = signal('');

  // Editing State
  isEditingMobile = signal(false);
  isUpdatingMobile = signal(false); // Loader for mobile
  newMobile = signal('');

  appVersion = env.appVersion;

  constructor() {
    console.log(this.userService.currentUser());
    const resData: User | null = this.userService.currentUser();
    const userData = {
      profilePic: resData?.profileImage || '',
      name: resData?.name || '',
      mobileNumber: resData?.mobile || '',
      email: resData?.email || '',
      masterPin: resData?.masterPin || '',
      qrData: `${window.location.origin}/verify-pin?scanId=${resData?.id}`,
      sizeUsed: this.utility.getSizeWithUnit(resData?.storageUsed || 0),
      totalSize: resData?.storageLimit || 0,
      usedPercentage: this.utility.getPercentage(resData?.storageUsed || 0, resData?.storageLimit || 0),
      joinedAt: this.getDateInFormat(resData?.joinedDate || new Date()),
      updatedAt: '2025-01-10'
    };
    this.profile.set(userData);
    this.setProfilePicture(resData?.profileImage);
  }

  private getDateInFormat(date: any) {
    if (date._nanoseconds) {
      date = this.utility.getFirebaseTimeStamp(date);
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  toggleQrPopup() {
    this.showQrPopup.update(val => !val);
    console.log(this.profileForm.qrData().value());
  }

  closeQrPopup() {
    this.showQrPopup.set(false);
  }

  private setProfilePicture(imgUrl: string = "", isShowToast: boolean = false) {
    this.isUploading.set(true);

    const newImage = new Image();
    newImage.src = imgUrl;
    newImage.onload = () => {
      this.isUploading.set(false);
      this.profile.update(p => ({
        ...p,
        profilePic: imgUrl
      }));
      if (isShowToast)
        this.toastService.show('Profile picture updated successfully!', 'success');
    };
    newImage.onerror = () => {
      this.isUploading.set(false);
      this.profile.update(p => ({
        ...p,
        profilePic: imgUrl
      }));
      if (isShowToast)
        this.toastService.show('Profile picture updated, but image failed to load.', 'info');
    };
  }

  // M-PIN Logic
  openPinPopup() {
    this.newPin.set('');
    this.showPinPopup.set(true);
  }

  closePinPopup() {
    this.showPinPopup.set(false);
    this.newPin.set('');
  }

  savePin() {
    const pin = this.newPin().trim();
    if (!pin) {
      this.toastService.show('Please enter a PIN', 'error');
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      this.toastService.show('M-PIN must be exactly 4 digits', 'error');
      return;
    }

    this.isUpdatingPin.set(true);
    this.userService.updateUserDetails({ masterPin: pin }).subscribe({
      next: (res) => {
        this.profile.update(p => ({ ...p, masterPin: '****' })); // Keep masked
        this.isUpdatingPin.set(false);
        this.closePinPopup();
        this.toastService.show('Master PIN updated successfully', 'success');
      },
      error: (err) => {
        this.isUpdatingPin.set(false);
        this.toastService.show('Failed to update Master PIN', 'error');
      }
    });
  }

  onLogout() {
    this.isLoggingOut.set(true);
    this.authService.logout().subscribe({
      next: (res) => {
        console.log(res);
        this.toastService.show('Logged out successfully', 'success');
        this.isLoggingOut.set(false);
      },
      error: (err) => {
        console.log(err);
        this.toastService.show(err.message || 'Logout failed', 'error');
        this.isLoggingOut.set(false);
      }
    })
  }

  onUploadPhoto() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        this.uploadFile(file);
      }
    };
    fileInput.click();
  }

  uploadFile(file: File) {
    if (file.size > 2 * 1024 * 1024) {
      this.toastService.show('Image size should be less than 2MB', 'error');
      return;
    }

    this.isUploading.set(true);
    this.userService.updateProfilePicture(file).subscribe({
      next: (res) => {
        console.log('Upload success:', res);

        if (res.profilePicture) {
          this.setProfilePicture(res.profilePicture);
        } else {
          this.isUploading.set(false);
          this.toastService.show('Profile picture updated!', 'success');
        }
      },
      error: (err) => {
        console.error('Upload error:', err);
        this.isUploading.set(false);
        this.toastService.show('Failed to update profile picture. Please try again.', 'error');
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  onChangePin() {
    this.openPinPopup();
  }

  // Mobile Editing
  startEditMobile() {
    this.newMobile.set(this.profile().mobileNumber || '');
    this.isEditingMobile.set(true);
  }

  cancelEditMobile() {
    this.isEditingMobile.set(false);
    this.newMobile.set('');
  }

  saveMobile() {
    const mobile = this.newMobile().trim();
    if (!mobile) {
      this.toastService.show('Please enter a mobile number', 'error');
      return;
    }

    if (!isValidMobile(mobile)) {
      this.toastService.show('Mobile number must be exactly 10 digits', 'error');
      return;
    }

    this.isUpdatingMobile.set(true);
    this.userService.updateUserDetails({ mobileNumber: mobile }).subscribe({
      next: (res) => {
        this.profile.update(p => ({ ...p, mobileNumber: mobile }));
        this.isEditingMobile.set(false);
        this.isUpdatingMobile.set(false);
        this.toastService.show('Mobile number updated successfully', 'success');
      },
      error: (err) => {
        this.isUpdatingMobile.set(false);
        this.toastService.show('Mobile number update failed', 'error');
      }
    })
  }
}
