export interface User {
    id: string;
    name: string;
    email: string;
    mobile?: string;
    profileImage?: string;
    joinedDate?: Date;
    storageUsed?: number;
    storageLimit?: number;
    masterPin?: string;
}

export interface UpdateUser {
    mobileNumber?: string;
    masterPin?: string;
    displayName?: string;
}