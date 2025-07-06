import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import SkeletonFees from "../components/SkeletonFees";
import { API_BASE } from "../api/apiBase";

type FeePayment = {
  id: number;
  amount: number;
  status: "PAID" | "PENDING" | "OVERDUE";
  paidAt: string | null;
  dueDate: string;
  createdAt: string;
};

export default function Fees() {
  const [fees, setFees] = useState<FeePayment[]>([]);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token") || "";

  // Fetch studentId from /auth/me for reliability
  useEffect(() => {
    const fetchStudentId = async () => {
      try {
        const res = await axios.get(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const id = res.data?.user?.studentId;
        setStudentId(id ?? null);
      } catch {
        setStudentId(null);
        toast.error("Failed to fetch user info");
      }
    };
    if (token) fetchStudentId();
  }, [token]);

  const fetchFees = async (id: number) => {
    try {
      const res = await axios.get(`${API_BASE}/payments/student/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFees(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      setFees([]); // fallback to empty array on error
      toast.error("Failed to fetch fee payments");
    }
  };

  useEffect(() => {
    if (studentId) fetchFees(studentId).finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return <SkeletonFees />;

  return (
    <div className='p-6 max-w-4xl mx-auto'>
      <h2 className='text-3xl font-extrabold mb-8 text-purple-900 flex items-center gap-2'>
        <span role='img' aria-label='fees'>
          💳
        </span>{" "}
        Fee Payment History
      </h2>

      <div className='overflow-x-auto bg-white rounded-xl shadow border p-4'>
        {/* Table for desktop */}
        <table className='min-w-full border-separate border-spacing-y-2 text-sm hidden sm:table'>
          <thead>
            <tr className='bg-purple-50 text-left'>
              <th className='p-2 border-b'>Amount (₹)</th>
              <th className='p-2 border-b'>Due Date</th>
              <th className='p-2 border-b'>Status</th>
              <th className='p-2 border-b'>Paid At</th>
            </tr>
          </thead>
          <tbody>
            {fees.map((fee) => (
              <tr
                key={fee.id}
                className='hover:bg-purple-50 rounded-lg transition'
              >
                <td className='p-2'>
                  <span className='font-semibold'>₹{fee.amount}</span>
                </td>
                <td className='p-2'>
                  {new Date(fee.dueDate).toLocaleDateString()}
                </td>
                <td className='p-2'>
                  <span
                    className={
                      fee.status === "PAID"
                        ? "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold"
                        : fee.status === "OVERDUE"
                        ? "bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-semibold"
                        : "bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold"
                    }
                  >
                    {fee.status}
                  </span>
                </td>
                <td className='p-2'>
                  {fee.paidAt ? (
                    new Date(fee.paidAt).toLocaleDateString()
                  ) : (
                    <span className='text-gray-400 italic'>-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Card layout for mobile */}
        <div className='sm:hidden flex flex-col gap-4'>
          {fees.map((fee) => (
            <div
              key={fee.id}
              className='bg-purple-50 rounded-lg shadow p-3 text-xs'
            >
              <div className='flex justify-between mb-1'>
                <span className='font-bold'>₹{fee.amount}</span>
                <span className='bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium shadow-sm'>
                  {fee.status}
                </span>
              </div>
              <div className='grid grid-cols-2 gap-x-2 gap-y-1'>
                <span className='font-semibold'>Due Date:</span>
                <span>{new Date(fee.dueDate).toLocaleDateString()}</span>
                <span className='font-semibold'>Paid At:</span>
                <span>
                  {fee.paidAt ? (
                    new Date(fee.paidAt).toLocaleDateString()
                  ) : (
                    <span className='text-gray-400 italic'>-</span>
                  )}
                </span>
              </div>
              <div className='mt-2 text-xs text-gray-600'>
                <span className='font-semibold'>Status: </span>
                <span
                  className={
                    fee.status === "PAID"
                      ? "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold"
                      : fee.status === "OVERDUE"
                      ? "bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-semibold"
                      : "bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold"
                  }
                >
                  {fee.status}
                </span>
              </div>
            </div>
          ))}
          {fees.length === 0 && (
            <div className='p-4 text-center'>No fee records available.</div>
          )}
        </div>
      </div>
    </div>
  );
}
