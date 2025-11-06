// src/api/axiosClient.ts
import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:8080", // BE doğru port
  withCredentials: false,
  headers: { "Content-Type": "application/json" },
});

// Hata olursa konsolda net görelim
axiosClient.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("API ERROR:", err?.response?.status, err?.response?.data || err.message);
    return Promise.reject(err);
  }
);

export default axiosClient;
