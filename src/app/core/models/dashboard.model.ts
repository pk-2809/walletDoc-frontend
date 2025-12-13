export interface Dashboard {
    id: string,
    totalDocs: number,
    storageUsed: number,
    documentList: DocumentList[]
}

export interface DocumentList {
    docId: string,
    docName: string,
    docType: string,
    docSize: number,
    uploadedTime: string,
    isDocShow: boolean,
    docUrl?: string
}

export interface DocumentDetail {
    id: string;
    userId: string;
    fileName: string;
    storagePath: string;
    downloadURL: string;
    fileSize: number;
    mimeType: string;
    documentType: string;
    description: string;
    uploadedAt: { _seconds: number, _nanoseconds: number };
    updatedAt: { _seconds: number, _nanoseconds: number };
}