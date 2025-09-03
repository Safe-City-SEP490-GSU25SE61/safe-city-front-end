import axios from 'axios';
import { API_ENDPOINTS } from '../../constants/api';

// Helper function to get authorization headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    Authorization: `Bearer ${token}`,
  };
};
export const getConfig = async () => {
  const response = await axios.get(API_ENDPOINTS.CONFIG.BASE, {
    headers: getAuthHeaders(),
  });
  return response.data;
};
export const createConfig = async (data: any) => {
  const response = await axios.post(API_ENDPOINTS.CONFIG.BASE, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};
export const updateConfig = async (data: any) => {
  const response = await axios.put(API_ENDPOINTS.CONFIG.BASE, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};
export const deleteConfig = async (id: string) => {
  const response = await axios.delete(API_ENDPOINTS.CONFIG.BASE, {
    params: { id },
    headers: getAuthHeaders(),
  });
  return response.data;
};
export const getConfigById = async (id: string) => {
  const response = await axios.get(API_ENDPOINTS.CONFIG.BY_ID(id), {
    headers: getAuthHeaders(),
  });
  return response.data;
};