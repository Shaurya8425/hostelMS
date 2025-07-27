import axiosInstance from "./axiosInstance";

export const getLinenInventory = async () => {
  try {
    const res = await axiosInstance.get("/linen/inventory");
    console.log("Linen inventory response:", res.data);
    return res.data;
  } catch (error: any) {
    console.error(
      "Error fetching linen inventory:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const updateLinenInventory = async (data: {
  bedsheet: number;
  pillowCover: number;
  blanket?: number;
}) => {
  try {
    const res = await axiosInstance.put("/linen/inventory", data);
    return res.data;
  } catch (error: any) {
    console.error(
      "Error updating linen inventory:",
      error.response?.data || error.message
    );
    throw error;
  }
};
