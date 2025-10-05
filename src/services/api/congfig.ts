import axios from 'axios';
import { API_ENDPOINTS } from '../../constants/api';

// Helper function to get authorization headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    Authorization: `Bearer ${token}`,
  };
};
export const getConfigByKeyword = async (keyword: string) => {
  const response = await axios.get(API_ENDPOINTS.CONFIG.BASE, {
    params: { keyword },
    headers: getAuthHeaders(),
  });
  return response.data;
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
export const updateConfig = async (
  id: number,
  category: string,
  key: string,
  value: string,
  description: string,
  mediaFile?: File
) => {
  const formData = new FormData();
  formData.append('id', id.toString());
  formData.append('category', category);
  formData.append('key', key);
  formData.append('value', value);
  formData.append('description', description);
  
  if (mediaFile) {
    formData.append('MediaFile', mediaFile);
  }

  const response = await axios.put(API_ENDPOINTS.CONFIG.BASE, formData, {
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'multipart/form-data',
    },
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