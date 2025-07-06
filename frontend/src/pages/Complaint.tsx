import { useEffect, useState } from "react";
import ComplaintList from "../components/complaint/ComplaintList";
import FileComplaint from "../components/complaint/FileComplaint";
import axios from "axios";
import { getStudentComplaints } from "../api/complaintApi";
import SkeletonComplaint from "../components/SkeletonComplaint";
import { API_BASE } from "../api/apiBase";

export default function Complaint() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkProfileAndFetchComplaints = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { user } = res.data;
        if (user.role === "STUDENT" && user.studentId === null) {
          window.location.href = "/complete-profile";
          return;
        }
        setStudentId(user.studentId);
        // Fetch complaints for this student
        if (user.studentId) {
          const complaintsRes = await getStudentComplaints(user.studentId);
          setComplaints(complaintsRes.data.data);
        }
      } catch (err) {
        // If unauthorized, redirect to login
        if (
          typeof err === "object" &&
          err !== null &&
          "response" in err &&
          typeof (err as any).response === "object" &&
          ((err as any).response.status === 401 ||
            (err as any).response.status === 403)
        ) {
          localStorage.removeItem("token");
          window.location.href = "/"; // or your login route
        }
      } finally {
        setLoading(false);
      }
    };

    checkProfileAndFetchComplaints();
  }, []);

  // Add new complaint to the list instantly
  const handleComplaintFiled = (complaint: any) => {
    setComplaints((prev) => [complaint, ...prev]);
  };

  if (loading) return <SkeletonComplaint />;

  return (
    <div className='max-w-3xl mx-auto p-6'>
      <h1 className='text-3xl font-extrabold mb-8 text-blue-900 flex items-center gap-2'>
        <span role='img' aria-label='complaint'>
          📝
        </span>{" "}
        My Complaints
      </h1>

      <section className='mb-10 bg-white rounded-xl shadow p-6 border'>
        <h2 className='text-xl font-bold mb-4 text-blue-800'>
          File a Complaint
        </h2>
        <FileComplaint
          studentId={studentId}
          onComplaintFiled={handleComplaintFiled}
        />
      </section>

      <section className='bg-white rounded-xl shadow p-6 border'>
        <h2 className='text-xl font-bold mb-4 text-blue-800'>
          Complaint History
        </h2>
        <ComplaintList complaints={complaints} />
      </section>
    </div>
  );
}
