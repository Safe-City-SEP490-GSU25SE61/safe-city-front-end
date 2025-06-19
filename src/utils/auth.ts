import { jwtDecode } from 'jwt-decode';

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
}