import { APIGatewayProxyResult } from 'aws-lambda';
import { Context } from 'openapi-backend';
import { createEvent, getEventById, updateEventById, deleteEventById, queryEvents } from '../services/dynamoDbGeoService';
import { Event } from '../models/event';

export const createNewEvent = async (c: Context): Promise<APIGatewayProxyResult> => {
  const requestBody = c.request.requestBody as Event;
  try {
    const newEvent = await createEvent(requestBody);
    return {
      statusCode: 201,
      body: JSON.stringify(newEvent),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error creating event', error }),
    };
  }
};

export const getEvent = async (c: Context): Promise<APIGatewayProxyResult> => {
  const eventId: string = Array.isArray(c.request.params.eventId) ? c.request.params.eventId[0] : c.request.params.eventId;
  const entityType: string = Array.isArray(c.request.params.entityType) ? c.request.params.entityType[0] : c.request.params.entityType;
  
  try {
    const event = await getEventById(eventId, entityType);
    if (event) {
      return {
        statusCode: 200,
        body: JSON.stringify(event),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Event not found' }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error fetching event', error }),
    };
  }
};

export const updateEvent = async (c: Context): Promise<APIGatewayProxyResult> => {
  const eventId: string = Array.isArray(c.request.params.eventId) ? c.request.params.eventId[0] : c.request.params.eventId;
  const entityType: string = Array.isArray(c.request.params.entityType) ? c.request.params.entityType[0] : c.request.params.entityType;
  
  const requestBody = c.request.requestBody as Partial<Event>;
  try {
    const updatedEvent = await updateEventById(eventId, entityType, requestBody);
    if (updatedEvent) {
      return {
        statusCode: 200,
        body: JSON.stringify(updatedEvent),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Event not found' }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error updating event', error }),
    };
  }
};

export const deleteEvent = async (c: Context): Promise<APIGatewayProxyResult> => {
  const eventId: string = Array.isArray(c.request.params.eventId) ? c.request.params.eventId[0] : c.request.params.eventId;
  const entityType: string = Array.isArray(c.request.params.entityType) ? c.request.params.entityType[0] : c.request.params.entityType;
  
  try {
    await deleteEventById(eventId, entityType);
    return {
      statusCode: 204,
      body: '',
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error deleting event', error }),
    };
  }
};

export const searchEvents = async (c: Context): Promise<APIGatewayProxyResult> => {
  const { latitude, longitude, radiusInKm } = c.request.query!;
  try {
    const lat: string = Array.isArray(latitude) ? latitude[0] : latitude;
    const lon: string = Array.isArray(longitude) ? longitude[0] : longitude;
    const radius: string = Array.isArray(radiusInKm) ? radiusInKm[0] : radiusInKm;

    const events = await queryEvents(parseFloat(lat), parseFloat(lon), parseFloat(radius));
    return {
      statusCode: 200,
      body: JSON.stringify(events),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error querying events', error }),
    };
  }
};