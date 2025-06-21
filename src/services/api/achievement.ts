import axios from 'axios';
import { API_ENDPOINTS } from '../../constants/api';
export const getAllAchievementConfigs = async () => {
const response = await axios.get(API_ENDPOINTS.ACHIEVEMENT.CONFIG);
return response.data;
};
export const getAchievementConfigById = async (id: string) => {
const response = await axios.get(API_ENDPOINTS.ACHIEVEMENT.CONFIG_BY_ID(id));
return response.data;
};
export const createAchievementConfig = async (data: any) => {
const response = await axios.post(API_ENDPOINTS.ACHIEVEMENT.CONFIG, data);
return response.data;
};
export const updateAchievementConfig = async (id: string, data: any) => {
const response = await axios.put(API_ENDPOINTS.ACHIEVEMENT.CONFIG_BY_ID(id), data);
return response.data;
};
export const deleteAchievementConfig = async (id: string) => {
const response = await axios.delete(API_ENDPOINTS.ACHIEVEMENT.CONFIG_BY_ID(id));
return response.data;
};