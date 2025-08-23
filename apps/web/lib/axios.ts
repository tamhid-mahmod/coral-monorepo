import type { AxiosRequestConfig } from "axios";

import axios from "axios";

import { CONFIG } from "@/global-config";

import { paths } from "@/routes/paths";

import { getSession, updateSession } from "@/auth/context";

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: CONFIG.serverUrl });

let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];

// Handle logout and prevent infinite loops
const handleLogout = () => {
  if (window.location.pathname !== paths.auth.signIn) {
    window.location.href = paths.auth.signIn;
  }
};

// Subscribe to token refresh
const subscribeTokenRefresh = (callback: () => void) => {
  refreshSubscribers.push(callback);
};

// Execute queued requests after refresh
const onRefreshSuccess = () => {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
};

// Request interceptor to add access token
axiosInstance.interceptors.request.use(
  async (config) => {
    const session = await getSession();

    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle expired tokens and refresh logic
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loops by excluding refresh endpoint
    if (originalRequest.url === endpoints.auth.refreshToken) {
      return Promise.reject(error);
    }

    const session = await getSession();

    if (error.response?.status === 401 && !originalRequest._retry && session) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh(() => resolve(axiosInstance(originalRequest)));
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      if (!session?.refreshToken) {
        handleLogout();
        return Promise.reject(new Error("No refresh token available"));
      }

      try {
        // Use axiosInstance to ensure baseURL is used
        const response = await axiosInstance.post(endpoints.auth.refreshToken, {
          refreshToken: session.refreshToken,
        });

        // Update session with new tokens
        const { accessToken, refreshToken } = response.data;
        await updateSession({ accessToken, refreshToken });

        isRefreshing = false;
        onRefreshSuccess();
        return axiosInstance(originalRequest);
      } catch (error) {
        isRefreshing = false;
        refreshSubscribers = [];
        handleLogout();

        return Promise.reject(error);
      }
    }

    return Promise.reject(
      (error.response && error.response.data) || "Something went wrong!"
    );
  }
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args];

    const res = await axiosInstance.get(url, { ...config });

    return res.data;
  } catch (error) {
    console.error("Failed to fetch:", error);
    throw error;
  }
};

// ----------------------------------------------------------------------

export const endpoints = {
  auth: {
    me: "/api/auth/me",
    signIn: "/api/auth/sign-in",
    signUp: "/api/auth/sign-up",
    verifyAccount: "/api/auth/verify-account",
    refreshToken: "/api/auth/refresh-token",
  },
};
