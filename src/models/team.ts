export interface Team {
    teamId: string;
    entityType: string; // team#Info | team#User
    sportType: string;
    teamName: string;
    location: {
        latitude: number;
        longitude: number;
    };
    status: string;
    requestedAt: string;
    joinedAt: string;
    role: string;
}