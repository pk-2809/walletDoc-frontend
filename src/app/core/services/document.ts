import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { DocumentList } from '../models/dashboard.model';
import { Utility } from '../../shared/utils/utility';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class Document {

  private api = inject(ApiService);
  private utilityService = inject(Utility);
  public docData = signal<DocumentList | null>(null);

  uploadDocument(file: File | null, fileName: string) {
    const formData = new FormData();
    if (file) {
      if (fileName) {
        formData.append('document', file);
        formData.append('description', fileName);
      }
    }

    return new Observable(observer => {
      this.api.post('api/documents/upload', formData).subscribe({
        next: (_res: any) => {
          console.log(_res);
          observer.next(_res.data);
          observer.complete();
        },
        error: (err) => {
          console.log(err);
          observer.next(false);
          observer.complete();
        }
      })
    })
  }

  getDocument(id: string): Observable<DocumentList> {
    return new Observable(observer => {
      this.api.get(`api/documents/${id}`).subscribe({
        next: (response: any) => {
          if (response && response.success) {
            const data = response.data;
            const doc: DocumentList = {
              docId: data.id,
              docName: data.fileName,
              docSize: data.fileSize,
              uploadedTime: this.utilityService.getFirebaseTimeStamp(data.uploadedAt).toLocaleDateString(),
              isDocShow: true, // Defaulting to true as it's a single view
              docType: data.mimeType,
              docUrl: data.downloadURL
            };
            this.docData.set(doc);
            observer.next(doc);
            observer.complete();
          } else {
            observer.error('Document not found');
          }
        },
        error: (err) => observer.error(err)
      });
    });
  }

  deleteDocument(id: string): Observable<boolean> {
    return new Observable(observer => {
      this.api.delete(`api/documents/${id}`).subscribe({
        next: (response: any) => {
          if (response && response.success) {
            // this.router.navigate(['dashboard']);
            observer.next(true);
            observer.complete();
          } else {
            observer.error('Document not found');
          }
        },
        error: (err) => observer.error(err)
      });
    });
  }

  updateDocumentVisibility(id: string, isVisible: boolean): Observable<boolean> {
    return new Observable(observer => {
      const body = { isDocShow: isVisible };
      this.api.put(`api/documents/${id}/toggle-visibility`, body).subscribe({
        next: (response: any) => {
          if (response && response.success) {
            observer.next(true);
            observer.complete();
          } else {
            observer.next(false);
            observer.complete();
          }
        },
        error: (err) => {
          console.error(err);
          observer.error(err);
        }
      });
    });
  }
}
