import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE } from "../../api/apiBase";

interface Leave {
  id: number;
  fromDate: string;
  toDate: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  student: {
    id: number;
    name: string;
    rollNumber: string;
  };
}

export default function AdminLeaves() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const token = localStorage.getItem("token");

  const fetchLeaves = async () => {
    try {
      const res = await axios.get(`${API_BASE}/leaves`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaves(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch leave applications");
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleStatusUpdate = async (
    id: number,
    status: "APPROVED" | "REJECTED"
  ) => {
    try {
      await axios.patch(
        `${API_BASE}/leaves/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Leave ${status.toLowerCase()} successfully`);
      fetchLeaves();
    } catch (err) {
      toast.error("Failed to update leave status");
    }
  };

  return (
    <div className='p-2 sm:p-6'>
      <h1 className='text-2xl sm:text-3xl font-extrabold mb-6 text-blue-900'>
        Leave Applications
      </h1>
      <div className='overflow-x-auto bg-white rounded-xl shadow border p-2 sm:p-4'>
        <table className='min-w-[700px] w-full border-separate border-spacing-y-2 text-left text-xs sm:text-sm'>
          <thead className='bg-blue-50'>
            <tr>
              <th className='p-2 border-b'>Student</th>
              <th className='p-2 border-b'>Roll No</th>
              <th className='p-2 border-b'>From</th>
              <th className='p-2 border-b'>To</th>
              <th className='p-2 border-b'>Reason</th>
              <th className='p-2 border-b'>Status</th>
              <th className='p-2 border-b'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((leave) => (
              <tr
                key={leave.id}
                className='hover:bg-blue-50 rounded-lg transition'
              >
                <td className='p-2'>
                  <span className='bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium shadow-sm'>
                    {leave.student.name}
                  </span>
                </td>
                <td className='p-2'>{leave.student.rollNumber}</td>
                <td className='p-2'>
                  {new Date(leave.fromDate).toDateString()}
                </td>
                <td className='p-2'>{new Date(leave.toDate).toDateString()}</td>
                <td className='p-2'>{leave.reason}</td>
                <td className='p-2'>
                  <span
                    className={
                      leave.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold"
                        : leave.status === "APPROVED"
                        ? "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold"
                        : "bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold"
                    }
                  >
                    {leave.status}
                  </span>
                </td>
                <td className='p-2 space-x-2'>
                  {leave.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(leave.id, "APPROVED")}
                        className='bg-gradient-to-r from-green-500 to-green-700 text-white px-2 py-1 rounded shadow hover:from-green-600 hover:to-green-800 text-sm transition'
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(leave.id, "REJECTED")}
                        className='bg-gradient-to-r from-red-500 to-red-700 text-white px-2 py-1 rounded shadow hover:from-red-600 hover:to-red-800 text-sm transition'
                      >
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {leaves.length === 0 && (
              <tr>
                <td className='p-4 text-center' colSpan={7}>
                  No leave applications found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
