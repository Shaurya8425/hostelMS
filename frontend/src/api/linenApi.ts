import axiosInstance from "./axiosInstance";

export const getLinenInventory = async () => {
  try {
    const res = await axiosInstance.get("/linen/inventory");
    console.log("Linen inventory API response:", res.data);
    // Ensure we're returning data with the expected properties
    const defaultInventory = {
      bedsheet: 0,
      bedsheetActive: 0,
      bedsheetInHand: 0,
      pillowCover: 0,
      pillowActive: 0,
      pillowInHand: 0,
      blanket: 0,
      blanketActive: 0,
      blanketInHand: 0,
    };

    // Return the response data, but fall back to default values if properties are missing
    return res.data ? { ...defaultInventory, ...res.data } : defaultInventory;
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
