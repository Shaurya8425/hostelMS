import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

interface Complaint {
  id: number;
  subject: string;
  description: string;
  status: "PENDING" | "RESOLVED" | "REJECTED";
  createdAt: string;
  student: {
    id: number;
    name: string;
    rollNumber: string;
  };
}

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const token = localStorage.getItem("token");

  const fetchComplaints = async () => {
    try {
      const res = await axios.get("http://localhost:3000/complaints", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComplaints(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch complaints");
    }
  };

  const handleStatusChange = async (
    id: number,
    newStatus: Complaint["status"]
  ) => {
    try {
      await axios.patch(
        `http://localhost:3000/complaints/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Status updated");
      fetchComplaints();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  return (
    <div className='p-2 sm:p-6'>
      <h1 className='text-2xl sm:text-3xl font-extrabold mb-6 text-blue-900'>
        Complaint Management
      </h1>
      <div className='overflow-x-auto bg-white rounded-xl shadow border p-2 sm:p-4'>
        <table className='min-w-[700px] w-full text-left border-separate border-spacing-y-2 text-xs sm:text-sm'>
          <thead className='bg-blue-50'>
            <tr>
              <th className='p-2 border-b'>Subject</th>
              <th className='p-2 border-b'>Description</th>
              <th className='p-2 border-b'>Student</th>
              <th className='p-2 border-b'>Status</th>
              <th className='p-2 border-b'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((c) => (
              <tr key={c.id} className='hover:bg-blue-50 rounded-lg transition'>
                <td className='p-2'>{c.subject}</td>
                <td className='p-2'>{c.description}</td>
                <td className='p-2'>
                  <span className='bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium shadow-sm'>
                    {c.student.name} ({c.student.rollNumber})
                  </span>
                </td>
                <td className='p-2'>
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
                </td>
                <td className='p-2 space-x-2'>
                  <select
                    className='border p-1 rounded shadow-sm bg-white'
                    value={c.status}
                    onChange={(e) =>
                      handleStatusChange(
                        c.id,
                        e.target.value as Complaint["status"]
                      )
                    }
                  >
                    <option value='PENDING'>Pending</option>
                    <option value='RESOLVED'>Resolved</option>
                    <option value='REJECTED'>Rejected</option>
                  </select>
                </td>
              </tr>
            ))}
            {complaints.length === 0 && (
              <tr>
                <td className='p-4 text-center' colSpan={5}>
                  No complaints found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
