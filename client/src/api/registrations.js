import api from './axios.js';

export const registerForEvent = (data) => api.post('/registrations', data);
export const getMyRegistrations = () => api.get('/registrations/me');
export const cancelRegistration = (eventId) => api.delete(`/registrations/${eventId}`);
