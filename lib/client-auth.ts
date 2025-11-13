'use client';

export function getAuthToken(): string | null {
  if (typeof document === 'undefined') return null;
  
  // First try localStorage (backup)
  const localToken = localStorage.getItem('auth-token');
  if (localToken) return localToken;
  
  // Then try cookies (if not HttpOnly)
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(c => c.trim().startsWith('auth-token='));
  return tokenCookie ? tokenCookie.split('=')[1] : null;
}

export function setAuthToken(token: string) {
  // Store in localStorage as backup (since HttpOnly cookie can't be read by JS)
  localStorage.setItem('auth-token', token);
  // Also set in cookie (non-HttpOnly for client-side access)
  document.cookie = `auth-token=${token}; Path=/; SameSite=Lax; Max-Age=604800`;
}

export function removeAuthToken() {
  localStorage.removeItem('auth-token');
  document.cookie = 'auth-token=; Path=/; SameSite=Lax; Max-Age=0';
}

