// utils/cookies.js - Cookie Management

export function setCookie(name, value, options = {}) {
  if (typeof window === 'undefined') return;

  const { expires = 7, path = '/' } = options;
  const date = new Date();
  date.setTime(date.getTime() + (expires * 24 * 60 * 60 * 1000));
  
  document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=${path}`;
}

export function getCookie(name) {
  if (typeof window === 'undefined') return null;

  const nameEQ = name + '=';
  const cookies = document.cookie.split(';');

  for (let cookie of cookies) {
    let c = cookie.trim();
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length);
    }
  }
  return null;
}

export function removeCookie(name) {
  if (typeof window === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

// Theme management
export function setTheme(theme) {
  setCookie('exonvc_theme', theme, { expires: 365 });
}

export function getTheme() {
  return getCookie('exonvc_theme') || 'dark';
}

// Auth management  
export function setAuthToken(token) {
  setCookie('exonvc_auth_token', token);
}

export function getAuthToken() {
  return getCookie('exonvc_auth_token');
}

export function removeAuthToken() {
  removeCookie('exonvc_auth_token');
}

export function setUserData(userData) {
  setCookie('exonvc_user_data', JSON.stringify(userData));
}

export function getUserData() {
  try {
    const userData = getCookie('exonvc_user_data');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    return null;
  }
}

export function removeUserData() {
  removeCookie('exonvc_user_data');
}

export function isAuthenticated() {
  const token = getAuthToken();
  const userData = getUserData();
  return !!(token && userData);
}
