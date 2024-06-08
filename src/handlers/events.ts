import { Context } from 'openapi-backend';
import { createEvent, getEventById, updateEventById, deleteEventById, queryEvents } from '../services/dynamoDbGeoService';
import { getEventAttendeesById } from '../services/dynamoDbService';
import { HttpResponse } from '../utils/response';
import { extractStringParam } from '../utils/utils';

export const getEventByIdHandler = async (c: Context): Promise<any> => {
  try {
    const eventId = extractStringParam(c.request.params.eventId);

    if (!eventId) {
      return HttpResponse.badRequest({ message: 'Event ID is required' });
    }

    const eventData = await getEventById(eventId, 'event#Info');

    if (!eventData) {
      return HttpResponse.notFound({ message: 'Event not found' });
    }

    return HttpResponse.ok(eventData);
  } catch (error) {
    console.error('Error getting event:', error);
    return HttpResponse.internalServerError({ message: 'Error getting event', error });
  }
};

export const getEventsByLocationHandler = async (c: Context): Promise<any> => {
  try {
    const latitude = extractStringParam(c.request.query.latitude);
    const longitude = extractStringParam(c.request.query.longitude);
    const radiusInKm = extractStringParam(c.request.query.radiusInKm);

    if (!latitude || !longitude || !radiusInKm) {
      return HttpResponse.badRequest({ message: 'Latitude, Longitude, and Radius in Km are required' });
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const radius = parseFloat(radiusInKm);

    if (isNaN(lat) || isNaN(lon) || isNaN(radius)) {
      return HttpResponse.badRequest({ message: 'Latitude, Longitude, and Radius in Km must be valid numbers' });
    }

    const events = await queryEvents(lat, lon, radius);
    return HttpResponse.ok(events);
  } catch (error) {
    console.error('Error getting events by location:', error);
    return HttpResponse.internalServerError({ message: 'Error getting events by location', error });
  }
};

export const getEventAttendeesHandler = async (c: Context): Promise<any> => {
  try {
    const eventId = extractStringParam(c.request.params.eventId);

    if (!eventId) {
      return HttpResponse.badRequest({ message: 'Event ID is required' });
    }

    const attendees = await getEventAttendeesById(eventId);
    return HttpResponse.ok(attendees);
  } catch (error) {
    console.error('Error getting event attendees:', error);
    return HttpResponse.internalServerError({ message: 'Error getting event attendees', error });
  }
};

export const createEventHandler = async (c: Context): Promise<any> => {
  try {
    const eventData = c.request.body;

    if (!eventData.location || !eventData.entityType) {
      return HttpResponse.badRequest({ message: 'Location and Entity Type are required' });
    }

    const createdEvent = await createEvent(eventData);
    return HttpResponse.created(createdEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    return HttpResponse.internalServerError({ message: 'Error creating event', error });
  }
};

export const updateEventHandler = async (c: Context): Promise<any> => {
  try {
    const eventId = extractStringParam(c.request.params.eventId);
    const updateData = c.request.body;

    if (!eventId) {
      return HttpResponse.badRequest({ message: 'Event ID is required' });
    }

    const updatedEvent = await updateEventById(eventId, 'event#Info', updateData);

    if (!updatedEvent) {
      return HttpResponse.notFound({ message: 'Event not found' });
    }

    return HttpResponse.ok(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    return HttpResponse.internalServerError({ message: 'Error updating event', error });
  }
};

export const deleteEventHandler = async (c: Context): Promise<any> => {
  try {
    const eventId = extractStringParam(c.request.params.eventId);

    if (!eventId) {
      return HttpResponse.badRequest({ message: 'Event ID is required' });
    }

    await deleteEventById(eventId, 'event#Info');
    return HttpResponse.noContent();
  } catch (error) {
    console.error('Error deleting event:', error);
    return HttpResponse.internalServerError({ message: 'Error deleting event', error });
  }
};
