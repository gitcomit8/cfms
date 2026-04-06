import api from './axios.js';

export const getEvents = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.category) params.append('category', filters.category);
  if (filters.status) params.append('status', filters.status);
  if (filters.search) params.append('search', filters.search);
  if (filters.limit) params.append('limit', filters.limit);
  if (filters.offset) params.append('offset', filters.offset);
  return api.get(`/events?${params.toString()}`);
};

export const getEvent = (eventId) => api.get(`/events/${eventId}`);
export const createEvent = (data) => api.post('/events', data);
export const updateEvent = (eventId, data) => api.put(`/events/${eventId}`, data);
export const deleteEvent = (eventId) => api.delete(`/events/${eventId}`);
