import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import SkeletonLeave from "../../components/skeleton/student/SkeletonLeave";
import { API_BASE } from "../../api/apiBase";

export default function Leave() {
  const [form, setForm] = useState({
    fromDate: "",
    toDate: "",
    reason: "",
  });

  const [leaves, setLeaves] = useState([]);
  const [studentEmail, setStudentEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      axios
        .get(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const user = res.data.user;
          if (user && user.email) {
            setStudentEmail(user.email);
          }
        });
    }
  }, [token]);

  const fetchLeaves = async (email?: string) => {
    try {
      const res = await axios.get(`${API_BASE}/leaves`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filter leaves for this student
      const mail = email || studentEmail;
      setLeaves(
        res.data.data.filter((leave: any) => leave.student?.email === mail)
      );
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
      if (!studentEmail) throw new Error("Student email not found");
      await axios.post(
        `${API_BASE}/leaves`,
        { ...form, studentEmail },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Leave Applied");
      setForm({ fromDate: "", toDate: "", reason: "" });
      fetchLeaves(studentEmail);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Leave request failed");
    }
  };

  useEffect(() => {
    if (studentEmail)
      fetchLeaves(studentEmail).finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [studentEmail]);

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
          disabled={!studentEmail}
        >
          Submit
        </button>
      </form>

      <h3 className='text-xl font-bold mb-4 text-blue-800'>
        Your Leave Requests
      </h3>
      <div className='overflow-auto bg-white rounded-xl shadow border p-4'>
        {/* Table for desktop */}
        <table className='min-w-full border-separate border-spacing-y-2 text-sm hidden sm:table'>
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
        {/* Card layout for mobile */}
        <div className='sm:hidden flex flex-col gap-4'>
          {leaves.map((leave: any) => (
            <div
              key={leave.id}
              className='bg-blue-50 rounded-lg shadow p-3 text-xs'
            >
              <div className='flex justify-between mb-1'>
                <span className='font-bold'>
                  From: {new Date(leave.fromDate).toLocaleDateString()}
                </span>
                <span className='bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium shadow-sm'>
                  {leave.status}
                </span>
              </div>
              <div className='grid grid-cols-2 gap-x-2 gap-y-1'>
                <span className='font-semibold'>To:</span>
                <span>{new Date(leave.toDate).toLocaleDateString()}</span>
                <span className='font-semibold'>Reason:</span>
                <span>{leave.reason}</span>
              </div>
              <div className='mt-2 text-xs text-gray-600'>
                <span className='font-semibold'>Status: </span>
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
              </div>
            </div>
          ))}
          {leaves.length === 0 && (
            <div className='p-4 text-center'>No leave records found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
