import { jwtDecode } from 'jwt-decode';
import { refreshToken as apiRefreshToken } from '../services/api/auth';

export function isAuthenticated() {
  const token = localStorage.getItem('accessToken');
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    return !!decoded;
  } catch {
    return false;
  }
}

export function getUserRole() {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  try {
    const decoded = jwtDecode<{ role?: string }>(token);
    return decoded.role ?? null;
  } catch {
    return null;
  }
}

export function hasRefreshToken() {
  return !!localStorage.getItem('refreshToken');
}

// New: Clear both tokens
export function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('officerCommune');
}

export function isTokenExpiringSoon(bufferSeconds = 120) {
  const token = localStorage.getItem('accessToken');
  if (!token) return true;
  try {
    const decoded = jwtDecode<{ exp?: number }>(token);
    if (!decoded.exp) return true;
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp - now < bufferSeconds;
  } catch {
    return true;
  }
}

export async function tryRefreshToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return false;
  try {
    const data = await apiRefreshToken({ refreshToken });
    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
      return true;
    }
    return false;
  } catch {
    clearTokens();
    return false;
  }
}

export function getUserName() {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  try {
    const decoded = jwtDecode<{ name?: string }>(token);
    return decoded.name ?? null;
  } catch {
    return null;
  }
}