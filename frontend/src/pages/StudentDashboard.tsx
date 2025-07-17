import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import SkeletonDashboard from "../components/SkeletonDashboard";
import { API_BASE } from "../api/apiBase";

export default function StudentDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        // Get user info
        const res = await axios.get(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { user } = res.data;
        console.log("Fetched user from /auth/me:", user);
        if (user.role === "STUDENT" && user.studentId === null) {
          window.location.href = "/complete-profile";
          return;
        }
        // Get student profile (with room, complaints, leaves, payments)
        console.log("Requesting /students/" + user.studentId);
        const studentRes = await axios.get(
          `${API_BASE}/students/${user.studentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Robustly handle both { data: student } and student object
        const studentData = studentRes.data?.data || studentRes.data;
        setProfile(studentData);
        console.log("Student profile loaded:", studentData);
      } catch (err: any) {
        if (err?.response?.status === 404) {
          setError(
            "Student profile not found. Please complete your profile or contact the administrator."
          );
        } else {
          setError("Failed to load dashboard data");
        }
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          localStorage.removeItem("token");
          window.location.href = "/";
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <SkeletonDashboard />;
  if (error) return <div className='p-6 text-red-500'>{error}</div>;
  if (!profile) return null;

  const {
    name,
    email,
    // branch removed
    // year removed
    // rollNumber removed
    gender,
    division,
    course,
    fromDate,
    toDate,
    linenIssued,
    room,
    complaints,
    leaves,
    // payments removed
  } = profile;

  return (
    <div className='flex flex-col max-w-3xl mx-auto p-6 gap-6'>
      <h1 className='text-3xl font-extrabold mb-8 text-green-900 flex items-center gap-2'>
        <span role='img' aria-label='student'>
          🎓
        </span>{" "}
        Student Dashboard
      </h1>
      <div className='bg-white rounded-xl shadow p-6 mb-4 border'>
        <h2 className='font-bold text-lg mb-3 text-green-800'>Profile</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2'>
          <div>
            <span className='font-semibold'>Name:</span> {name}
          </div>
          <div>
            <span className='font-semibold'>Email:</span> {email}
          </div>
          {/* Removed branch, year, roll number */}
          <div>
            <span className='font-semibold'>Gender:</span> {gender}
          </div>
          <div>
            <span className='font-semibold'>Division:</span> {division}
          </div>
          <div>
            <span className='font-semibold'>Course:</span> {course}
          </div>
          <div>
            <span className='font-semibold'>From:</span>{" "}
            {fromDate ? new Date(fromDate).toLocaleDateString() : ""}
          </div>
          <div>
            <span className='font-semibold'>To:</span>{" "}
            {toDate ? new Date(toDate).toLocaleDateString() : ""}
          </div>
          <div>
            <span className='font-semibold'>Linen Issued:</span>{" "}
            {linenIssued === "BEDSHEET"
              ? "Bedsheet"
              : linenIssued === "PILLOW_COVER"
              ? "Pillow Cover"
              : linenIssued}
          </div>
        </div>
      </div>
      <div className='bg-white rounded-xl shadow p-6 mb-4 border'>
        <h2 className='font-bold text-lg mb-3 text-green-800'>
          Room Assignment
        </h2>
        {room ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2'>
            <div>
              <span className='font-semibold'>Block:</span> {room.block}
            </div>
            <div>
              <span className='font-semibold'>Floor:</span> {room.floor}
            </div>
            <div>
              <span className='font-semibold'>Designation:</span>{" "}
              {room.designation}
            </div>
            <div>
              <span className='font-semibold'>Status:</span>{" "}
              <span
                className={
                  room.status === "AVAILABLE"
                    ? "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold"
                    : room.status === "OCCUPIED"
                    ? "bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold"
                    : room.status === "RESERVED"
                    ? "bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold"
                    : "bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold"
                }
              >
                {room.status}
              </span>
            </div>
            <div>
              <span className='font-semibold'>Room No:</span> {room.roomNumber}
            </div>
          </div>
        ) : (
          <div className='text-gray-500 italic'>No room assigned</div>
        )}
      </div>
      <div className='bg-white rounded-xl shadow p-6 mb-4 border'>
        <h2 className='font-bold text-lg mb-3 text-green-800'>Complaints</h2>
        {complaints && complaints.length > 0 ? (
          <ul className='list-disc ml-6 space-y-1'>
            {complaints.map((c: any) => (
              <li key={c.id}>
                <span className='font-semibold'>{c.subject}</span> -{" "}
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
                </span>{" "}
                ({new Date(c.createdAt).toLocaleDateString()})
              </li>
            ))}
          </ul>
        ) : (
          <div className='text-gray-500 italic'>No complaints filed</div>
        )}
        <Link
          to='/student/complaints'
          className='text-blue-600 underline mt-2 inline-block font-semibold hover:text-blue-800 transition'
        >
          File Complaint
        </Link>
      </div>
      <div className='bg-white rounded-xl shadow p-6 mb-4 border'>
        <h2 className='font-bold text-lg mb-3 text-green-800'>Leaves</h2>
        {leaves && leaves.length > 0 ? (
          <ul className='list-disc ml-6 space-y-1'>
            {leaves.map((l: any) => (
              <li key={l.id}>
                {new Date(l.fromDate).toLocaleDateString()} to{" "}
                {new Date(l.toDate).toLocaleDateString()} -{" "}
                <span
                  className={
                    l.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold"
                      : l.status === "APPROVED"
                      ? "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold"
                      : "bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold"
                  }
                >
                  {l.status}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className='text-gray-500 italic'>No leave applications</div>
        )}
        <Link
          to='/student/leaves'
          className='text-blue-600 underline mt-2 inline-block font-semibold hover:text-blue-800 transition'
        >
          Apply for Leave
        </Link>
      </div>
      {/* Fee Payments section removed */}
    </div>
  );
}
