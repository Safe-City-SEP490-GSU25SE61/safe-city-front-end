import { API_ENDPOINTS } from '../../constants/api';
import axios from 'axios';
// Helper function to get authorization headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    Authorization: `Bearer ${token}`,
  };
};
export const getIncident = async (range?: 'day' | 'week' | 'year' | 'month', 
    sort?: 'newest' | 'oldest',
    includeRelated?: boolean,
    priorityFilter?: string,
    fromDate?: string,
    toDate?: string) => {
        const params: any = {};
        if (range) params.range = range;
        if (sort) params.sort = sort;
        if (includeRelated !== undefined) params.includeRelated = includeRelated;
        if (priorityFilter) params.priorityFilter = priorityFilter;
        if (fromDate) params.fromDate = fromDate;
        if (toDate) params.toDate = toDate;
    const response = await axios.get(API_ENDPOINTS.INCIDENT.BASE, {
        headers: getAuthHeaders(),
        params: params,
    });
    return response.data.data;
};
export const getIncidentAdmin = async (
    range?: 'day' | 'week' | 'year' | 'month', 
    sort?: 'newest' | 'oldest',
    includeRelated?: boolean,
    priorityFilter?: string,
    fromDate?: string,
    toDate?: string
) => {
    const params: any = {};
    if (range) params.range = range;
    if (sort) params.sort = sort;
    if (includeRelated !== undefined) params.includeRelated = includeRelated;
    if (priorityFilter) params.priorityFilter = priorityFilter;
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    
    const response = await axios.get(API_ENDPOINTS.INCIDENT.BASE_ADMIN, {
        headers: getAuthHeaders(),
        params,
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
export const updateIncidentVisibility = async (id: string, data: any) => {
    const response = await axios.patch(API_ENDPOINTS.INCIDENT.ISVISIBLE(id), data, {
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
export const getIncidentStatisticsAdmin = async (range?: 'week' | 'month' | 'quarter') => {
    const params = range ? { range } : {};
    const response = await axios.get(API_ENDPOINTS.INCIDENT.INCIDENT_STATISTICS_ADMIN, {
        headers: getAuthHeaders(),
        params,
    }); 
    return response.data;
};
export const getIncidentStatisticsOfficer = async (range?: 'week' | 'month' | 'quarter') => {
    const params = range ? { range } : {};
    const response = await axios.get(API_ENDPOINTS.INCIDENT.INCIDENT_STATISTICS_OFFICER, {
        headers: getAuthHeaders(),
        params,
    }); 
    return response.data;
};

