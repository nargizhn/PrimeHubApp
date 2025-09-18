// API Configuration
// Change this URL to point to your deployed backend or local development server
const API_BASE_URL = process.env.REACT_APP_API_URL || "https://backend-905509257688.europe-west1.run.app";

export const API_ENDPOINTS = {
  BASE_URL: API_BASE_URL,
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    SIGNUP: `${API_BASE_URL}/api/auth/signup`,
  },
  VENDORS: {
    BASE: `${API_BASE_URL}/api/vendors`,
    BY_ID: (id) => `${API_BASE_URL}/api/vendors/${id}`,
    RATING: (id) => `${API_BASE_URL}/api/vendors/${id}/rating`,
  },
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function for API calls with authentication
export const apiCall = async (url, options = {}) => {
  const defaultOptions = {
    headers: getAuthHeaders(),
    ...options,
  };

  return fetch(url, defaultOptions);
};