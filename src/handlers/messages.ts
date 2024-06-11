import { Context } from 'openapi-backend';
import { getEventMessages, createEventMessage, updateEventMessage, deleteEventMessage } from '../services/dynamoDbService';
import { HttpResponse } from '../utils/response';
import { extractStringParam } from '../utils/utils';

export const getEventMessagesHandler = async (c: Context): Promise<any> => {
  try {
    const eventId = extractStringParam(c.request.params.eventId);

    if (!eventId) {
      return HttpResponse.badRequest({ message: 'Event ID is required' });
    }

    const messages = await getEventMessages(eventId);
    return HttpResponse.ok(messages);
  } catch (error) {
    console.error('Error getting event messages:', error);
    return HttpResponse.internalServerError({ message: 'Error getting event messages', error });
  }
};

export const createEventMessageHandler = async (c: Context): Promise<any> => {
  try {
    const eventId = extractStringParam(c.request.params.eventId);
    const messageData = c.request.body;

    if (!eventId || !messageData.text || !messageData.postedBy) {
      return HttpResponse.badRequest({ message: 'Event ID, text, and postedBy are required' });
    }

    const createdMessage = await createEventMessage(eventId, messageData);
    return HttpResponse.created(createdMessage);
  } catch (error) {
    console.error('Error creating event message:', error);
    return HttpResponse.internalServerError({ message: 'Error creating event message', error });
  }
};

export const updateEventMessageHandler = async (c: Context): Promise<any> => {
  try {
    const eventId = extractStringParam(c.request.params.eventId);
    const messageId = extractStringParam(c.request.params.messageId);
    const updateData = c.request.body;

    if (!eventId || !messageId) {
      return HttpResponse.badRequest({ message: 'Event ID and Message ID are required' });
    }

    const updatedMessage = await updateEventMessage(eventId, messageId, updateData);

    if (!updatedMessage) {
      return HttpResponse.notFound({ message: 'Message not found' });
    }

    return HttpResponse.ok(updatedMessage);
  } catch (error) {
    console.error('Error updating message:', error);
    return HttpResponse.internalServerError({ message: 'Error updating message', error });
  }
};

export const deleteEventMessageHandler = async (c: Context): Promise<any> => {
  try {
    const eventId = extractStringParam(c.request.params.eventId);
    const messageId = extractStringParam(c.request.params.messageId);

    if (!eventId || !messageId) {
      return HttpResponse.badRequest({ message: 'Event ID and Message ID are required' });
    }

    await deleteEventMessage(eventId, messageId);
    return HttpResponse.noContent();
  } catch (error) {
    console.error('Error deleting message:', error);
    return HttpResponse.internalServerError({ message: 'Error deleting message', error });
  }
};
