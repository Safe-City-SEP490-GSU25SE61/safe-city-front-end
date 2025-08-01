import { API_ENDPOINTS } from '../../constants/api';
import axios from 'axios';
// Helper function to get authorization headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    Authorization: `Bearer ${token}`,
  };
};
export const getIncident = async () => {
    const response = await axios.get(API_ENDPOINTS.INCIDENT.BASE, {
        headers: getAuthHeaders(),
    });
    return response.data.data;
};

export const getIncidentById = async (id: string) => {
    const response = await axios.get(API_ENDPOINTS.INCIDENT.BY_ID(id), {
        headers: getAuthHeaders(),
    });
    return response.data.data;
};
export const updateIncidentStatus = async (id: string, data: any) => {
    const response = await axios.patch(API_ENDPOINTS.INCIDENT.STATUS(id), data, {
        headers: getAuthHeaders(),
    });
    return response.data.data;
};
export const createIncidentNote = async (id: string, data: any) => {
    const response = await axios.post(API_ENDPOINTS.INCIDENT.NOTE(id), data, {
        headers: getAuthHeaders(),
    }); 
    return response.data.data;
};
export const transferIncident = async (id: string, data: any) => {
    const response = await axios.patch(API_ENDPOINTS.INCIDENT.TRANSFER(id), data, {
        headers: getAuthHeaders(),
    }); 
    return response.data.data;
};
