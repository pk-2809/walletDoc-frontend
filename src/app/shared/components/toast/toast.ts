
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] flex flex-col-reverse space-y-reverse space-y-3 pointer-events-none items-center">
      @for (toast of toastService.toasts(); track toast.id) {
        <div 
          class="pointer-events-auto min-w-[300px] bg-gray-900 text-white rounded-full px-6 py-3 shadow-xl transform transition-all animate-[slideUpFade_0.3s_ease-out] flex items-center gap-4"
        >
          
          <!-- Minimal Icon -->
          <div class="shrink-0">
             @if (toast.type === 'success') {
               <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
             } @else if (toast.type === 'error') {
               <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
             } @else {
               <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
             }
          </div>

          <!-- Content -->
          <p class="text-sm font-medium tracking-wide whitespace-nowrap flex-1">{{ toast.message }}</p>
          
          <!-- Optional Close (keep it subtle or remove for true minimal) -->
          <!-- Keeping it very subtle -->
          <button (click)="toastService.remove(toast.id)" 
            class="ml-auto text-gray-500 hover:text-white transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slideUpFade {
      from { opacity: 0; transform: translateY(20px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastComponent {
  toastService = inject(ToastService);
}
