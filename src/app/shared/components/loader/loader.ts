import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../core/services/loading';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loadingService.isLoading()) {
      <div class="fixed inset-0 bg-[#1e3a8a] bg-opacity-95 flex items-center justify-center z-50 backdrop-blur-sm">
        <div class="flex flex-col items-center space-y-8">
          <!-- Circular Progress Ring -->
          <div class="relative w-32 h-32">
            <!-- Background circle -->
            <svg class="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                stroke-width="8"
                fill="none"
                class="text-white text-opacity-20"
              />
              <!-- Animated circle -->
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                stroke-width="8"
                fill="none"
                stroke-linecap="round"
                class="text-white animate-spin-slow"
                style="stroke-dasharray: 350; stroke-dashoffset: 100;"
              />
            </svg>
            
            <!-- Center icon -->
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center animate-pulse-slow">
                <svg class="w-8 h-8 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <!-- Loading text -->
          <div class="text-center">
            <p class="text-white font-bold text-2xl mb-2 tracking-wider">LOADING</p>
            <div class="flex items-center justify-center space-x-2">
              <div class="w-2 h-2 bg-white rounded-full animate-bounce-delay-0"></div>
              <div class="w-2 h-2 bg-white rounded-full animate-bounce-delay-1"></div>
              <div class="w-2 h-2 bg-white rounded-full animate-bounce-delay-2"></div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    @keyframes pulse-slow {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.05); opacity: 0.8; }
    }
    
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
    
    .animate-spin-slow {
      animation: spin-slow 2s linear infinite;
    }
    
    .animate-pulse-slow {
      animation: pulse-slow 2s ease-in-out infinite;
    }
    
    .animate-bounce-delay-0 {
      animation: bounce 1s infinite;
      animation-delay: 0s;
    }
    
    .animate-bounce-delay-1 {
      animation: bounce 1s infinite;
      animation-delay: 0.2s;
    }
    
    .animate-bounce-delay-2 {
      animation: bounce 1s infinite;
      animation-delay: 0.4s;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoaderComponent {
  loadingService = inject(LoadingService);
}
