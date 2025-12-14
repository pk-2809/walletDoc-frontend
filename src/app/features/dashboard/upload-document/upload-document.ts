import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Document } from '../../../core/services/document';
import { Utility } from '../../../shared/utils/utility';

interface DocumentModel {
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
  selector: 'app-upload-document',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-60 flex items-center justify-center px-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" (click)="close()"></div>

      <!-- Modal -->
      <div class="bg-white rounded-4xl w-full max-w-sm p-6 relative z-10 shadow-2xl animate-in fade-in zoom-in duration-200">
        
        @if (!isSuccess()) {
          <!-- Header -->
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-black text-gray-900 uppercase tracking-wide">Add Document</h2>
            <button (click)="close()" class="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <!-- Form -->
          <div class="space-y-6">
            <!-- Name Input -->
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Document Name</label>
              <input type="text" [(ngModel)]="docName" placeholder="e.g. Driving License" 
                class="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:border-[#4c49c3] focus:ring-4 focus:ring-[#4c49c3]/10 outline-none transition-all font-medium">
            </div>

            <!-- File Picker -->
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Upload File</label>
              <div class="relative group cursor-pointer" (click)="fileInput.click()">
                <input #fileInput type="file" class="hidden" (change)="onFileSelected($event)" accept="image/*,application/pdf">
                <div class="w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center bg-gray-50 group-hover:bg-blue-50 group-hover:border-blue-300 transition-colors">
                  @if (selectedFile()) {
                    <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-2">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                    <p class="text-sm font-bold text-gray-900">{{ selectedFile()?.name }}</p>
                    <p class="text-xs text-gray-500 mt-1">{{ utilityService.getSizeWithUnit(selectedFile()?.size || 0) }}</p>
                  } @else {
                    <div class="w-12 h-12 bg-gray-200 text-gray-400 rounded-xl flex items-center justify-center mb-2 group-hover:bg-blue-200 group-hover:text-blue-600 transition-colors">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                    </div>
                    <p class="text-sm font-bold text-gray-500 group-hover:text-blue-600 transition-colors">Tap to browse</p>
                    <p class="text-xs text-gray-400 mt-1">PDF, JPG, PNG up to 10MB</p>
                  }
                </div>
              </div>
            </div>

            <!-- Upload Button -->
            <button (click)="upload()" [disabled]="!docName || !selectedFile()"
              class="w-full bg-[#4c49c3] text-white py-4 rounded-2xl font-bold text-base tracking-wider shadow-lg shadow-indigo-500/30 hover:bg-[#5855d6] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none uppercase">
              Upload Document
            </button>
          </div>
        }



        @if (isSuccess()) {
          <div class="flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
            <div class="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/20">
              <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h3 class="text-xl font-black text-gray-900 uppercase tracking-wide mb-2">Success!</h3>
            <p class="text-gray-500 text-sm font-medium mb-8">Your document is safe and ready.</p>
            <button (click)="finish()" class="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold uppercase tracking-wider hover:bg-black transition-colors">
              Done
            </button>
          </div>
        }

      </div>
    </div>
  `,
  styles: []
})
export class UploadDocumentComponent {
  @Output() closeEvent = new EventEmitter<void>();
  @Output() uploadEvent = new EventEmitter<DocumentModel>();

  docName = '';
  selectedFile = signal<File | null>(null);
  isUploading = signal(false);
  isSuccess = signal(false);

  private documentService = inject(Document);
  public utilityService = inject(Utility);

  close() {
    this.closeEvent.emit();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.match('image.*') && !file.type.match('application/pdf')) {
        alert('Only images and PDFs are allowed.');
        return;
      }
      this.selectedFile.set(file);
      // Auto-fill name if empty
      if (!this.docName) {
        this.docName = file.name.split('.')[0];
      }
    }
  }

  upload() {
    if (!this.docName || !this.selectedFile()) return;

    this.isUploading.set(true);

    this.documentService.uploadDocument(this.selectedFile(), this.docName).subscribe({
      next: (value: any) => {
        console.log(value);
        this.isUploading.set(false);
        this.isSuccess.set(true);
        this.uploadEvent.emit({
          id: value.documentId,
          name: value.fileName,
          size: this.utilityService.getSizeWithUnit(value.fileSize),
          date: new Date(value.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          icon: value.documentType.includes('image') ? 'img' : 'doc',
          isVisible: true,
          rawSize: value.fileSize,
          rawDate: new Date(value.uploadedAt)
        });
      },
      error: (err) => {
        console.log(err);
        this.isUploading.set(false);
        this.isSuccess.set(false);
      }
    })

  }

  finish() {
    this.close();
  }
}
