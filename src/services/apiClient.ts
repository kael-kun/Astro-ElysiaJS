import axios, { AxiosInstance, AxiosError } from "axios";

const API_BASE_URL = import.meta.env.PUBLIC_API_URL || window.location.origin;

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add auth token and handle FormData
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // If data is FormData, let axios set the correct Content-Type with boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      axios.post(`${API_BASE_URL}/api/logout`, {}, { withCredentials: true }).catch(() => {});
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      window.location.replace("/auth/login");
    }

    if (error.response?.status === 500) {
      console.error("Server error occurred");
    }

    if (error.response?.status === 429) {
      window.dispatchEvent(new CustomEvent("rate-limit-exceeded"));
    }

    return Promise.reject(error);
  },
);

export default apiClient;
