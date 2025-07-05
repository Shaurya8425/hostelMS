// src/api/authApi.ts
import axios from "axios";

const API_BASE = "https://hostelms-3z7d.onrender.com/";

export const signup = async (data: {
  name: string;
  email: string;
  password: string;
  role?: "ADMIN" | "STUDENT";
}) => {
  return axios.post(`${API_BASE}/auth/signup`, data);
};

export const login = async (data: { email: string; password: string }) => {
  return axios.post(`${API_BASE}/auth/login`, data);
};
