import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Utility {

  getFirebaseTimeStamp(dateObj: any) {
    const date = new Date(
      dateObj._seconds * 1000 + dateObj._nanoseconds / 1e6
    );
    return date;
  }

  private sizeFormatter(bytes: number): string[] {
    if (bytes === 0) return ['0', 'B'];
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return [parseFloat((bytes / Math.pow(k, i)).toFixed(1)).toString(), sizes[i]];
  }

  getSizeWithUnit(bytes: number): string {
    const data = this.sizeFormatter(bytes);
    return data[0] + data[1];
  }

  getUnitbySize(bytes: number): string {
    const data = this.sizeFormatter(bytes);
    return data[1];
  }

  getSizeWithoutUnit(bytes: number): string {
    const data = this.sizeFormatter(bytes);
    return data[0];
  }

  getSizeInMB(bytes: number): string {
    if (bytes === 0) return '0';
    const k = 1024 * 1024;
    return (bytes / k).toFixed(2);
  }

  getPercentage(usedBytes: number, totalLimitInMB: number): number {
    if (!usedBytes || !totalLimitInMB) return 0;
    const totalBytes = totalLimitInMB * 1024 * 1024;
    const percentage = (usedBytes / totalBytes) * 100;
    return parseFloat(percentage.toFixed(2));
  }
}
