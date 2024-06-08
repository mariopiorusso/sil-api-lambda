export interface BuddyMessage {
    eventId: string;
    messageId: string;
    createdAt: string;
    postedBy: string;
    text: string;
    imageS3Key?: string;
}