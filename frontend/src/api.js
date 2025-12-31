import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:8000/api";

export const api = axios.create({
  baseURL: API_URL
});


// Automatically attach token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors (token expired)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh");
        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        // Try to refresh token
        const res = await axios.post(`${API_URL}/auth/refresh/`, {
          refresh: refreshToken
        });

        const newAccessToken = res.data.access;
        localStorage.setItem("access", newAccessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.href = "/admin/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export function setAuth(token) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}