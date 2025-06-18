import axios from 'axios';
import { API_ENDPOINTS } from '../../constants/api';

// Example: Get roles
export const initRoles = async () => {
  const response = await axios.get(API_ENDPOINTS.AUTH.INIT_ROLES);
  return response.data;
};

// Register
export const register = async (data: any) => {
  const response = await axios.post(API_ENDPOINTS.AUTH.REGISTER, data);
  return response.data;
};

// Verify Account
export const verifyAccount = async (data: any) => {
  const response = await axios.post(API_ENDPOINTS.AUTH.VERIFY_ACCOUNT, data);
  return response.data;
};

// Login
export const login = async (data: any) => {
  const response = await axios.post(API_ENDPOINTS.AUTH.LOGIN, data);
  return response.data;
};

// Refresh Token
export const refreshToken = async (data: any) => {
  const response = await axios.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, data);
  return response.data;
};

// Logout
export const logout = async (data: any) => {
  const response = await axios.post(API_ENDPOINTS.AUTH.LOGOUT, data);
  return response.data;
};

// Get User Info
export const getUserInfo = async (token: string) => {
  const response = await axios.get(API_ENDPOINTS.AUTH.GET_USER_INFO, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
