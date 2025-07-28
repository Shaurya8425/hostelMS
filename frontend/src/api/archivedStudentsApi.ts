import axiosInstance from "./axiosInstance";

export interface ArchivedStudent {
  id: number;
  originalId: number;
  name: string;
  email: string;
  phone: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  designation: string | null;
  guardianName: string | null;
  mobile: string | null;
  ticketNumber: string | null;
  division: string | null;
  course: string | null;
  fromDate: string | null;
  toDate: string | null;
  bedsheetCount: number;
  pillowCount: number;
  blanketCount: number;
  linenIssuedDate: string | null;
  roomNumber: string | null;
  deletedAt: string;
  deletedBy: string | null;
  originalCreatedAt: string;
  originalUpdatedAt: string;
}

export interface ArchivedStudentsResponse {
  data: ArchivedStudent[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Get all archived students with pagination and search
export const getArchivedStudents = async (
  search: string = "",
  page: number = 1,
  limit: number = 10
): Promise<ArchivedStudentsResponse> => {
  const response = await axiosInstance.get("/archived-students", {
    params: { search, page, limit },
  });
  return response.data;
};

// Get a specific archived student by ID
export const getArchivedStudent = async (
  id: number
): Promise<ArchivedStudent> => {
  const response = await axiosInstance.get(`/archived-students/${id}`);
  return response.data;
};

// Get archived student by original student ID
export const getArchivedStudentByOriginalId = async (
  originalId: number
): Promise<ArchivedStudent> => {
  const response = await axiosInstance.get(
    `/archived-students/original/${originalId}`
  );
  return response.data;
};

// Permanently delete an archived student (admin only)
export const permanentlyDeleteArchivedStudent = async (
  id: number
): Promise<void> => {
  await axiosInstance.delete(`/archived-students/${id}`);
};
