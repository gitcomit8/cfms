import api from './axios.js';

export const submitScore = (data) => api.post('/scores', data);
export const getLeaderboard = (eventId) => api.get(`/scores/leaderboard/${eventId}`);
export const getTeamScores = (teamId, eventId) => api.get(`/scores/team/${teamId}/event/${eventId}`);
export const getMyScores = () => api.get('/scores/my-scores');
