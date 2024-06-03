import { APIGatewayProxyResult } from 'aws-lambda';
import { Context } from 'openapi-backend';
import { createBuddyRequest, getBuddyRequestById, updateBuddyRequestStatus, removeBuddy } from '../services/dynamoDbService';
import { Buddy } from '../models/buddy';

export const sendBuddyRequest = async (c: Context): Promise<APIGatewayProxyResult> => {
  const requestBody = c.request.requestBody as Buddy;
  try {
    const newBuddyRequest = await createBuddyRequest(requestBody);
    return {
      statusCode: 201,
      body: JSON.stringify(newBuddyRequest),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error sending buddy request', error }),
    };
  }
};

export const getBuddyRequest = async (c: Context): Promise<APIGatewayProxyResult> => {
  const userId: string = Array.isArray(c.request.params.userId) ? c.request.params.userId[0] : c.request.params.userId;
  const buddyId: string = Array.isArray(c.request.params.buddyId) ? c.request.params.buddyId[0] : c.request.params.buddyId;
  
  try {
    const buddyRequest = await getBuddyRequestById(userId, buddyId);
    if (buddyRequest) {
      return {
        statusCode: 200,
        body: JSON.stringify(buddyRequest),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Buddy request not found' }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error fetching buddy request', error }),
    };
  }
};

export const updateBuddyRequest = async (c: Context): Promise<APIGatewayProxyResult> => {
  const userId: string = Array.isArray(c.request.params.userId) ? c.request.params.userId[0] : c.request.params.userId;
  const buddyId: string = Array.isArray(c.request.params.buddyId) ? c.request.params.buddyId[0] : c.request.params.buddyId;
  const requestBody = c.request.requestBody as { status: string };
  try {
    const updatedBuddyRequest = await updateBuddyRequestStatus(userId, buddyId, requestBody.status);
    if (updatedBuddyRequest) {
      return {
        statusCode: 200,
        body: JSON.stringify(updatedBuddyRequest),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Buddy request not found' }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error updating buddy request', error }),
    };
  }
};

export const removeBuddyRequest = async (c: Context): Promise<APIGatewayProxyResult> => {
  const userId: string = Array.isArray(c.request.params.userId) ? c.request.params.userId[0] : c.request.params.userId;
  const buddyId: string = Array.isArray(c.request.params.buddyId) ? c.request.params.buddyId[0] : c.request.params.buddyId;
  
  try {
    await removeBuddy(userId, buddyId);
    return {
      statusCode: 204,
      body: '',
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error removing buddy', error }),
    };
  }
};