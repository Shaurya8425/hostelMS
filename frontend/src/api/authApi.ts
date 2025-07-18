// src/api/authApi.ts
import axios from "axios";
import { API_BASE } from "./apiBase";

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
