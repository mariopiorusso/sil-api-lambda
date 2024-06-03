import { APIGatewayProxyResult } from 'aws-lambda';
import { Context } from 'openapi-backend';
import { createMessage, getMessageById, updateMessageById, deleteMessageById } from '../services/dynamoDbService';
import { Message } from '../models/message';

export const sendMessage = async (c: Context): Promise<APIGatewayProxyResult> => {
  const requestBody = c.request.requestBody as Message;
  try {
    const newMessage = await createMessage(requestBody);
    return {
      statusCode: 201,
      body: JSON.stringify(newMessage),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error creating message', error }),
    };
  }
};

export const getMessage = async (c: Context): Promise<APIGatewayProxyResult> => {
  const messageId: string = Array.isArray(c.request.params.messageId) ? c.request.params.messageId[0] : c.request.params.messageId;
  const eventId: string = Array.isArray(c.request.params.eventId) ? c.request.params.eventId[0] : c.request.params.eventId;
  
  try {
    const message = await getMessageById(messageId, eventId);
    if (message) {
      return {
        statusCode: 200,
        body: JSON.stringify(message),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Message not found' }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error fetching message', error }),
    };
  }
};

export const updateMessage = async (c: Context): Promise<APIGatewayProxyResult> => {
  const messageId: string = Array.isArray(c.request.params.messageId) ? c.request.params.messageId[0] : c.request.params.messageId;
  const eventId: string = Array.isArray(c.request.params.eventId) ? c.request.params.eventId[0] : c.request.params.eventId;
  
  const requestBody = c.request.requestBody as Partial<Message>;
  try {
    const updatedMessage = await updateMessageById(messageId, eventId, requestBody);
    if (updatedMessage) {
      return {
        statusCode: 200,
        body: JSON.stringify(updatedMessage),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Message not found' }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error updating message', error }),
    };
  }
};

export const deleteMessage = async (c: Context): Promise<APIGatewayProxyResult> => {
  const messageId: string = Array.isArray(c.request.params.messageId) ? c.request.params.messageId[0] : c.request.params.messageId;
  const eventId: string = Array.isArray(c.request.params.eventId) ? c.request.params.eventId[0] : c.request.params.eventId;
  
  try {
    await deleteMessageById(messageId, eventId);
    return {
      statusCode: 204,
      body: '',
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error deleting message', error }),
    };
  }
};