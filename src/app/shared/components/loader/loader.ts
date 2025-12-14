import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../core/services/loading';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loadingService.isLoading()) {
      <div class="fixed inset-0 flex items-center justify-center z-[200] perspective-1000">
        <!-- Glass Backdrop -->
        <div class="absolute inset-0 bg-black/20 backdrop-blur-md transition-opacity duration-300"></div>

        <!-- Loader Container -->
        <div class="relative flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
          
          <!-- Animated Logo Core -->
          <div class="relative w-24 h-24 mb-6">
            <!-- Outer Ring -->
            <div class="absolute inset-0 border-4 border-[#4c49c3]/30 rounded-full animate-[spin_3s_linear_infinite]"></div>
            <div class="absolute inset-0 border-t-4 border-[#4c49c3] rounded-full animate-[spin_2s_linear_infinite]"></div>
            
            <!-- Inner Ring -->
            <div class="absolute inset-4 border-4 border-[#818cf8]/30 rounded-full animate-[spin_3s_linear_infinite_reverse]"></div>
            <div class="absolute inset-4 border-b-4 border-[#818cf8] rounded-full animate-[spin_2s_linear_infinite_reverse]"></div>

            <!-- Center Brand Core -->
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-8 h-8 bg-[#4c49c3] rounded-xl transform rotate-45 flex items-center justify-center shadow-lg shadow-indigo-500/50 animate-pulse">
                <div class="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
          </div>

          <!-- Text -->
          <div class="text-center relative z-10">
            <h2 class="text-lg font-black text-white tracking-[0.2em] mb-1">WALLET<span class="text-[#4c49c3]">DOC</span></h2>
            <div class="flex items-center justify-center gap-1 h-4">
              <span class="w-1.5 h-1.5 bg-[#4c49c3] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span class="w-1.5 h-1.5 bg-[#4c49c3] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span class="w-1.5 h-1.5 bg-[#4c49c3] rounded-full animate-bounce"></span>
            </div>
          </div>

        </div>
      </div>
    }
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoaderComponent {
  loadingService = inject(LoadingService);
}
