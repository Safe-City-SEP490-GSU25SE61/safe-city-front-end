export const API_BASE_URL = 'https://safe-city-back-end.onrender.com/api';

export const API_ENDPOINTS = {
  AUTH: {
    INIT_ROLES: `${API_BASE_URL}/auth/init-roles`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    VERIFY_ACCOUNT: `${API_BASE_URL}/auth/verify-account`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    REFRESH_TOKEN: `${API_BASE_URL}/auth/refresh-token`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    GET_USER_INFO: `${API_BASE_URL}/auth/get-user-info`,
  },
  // Add other groups (e.g., USERS, REPORTS) here as needed
};
