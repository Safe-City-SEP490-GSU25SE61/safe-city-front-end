import axios from 'axios';
import { API_ENDPOINTS } from '../../constants/api';

// Helper function to get authorization headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const getAllDistricts = async () => {
  const response = await axios.get(API_ENDPOINTS.DISTRICTS.BASE, {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};

export const createDistrict = async (data: any) => {
  const response = await axios.post(API_ENDPOINTS.DISTRICTS.BASE, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getDistrictById = async (id: string) => {
  const response = await axios.get(API_ENDPOINTS.DISTRICTS.BY_ID(id), {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};

export const updateDistrictById = async (id: string, data: any) => {
  const response = await axios.put(API_ENDPOINTS.DISTRICTS.BY_ID(id), data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const deleteDistrictById = async (id: string) => {
  const response = await axios.delete(API_ENDPOINTS.DISTRICTS.BY_ID(id), {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const assignToOfficer = async (data: any) => {
  const response = await axios.patch(API_ENDPOINTS.DISTRICTS.ASSIGN_TO_OFFICER, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const searchDistricts = async (params: any) => {
  const response = await axios.get(API_ENDPOINTS.DISTRICTS.SEARCH, { 
    params,
    headers: getAuthHeaders(),
  });
  return response.data;
};
