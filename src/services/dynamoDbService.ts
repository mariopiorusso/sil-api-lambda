import * as AWS from 'aws-sdk';
import { Message } from '../models/message';
import { Buddy } from '../models/buddy';
import { BuddyMessage } from '../models/buddyMessage';
import { User } from '../models/user';
import { convertToDynamoDBItem } from '../utils/utils';
import { TABLE } from '../utils/constants';

const ddb = new AWS.DynamoDB.DocumentClient();

// Message functions
export const createMessage = async (data: Message): Promise<Message> => {
  const params = {
    TableName: TABLE.Messages,
    Item: {
      ...data,
      createdAt: new Date().toISOString(), // Auto-generate timestamp
    },
  };
  await ddb.put(params).promise();
  return data;
};

export const getMessageById = async (messageId: string, eventId: string): Promise<Message | null> => {
  const params = {
    TableName: TABLE.Messages,
    Key: {
      messageId: messageId,
      eventId: eventId,
    },
  };
  const result = await ddb.get(params).promise();
  return result.Item as Message || null;
};

export const updateMessageById = async (messageId: string, eventId: string, data: Partial<Message>): Promise<Message | null> => {
  const params = {
    TableName: TABLE.Messages,
    Key: {
      messageId: messageId,
      eventId: eventId,
    },
    UpdateExpression: 'set ' + Object.keys(data).map((key) => `#${key} = :${key}`).join(', '),
    ExpressionAttributeNames: Object.fromEntries(Object.keys(data).map((key) => [`#${key}`, key])),
    ExpressionAttributeValues: AWS.DynamoDB.Converter.marshall(Object.fromEntries(Object.entries(data).map(([key, value]) => [`:${key}`, value]))),
    ReturnValues: 'UPDATED_NEW',
  };
  const result = await ddb.update(params).promise();
  return result.Attributes ? AWS.DynamoDB.Converter.unmarshall(result.Attributes) as Message : null;
};

export const deleteMessageById = async (messageId: string, eventId: string): Promise<void> => {
  const params = {
    TableName: TABLE.Messages,
    Key: {
      messageId: messageId,
      eventId: eventId,
    },
  };
  await ddb.delete(params).promise();
};

// Buddy functions
export const createBuddyRequest = async (data: Buddy): Promise<Buddy> => {
  const params = {
    TableName: TABLE.Buddies,
    Item: {
      ...data,
      sentAt: new Date().toISOString(), // Auto-generate timestamp
    },
  };
  await ddb.put(params).promise();
  return data;
};

export const getBuddyRequestById = async (userId: string, buddyId: string): Promise<Buddy | null> => {
  const params = {
    TableName: TABLE.Buddies,
    Key: {
      userId: userId,
      buddyId: buddyId,
    },
  };
  const result = await ddb.get(params).promise();
  return result.Item as Buddy || null;
};

export const updateBuddyRequestStatus = async (userId: string, buddyId: string, status: string): Promise<Buddy | null> => {
  const params = {
    TableName: TABLE.Buddies,
    Key: {
      userId: userId,
      buddyId: buddyId,
    },
    UpdateExpression: 'set #status = :status, #connectionDate = :connectionDate',
    ExpressionAttributeNames: {
      '#status': 'status',
      '#connectionDate': 'connectionDate',
    },
    ExpressionAttributeValues: {
      ':status': status,
      ':connectionDate': status === 'accepted' ? new Date().toISOString() : null,
    },
    ReturnValues: 'UPDATED_NEW',
  };
  const result = await ddb.update(params).promise();
  return result.Attributes as Buddy || null;
};

export const removeBuddy = async (userId: string, buddyId: string): Promise<void> => {
  const params = {
    TableName: TABLE.Buddies,
    Key: {
      userId: userId,
      buddyId: buddyId,
    },
  };
  await ddb.delete(params).promise();
};

// BuddyMessage functions
export const createBuddyMessage = async (data: BuddyMessage): Promise<BuddyMessage> => {
  const params = {
    TableName: TABLE.BuddyMessages,
    Item: {
      ...convertToDynamoDBItem(data),
      createdAt: new Date().toISOString(), // Auto-generate timestamp
    }
  };
  await ddb.put(params).promise();
  return data;
};

export const getBuddyMessageById = async (messageId: string, buddyId: string): Promise<BuddyMessage | null> => {
  const params = {
    TableName: TABLE.BuddyMessages,
    Key: {
      messageId: messageId,
      buddyId: buddyId,
    },
  };
  const result = await ddb.get(params).promise();
  return result.Item ? AWS.DynamoDB.Converter.unmarshall(result.Item) as BuddyMessage : null;
};

export const updateBuddyMessageById = async (messageId: string, buddyId: string, data: Partial<BuddyMessage>): Promise<BuddyMessage | null> => {
  const params = {
    TableName: TABLE.BuddyMessages,
    Key: {
      messageId: messageId,
      buddyId: buddyId,
    },
    UpdateExpression: 'set ' + Object.keys(data).map((key) => `#${key} = :${key}`).join(', '),
    ExpressionAttributeNames: Object.fromEntries(Object.keys(data).map((key) => [`#${key}`, key])),
    ExpressionAttributeValues: AWS.DynamoDB.Converter.marshall(Object.fromEntries(Object.entries(data).map(([key, value]) => [`:${key}`, value]))),
    ReturnValues: 'UPDATED_NEW',
  };
  const result = await ddb.update(params).promise();
  return result.Attributes ? AWS.DynamoDB.Converter.unmarshall(result.Attributes) as BuddyMessage : null;
};

export const deleteBuddyMessageById = async (messageId: string, buddyId: string): Promise<void> => {
  const params = {
    TableName: TABLE.BuddyMessages,
    Key: {
      messageId: messageId,
      buddyId: buddyId,
    },
  };
  await ddb.delete(params).promise();
};

export const getEventAttendeesById = async (eventId: string): Promise<User[]> => {
  const attendeeParams = {
    TableName: TABLE.Events,
    KeyConditionExpression: 'eventId = :eventId and entityType = :entityType',
    FilterExpression: '#userStatus = :accepted',
    ExpressionAttributeValues: {
      ':eventId': eventId,
      ':entityType': 'event#User',
      ':accepted': 'accepted',
    },
    ExpressionAttributeNames: {
      '#userStatus': 'userStatus',
    },
  };

  const attendeesResult = await ddb.query(attendeeParams).promise();
  const userIds = attendeesResult.Items ? attendeesResult.Items.map(item => item.userId) : [];

  if (userIds.length === 0) {
    return [];
  }

  const keys = userIds.map(userId => ({ userId: userId }));
  const usersParams = {
    RequestItems: {
      [TABLE.Users]: {
        Keys: keys
      }
    }
  };

  const usersResult = await ddb.batchGet(usersParams).promise();
  return usersResult.Responses ? usersResult.Responses[TABLE.Users].map(item => AWS.DynamoDB.Converter.unmarshall(item) as User) : [];
};

export const getTeamMembersById = async (teamId: string): Promise<User[]> => {
  const attendeeParams = {
    TableName: TABLE.Teams,
    KeyConditionExpression: 'teamId = :teamId and entityType = :entityType',
    FilterExpression: '#userStatus = :accepted',
    ExpressionAttributeValues: {
      ':teamId': teamId,
      ':entityType': 'event#User',
      ':accepted': 'accepted',
    },
    ExpressionAttributeNames: {
      '#userStatus': 'userStatus',
    },
  };

  const attendeesResult = await ddb.query(attendeeParams).promise();
  const userIds = attendeesResult.Items ? attendeesResult.Items.map(item => item.userId) : [];

  if (userIds.length === 0) {
    return [];
  }

  const keys = userIds.map(userId => ({ userId: userId }));
  const usersParams = {
    RequestItems: {
      [TABLE.Users]: {
        Keys: keys
      }
    }
  };

  const usersResult = await ddb.batchGet(usersParams).promise();
  return usersResult.Responses ? usersResult.Responses[TABLE.Users].map(item => AWS.DynamoDB.Converter.unmarshall(item) as User) : [];
};