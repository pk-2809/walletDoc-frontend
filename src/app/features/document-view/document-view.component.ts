import { Component, inject, signal, ViewChild, ElementRef, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Utility } from '../../shared/utils/utility';
import { SafePipe } from '../../shared/pipes/safe.pipe';
import { Document } from '../../core/services/document';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { UserService } from '../../core/services/user';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../shared/services/toast.service';

@Component({
    selector: 'app-document-view',
    standalone: true,
    imports: [CommonModule, SafePipe, ConfirmDialogComponent],
    templateUrl: './document-view.component.html',
    styleUrl: './document-view.component.css'
})
export class DocumentViewComponent {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    public utilityService = inject(Utility);
    private documentService = inject(Document);
    public userService = inject(UserService);
    private toastService = inject(ToastService);

    docId = signal<string | null>(null);
    private documentData = toSignal(
        this.route.data.pipe(map(data => data['docData'] ?? null))
    );
    document = computed(() => this.documentData());
    @ViewChild('imageRef') imageRef?: ElementRef<HTMLImageElement>;
    zoomLevel = signal(1);
    panX = signal(0);
    panY = signal(0);
    isDragging = signal(false);
    startX = 0;
    startY = 0;

    // UI State
    showControls = signal(true);

    goBack() {
        this.router.navigate(['/dashboard']);
    }

    async shareDocument() {
        const doc = this.document();
        if (!doc) return;

        const shareData = {
            title: doc.docName,
            text: 'Check out this document',
            url: doc.docUrl || window.location.href
        };

        // 1. Try Native Share
        try {
            if (navigator.share) {
                await navigator.share(shareData);
                return; // Shared successfully
            }
        } catch (err) {
            console.warn('Native share failed or dismissed', err);
            // Continue to fallback
        }

        // 2. Fallback: Clipboard API
        try {
            await navigator.clipboard.writeText(shareData.url);
            this.toastService.show('Link copied to clipboard!', 'success');
        } catch (clipboardErr) {
            console.error('Clipboard failed', clipboardErr);

            // 3. Ultimate Fallback: Prompt (Works in insecure contexts too)
            // This ensures the user definitely gets the URL even if everything else fails
            const manualCopy = confirm('Share not supported. Copy link manually?\n' + shareData.url);
            if (manualCopy) {
                // We can't actually copy effectively here without user interaction on a specific element, 
                // but we can try prompting or just showing it.
                // Mobile browsers often allow copying from a prompt input if we used prompt().
                prompt('Copy this link:', shareData.url);
            } else {
                this.toastService.show('Could not share link', 'error');
            }
        }
    }

    get isPdf() {
        return this.document()?.docType.includes('pdf');
    }

    // --- Image Gestures (Simple version) ---

    zoomIn() {
        this.zoomLevel.update(z => Math.min(z + 0.5, 4));
    }

    zoomOut() {
        this.zoomLevel.update(z => Math.max(z - 0.5, 1));
        if (this.zoomLevel() === 1) {
            this.resetPan();
        }
    }

    resetZoom() {
        this.zoomLevel.set(1);
        this.resetPan();
    }

    resetPan() {
        this.panX.set(0);
        this.panY.set(0);
    }

    // Mouse/Touch Events for Panning (Basic)
    startDrag(event: MouseEvent | TouchEvent) {
        if (this.zoomLevel() <= 1) return;
        this.isDragging.set(true);

        if (event instanceof MouseEvent) {
            this.startX = event.clientX - this.panX();
            this.startY = event.clientY - this.panY();
        } else {
            this.startX = event.touches[0].clientX - this.panX();
            this.startY = event.touches[0].clientY - this.panY();
        }
    }

    onDrag(event: MouseEvent | TouchEvent) {
        if (!this.isDragging()) return;
        event.preventDefault(); // Prevent scrolling while dragging

        let clientX, clientY;
        if (event instanceof MouseEvent) {
            clientX = event.clientX;
            clientY = event.clientY;
        } else {
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        }

        this.panX.set(clientX - this.startX);
        this.panY.set(clientY - this.startY);
    }

    endDrag() {
        this.isDragging.set(false);
    }

    // Double tap to zoom
    lastTap = 0;
    handleDoubleTap(e: any) {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - this.lastTap;
        if (tapLength < 300 && tapLength > 0) {
            if (this.zoomLevel() > 1) {
                this.resetZoom();
            } else {
                this.zoomIn();
            }
        }
        this.lastTap = currentTime;
    }


    // --- Delete Logic ---
    showDeleteConfirm = signal(false);
    isDeleting = signal(false);

    onDeleteClick() {
        this.showDeleteConfirm.set(true);
    }

    cancelDelete() {
        if (this.isDeleting()) return;
        this.showDeleteConfirm.set(false);
    }

    confirmDelete() {
        if (this.document()) {
            this.isDeleting.set(true);
            this.documentService.deleteDocument(this.document()?.docId || '').subscribe({
                next: () => {
                    this.userService.clearUser();
                    this.isDeleting.set(false);
                    this.showDeleteConfirm.set(false);
                    this.toastService.show('Document deleted successfully', 'success');
                    this.goBack();
                },
                error: (err) => {
                    console.error(err);
                    this.isDeleting.set(false);
                    this.showDeleteConfirm.set(false);
                    this.toastService.show(err.message || 'Failed to delete document', 'error');
                }
            });
        }
    }

    toggleControls() {
        this.showControls.update(v => !v);
    }
}
