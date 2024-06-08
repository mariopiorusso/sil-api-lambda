import { Context } from 'openapi-backend';
import { createTeam, getTeamById, updateTeamById, deleteTeamById, queryTeams } from '../services/dynamoDbGeoService';
import { getTeamMembersById } from '../services/dynamoDbService';
import { HttpResponse } from '../utils/response';
import { extractStringParam } from '../utils/utils';

export const getTeamByIdHandler = async (c: Context): Promise<any> => {
  try {
    const teamId = extractStringParam(c.request.params.teamId);

    if (!teamId) {
      return HttpResponse.badRequest({ message: 'Team ID is required' });
    }

    const teamData = await getTeamById(teamId, 'team#Info');

    if (!teamData) {
      return HttpResponse.notFound({ message: 'Team not found' });
    }

    return HttpResponse.ok(teamData);
  } catch (error) {
    console.error('Error getting team:', error);
    return HttpResponse.internalServerError({ message: 'Error getting team', error });
  }
};

export const getTeamsByLocationHandler = async (c: Context): Promise<any> => {
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

    const teams = await queryTeams(lat, lon, radius);
    return HttpResponse.ok(teams);
  } catch (error) {
    console.error('Error getting teams by location:', error);
    return HttpResponse.internalServerError({ message: 'Error getting teams by location', error });
  }
};

export const getTeamMembersHandler = async (c: Context): Promise<any> => {
  try {
    const teamId = extractStringParam(c.request.params.teamId);

    if (!teamId) {
      return HttpResponse.badRequest({ message: 'Team ID is required' });
    }

    const members = await getTeamMembersById(teamId);
    return HttpResponse.ok(members);
  } catch (error) {
    console.error('Error getting team members:', error);
    return HttpResponse.internalServerError({ message: 'Error getting team members', error });
  }
};

export const createTeamHandler = async (c: Context): Promise<any> => {
  try {
    const teamData = c.request.body;

    const createdTeam = await createTeam(teamData);
    return HttpResponse.created(createdTeam);
  } catch (error) {
    console.error('Error creating team:', error);
    return HttpResponse.internalServerError({ message: 'Error creating team', error });
  }
};

export const updateTeamHandler = async (c: Context): Promise<any> => {
  try {
    const teamId = extractStringParam(c.request.params.teamId);
    const updateData = c.request.body;

    if (!teamId) {
      return HttpResponse.badRequest({ message: 'Team ID is required' });
    }

    const updatedTeam = await updateTeamById(teamId, 'team#Info', updateData);

    if (!updatedTeam) {
      return HttpResponse.notFound({ message: 'Team not found' });
    }

    return HttpResponse.ok(updatedTeam);
  } catch (error) {
    console.error('Error updating team:', error);
    return HttpResponse.internalServerError({ message: 'Error updating team', error });
  }
};

export const deleteTeamHandler = async (c: Context): Promise<any> => {
  try {
    const teamId = extractStringParam(c.request.params.teamId);

    if (!teamId) {
      return HttpResponse.badRequest({ message: 'Team ID is required' });
    }

    await deleteTeamById(teamId, 'team#Info');
    return HttpResponse.noContent();
  } catch (error) {
    console.error('Error deleting team:', error);
    return HttpResponse.internalServerError({ message: 'Error deleting team', error });
  }
};
