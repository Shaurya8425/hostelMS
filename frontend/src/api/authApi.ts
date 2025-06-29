// src/api/authApi.ts
import axios from "axios";

const API_BASE = "http://localhost:3000"; // or your backend URL

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
