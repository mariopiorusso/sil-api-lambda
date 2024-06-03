import { APIGatewayProxyResult } from 'aws-lambda';
import { Context } from 'openapi-backend';
import { createUser, getUserById, updateUserById, deleteUserById, queryUsers } from '../services/dynamoDbGeoService';
import { User } from '../models/user';

export const createNewUser = async (c: Context): Promise<APIGatewayProxyResult> => {
  const requestBody = c.request.requestBody as User;
  try {
    const newUser = await createUser(requestBody);
    return {
      statusCode: 201,
      body: JSON.stringify(newUser),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error creating user', error }),
    };
  }
};

export const getUser = async (c: Context): Promise<APIGatewayProxyResult> => {
  const userId: string = Array.isArray(c.request.params.userId) ? c.request.params.userId[0] : c.request.params.userId;
  
  try {
    const user = await getUserById(userId);
    if (user) {
      return {
        statusCode: 200,
        body: JSON.stringify(user),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'User not found' }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error fetching user', error }),
    };
  }
};

export const updateUser = async (c: Context): Promise<APIGatewayProxyResult> => {
  const userId: string = Array.isArray(c.request.params.userId) ? c.request.params.userId[0] : c.request.params.userId;
  const requestBody = c.request.requestBody as Partial<User>;
  try {
    const updatedUser = await updateUserById(userId, requestBody);
    if (updatedUser) {
      return {
        statusCode: 200,
        body: JSON.stringify(updatedUser),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'User not found' }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error updating user', error }),
    };
  }
};

export const deleteUser = async (c: Context): Promise<APIGatewayProxyResult> => {
  const userId: string = Array.isArray(c.request.params.userId) ? c.request.params.userId[0] : c.request.params.userId;
  try {
    await deleteUserById(userId);
    return {
      statusCode: 204,
      body: '',
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error deleting user', error }),
    };
  }
};

export const searchUsers = async (c: Context): Promise<APIGatewayProxyResult> => {
  const { latitude, longitude, radiusInKm } = c.request.query!;
  try {
    const lat: string = Array.isArray(latitude) ? latitude[0] : latitude;
    const lon: string = Array.isArray(longitude) ? longitude[0] : longitude;
    const radius: string = Array.isArray(radiusInKm) ? radiusInKm[0] : radiusInKm;

    const users = await queryUsers(parseFloat(lat), parseFloat(lon), parseFloat(radius));
    return {
      statusCode: 200,
      body: JSON.stringify(users),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error querying users', error }),
    };
  }
};