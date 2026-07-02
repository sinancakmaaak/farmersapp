// Token işlemleri için sabit değerler
const TOKEN_KEY = 'auth_token';
const TOKEN_PREFIX = 'Bearer';

// Token alma
export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// Token kaydetme
export const setAuthToken = (token: string): void => {
  if (token.startsWith(TOKEN_PREFIX)) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.setItem(TOKEN_KEY, `${TOKEN_PREFIX} ${token}`);
  }
};

// Token silme
export const removeAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

// Token kontrolü
export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  return !!token;
};

// Auth header oluşturma
export const getAuthHeader = (): { Authorization: string } | null => {
  const token = getAuthToken();
  if (!token) return null;
  
  // Token zaten Bearer prefix'ine sahipse direkt kullan
  if (token.startsWith(TOKEN_PREFIX)) {
    return { Authorization: token };
  }
  
  // Bearer prefix'i ekle
  return { Authorization: `${TOKEN_PREFIX} ${token}` };
}; 