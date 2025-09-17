const getDefaultApiBase = () => {
  if (typeof window !== 'undefined' && window.location) {
    return `${window.location.origin}/api`;
  }
  return '/api';
};

const resolveBaseUrl = () => {
  const candidates = [
    typeof import.meta !== 'undefined' ? import.meta.env?.VITE_API_BASE_URL : undefined,
    typeof import.meta !== 'undefined' ? import.meta.env?.REACT_APP_API_BASE : undefined,
    typeof process !== 'undefined' ? process.env?.VITE_API_BASE_URL : undefined,
    typeof process !== 'undefined' ? process.env?.REACT_APP_API_BASE : undefined,
  ].filter(Boolean);

  const base = candidates.length > 0 ? candidates[0] : getDefaultApiBase();
  return base?.endsWith('/') ? base.slice(0, -1) : base;
};

export const API_BASE_URL = resolveBaseUrl();
