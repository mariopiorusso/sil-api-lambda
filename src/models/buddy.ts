export interface Buddy {
    userId: string;
    buddyId: string;
    status: 'pending' | 'accepted' | 'declined';
    sentAt: string;
    connectionDate: string;
}