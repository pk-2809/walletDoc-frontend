import { Component, ChangeDetectionStrategy, input, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QRCodeComponent } from 'angularx-qrcode';
import { LoadingService } from '../../../core/services/loading';
import { ToastService } from '../../../shared/services/toast';
import { UserService } from '../../../core/services/user';
import html2canvas from 'html2canvas';

export interface QrUser {
    name: string;
    email: string;
    qrData: string;
    joinedAt: string;
    profilePic: string;
}

@Component({
    selector: 'app-qr-id-card',
    standalone: true,
    imports: [CommonModule, QRCodeComponent],
    templateUrl: './qr-id-card.html',
    styleUrl: './qr-id-card.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class QrIdCardComponent {
    // Inputs
    user = input.required<QrUser>();

    // Outputs
    close = output<void>();

    private loadingService = inject(LoadingService);
    private toastService = inject(ToastService);
    private userService = inject(UserService);

    isDownloading = signal(false);

    closePopup() {
        this.close.emit();
    }

    downloadQrCard() {
        this.isDownloading.set(true);
        this.loadingService.show();
        const element = document.getElementById('qr-id-card');

        if (!element) {
            this.isDownloading.set(false);
            this.loadingService.hide();
            this.toastService.show('Could not find ID Card element', 'error');
            return;
        }

        // 1. Fetch Base64 Image if needed (to proxy CORS)
        this.userService.getProfilePicInBase64().subscribe({
            next: (base64Data) => {
                const imgElement = element.querySelector('img');
                const originalSrc = imgElement?.src;

                if (base64Data && imgElement) {
                    const imgSrc = base64Data.startsWith('data:') ? base64Data : `data:image/png;base64,${base64Data}`;
                    imgElement.src = imgSrc;
                }

                setTimeout(() => {
                    this.generateCanvas(element, imgElement, originalSrc);
                }, 100);
            },
            error: () => {
                // Fallback
                setTimeout(() => {
                    this.generateCanvas(element, null, null);
                }, 100);
            }
        });
    }

    private generateCanvas(element: HTMLElement, imgElement: HTMLImageElement | null | undefined, originalSrc: string | null | undefined) {
        html2canvas(element, {
            scale: 4,
            useCORS: true,
            backgroundColor: null,
            logging: false
        }).then(canvas => {
            // Revert src if changed
            if (imgElement && originalSrc) imgElement.src = originalSrc;

            const timestamp = Date.now();
            const link = document.createElement('a');
            link.download = `WalletDoc_${this.user().name.replace(/\s+/g, '_')}_${timestamp}.png`;
            link.href = canvas.toDataURL('image/png', 1.0);
            link.click();

            this.isDownloading.set(false);
            this.loadingService.hide();
            this.toastService.show('ID Card downloaded successfully!', 'success');
        }).catch(err => {
            console.error(err);
            if (imgElement && originalSrc) imgElement.src = originalSrc;
            this.isDownloading.set(false);
            this.loadingService.hide();
            this.toastService.show('Failed to download ID Card', 'error');
        });
    }
}
