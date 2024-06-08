export interface Event {
    eventId: string;
    entityType: string; // event#Info | event#User
    sportType: string;
    location: {
        latitude: number;
        longitude: number;
    };
    title: string;
    schedule: string;
    description: string;
    userId: string,
    userStatus: string;
    requestedAt: string;
    joinedAt: string;
    role: string;
}