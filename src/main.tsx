import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import axios from 'axios';
import { isTokenExpiringSoon, tryRefreshToken } from './utils/auth';

axios.interceptors.request.use(async (config) => {
  // Skip interceptor for refresh token requests
  if (config.url?.includes('/auth/refresh-token')) {
    return config;
  }
  if (isTokenExpiringSoon()) {
    await tryRefreshToken();
  }
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Axios interceptor set
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
