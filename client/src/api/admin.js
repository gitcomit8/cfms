import api from './axios.js';

export const getUsers = () => api.get('/admin/users');
export const updateUserRole = (id, role) => api.put(`/admin/users/${id}/role`, { role });
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
export const getDashboardStats = () => api.get('/admin/stats/dashboard');
