import axios from "axios";
import { API_BASE } from "./apiBase";

export const getLinenInventory = async () => {
  const res = await axios.get(`${API_BASE}/linen/inventory`);
  return res.data;
};

export const updateLinenInventory = async (data: {
  bedsheet: number;
  pillowCover: number;
}) => {
  const token = localStorage.getItem("token");
  const res = await axios.put(`${API_BASE}/linen/inventory`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
