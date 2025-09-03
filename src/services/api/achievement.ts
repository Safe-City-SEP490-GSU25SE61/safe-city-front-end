import axios from 'axios';
import { API_ENDPOINTS } from '../../constants/api';

// Achievement interfaces
export interface AchievementConfig {
  id?: string;
  name: string;
  description: string;
  points: number;
  benefit: string;
  image?: string;
  status?: 'active' | 'inactive';
  createdDate?: string;
  lastUpdated?: string;
}

export interface AchievementCreateData {
  name: string;
  description: string;
  minPoint: number;
  benefit: string;
  logoFile?: File;
  image?: string;
}

const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
      Authorization: `Bearer ${token}`,
    };
  };

const getAuthHeadersForFormData = () => {
    const token = localStorage.getItem('accessToken');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    };
  };

export const getAllAchievementConfigs = async () => {
  const response = await axios.get(API_ENDPOINTS.ACHIEVEMENT.CONFIG, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getAchievementConfigById = async (id: string) => {
  const response = await axios.get(API_ENDPOINTS.ACHIEVEMENT.CONFIG_BY_ID(id), {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const createAchievementConfig = async (data: AchievementCreateData) => {
  // Check if we have a file to upload
  if (data.logoFile) {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('minPoint', data.minPoint.toString());
    formData.append('benefit', data.benefit);
    formData.append('logo', data.logoFile);
    
    const response = await axios.post(API_ENDPOINTS.ACHIEVEMENT.CONFIG, formData, {
      headers: getAuthHeadersForFormData(),
    });
    return response.data;
  } else {
    // No file upload, send regular JSON
    const { logoFile, ...jsonData } = data;
    const response = await axios.post(API_ENDPOINTS.ACHIEVEMENT.CONFIG, jsonData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  }
};

export const updateAchievementConfig = async (id: string, data: AchievementCreateData) => {
  // Check if we have a file to upload
  if (data.logoFile) {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('minPoint', data.minPoint.toString());
    formData.append('benefit', data.benefit);
    formData.append('logo', data.logoFile);
   

    const response = await axios.put(API_ENDPOINTS.ACHIEVEMENT.CONFIG_BY_ID(id), formData, {
      headers: getAuthHeadersForFormData(),
    });
    return response.data;
  } else {
    // No file upload, send regular JSON
    const { logoFile, ...jsonData } = data;
    const response = await axios.post(API_ENDPOINTS.ACHIEVEMENT.CONFIG_BY_ID(id), { ...jsonData, _method: 'PUT' }, {
      headers: getAuthHeaders(),
    });
    return response.data;
  }
};

export const deleteAchievementConfig = async (id: string) => {
  const response = await axios.delete(API_ENDPOINTS.ACHIEVEMENT.CONFIG_BY_ID(id), {
    headers: getAuthHeaders(),
  });
  return response.data;
};