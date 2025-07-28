import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import SkeletonDashboard from "../../components/skeleton/student/SkeletonDashboard";
import { API_BASE } from "../../api/apiBase";

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
          setError(
            "Student profile not found. Please contact the administrator to complete your profile."
          );
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
    phone,
    gender,
    designation,
    guardianName,
    mobile,
    ticketNumber,
    division,
    course,
    fromDate,
    toDate,
    bedsheetCount,
    pillowCount,
    blanketCount,
    linenIssuedDate,
    room,
    complaints,
    leaves,
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
        <h2 className='font-bold text-lg mb-4 text-green-800 flex items-center gap-2'>
          <span>👤</span> Personal Information
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Basic Information */}
          <div className='space-y-3'>
            <h3 className='font-semibold text-gray-700 text-sm uppercase tracking-wide border-b pb-1'>
              Basic Details
            </h3>
            <div>
              <span className='font-semibold text-gray-600'>Name:</span>{" "}
              <span className='text-gray-800'>{name}</span>
            </div>
            <div>
              <span className='font-semibold text-gray-600'>Email:</span>{" "}
              <span className='text-gray-800'>{email}</span>
            </div>
            <div>
              <span className='font-semibold text-gray-600'>Phone:</span>{" "}
              <span className='text-gray-800'>{phone || "Not provided"}</span>
            </div>
            <div>
              <span className='font-semibold text-gray-600'>Mobile:</span>{" "}
              <span className='text-gray-800'>{mobile || "Not provided"}</span>
            </div>
            <div>
              <span className='font-semibold text-gray-600'>Gender:</span>{" "}
              <span className='text-gray-800'>{gender}</span>
            </div>
            <div>
              <span className='font-semibold text-gray-600'>
                Guardian Name:
              </span>{" "}
              <span className='text-gray-800'>
                {guardianName || "Not provided"}
              </span>
            </div>
          </div>

          {/* Academic & Administrative Information */}
          <div className='space-y-3'>
            <h3 className='font-semibold text-gray-700 text-sm uppercase tracking-wide border-b pb-1'>
              Academic & Administrative
            </h3>
            <div>
              <span className='font-semibold text-gray-600'>Designation:</span>{" "}
              <span
                className={`${
                  designation ? "text-gray-800" : "text-gray-400 italic"
                }`}
              >
                {designation || "Not assigned"}
              </span>
            </div>
            <div>
              <span className='font-semibold text-gray-600'>
                Ticket Number:
              </span>{" "}
              <span
                className={`${
                  ticketNumber
                    ? "text-blue-600 font-mono"
                    : "text-gray-400 italic"
                }`}
              >
                {ticketNumber || "Not assigned"}
              </span>
            </div>
            <div>
              <span className='font-semibold text-gray-600'>Division:</span>{" "}
              <span
                className={`${
                  division ? "text-gray-800" : "text-gray-400 italic"
                }`}
              >
                {division || "Not assigned"}
              </span>
            </div>
            <div>
              <span className='font-semibold text-gray-600'>Course:</span>{" "}
              <span
                className={`${
                  course ? "text-gray-800" : "text-gray-400 italic"
                }`}
              >
                {course || "Not assigned"}
              </span>
            </div>
            <div>
              <span className='font-semibold text-gray-600'>From Date:</span>{" "}
              <span
                className={`${
                  fromDate ? "text-gray-800" : "text-gray-400 italic"
                }`}
              >
                {fromDate ? new Date(fromDate).toLocaleDateString() : "Not set"}
              </span>
            </div>
            <div>
              <span className='font-semibold text-gray-600'>To Date:</span>{" "}
              <span
                className={`${
                  toDate ? "text-gray-800" : "text-gray-400 italic"
                }`}
              >
                {toDate ? new Date(toDate).toLocaleDateString() : "Not set"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className='bg-white rounded-xl shadow p-6 mb-4 border'>
        <h2 className='font-bold text-lg mb-4 text-green-800 flex items-center gap-2'>
          <span>🛏️</span> Linen Inventory
        </h2>
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-4'>
          <div className='text-center p-3 bg-blue-50 rounded-lg'>
            <div className='text-2xl font-bold text-blue-600'>
              {bedsheetCount || 0}
            </div>
            <div className='text-sm text-gray-600'>Bedsheets</div>
          </div>
          <div className='text-center p-3 bg-green-50 rounded-lg'>
            <div className='text-2xl font-bold text-green-600'>
              {pillowCount || 0}
            </div>
            <div className='text-sm text-gray-600'>Pillows</div>
          </div>
          <div className='text-center p-3 bg-purple-50 rounded-lg'>
            <div className='text-2xl font-bold text-purple-600'>
              {blanketCount || 0}
            </div>
            <div className='text-sm text-gray-600'>Blankets</div>
          </div>
        </div>
        {linenIssuedDate && (
          <div className='mt-4 p-3 bg-yellow-50 rounded-lg'>
            <span className='font-semibold text-yellow-800'>
              Last Linen Issue Date:
            </span>{" "}
            <span className='text-yellow-700'>
              {new Date(linenIssuedDate).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Enhanced linen info if available */}
        {profile.linenInfo && (
          <div className='mt-4 p-3 bg-gray-50 rounded-lg'>
            <h4 className='font-semibold text-gray-700 mb-2'>Linen Details</h4>
            <div className='text-sm text-gray-600'>
              <p>
                Issued Date:{" "}
                {profile.linenInfo.issuedDate
                  ? new Date(profile.linenInfo.issuedDate).toLocaleDateString()
                  : "Not recorded"}
              </p>
            </div>
          </div>
        )}
      </div>
      <div className='bg-white rounded-xl shadow p-6 mb-4 border'>
        <h2 className='font-bold text-lg mb-4 text-green-800 flex items-center gap-2'>
          <span>🏠</span> Room Assignment
        </h2>
        {room ? (
          <div className='bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3'>
              <div>
                <span className='font-semibold text-gray-700'>
                  Room Number:
                </span>{" "}
                <span className='text-blue-600 font-bold text-lg'>
                  {room.roomNumber}
                </span>
              </div>
              <div>
                <span className='font-semibold text-gray-700'>Block:</span>{" "}
                <span className='text-indigo-600 font-medium'>
                  {room.block}
                </span>
              </div>
              <div>
                <span className='font-semibold text-gray-700'>Floor:</span>{" "}
                <span className='text-gray-800'>
                  {room.floor === 0 ? "Ground Floor" : `Floor ${room.floor}`}
                </span>
              </div>
              <div>
                <span className='font-semibold text-gray-700'>Capacity:</span>{" "}
                <span className='text-gray-800'>
                  {room.capacity || "Not specified"}
                </span>
              </div>
              {room.designation && (
                <div>
                  <span className='font-semibold text-gray-700'>
                    Designation:
                  </span>{" "}
                  <span className='text-gray-800'>{room.designation}</span>
                </div>
              )}
              <div>
                <span className='font-semibold text-gray-700'>Status:</span>{" "}
                <span
                  className={
                    room.status === "AVAILABLE"
                      ? "bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold"
                      : room.status === "OCCUPIED"
                      ? "bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold"
                      : room.status === "RESERVED"
                      ? "bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold"
                      : "bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold"
                  }
                >
                  {room.status}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className='text-center py-8 text-gray-500 italic bg-gray-50 rounded-lg'>
            <div className='text-4xl mb-2'>🏠</div>
            <div>No room assigned yet</div>
            <div className='text-sm mt-1'>
              Please contact the administrator for room assignment
            </div>
          </div>
        )}
      </div>
      <div className='bg-white rounded-xl shadow p-6 mb-4 border'>
        <h2 className='font-bold text-lg mb-4 text-green-800 flex items-center gap-2'>
          <span>📝</span> Complaints
        </h2>
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
        <h2 className='font-bold text-lg mb-4 text-green-800 flex items-center gap-2'>
          <span>🏖️</span> Leaves
        </h2>
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
