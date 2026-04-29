import api from './axios.js';

export const getSchema = () => api.get('/schema');
