import { useEffect, useState } from "react";
import ComplaintList from "../../components/complaint/ComplaintList";
import FileComplaint from "../../components/complaint/FileComplaint";
import axios from "axios";
import { getStudentComplaints } from "../../api/complaintApi";
import SkeletonComplaint from "../../components/skeleton/student/SkeletonComplaint";
import { API_BASE } from "../../api/apiBase";

export default function Complaint() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [studentEmail, setStudentEmail] = useState<string | null>(null);
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
        if (user.role === "STUDENT" && !user.email) {
          window.location.href = "/complete-profile";
          return;
        }
        setStudentEmail(user.email);
        // Fetch complaints for this student
        if (user.email) {
          const complaintsRes = await getStudentComplaints(user.email);
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
          studentEmail={studentEmail}
          onComplaintFiled={handleComplaintFiled}
        />
      </section>

      <section className='bg-white rounded-xl shadow p-6 border'>
        <h2 className='text-xl font-bold mb-4 text-blue-800'>
          Complaint History
        </h2>
        {/* Responsive: table for sm+, cards for mobile */}
        <div className='hidden sm:block'>
          <ComplaintList complaints={complaints} />
        </div>
        <div className='sm:hidden flex flex-col gap-4'>
          {complaints.map((c) => (
            <div
              key={c.id}
              className='bg-blue-50 rounded-lg shadow p-3 text-xs'
            >
              <div className='flex justify-between mb-1'>
                <span className='font-bold'>{c.subject}</span>
                <span className='bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium shadow-sm'>
                  {c.status}
                </span>
              </div>
              <div className='grid grid-cols-2 gap-x-2 gap-y-1'>
                <span className='font-semibold'>Description:</span>
                <span>{c.description}</span>
                <span className='font-semibold'>Created:</span>
                <span>{new Date(c.createdAt).toLocaleDateString()}</span>
              </div>
              <div className='mt-2 text-xs text-gray-600'>
                <span className='font-semibold'>Status: </span>
                <span
                  className={
                    c.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold"
                      : c.status === "RESOLVED"
                      ? "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold"
                      : "bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold"
                  }
                >
                  {c.status}
                </span>
              </div>
            </div>
          ))}
          {complaints.length === 0 && (
            <div className='p-4 text-center'>No complaints found</div>
          )}
        </div>
      </section>
    </div>
  );
}
