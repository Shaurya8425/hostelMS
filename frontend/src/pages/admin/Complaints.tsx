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
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-4'>Complaint Management</h1>
      <div className='overflow-x-auto'>
        <table className='w-full text-left border'>
          <thead className='bg-gray-100'>
            <tr>
              <th className='p-2 border'>Subject</th>
              <th className='p-2 border'>Description</th>
              <th className='p-2 border'>Student</th>
              <th className='p-2 border'>Status</th>
              <th className='p-2 border'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((c) => (
              <tr key={c.id}>
                <td className='p-2 border'>{c.subject}</td>
                <td className='p-2 border'>{c.description}</td>
                <td className='p-2 border'>
                  {c.student.name} ({c.student.rollNumber})
                </td>
                <td className='p-2 border'>{c.status}</td>
                <td className='p-2 border space-x-2'>
                  <select
                    className='border p-1 rounded'
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
