import { Context } from 'openapi-backend';
import { createBuddyRequest, getBuddyRequestById, updateBuddyRequestStatus, getBuddies } from '../services/dynamoDbService';
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

    const buddyRequest = await getBuddyRequestById(userId, buddyId);

    if (!buddyRequest) {
      return HttpResponse.notFound({ message: 'Buddy request not found' });
    }

    return HttpResponse.ok(buddyRequest);
  } catch (error) {
    console.error('Error getting buddy request:', error);
    return HttpResponse.internalServerError({ message: 'Error getting buddy request', error });
  }
};

export const updateBuddyRequestStatusHandler = async (c: Context): Promise<any> => {
  try {
    const userId = extractStringParam(c.request.params.userId);
    const buddyId = extractStringParam(c.request.params.buddyId);
    const status = c.request.body.status;

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

    const updatedBuddyRequest = await updateBuddyRequestStatus(userId, buddyId, 'declined');

    if (!updatedBuddyRequest) {
      return HttpResponse.notFound({ message: 'Buddy request not found' });
    }
    return HttpResponse.noContent();
  } catch (error) {
    console.error('Error deleting buddy request:', error);
    return HttpResponse.internalServerError({ message: 'Error deleting buddy request', error });
  }
};

export const getPendingBuddyRequestsHandler = async (c: Context): Promise<any> => {
  try {
    const userId = extractStringParam(c.request.params.userId);

    if (!userId) {
      return HttpResponse.badRequest({ message: 'User ID is required' });
    }

    const buddyRequests = await getBuddies(userId, 'pending');
    return HttpResponse.ok(buddyRequests);
  } catch (error) {
    console.error('Error getting pending buddy requests:', error);
    return HttpResponse.internalServerError({ message: 'Error getting pending buddy requests', error });
  }
};

export const getAcceptedBuddiesHandler = async (c: Context): Promise<any> => {
  try {
    const userId = extractStringParam(c.request.params.userId);

    if (!userId) {
      return HttpResponse.badRequest({ message: 'User ID is required' });
    }

    const buddies = await getBuddies(userId, 'accepted');
    return HttpResponse.ok(buddies);
  } catch (error) {
    console.error('Error getting accepted buddies:', error);
    return HttpResponse.internalServerError({ message: 'Error getting accepted buddies', error });
  }
};