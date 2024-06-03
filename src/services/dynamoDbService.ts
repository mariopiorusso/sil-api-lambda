import * as AWS from 'aws-sdk';
import { Message } from '../models/message';
import { Buddy } from '../models/buddy';
import { BuddyMessage } from '../models/buddyMessage';
import { convertToDynamoDBItem } from '../utils/utils';
import { TABLE } from '../utils/constants';

const ddb = new AWS.DynamoDB.DocumentClient();

// Message functions
export const createMessage = async (data: Message): Promise<Message> => {
  const params = {
    TableName: TABLE.Messages,
    Item: data,
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
    Item: data,
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
    UpdateExpression: 'set #status = :status',
    ExpressionAttributeNames: {
      '#status': 'status',
    },
    ExpressionAttributeValues: {
      ':status': status,
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
    Item: convertToDynamoDBItem(data)
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
