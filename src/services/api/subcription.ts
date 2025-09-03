import axios from 'axios';
import { API_ENDPOINTS } from '../../constants/api';
const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
      Authorization: `Bearer ${token}`,
    };
  };
export const getSubscriptionsMetrics = async () => {
  const response = await axios.get(API_ENDPOINTS.SUBCRIPTIONS.BASE, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getSubscriptionsHistory = async () => {
  const response = await axios.get(API_ENDPOINTS.SUBCRIPTIONS.HISTORY, {
    headers: getAuthHeaders(),
  });
  return response.data;
};