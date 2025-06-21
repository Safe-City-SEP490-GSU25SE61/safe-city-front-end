import axios from 'axios';
import { API_ENDPOINTS } from '../../constants/api';

// Helper function to get authorization headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const getAllWards = async () => {
  const response = await axios.get(API_ENDPOINTS.WARD.BASE, {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};

export const createWard = async (data: any) => {
  const response = await axios.post(API_ENDPOINTS.WARD.BASE, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getWardById = async (id: string) => {
  const response = await axios.get(API_ENDPOINTS.WARD.BY_ID(id), {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};

export const updateWardById = async (id: string, data: any) => {
  const response = await axios.put(API_ENDPOINTS.WARD.BY_ID(id), data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const deleteWardById = async (id: string) => {
  const response = await axios.delete(API_ENDPOINTS.WARD.BY_ID(id), {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const searchWards = async (params: any) => {
  const response = await axios.get(API_ENDPOINTS.WARD.SEARCH, { 
    params,
    headers: getAuthHeaders(),
  });
  return response.data;
};
