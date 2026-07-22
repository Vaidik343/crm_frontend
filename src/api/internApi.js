// src/api/internApi.js

import axios from "axios";

const internApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// ─────────────────────────────────────────────────────────────
// Request Interceptor
// Adds Intern JWT to every request
// ─────────────────────────────────────────────────────────────
internApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("intern_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─────────────────────────────────────────────────────────────
// Response Interceptor
// Redirect intern to intern login when token expires
// ─────────────────────────────────────────────────────────────
internApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest =
      error.config?.url?.includes("/intern/login");

    if (
      error.response?.status === 401 &&
      !isLoginRequest
    ) {
      localStorage.removeItem("intern_token");
      window.location.href = "/intern/login";
    }

    return Promise.reject(error);
  }
);

export default internApi;