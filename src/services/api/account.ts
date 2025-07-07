import axios from 'axios';
import { API_ENDPOINTS } from '../../constants/api';

// Get list of users (with optional query params for filtering, pagination, etc.)
export const getUsers = async (params?: any) => {
  const response = await axios.get(API_ENDPOINTS.USERS.BASE, { params });
  return response.data;
};

// Get user by ID
export const getUserById = async (id: string) => {
  const response = await axios.get(API_ENDPOINTS.USERS.BY_ID(id));
  return response.data;
};

// Create a new user
export const createUser = async (userData: any) => {
  const response = await axios.post(API_ENDPOINTS.USERS.CREATE, userData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getOfficers= async () => {
  const response = await axios.get(API_ENDPOINTS.USERS.GET_OFFICER);
  return response.data.data;
};

// Delete user by ID
export const deleteUser = async (id: string) => {
  const response = await axios.delete(API_ENDPOINTS.USERS.DELETE(id));
  return response.data;
};

