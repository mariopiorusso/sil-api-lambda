import * as AWS from 'aws-sdk';
import * as ddbGeo from 'dynamodb-geo';
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
  const { eventId, entityType, location, ...otherData } = data;
  const params = {
    RangeKeyValue: { S: eventId },
    GeoPoint: {
      latitude: location.latitude,
      longitude: location.longitude,
    },
    PutItemInput: {
      Item: {
        eventId: { S: eventId },
        entityType: { S: entityType },
        location: {
          M: {
            latitude: { N: location.latitude.toString() },
            longitude: { N: location.longitude.toString() },
          }
        },
        ...convertToDynamoDBItem(otherData),
      },
    },
  };
  await eventGeoTableManager.putPoint(params).promise();
  return data;
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
    IndexName: 'EventIdGSI',
    KeyConditionExpression: 'eventId = :eventId and entityType = :entityType',
    ExpressionAttributeValues: {
      ':eventId': eventId,
      ':entityType': entityType
    }
  };
  const result = await ddb.query(params).promise();
  if (result.Items && result.Items.length > 0) {
    return AWS.DynamoDB.Converter.unmarshall(result.Items[0]) as Event;
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
  const { teamId, entityType, location, ...otherData } = data;
  const params = {
    RangeKeyValue: { S: teamId },
    GeoPoint: {
      latitude: location.latitude,
      longitude: location.longitude,
    },
    PutItemInput: {
      Item: {
        teamId: { S: teamId },
        entityType: { S: entityType },
        location: {
          M: {
            latitude: { N: location.latitude.toString() },
            longitude: { N: location.longitude.toString() },
          }
        },
        ...convertToDynamoDBItem(otherData),
      },
    },
  };
  await teamGeoTableManager.putPoint(params).promise();
  return data;
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
    IndexName: 'TeamIdGSI',
    KeyConditionExpression: 'teamId = :teamId and entityType = :entityType',
    ExpressionAttributeValues: {
      ':teamId': teamId,
      ':entityType': entityType
    }
  };
  const result = await ddb.query(params).promise();
  if (result.Items && result.Items.length > 0) {
    return AWS.DynamoDB.Converter.unmarshall(result.Items[0]) as Team;
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
  const { userId, location, ...otherData } = data;
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
        location: {
          M: {
            latitude: { N: latitude.toString() },
            longitude: { N: longitude.toString() },
          }
        },
        ...convertToDynamoDBItem(otherData),
      },
    },
  };
  await userGeoTableManager.putPoint(params).promise();
  return data;
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
    IndexName: 'UserIdGSI',
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    }
  };
  const result = await ddb.query(params).promise();
  if (result.Items && result.Items.length > 0) {
    return AWS.DynamoDB.Converter.unmarshall(result.Items[0]) as User;
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
