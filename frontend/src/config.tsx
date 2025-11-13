const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 10000,
};