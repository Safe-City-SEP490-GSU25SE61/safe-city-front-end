import axios from 'axios';
import { API_ENDPOINTS } from '../../constants/api';

// Helper function to get authorization headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const getCommuneData = async () => {
  const response = await axios.get(API_ENDPOINTS.MAP.COMMUNE_DATA, {
    headers: getAuthHeaders(),
  });
  return response.data;
};