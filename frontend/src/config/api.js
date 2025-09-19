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

// Helper function to format rating display
export const formatRating = (rating, ratingCount = 0) => {
  // Check if rating is 0, null, undefined, or no ratings yet
  if (!rating || rating === 0 || ratingCount === 0) {
    return "Not rated yet";
  }
  
  // Format to 3 significant figures
  const formatted = Number(rating.toPrecision(3));
  return `${formatted} (${ratingCount} ${ratingCount === 1 ? 'rating' : 'ratings'})`;
};