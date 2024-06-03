export interface BuddyRequest {
    userId: string;
    buddyId: string;
    status: 'pending' | 'accepted' | 'declined';
    sentAt: string;
  }