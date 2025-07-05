import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import SkeletonFees from "../components/SkeletonFees";

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
        const res = await axios.get("http://localhost:3000/auth/me", {
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
      const res = await axios.get(
        `http://localhost:3000/payments/student/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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
        <table className='min-w-full border-separate border-spacing-y-2 text-sm'>
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
        {fees.length === 0 && (
          <p className='text-gray-600 mt-4'>No fee records available.</p>
        )}
      </div>
    </div>
  );
}
