import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

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
      const res = await axios.get("http://localhost:3000/leaves", {
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
        `http://localhost:3000/leaves/${id}/status`,
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
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-4'>Leave Applications</h1>

      <div className='overflow-x-auto'>
        <table className='w-full border text-left'>
          <thead className='bg-gray-100'>
            <tr>
              <th className='p-2 border'>Student</th>
              <th className='p-2 border'>Roll No</th>
              <th className='p-2 border'>From</th>
              <th className='p-2 border'>To</th>
              <th className='p-2 border'>Reason</th>
              <th className='p-2 border'>Status</th>
              <th className='p-2 border'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((leave) => (
              <tr key={leave.id}>
                <td className='p-2 border'>{leave.student.name}</td>
                <td className='p-2 border'>{leave.student.rollNumber}</td>
                <td className='p-2 border'>
                  {new Date(leave.fromDate).toDateString()}
                </td>
                <td className='p-2 border'>
                  {new Date(leave.toDate).toDateString()}
                </td>
                <td className='p-2 border'>{leave.reason}</td>
                <td className='p-2 border'>
                  <span
                    className={`px-2 py-1 rounded text-white ${
                      leave.status === "PENDING"
                        ? "bg-yellow-500"
                        : leave.status === "APPROVED"
                        ? "bg-green-600"
                        : "bg-red-600"
                    }`}
                  >
                    {leave.status}
                  </span>
                </td>
                <td className='p-2 border space-x-2'>
                  {leave.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(leave.id, "APPROVED")}
                        className='bg-green-600 text-white px-2 py-1 rounded text-sm'
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(leave.id, "REJECTED")}
                        className='bg-red-600 text-white px-2 py-1 rounded text-sm'
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
