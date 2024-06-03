export interface User {
    userId: string;
    name: string;
    email: string;
    sportsInterests: string[];
    location: {
        latitude: number;
        longitude: number;
    };
    skillLevel: string;
    ratings: number;
}