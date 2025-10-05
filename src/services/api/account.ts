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

// Get account statistics for admin dashboard
export const getAccountStatistics = async () => {
  const response = await axios.get(API_ENDPOINTS.USERS.GET_STATISTICS);
  return response.data;
};

// Suspend/unsuspend user by ID
export const suspendUser = async (id: string, status: 'active' | 'inactive' = 'inactive') => {
  const response = await axios.patch(
    API_ENDPOINTS.USERS.SUSPEND(id),
    { status }
  );
  return response.data;
};
export const getUserProfile = async () =>{
  const response = await axios.get(API_ENDPOINTS.USERS.PROFILE);
  return response.data;
}
export const getUserHistoryPoint = async (id : string) =>{
  const response = await axios.get(API_ENDPOINTS.USERS.USER_POINT(id));
  return response.data;
}
