import { Context } from 'openapi-backend';
import { createUser, getUserById, updateUserById, deleteUserById, queryUsers } from '../services/dynamoDbGeoService';
import { HttpResponse } from '../utils/response';
import { extractStringParam } from '../utils/utils';

export const getUserByIdHandler = async (c: Context): Promise<any> => {
  try {
    const userId = extractStringParam(c.request.params.userId);

    if (!userId) {
      return HttpResponse.badRequest({ message: 'User ID is required' });
    }

    const userData = await getUserById(userId);

    if (!userData) {
      return HttpResponse.notFound({ message: 'User not found' });
    }

    return HttpResponse.ok(userData);
  } catch (error) {
    console.error('Error getting user:', error);
    return HttpResponse.internalServerError({ message: 'Error getting user', error });
  }
};

export const getUsersByLocationHandler = async (c: Context): Promise<any> => {
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

    const users = await queryUsers(lat, lon, radius);
    return HttpResponse.ok(users);
  } catch (error) {
    console.error('Error getting users by location:', error);
    return HttpResponse.internalServerError({ message: 'Error getting users by location', error });
  }
};

export const createUserHandler = async (c: Context): Promise<any> => {
  try {
    const userData = c.request.body;

    const createdUser = await createUser(userData);
    return HttpResponse.created(createdUser);
  } catch (error) {
    console.error('Error creating user:', error);
    return HttpResponse.internalServerError({ message: 'Error creating user', error });
  }
};

export const updateUserHandler = async (c: Context): Promise<any> => {
  try {
    const userId = extractStringParam(c.request.params.userId);
    const updateData = c.request.body;

    if (!userId) {
      return HttpResponse.badRequest({ message: 'User ID is required' });
    }

    const updatedUser = await updateUserById(userId, updateData);

    if (!updatedUser) {
      return HttpResponse.notFound({ message: 'User not found' });
    }

    return HttpResponse.ok(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return HttpResponse.internalServerError({ message: 'Error updating user', error });
  }
};

export const deleteUserHandler = async (c: Context): Promise<any> => {
  try {
    const userId = extractStringParam(c.request.params.userId);

    if (!userId) {
      return HttpResponse.badRequest({ message: 'User ID is required' });
    }

    await deleteUserById(userId);
    return HttpResponse.noContent();
  } catch (error) {
    console.error('Error deleting user:', error);
    return HttpResponse.internalServerError({ message: 'Error deleting user', error });
  }
};
