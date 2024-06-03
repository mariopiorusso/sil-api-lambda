import { APIGatewayProxyEvent, APIGatewayProxyResult, Context as LambdaContext } from 'aws-lambda';
import { OpenAPIBackend, Request } from 'openapi-backend';
import { createNewEvent, getEvent, updateEvent, deleteEvent, searchEvents } from './handlers/events';
import { createNewUser, getUser, updateUser, deleteUser, searchUsers } from './handlers/users';
import { createNewTeam, getTeam, updateTeam, deleteTeam, searchTeams } from './handlers/teams';
import { sendBuddyRequest, getBuddyRequest, updateBuddyRequest, removeBuddyRequest } from './handlers/buddies';
import { sendMessage, getMessage, updateMessage, deleteMessage } from './handlers/messages';

const api = new OpenAPIBackend({ definition: './openapi.json' });

api.register({
    // Events
    createNewEvent,
    getEvent,
    updateEvent,
    deleteEvent,
    searchEvents,
    // Users
    createNewUser,
    getUser,
    updateUser,
    deleteUser,
    searchUsers,
    // Teams
    createNewTeam,
    getTeam,
    updateTeam,
    deleteTeam,
    searchTeams,
    // Buddies
    sendBuddyRequest,
    getBuddyRequest,
    updateBuddyRequest,
    removeBuddyRequest,
    // Messages
    sendMessage,
    getMessage,
    updateMessage,
    deleteMessage,
});

api.init();

export const handler = async (event: APIGatewayProxyEvent, context: LambdaContext): Promise<APIGatewayProxyResult> => {
    return api.handleRequest({
        method: event.httpMethod,
        path: event.path,
        query: event.queryStringParameters,
        headers: event.headers,
        body: event.body ? JSON.parse(event.body) : {},
        pathParameters: event.pathParameters,
        requestContext: event.requestContext,
    } as Request, event, context);
};
