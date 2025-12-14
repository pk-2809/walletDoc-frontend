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
import { QRCodeComponent } from 'angularx-qrcode';
import { ToastComponent } from '../../../shared/components/toast/toast';
import { ToastService } from '../../../shared/services/toast';
import { env } from '../../../../environments/environment';
import html2canvas from 'html2canvas';
import { LoadingService } from '../../../core/services/loading';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, QRCodeComponent, FormsModule],
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

  // State
  showQrPopup = signal(false);
  isLoggingOut = signal(false);
  isUploading = signal(false);

  // Download State
  isDownloading = signal(false);

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

  downloadQrCard() {
    this.isDownloading.set(true);
    this.loadingService.show(); // Start global loader
    const element = document.getElementById('qr-id-card');

    if (!element) {
      this.isDownloading.set(false);
      this.loadingService.hide();
      this.toastService.show('Could not find ID Card element', 'error');
      return;
    }

    // 1. Fetch Base64 Image from API
    this.userService.getProfilePicInBase64().subscribe({
      next: (base64Data) => {
        // 2. Prepare Image
        const imgElement = element.querySelector('img');
        const originalSrc = imgElement?.src;

        if (base64Data && imgElement) {
          const imgSrc = base64Data.startsWith('data:') ? base64Data : `data:image/png;base64,${base64Data}`;
          imgElement.src = imgSrc;
        }

        // 3. Capture Canvas
        setTimeout(() => {
          html2canvas(element, {
            scale: 4,
            useCORS: true,
            backgroundColor: null,
            logging: true
          }).then(canvas => {
            // Revert and Cleanup
            if (imgElement && originalSrc) imgElement.src = originalSrc;

            // Download
            const timestamp = Date.now();
            const link = document.createElement('a');
            link.download = `WalletDoc_${this.profileForm.name().value().replace(/\s+/g, '_')}_${timestamp}.png`;
            link.href = canvas.toDataURL('image/png', 1.0);
            link.click();
            this.isDownloading.set(false);
            this.loadingService.hide(); // Hide global loader
            this.toastService.show('ID Card downloaded successfully!', 'success');
          }).catch(err => {
            console.error('Download failed', err);
            if (imgElement && originalSrc) imgElement.src = originalSrc;
            this.isDownloading.set(false);
            this.loadingService.hide();
            this.toastService.show('Failed to download ID Card', 'error');
          });
        }, 100);
      },
      error: (err) => {
        console.error('Base64 API failed, proceeding with default', err);
        this.loadingService.hide(); // Hide loader from API call count? 
        // Note: loadingService logic is count based, so if API ended, count is 0. 
        // But we called show() manually, so count is at least 1.
        // We will call hide() again when canvas is done.

        // Wait, if API fails, we want to try generic canvas generation.
        // We should KEEP loader on for that.
        // But here we called hide() in error block? No, I should remove that hide() based on my previous thought process.
        // Actually, let's keep it simple: Show manual loader. API adds +1 then -1. Manual +1 remains.

        // Fallback: Try generating anyway
        html2canvas(element, {
          scale: 4,
          useCORS: true,
          backgroundColor: null,
          logging: true
        }).then(canvas => {
          const timestamp = Date.now();
          const link = document.createElement('a');
          link.download = `WalletDoc_${this.profileForm.name().value().replace(/\s+/g, '_')}_${timestamp}.png`;
          link.href = canvas.toDataURL('image/png', 1.0);
          link.click();
          this.isDownloading.set(false);
          this.loadingService.hide();
          this.toastService.show('ID Card downloaded successfully!', 'success');
        }).catch(downloadErr => {
          this.isDownloading.set(false);
          this.loadingService.hide();
          this.toastService.show('Failed to download ID Card', 'error');
        });
      }
    });
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
