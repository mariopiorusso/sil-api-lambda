import { APIGatewayProxyHandler } from 'aws-lambda';
import OpenAPIBackend from 'openapi-backend';
import { getEventByIdHandler, getEventsByLocationHandler, searchEventsHandler, getEventAttendeesHandler, createEventHandler, updateEventHandler, deleteEventHandler } from './handlers/events';
import { getUserByIdHandler, getUsersByLocationHandler, createUserHandler, updateUserHandler, deleteUserHandler } from './handlers/users';
import { getPendingBuddyRequestsHandler, getAcceptedBuddiesHandler, createBuddyRequestHandler, getBuddyRequestByIdHandler, updateBuddyRequestStatusHandler, deleteBuddyRequestHandler } from './handlers/buddies';
import { getEventMessagesHandler, createEventMessageHandler, updateEventMessageHandler, deleteEventMessageHandler } from './handlers/messages';
import { createTeamHandler, getTeamByIdHandler, getTeamsByLocationHandler, searchTeamsHandler, updateTeamHandler, deleteTeamHandler, getTeamMembersHandler } from './handlers/teams';
import { normalizeParams } from './utils/utils';

// Initialize OpenAPIBackend with your API definition
const api = new OpenAPIBackend({ definition: './sil-openapi.json' });

// Register handlers for each operation
api.register({
  getEventById: getEventByIdHandler,
  getEventsByLocation: getEventsByLocationHandler,
  searchEvents: searchEventsHandler,
  getEventAttendees: getEventAttendeesHandler,
  getEventMessages: getEventMessagesHandler,
  createEvent: createEventHandler,
  createEventMessage: createEventMessageHandler,
  updateEvent: updateEventHandler,
  updateEventMessage: updateEventMessageHandler,
  deleteEvent: deleteEventHandler,
  deleteEventMessage: deleteEventMessageHandler,

  getUserById: getUserByIdHandler,
  getUsersByLocation: getUsersByLocationHandler,
  createUser: createUserHandler,
  updateUser: updateUserHandler,
  deleteUser: deleteUserHandler,

  getPendingBuddyRequests: getPendingBuddyRequestsHandler,
  getAcceptedBuddies: getAcceptedBuddiesHandler,
  createBuddyRequest: createBuddyRequestHandler,
  getBuddyRequestById: getBuddyRequestByIdHandler,
  updateBuddyRequestStatus: updateBuddyRequestStatusHandler,
  deleteBuddyRequest: deleteBuddyRequestHandler,

  createTeam: createTeamHandler,
  getTeamById: getTeamByIdHandler,
  getTeamsByLocation: getTeamsByLocationHandler,
  searchTeams: searchTeamsHandler,
  updateTeam: updateTeamHandler,
  deleteTeam: deleteTeamHandler,
  getTeamMembers: getTeamMembersHandler
});

console.log("API registered")

// Initialize the API
api.init();

console.log("API initiated")

// Lambda handler
export const handler: APIGatewayProxyHandler = async (event, context) => {

  console.log('Received event:', JSON.stringify(event, null, 2));

  // Normalize headers and query parameters
  const normalizedHeaders = normalizeParams(event.headers);
  const normalizedQuery = normalizeParams(event.queryStringParameters);
  const pathParameters = event.pathParameters || {};

  // Construct the path with parameters
  const fullPath = Object.keys(pathParameters).reduce(
    (path, param) => path.replace(`{${param}}`, pathParameters[param]!),
    event.path
  );

  console.log('Normalized headers:', JSON.stringify(normalizedHeaders));
  console.log('Normalized query parameters:', JSON.stringify(normalizedQuery));
  console.log('Full path:', fullPath);

  try {
    // Await the result of the API handler
    console.log('Calling api.handleRequest...');
    const response = await api.handleRequest({
      method: event.httpMethod,
      path: fullPath,
      body: event.body,
      headers: normalizedHeaders,
      query: normalizedQuery,
    });

    console.log('API response:', JSON.stringify(response));

    // Return the API response
    return {
      statusCode: response.statusCode,
      headers: response.headers,
      body: response.body,
    };
  } catch (error) {
    console.error('Error handling request:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error2' }),
    };
  }
};
