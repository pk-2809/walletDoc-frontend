import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Location } from '@angular/common';
import { Document } from '../../core/services/document';
import { DocumentList } from '../../core/models/dashboard.model';
import { catchError, of } from 'rxjs';

export const previewResolver: ResolveFn<DocumentList | null> = (route, state) => {

  const document = inject(Document);
  const location = inject(Location);
  const id = route.paramMap.get("id");

  return document.getDocument(id || "").pipe(
    catchError(() => {
      location.back();
      return of(null)
    })
  );
};