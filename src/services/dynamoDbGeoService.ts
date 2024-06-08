import * as AWS from 'aws-sdk';
import * as ddbGeo from 'dynamodb-geo';
import { v4 as uuidv4 } from 'uuid';
import { Event } from '../models/event';
import { Team } from '../models/team';
import { User } from '../models/user';
import { convertToDynamoDBItem } from '../utils/utils';
import { GEO_HASHKEY_LENGTH, TABLE } from '../utils/constants';

const ddb = new AWS.DynamoDB.DocumentClient();

// Configuration for events
const eventConfig = new ddbGeo.GeoDataManagerConfiguration(ddb, TABLE.Events);
eventConfig.hashKeyLength = GEO_HASHKEY_LENGTH;
const eventGeoTableManager = new ddbGeo.GeoDataManager(eventConfig);

// Configuration for teams
const teamConfig = new ddbGeo.GeoDataManagerConfiguration(ddb, TABLE.Teams);
teamConfig.hashKeyLength = GEO_HASHKEY_LENGTH;
const teamGeoTableManager = new ddbGeo.GeoDataManager(teamConfig);

// Configuration for users
const userConfig = new ddbGeo.GeoDataManagerConfiguration(ddb, TABLE.Users);
userConfig.hashKeyLength = GEO_HASHKEY_LENGTH;
const userGeoTableManager = new ddbGeo.GeoDataManager(userConfig);

// Event functions
export const createEvent = async (data: Event): Promise<Event> => {
  const eventId = uuidv4();
  const { location, ...otherData } = data;
  const params = {
    RangeKeyValue: { S: eventId },
    GeoPoint: {
      latitude: location.latitude,
      longitude: location.longitude,
    },
    PutItemInput: {
      Item: {
        eventId: { S: eventId },
        ...convertToDynamoDBItem(otherData),
        location: {
          M: {
            latitude: { N: location.latitude.toString() },
            longitude: { N: location.longitude.toString() },
          }
        },
        createdAt: { S: new Date().toISOString() }, // Auto-generate timestamp
      },
    },
  };
  await eventGeoTableManager.putPoint(params).promise();
  return { ...data, eventId };
};

export const queryEvents = async (latitude: number, longitude: number, radiusInKm: number): Promise<Event[]> => {
  const result = await eventGeoTableManager.queryRadius({
    RadiusInMeter: radiusInKm * 1000,
    CenterPoint: {
      latitude: latitude,
      longitude: longitude,
    },
  });
  return result.map(item => AWS.DynamoDB.Converter.unmarshall(item) as Event);
};

export const getEventById = async (eventId: string, entityType: string): Promise<Event | null> => {
  const params = {
    TableName: TABLE.Events,
    Key: {
      eventId: eventId,
      entityType: entityType,
    }
  };
  const result = await ddb.get(params).promise();
  if (result.Item) {
    return AWS.DynamoDB.Converter.unmarshall(result.Item) as Event;
  }
  return null;
};

export const updateEventById = async (eventId: string, entityType: string, data: Partial<Event>): Promise<Event | null> => {
  const params = {
    TableName: TABLE.Events,
    Key: {
      eventId: eventId,
      entityType: entityType,
    },
    UpdateExpression: 'set ' + Object.keys(data).map((key) => `#${key} = :${key}`).join(', '),
    ExpressionAttributeNames: Object.fromEntries(Object.keys(data).map((key) => [`#${key}`, key])),
    ExpressionAttributeValues: AWS.DynamoDB.Converter.marshall(Object.fromEntries(Object.entries(data).map(([key, value]) => [`:${key}`, value]))),
    ReturnValues: 'UPDATED_NEW',
  };
  const result = await ddb.update(params).promise();
  return result.Attributes ? AWS.DynamoDB.Converter.unmarshall(result.Attributes) as Event : null;
};

export const deleteEventById = async (eventId: string, entityType: string): Promise<void> => {
  const params = {
    TableName: TABLE.Events,
    Key: {
      eventId: eventId,
      entityType: entityType,
    },
  };
  await ddb.delete(params).promise();
};

// Team functions
export const createTeam = async (data: Team): Promise<Team> => {
  const teamId = uuidv4();
  const { location, ...otherData } = data;
  const params = {
    RangeKeyValue: { S: teamId },
    GeoPoint: {
      latitude: location.latitude,
      longitude: location.longitude,
    },
    PutItemInput: {
      Item: {
        teamId: { S: teamId },
        ...convertToDynamoDBItem(otherData),
        location: {
          M: {
            latitude: { N: location.latitude.toString() },
            longitude: { N: location.longitude.toString() },
          }
        },
        createdAt: { S: new Date().toISOString() }, // Auto-generate timestamp
      },
    },
  };
  await teamGeoTableManager.putPoint(params).promise();
  return { ...data, teamId };
};

export const queryTeams = async (latitude: number, longitude: number, radiusInKm: number): Promise<Team[]> => {
  const result = await teamGeoTableManager.queryRadius({
    RadiusInMeter: radiusInKm * 1000,
    CenterPoint: {
      latitude: latitude,
      longitude: longitude,
    },
  });
  return result.map(item => AWS.DynamoDB.Converter.unmarshall(item) as Team);
};

export const getTeamById = async (teamId: string, entityType: string): Promise<Team | null> => {
  const params = {
    TableName: TABLE.Teams,
    Key: {
      teamId: teamId,
      entityType: entityType,
    }
  };
  const result = await ddb.get(params).promise();
  if (result.Item) {
    return AWS.DynamoDB.Converter.unmarshall(result.Item) as Team;
  }
  return null;
};

export const updateTeamById = async (teamId: string, entityType: string, data: Partial<Team>): Promise<Team | null> => {
  const params = {
    TableName: TABLE.Teams,
    Key: {
      teamId: teamId,
      entityType: entityType,
    },
    UpdateExpression: 'set ' + Object.keys(data).map((key) => `#${key} = :${key}`).join(', '),
    ExpressionAttributeNames: Object.fromEntries(Object.keys(data).map((key) => [`#${key}`, key])),
    ExpressionAttributeValues: AWS.DynamoDB.Converter.marshall(Object.fromEntries(Object.entries(data).map(([key, value]) => [`:${key}`, value]))),
    ReturnValues: 'UPDATED_NEW',
  };
  const result = await ddb.update(params).promise();
  return result.Attributes ? AWS.DynamoDB.Converter.unmarshall(result.Attributes) as Team : null;
};

export const deleteTeamById = async (teamId: string, entityType: string): Promise<void> => {
  const params = {
    TableName: TABLE.Teams,
    Key: {
      teamId: teamId,
      entityType: entityType,
    },
  };
  await ddb.delete(params).promise();
};

// User functions
export const createUser = async (data: User): Promise<User> => {
  const userId = uuidv4();
  const { location, ...otherData } = data;
  const { latitude, longitude } = location;
  const params = {
    RangeKeyValue: { S: userId },
    GeoPoint: {
      latitude: latitude,
      longitude: longitude,
    },
    PutItemInput: {
      Item: {
        userId: { S: userId },
        ...convertToDynamoDBItem(otherData),
        location: {
          M: {
            latitude: { N: latitude.toString() },
            longitude: { N: longitude.toString() },
          }
        },
        createdAt: { S: new Date().toISOString() }, // Auto-generate timestamp
      },
    },
  };
  await userGeoTableManager.putPoint(params).promise();
  return { ...data, userId };
};

export const queryUsers = async (latitude: number, longitude: number, radiusInKm: number): Promise<User[]> => {
  const result = await userGeoTableManager.queryRadius({
    RadiusInMeter: radiusInKm * 1000,
    CenterPoint: {
      latitude: latitude,
      longitude: longitude,
    },
  });
  return result.map(item => AWS.DynamoDB.Converter.unmarshall(item) as User);
};

export const getUserById = async (userId: string): Promise<User | null> => {
  const params = {
    TableName: TABLE.Users,
    Key: {
      userId: userId,
    }
  };
  const result = await ddb.get(params).promise();
  if (result.Item) {
    return AWS.DynamoDB.Converter.unmarshall(result.Item) as User;
  }
  return null;
};

export const updateUserById = async (userId: string, data: Partial<User>): Promise<User | null> => {
  const params = {
    TableName: TABLE.Users,
    Key: {
      userId: userId,
    },
    UpdateExpression: 'set ' + Object.keys(data).map((key) => `#${key} = :${key}`).join(', '),
    ExpressionAttributeNames: Object.fromEntries(Object.keys(data).map((key) => [`#${key}`, key])),
    ExpressionAttributeValues: AWS.DynamoDB.Converter.marshall(Object.fromEntries(Object.entries(data).map(([key, value]) => [`:${key}`, value]))),
    ReturnValues: 'UPDATED_NEW',
  };
  const result = await ddb.update(params).promise();
  return result.Attributes ? AWS.DynamoDB.Converter.unmarshall(result.Attributes) as User : null;
};

export const deleteUserById = async (userId: string): Promise<void> => {
  const params = {
    TableName: TABLE.Users,
    Key: {
      userId: userId,
    },
  };
  await ddb.delete(params).promise();
};
