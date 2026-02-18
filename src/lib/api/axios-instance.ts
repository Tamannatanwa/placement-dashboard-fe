import axios, { AxiosInstance } from "axios";

// In production (Vercel), use relative URLs so requests go through Vercel's reverse proxy
// This avoids HTTPS → HTTP mixed-content errors
// In development, use NEXT_PUBLIC_BASE_URL or fallback to localhost:8000
const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? ""
    : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";

// Create a SINGLE shared axios instance (singleton pattern)
let apiInstance: AxiosInstance | null = null;

export const getApiInstance = (): AxiosInstance => {
  // Return existing instance if already created
  if (apiInstance) {
    return apiInstance;
  }

  // Create new instance only once
  apiInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
    // Slightly higher timeout to accommodate recommendation queries while still failing fast on real issues
    timeout: 15000,
  });

  // Add auth token to requests
  apiInstance.interceptors.request.use(
    (config) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("access_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Handle 401 errors - token expired or invalid
  apiInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Clear invalid token and redirect to login
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user_info");
          // Only redirect if we're not already on login page
          if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login";
          }
        }
      }
      return Promise.reject(error);
    }
  );

  return apiInstance;
};

// Export the base URL for other uses
export { API_BASE_URL };


