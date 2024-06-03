export interface Event {
    eventId: string;
    entityType: string;
    sportType: string;
    location: {
        latitude: number;
        longitude: number;
    };
    title: string;
    schedule: string; // ISO date string
    description: string;
    status: string;
    requestedAt: string; // ISO date string
    joinedAt: string; // ISO date string
    role: string;
}