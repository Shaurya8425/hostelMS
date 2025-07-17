import axios from "axios";
import { API_BASE } from "./apiBase";

export const fileComplaint = async ({
  subject,
  description,
  studentEmail,
}: {
  subject: string;
  description: string;
  studentEmail: string;
}) => {
  const token = localStorage.getItem("token");
  return axios.post(
    `${API_BASE}/complaints`,
    { subject, description, studentEmail },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const getStudentComplaints = async (studentEmail: string) => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_BASE}/complaints/student/${studentEmail}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
