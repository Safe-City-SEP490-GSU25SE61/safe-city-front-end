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
    VIEW_OFFICER_DISTRICT_CHANGE: (accountId: string) => `${API_BASE_URL}/districts/officer/${accountId}/history`,
    SEARCH: `${API_BASE_URL}/districts/search`,
    UNASSIGN_FROM_OFFICER: (accountId: string) => `${API_BASE_URL}/districts/unassign-from-officer/${accountId}`,
    
  },
  WARD: {
    BASE: `${API_BASE_URL}/wards`,
    BY_ID: (id: string) => `${API_BASE_URL}/wards/${id}`,
    ASSIGN_TO_OFFICER: `${API_BASE_URL}/wards/assign-to-officer`,
    SEARCH: `${API_BASE_URL}/wards/search`,
  },
  PACKAGES: {
    BASE: `${API_BASE_URL}/packages`,
    BY_ID: (id: string) => `${API_BASE_URL}/packages/${id}`,
    CHANGE_HISTORY: (id: string) => `${API_BASE_URL}/packages/${id}/history`,
  },
  ACHIEVEMENT: {
    CONFIG: `${API_BASE_URL}/achievement/config`,
    CONFIG_BY_ID: (id: string) => `${API_BASE_URL}/achievement/config/${id}`,
  },
  USERS: {
    BASE: `${API_BASE_URL}/accounts`,
    BY_ID: (id: string) => `${API_BASE_URL}/accounts/${id}`,
    CREATE: `${API_BASE_URL}/accounts`,
    DELETE: (id: string) => `${API_BASE_URL}/accounts/${id}`,
    GET_OFFICER: `${API_BASE_URL}/accounts/officer`,
  },
  INCIDENT: {
    BASE: `${API_BASE_URL}/reports/officer`,
    BY_ID: (id: string) => `${API_BASE_URL}/reports/${id}`,
    NOTE: (id: string) => `${API_BASE_URL}/reports/${id}/note`,
    STATUS: (id: string) => `${API_BASE_URL}/reports/${id}/status`,
  },
  // Add other groups (e.g., USERS, REPORTS) here as needed
};
