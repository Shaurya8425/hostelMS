import { useEffect, useState } from "react";
import ComplaintList from "../components/complaint/ComplaintList";
import FileComplaint from "../components/complaint/FileComplaint";
import axios from "axios";
import { getStudentComplaints } from "../api/complaintApi";

export default function Complaint() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [studentId, setStudentId] = useState<number | null>(null);

  useEffect(() => {
    const checkProfileAndFetchComplaints = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get("http://localhost:3000/auth/me", {
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
      }
    };

    checkProfileAndFetchComplaints();
  }, []);

  // Add new complaint to the list instantly
  const handleComplaintFiled = (complaint: any) => {
    setComplaints((prev) => [complaint, ...prev]);
  };

  return (
    <div className='max-w-3xl mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-4'>My Complaints</h1>

      <section className='mb-8'>
        <h2 className='text-xl font-semibold mb-2'>File a Complaint</h2>
        <FileComplaint
          studentId={studentId}
          onComplaintFiled={handleComplaintFiled}
        />
      </section>

      <section>
        <h2 className='text-xl font-semibold mb-2'>Complaint History</h2>
        <ComplaintList complaints={complaints} />
      </section>
    </div>
  );
}
