import { Component, inject, signal, computed, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { authSignals } from '../../state/auth-signals';
import { UploadDocumentComponent } from './upload-document/upload-document';
import { UserService } from '../../core/services/user';
import { Document as DocumentService } from '../../core/services/document'; // Renaming to avoid clash with interface
import { DocumentList } from '../../core/models/dashboard.model';
import { Utility } from '../../shared/utils/utility';
import { QrIdCardComponent, QrUser } from '../../shared/components/qr-id-card/qr-id-card';

interface Document {
  id: string;
  name: string;
  size: string;
  date: string;
  icon: 'doc' | 'img';
  isVisible: boolean;
  rawSize: number; // for sorting
  rawDate: Date;   // for sorting
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, UploadDocumentComponent, QrIdCardComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  private router = inject(Router);
  public userService = inject(UserService);
  private utilityService = inject(Utility);
  auth = authSignals;

  userName = this.auth.user()?.name || 'Wallet Doc';

  stats = {
    totalDocs: 0,
    totalSize: '0',
    sizeUnit: '',
    profileImage: '',
    usedPercentage: 0,
    totalStorageLimit: 50
  };

  showUploadModal = signal(false);
  showQrPopup = signal(false);
  sortOption = signal<'date' | 'name' | 'size'>('date');

  // Computed QrUser for the shared component
  qrUser = computed<QrUser>(() => {
    const user = this.userService.currentUser();
    return {
      name: user?.name || '',
      email: user?.email || '',
      qrData: `${window.location.origin}/verify-pin?scanId=${user?.id}`,
      joinedAt: this.utilityService.getFirebaseTimeStamp(user?.joinedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) || '',
      profilePic: user?.profileImage || ''
    };
  });

  // Loading States
  openingDocId = signal<string | null>(null);
  togglingDocId = signal<string | null>(null);

  private rawDocuments = signal<Document[]>([]);

  ngOnInit() {
    const userDocuments = this.userService.dashboardData();
    if (userDocuments) {
      this.stats.totalDocs = userDocuments?.totalDocs || 0;
      this.stats.totalSize = this.utilityService.getSizeWithoutUnit(userDocuments?.storageUsed || 0);
      this.stats.sizeUnit = this.utilityService.getUnitbySize(userDocuments?.storageUsed || 0);
      this.stats.profileImage = this.userService.currentUser()?.profileImage || '';

      const used = userDocuments?.storageUsed || 0;
      this.stats.usedPercentage = this.utilityService.getPercentage(used, this.stats.totalStorageLimit);

      userDocuments?.documentList.forEach((docItem: DocumentList) => {
        const doc: Document = {
          id: docItem.docId,
          name: docItem.docName,
          size: this.utilityService.getSizeWithUnit(docItem.docSize || 0),
          isVisible: docItem.isDocShow,
          date: docItem.uploadedTime,
          icon: docItem.docType.includes('pdf') ? 'doc' : 'img',
          rawSize: docItem.docSize,
          rawDate: new Date(docItem.uploadedTime)
        };
        this.rawDocuments.update((currentList) => [...currentList, doc]);
      });
    }
    else {
      sessionStorage.clear();
      localStorage.clear();
      this.router.navigate(['/login']);
    }
  }

  // Computed Sorted Documents
  documents = computed(() => {
    const docs = [...this.rawDocuments()];
    const sort = this.sortOption();

    return docs.sort((a, b) => {
      if (sort === 'date') return b.rawDate.getTime() - a.rawDate.getTime();
      if (sort === 'size') return b.rawSize - a.rawSize;
      if (sort === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
  });

  onProfileSelect() {
    this.router.navigate(['/dashboard/profile']);
  }

  // QR Logic
  toggleQrPopup() {
    this.showQrPopup.update(val => !val);
  }

  closeQrPopup() {
    this.showQrPopup.set(false);
  }

  // Upload Logic
  openUploadModal() {
    this.showUploadModal.set(true);
  }

  closeUploadModal() {
    this.showUploadModal.set(false);
  }

  handleUpload(event: Document) {
    this.rawDocuments.update(docs => [event, ...docs]);
    const totalSize = this.rawDocuments().reduce((sum, doc) => sum + (doc.rawSize || 0), 0);
    this.stats.totalSize = this.utilityService.getSizeWithoutUnit(totalSize);
    this.stats.sizeUnit = this.utilityService.getUnitbySize(totalSize);
    this.stats.totalDocs++;
  }

  private documentService = inject(DocumentService);

  toggleVisibility(doc: Document) {
    // Prevent interaction if any action is in progress
    if (this.togglingDocId() || this.openingDocId()) return;

    this.togglingDocId.set(doc.id);
    const newStatus = !doc.isVisible;

    this.documentService.updateDocumentVisibility(doc.id, newStatus).subscribe({
      next: (success) => {
        if (success) {
          this.rawDocuments.update(docs =>
            docs.map(d => d.id === doc.id ? { ...d, isVisible: newStatus } : d)
          );
        }
        this.togglingDocId.set(null);
      },
      error: () => {
        // Revert or show error
        this.togglingDocId.set(null);
      }
    });
  }

  openDocument(doc: Document) {
    if (this.openingDocId() || this.togglingDocId()) return;

    this.openingDocId.set(doc.id);
    this.router.navigate(['/dashboard/preview', doc.id]);
    this.openingDocId.set(null);
  }

  setSort(option: 'date' | 'name' | 'size') {
    this.sortOption.set(option);
  }
}
