import { Context } from 'openapi-backend';
import { createBuddyRequest, getBuddyRequestById, updateBuddyRequestStatus, removeBuddy } from '../services/dynamoDbService';
import { HttpResponse } from '../utils/response';
import { extractStringParam } from '../utils/utils';

export const createBuddyRequestHandler = async (c: Context): Promise<any> => {
  try {
    const buddyData = c.request.body;

    const createdBuddyRequest = await createBuddyRequest(buddyData);
    return HttpResponse.created(createdBuddyRequest);
  } catch (error) {
    console.error('Error creating buddy request:', error);
    return HttpResponse.internalServerError({ message: 'Error creating buddy request', error });
  }
};

export const getBuddyRequestByIdHandler = async (c: Context): Promise<any> => {
  try {
    const userId = extractStringParam(c.request.params.userId);
    const buddyId = extractStringParam(c.request.params.buddyId);

    if (!userId || !buddyId) {
      return HttpResponse.badRequest({ message: 'User ID and Buddy ID are required' });
    }

    const buddyRequestData = await getBuddyRequestById(userId, buddyId);

    if (!buddyRequestData) {
      return HttpResponse.notFound({ message: 'Buddy request not found' });
    }

    return HttpResponse.ok(buddyRequestData);
  } catch (error) {
    console.error('Error getting buddy request:', error);
    return HttpResponse.internalServerError({ message: 'Error getting buddy request', error });
  }
};

export const updateBuddyRequestStatusHandler = async (c: Context): Promise<any> => {
  try {
    const userId = extractStringParam(c.request.params.userId);
    const buddyId = extractStringParam(c.request.params.buddyId);
    const { status } = c.request.body;

    if (!userId || !buddyId || !status) {
      return HttpResponse.badRequest({ message: 'User ID, Buddy ID, and Status are required' });
    }

    const updatedBuddyRequest = await updateBuddyRequestStatus(userId, buddyId, status);

    if (!updatedBuddyRequest) {
      return HttpResponse.notFound({ message: 'Buddy request not found' });
    }

    return HttpResponse.ok(updatedBuddyRequest);
  } catch (error) {
    console.error('Error updating buddy request status:', error);
    return HttpResponse.internalServerError({ message: 'Error updating buddy request status', error });
  }
};

export const deleteBuddyRequestHandler = async (c: Context): Promise<any> => {
  try {
    const userId = extractStringParam(c.request.params.userId);
    const buddyId = extractStringParam(c.request.params.buddyId);

    if (!userId || !buddyId) {
      return HttpResponse.badRequest({ message: 'User ID and Buddy ID are required' });
    }

    await removeBuddy(userId, buddyId);
    return HttpResponse.noContent();
  } catch (error) {
    console.error('Error deleting buddy request:', error);
    return HttpResponse.internalServerError({ message: 'Error deleting buddy request', error });
  }
};
