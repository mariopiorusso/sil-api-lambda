import { APIGatewayProxyHandler } from 'aws-lambda';
import OpenAPIBackend, { Context, Document } from 'openapi-backend';
import { getEventByIdHandler, getEventsByLocationHandler, getEventAttendeesHandler, createEventHandler, updateEventHandler, deleteEventHandler } from './handlers/events';
import { getUserByIdHandler, getUsersByLocationHandler, createUserHandler, updateUserHandler, deleteUserHandler } from './handlers/users';
import { createMessageHandler, getMessageByIdHandler, updateMessageHandler, deleteMessageHandler } from './handlers/messages';
import { createBuddyRequestHandler, getBuddyRequestByIdHandler, updateBuddyRequestStatusHandler, deleteBuddyRequestHandler } from './handlers/buddies';
import { createTeamHandler, getTeamByIdHandler, getTeamsByLocationHandler, updateTeamHandler, deleteTeamHandler, getTeamMembersHandler } from './handlers/teams';
import { normalizeParams } from './utils/utils';

// Initialize OpenAPIBackend with your API definition
const api = new OpenAPIBackend({ definition: './sil-openapi.json' });

// Register handlers for each operation
api.register({
  getEventById: getEventByIdHandler,
  getEventsByLocation: getEventsByLocationHandler,
  getEventAttendees: getEventAttendeesHandler,
  createEvent: createEventHandler,
  updateEvent: updateEventHandler,
  deleteEvent: deleteEventHandler,

  getUserById: getUserByIdHandler,
  getUsersByLocation: getUsersByLocationHandler,
  createUser: createUserHandler,
  updateUser: updateUserHandler,
  deleteUser: deleteUserHandler,

  createMessage: createMessageHandler,
  getMessageById: getMessageByIdHandler,
  updateMessage: updateMessageHandler,
  deleteMessage: deleteMessageHandler,

  createBuddyRequest: createBuddyRequestHandler,
  getBuddyRequestById: getBuddyRequestByIdHandler,
  updateBuddyRequestStatus: updateBuddyRequestStatusHandler,
  deleteBuddyRequest: deleteBuddyRequestHandler,

  createTeam: createTeamHandler,
  getTeamById: getTeamByIdHandler,
  getTeamsByLocation: getTeamsByLocationHandler,
  updateTeam: updateTeamHandler,
  deleteTeam: deleteTeamHandler,
  getTeamMembers: getTeamMembersHandler,
});

// Initialize the API
api.init();

// Lambda handler
export const handler: APIGatewayProxyHandler = async (event, context) => {
  // Normalize headers and query parameters
  const normalizedHeaders = normalizeParams(event.headers);
  const normalizedQuery = normalizeParams(event.queryStringParameters);
  const pathParameters = event.pathParameters || {};

  // Construct the path with parameters
  const fullPath = Object.keys(pathParameters).reduce(
    (path, param) => path.replace(`{${param}}`, pathParameters[param]!),
    event.path
  );

  // Await the result of the API handler
  const response = await api.handleRequest({
    method: event.httpMethod,
    path: fullPath,
    body: event.body,
    headers: normalizedHeaders,
    query: normalizedQuery,
  });

  // Return the API response
  return {
    statusCode: response.statusCode,
    headers: response.headers,
    body: response.body,
  };
};
