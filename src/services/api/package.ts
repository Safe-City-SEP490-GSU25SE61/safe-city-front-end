import axios from 'axios';
import { API_ENDPOINTS } from '../../constants/api';

// Helper function to get authorization headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const getAllPackages = async () => {
  const response = await axios.get(API_ENDPOINTS.PACKAGES.BASE, {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};

export const createPackage = async (data: any) => {
  const response = await axios.post(API_ENDPOINTS.PACKAGES.BASE, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getPackageById = async (id: string) => {
  const response = await axios.get(API_ENDPOINTS.PACKAGES.BY_ID(id), {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};

export const updatePackageById = async (id: string, data: any) => {
  const response = await axios.put(API_ENDPOINTS.PACKAGES.BY_ID(id), data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const deletePackageById = async (id: string) => {
  const response = await axios.delete(API_ENDPOINTS.PACKAGES.BY_ID(id), {
    headers: getAuthHeaders(),
  });
  return response.data;
};
