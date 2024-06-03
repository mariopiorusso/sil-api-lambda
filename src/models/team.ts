export interface Team {
    teamId: string;
    entityType: string;
    sportType: string;
    teamName: string;
    location: {
        latitude: number;
        longitude: number;
    };
    status: string;
    requestedAt: string; // ISO date string
    joinedAt: string; // ISO date string
    role: string;
}