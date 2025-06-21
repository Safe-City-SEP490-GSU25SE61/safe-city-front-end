export const API_BASE_URL = '/api';

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
  DISTRICTS: {
    BASE: `${API_BASE_URL}/districts`,
    BY_ID: (id: string) => `${API_BASE_URL}/districts/${id}`,
    ASSIGN_TO_OFFICER: `${API_BASE_URL}/districts/assign-to-officer`,
    SEARCH: `${API_BASE_URL}/districts/search`,
  },
  WARD: {
    BASE: `${API_BASE_URL}/wards`,
    BY_ID: (id: string) => `${API_BASE_URL}/wards/${id}`,
    ASSIGN_TO_OFFICER: `${API_BASE_URL}/wards/assign-to-officer`,
    SEARCH: `${API_BASE_URL}/wards/search`,
  },
  // Add other groups (e.g., USERS, REPORTS) here as needed
};
