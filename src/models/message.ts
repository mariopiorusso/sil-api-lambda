export interface Message {
    eventId: string;
    messageId: string;
    createdAt: string;
    postedBy: string;
    content: string;
    imageS3Key?: string;
}