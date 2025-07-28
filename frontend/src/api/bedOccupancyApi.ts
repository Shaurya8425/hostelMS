import axiosInstance from "./axiosInstance";

export interface BedOccupancyData {
  dateRange: {
    startDate: string;
    endDate: string;
    totalDays: number;
  };
  summary: {
    totalBeds: number;
    totalPossibleBedDays: number;
    totalOccupiedBedDays: number;
    occupancyPercentage: number;
    availableBedDays: number;
  };
  wingStats: {
    [key: string]: {
      totalBeds: number;
      occupiedBedDays: number;
      totalPossibleBedDays: number;
      occupancyPercentage: number;
    };
  };
  studentOccupancy: Array<{
    studentId: number;
    studentName: string;
    room: string;
    bedDays: number;
    fromDate: string;
    toDate: string;
    type: "current" | "archived";
  }>;
}

// Get bed days occupancy data with time filter
export const getBedOccupancyData = async (
  startDate: string,
  endDate: string
): Promise<BedOccupancyData> => {
  const response = await axiosInstance.get("/bed-occupancy", {
    params: { startDate, endDate },
  });
  return response.data;
};
