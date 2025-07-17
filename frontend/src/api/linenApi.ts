import axios from "axios";
import { API_BASE } from "./apiBase";

export const getLinenInventory = async () => {
  const res = await axios.get(`${API_BASE}/linen/inventory`);
  return res.data;
};
