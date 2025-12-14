import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Location } from '@angular/common';
import { Document } from '../../core/services/document';
import { DocumentList } from '../../core/models/dashboard.model';
import { catchError, of, tap } from 'rxjs';
import { LoadingService } from '../../core/services/loading';

export const previewResolver: ResolveFn<DocumentList | null> = (route, state) => {

  const document = inject(Document);
  const location = inject(Location);
  const loadingService = inject(LoadingService);
  const id = route.paramMap.get("id");

  // Keep loader visible during transition
  loadingService.show();

  return document.getDocument(id || "").pipe(
    catchError(() => {
      loadingService.hide(); // Hide if error
      location.back();
      return of(null)
    })
  );
};