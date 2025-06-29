import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function Leave() {
  const [form, setForm] = useState({
    fromDate: "",
    toDate: "",
    reason: "",
  });

  const [leaves, setLeaves] = useState([]);
  const [studentId, setStudentId] = useState<number | null>(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    // Get studentId from localStorage or /auth/me
    let id = Number(localStorage.getItem("studentId"));
    if (id && id > 0) {
      setStudentId(id);
    } else if (token) {
      axios
        .get("http://localhost:3000/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const user = res.data.user;
          if (user && user.studentId) {
            setStudentId(user.studentId);
            localStorage.setItem("studentId", user.studentId.toString());
          }
        });
    }
  }, [token]);

  const fetchLeaves = async (sid?: number) => {
    try {
      const res = await axios.get("http://localhost:3000/leaves", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filter leaves for this student
      const id = sid || studentId;
      setLeaves(res.data.data.filter((leave: any) => leave.studentId === id));
    } catch (err) {
      toast.error("Failed to fetch leaves");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!studentId) throw new Error("Student ID not found");
      await axios.post(
        "http://localhost:3000/leaves",
        { ...form, studentId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Leave Applied");
      setForm({ fromDate: "", toDate: "", reason: "" });
      fetchLeaves(studentId);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Leave request failed");
    }
  };

  useEffect(() => {
    if (studentId) fetchLeaves(studentId);
    // eslint-disable-next-line
  }, [studentId]);

  return (
    <div className='p-6 max-w-3xl mx-auto'>
      <h2 className='text-2xl font-semibold mb-4'>Apply for Leave</h2>
      <form
        onSubmit={handleSubmit}
        className='grid gap-4 bg-white p-4 shadow rounded-lg'
      >
        <input
          type='date'
          name='fromDate'
          value={form.fromDate}
          onChange={handleChange}
          required
          className='border p-2 rounded'
        />
        <input
          type='date'
          name='toDate'
          value={form.toDate}
          onChange={handleChange}
          required
          className='border p-2 rounded'
        />
        <textarea
          name='reason'
          value={form.reason}
          onChange={handleChange}
          placeholder='Reason for leave'
          required
          className='border p-2 rounded'
        ></textarea>
        <button
          type='submit'
          className='bg-blue-600 text-white p-2 rounded hover:bg-blue-700'
          disabled={!studentId}
        >
          Submit
        </button>
      </form>

      <h3 className='text-xl font-semibold mt-8 mb-2'>Your Leave Requests</h3>
      <div className='overflow-auto'>
        <table className='min-w-full border text-sm mt-2'>
          <thead>
            <tr className='bg-gray-100'>
              <th className='border px-4 py-2'>From</th>
              <th className='border px-4 py-2'>To</th>
              <th className='border px-4 py-2'>Reason</th>
              <th className='border px-4 py-2'>Status</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((leave: any) => (
              <tr key={leave.id}>
                <td className='border px-4 py-2'>
                  {new Date(leave.fromDate).toLocaleDateString()}
                </td>
                <td className='border px-4 py-2'>
                  {new Date(leave.toDate).toLocaleDateString()}
                </td>
                <td className='border px-4 py-2'>{leave.reason}</td>
                <td className='border px-4 py-2'>
                  <span
                    className={`px-2 py-1 rounded ${
                      leave.status === "APPROVED"
                        ? "bg-green-200 text-green-800"
                        : leave.status === "REJECTED"
                        ? "bg-red-200 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {leave.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {leaves.length === 0 && (
          <p className='text-gray-600 mt-2'>No leave records found.</p>
        )}
      </div>
    </div>
  );
}
