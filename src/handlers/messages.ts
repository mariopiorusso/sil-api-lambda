import { Context } from 'openapi-backend';
import { createMessage, getMessageById, updateMessageById, deleteMessageById } from '../services/dynamoDbService';
import { HttpResponse } from '../utils/response';
import { extractStringParam } from '../utils/utils';

export const createMessageHandler = async (c: Context): Promise<any> => {
  try {
    const messageData = c.request.body;

    const createdMessage = await createMessage(messageData);
    return HttpResponse.created(createdMessage);
  } catch (error) {
    console.error('Error creating message:', error);
    return HttpResponse.internalServerError({ message: 'Error creating message', error });
  }
};

export const getMessageByIdHandler = async (c: Context): Promise<any> => {
  try {
    const messageId = extractStringParam(c.request.params.messageId);
    const eventId = extractStringParam(c.request.params.eventId);

    if (!messageId || !eventId) {
      return HttpResponse.badRequest({ message: 'Message ID and Event ID are required' });
    }

    const messageData = await getMessageById(messageId, eventId);

    if (!messageData) {
      return HttpResponse.notFound({ message: 'Message not found' });
    }

    return HttpResponse.ok(messageData);
  } catch (error) {
    console.error('Error getting message:', error);
    return HttpResponse.internalServerError({ message: 'Error getting message', error });
  }
};

export const updateMessageHandler = async (c: Context): Promise<any> => {
  try {
    const messageId = extractStringParam(c.request.params.messageId);
    const eventId = extractStringParam(c.request.params.eventId);
    const updateData = c.request.body;

    if (!messageId || !eventId) {
      return HttpResponse.badRequest({ message: 'Message ID and Event ID are required' });
    }

    const updatedMessage = await updateMessageById(messageId, eventId, updateData);

    if (!updatedMessage) {
      return HttpResponse.notFound({ message: 'Message not found' });
    }

    return HttpResponse.ok(updatedMessage);
  } catch (error) {
    console.error('Error updating message:', error);
    return HttpResponse.internalServerError({ message: 'Error updating message', error });
  }
};

export const deleteMessageHandler = async (c: Context): Promise<any> => {
  try {
    const messageId = extractStringParam(c.request.params.messageId);
    const eventId = extractStringParam(c.request.params.eventId);

    if (!messageId || !eventId) {
      return HttpResponse.badRequest({ message: 'Message ID and Event ID are required' });
    }

    await deleteMessageById(messageId, eventId);
    return HttpResponse.noContent();
  } catch (error) {
    console.error('Error deleting message:', error);
    return HttpResponse.internalServerError({ message: 'Error deleting message', error });
  }
};
