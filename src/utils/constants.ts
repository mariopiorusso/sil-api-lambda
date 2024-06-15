export const TABLE = {
    Events: 'SILEvents',
    Teams: 'SILTeams',
    Users: 'SILUsers',
    Buddies: 'SILBuddies',
    Messages: 'SILMessages',
    BuddyMessages: 'SILBuddyMessages'
};

export const TABLE_GSIS = {
    EventIdEntityTypeGSI: 'EventIdGSI'
}

// Recommend hashKeyLength = 5 for 10km radius searches
// https://github.com/robhogan/dynamodb-geo.js/blob/master/test/integration/hashKeyLength.ts
export const GEO_HASHKEY_LENGTH = 5;