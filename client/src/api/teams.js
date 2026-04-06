import api from './axios.js';

export const createTeam = (data) => api.post('/teams', data);
export const joinTeam = (data) => api.post('/teams/join', data);
export const getMyTeams = () => api.get('/teams/my-teams');
export const getTeam = (id) => api.get(`/teams/${id}`);
export const getTeamsByEvent = (eventId) => api.get(`/teams/event/${eventId}`);
