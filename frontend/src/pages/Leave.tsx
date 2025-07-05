import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import SkeletonLeave from "../components/SkeletonLeave";

export default function Leave() {
  const [form, setForm] = useState({
    fromDate: "",
    toDate: "",
    reason: "",
  });

  const [leaves, setLeaves] = useState([]);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
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
    if (studentId) fetchLeaves(studentId).finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [studentId]);

  if (loading) return <SkeletonLeave />;

  return (
    <div className='p-6 max-w-3xl mx-auto'>
      <h2 className='text-3xl font-extrabold mb-8 text-blue-900 flex items-center gap-2'>
        <span role='img' aria-label='leave'>
          🌳
        </span>{" "}
        Apply for Leave
      </h2>
      <form
        onSubmit={handleSubmit}
        className='grid gap-4 bg-white p-6 shadow rounded-xl border mb-8'
      >
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <input
            type='date'
            name='fromDate'
            value={form.fromDate}
            onChange={handleChange}
            required
            className='border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow-sm'
          />
          <input
            type='date'
            name='toDate'
            value={form.toDate}
            onChange={handleChange}
            required
            className='border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow-sm'
          />
        </div>
        <textarea
          name='reason'
          value={form.reason}
          onChange={handleChange}
          placeholder='Reason for leave'
          required
          className='border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow-sm min-h-[80px]'
        ></textarea>
        <button
          type='submit'
          className='bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2 rounded shadow hover:from-blue-600 hover:to-blue-800 transition font-semibold'
          disabled={!studentId}
        >
          Submit
        </button>
      </form>

      <h3 className='text-xl font-bold mb-4 text-blue-800'>
        Your Leave Requests
      </h3>
      <div className='overflow-auto bg-white rounded-xl shadow border p-4'>
        <table className='min-w-full border-separate border-spacing-y-2 text-sm'>
          <thead>
            <tr className='bg-blue-50'>
              <th className='border-b px-4 py-2'>From</th>
              <th className='border-b px-4 py-2'>To</th>
              <th className='border-b px-4 py-2'>Reason</th>
              <th className='border-b px-4 py-2'>Status</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((leave: any) => (
              <tr
                key={leave.id}
                className='hover:bg-blue-50 rounded-lg transition'
              >
                <td className='px-4 py-2'>
                  {new Date(leave.fromDate).toLocaleDateString()}
                </td>
                <td className='px-4 py-2'>
                  {new Date(leave.toDate).toLocaleDateString()}
                </td>
                <td className='px-4 py-2'>{leave.reason}</td>
                <td className='px-4 py-2'>
                  <span
                    className={
                      leave.status === "APPROVED"
                        ? "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold"
                        : leave.status === "REJECTED"
                        ? "bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold"
                        : "bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold"
                    }
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
