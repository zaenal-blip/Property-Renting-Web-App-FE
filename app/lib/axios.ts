import axios, { AxiosError } from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds
  withCredentials: true,
});

// Request interceptor to attach JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem("accessToken");
      localStorage.removeItem("auth-storage");

      // Redirect to login page
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login")
      ) {
        window.location.href =
          "/login?redirect=" + encodeURIComponent(window.location.pathname);
      }
    }

    // Handle 403 Forbidden - insufficient permissions
    if (error.response?.status === 403) {
      console.error("Access forbidden:", error.response.data);
    }

    return Promise.reject(error);
  },
);
