import { APIGatewayProxyResult } from 'aws-lambda';
import { Context } from 'openapi-backend';
import { createTeam, getTeamById, updateTeamById, deleteTeamById, queryTeams } from '../services/dynamoDbGeoService';
import { Team } from '../models/team';

export const createNewTeam = async (c: Context): Promise<APIGatewayProxyResult> => {
  const requestBody = c.request.requestBody as Team;
  try {
    const newTeam = await createTeam(requestBody);
    return {
      statusCode: 201,
      body: JSON.stringify(newTeam),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error creating team', error }),
    };
  }
};

export const getTeam = async (c: Context): Promise<APIGatewayProxyResult> => {
  const teamId: string = Array.isArray(c.request.params.teamId) ? c.request.params.teamId[0] : c.request.params.teamId;
  const entityType: string = Array.isArray(c.request.params.entityType) ? c.request.params.entityType[0] : c.request.params.entityType;
  
  try {
    const team = await getTeamById(teamId, entityType);
    if (team) {
      return {
        statusCode: 200,
        body: JSON.stringify(team),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Team not found' }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error fetching team', error }),
    };
  }
};

export const updateTeam = async (c: Context): Promise<APIGatewayProxyResult> => {
  const teamId: string = Array.isArray(c.request.params.teamId) ? c.request.params.teamId[0] : c.request.params.teamId;
  const entityType: string = Array.isArray(c.request.params.entityType) ? c.request.params.entityType[0] : c.request.params.entityType;
  
  const requestBody = c.request.requestBody as Partial<Team>;
  try {
    const updatedTeam = await updateTeamById(teamId, entityType, requestBody);
    if (updatedTeam) {
      return {
        statusCode: 200,
        body: JSON.stringify(updatedTeam),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Team not found' }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error updating team', error }),
    };
  }
};

export const deleteTeam = async (c: Context): Promise<APIGatewayProxyResult> => {
  const teamId: string = Array.isArray(c.request.params.teamId) ? c.request.params.teamId[0] : c.request.params.teamId;
  const entityType: string = Array.isArray(c.request.params.entityType) ? c.request.params.entityType[0] : c.request.params.entityType;
  
  try {
    await deleteTeamById(teamId, entityType);
    return {
      statusCode: 204,
      body: '',
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error deleting team', error }),
    };
  }
};

export const searchTeams = async (c: Context): Promise<APIGatewayProxyResult> => {
  const { latitude, longitude, radiusInKm } = c.request.query!;
  try {
    const lat: string = Array.isArray(latitude) ? latitude[0] : latitude;
    const lon: string = Array.isArray(longitude) ? longitude[0] : longitude;
    const radius: string = Array.isArray(radiusInKm) ? radiusInKm[0] : radiusInKm;

    const teams = await queryTeams(parseFloat(lat), parseFloat(lon), parseFloat(radius));
    return {
      statusCode: 200,
      body: JSON.stringify(teams),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error querying teams', error }),
    };
  }
};