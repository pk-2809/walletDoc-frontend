
import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div (click)="onCancel()" class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"></div>
      
      <!-- Modal Content -->
      <div class="bg-white rounded-[2.5rem] p-8 w-full max-w-sm relative z-10 shadow-2xl transform transition-all animate-[bounceIn_0.5s_cubic-bezier(0.175,0.885,0.32,1.275)]">
        
        <div class="text-center">
          <!-- Icon (Warning) -->
          <div class="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
             <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
             </svg>
          </div>

          <h3 class="text-2xl font-black text-gray-900 mb-2">{{ title() }}</h3>
          <p class="text-gray-500 text-sm mb-8 px-4 leading-relaxed">{{ message() }}</p>
          
          <div class="flex space-x-3">
             <button (click)="onCancel()" [disabled]="isLoading()" 
               class="flex-1 py-4 px-4 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-colors uppercase text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed">
               {{ cancelText() }}
             </button>
             <button (click)="onConfirm()" [disabled]="isLoading()" 
               class="flex-1 py-4 px-4 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all uppercase text-sm tracking-wide active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center">
               @if (isLoading()) {
                 <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                   <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 Processing...
               } @else {
                 {{ confirmText() }}
               }
             </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ConfirmDialogComponent {
  title = input('Are you sure?');
  message = input('This action cannot be undone.');
  confirmText = input('Delete');
  cancelText = input('Cancel');
  isLoading = input(false);

  confirm = output<void>();
  cancel = output<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}
