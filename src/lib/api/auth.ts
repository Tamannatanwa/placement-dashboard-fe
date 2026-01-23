import axios from "axios";
import { setUserInfo, clearUserInfo } from "@/lib/utils/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface RegisterData {
  fullName?: string;
  email: string;
  password: string;
  role: "student" | "placement" | "admin";
}

export interface LoginData {
  email: string;
  password: string;
}

// Auth response shape based on backend API
// {
//   "access_token": "...",
//   "refresh_token": "...",
//   "token_type": "bearer",
//   "user": { "id": "...", "email": "...", "role": "admin" }
// }
export interface AuthResponse {
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  user?: {
    id: string;
    email: string;
    role: string;
  };
  message?: string;
}

export const authApi = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/api/v1/auth/register", data);
    // If register also returns tokens, store them
    if (typeof window !== "undefined" && response.data.access_token) {
      localStorage.setItem("access_token", response.data.access_token);
      if (response.data.refresh_token) {
        localStorage.setItem("refresh_token", response.data.refresh_token);
      }
      // Store user info for quick access
      if (response.data.user) {
        setUserInfo(response.data.user);
      }
      api.defaults.headers.common.Authorization = `Bearer ${response.data.access_token}`;
    }
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/api/v1/auth/login", data);
    if (typeof window !== "undefined" && response.data.access_token) {
      // Persist tokens for subsequent requests
      localStorage.setItem("access_token", response.data.access_token);
      if (response.data.refresh_token) {
        localStorage.setItem("refresh_token", response.data.refresh_token);
      }
      // Store user info for quick access
      if (response.data.user) {
        setUserInfo(response.data.user);
      }
      // Set default auth header for axios instance
      api.defaults.headers.common.Authorization = `Bearer ${response.data.access_token}`;
    }
    return response.data;
  },

  logout: async (): Promise<void> => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      clearUserInfo();
      delete api.defaults.headers.common.Authorization;
    }
  },

  getCurrentUser: async (): Promise<AuthResponse> => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    const response = await api.get<AuthResponse>("/api/v1/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // Store user info if available
    if (typeof window !== "undefined" && response.data.user) {
      setUserInfo(response.data.user);
    }
    return response.data;
  },
};

