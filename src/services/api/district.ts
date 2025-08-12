import axios from 'axios';
import { API_ENDPOINTS } from '../../constants/api';

// Helper function to get authorization headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    Authorization: `Bearer ${token}`,
  };
};


export const assignToOfficer = async (data: any) => {
  const response = await axios.patch(API_ENDPOINTS.WARD.ASSIGN_TO_OFFICER, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};



export const unassignFromOfficer = async (accountId: string) => {
  const response = await axios.patch(API_ENDPOINTS.WARD.UNASSIGN_FROM_OFFICER(accountId), {}, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getOfficerDistrictHistory = async (accountId: string) => {
  const response = await axios.get(API_ENDPOINTS.WARD.VIEW_OFFICER_DISTRICT_CHANGE(accountId), {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};
