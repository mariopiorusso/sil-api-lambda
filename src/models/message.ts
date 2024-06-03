export interface Message {
    eventId: string;
    messageId: string;
    createdAt: string; // ISO date string
    postedBy: string;
    text: string;
    imageS3Key?: string;
}