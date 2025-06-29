import axios from "axios";

const API_BASE = "http://localhost:3000";

export const fileComplaint = async ({
  subject,
  description,
  studentId,
}: {
  subject: string;
  description: string;
  studentId: number;
}) => {
  const token = localStorage.getItem("token");
  return axios.post(
    `${API_BASE}/complaints`,
    { subject, description, studentId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const getStudentComplaints = async (studentId: number) => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_BASE}/complaints/student/${studentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
