import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

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
    if (studentId) fetchFees(studentId);
  }, [studentId]);

  return (
    <div className='p-6 max-w-4xl mx-auto'>
      <h2 className='text-2xl font-bold mb-4'>Fee Payment History</h2>

      <div className='overflow-x-auto'>
        <table className='min-w-full text-sm border'>
          <thead>
            <tr className='bg-gray-100 text-left'>
              <th className='p-2 border'>Amount (₹)</th>
              <th className='p-2 border'>Due Date</th>
              <th className='p-2 border'>Status</th>
              <th className='p-2 border'>Paid At</th>
            </tr>
          </thead>
          <tbody>
            {fees.map((fee) => (
              <tr key={fee.id} className='border-t'>
                <td className='p-2 border'>₹{fee.amount}</td>
                <td className='p-2 border'>
                  {new Date(fee.dueDate).toLocaleDateString()}
                </td>
                <td className='p-2 border'>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      fee.status === "PAID"
                        ? "bg-green-100 text-green-800"
                        : fee.status === "OVERDUE"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {fee.status}
                  </span>
                </td>
                <td className='p-2 border'>
                  {fee.paidAt ? new Date(fee.paidAt).toLocaleDateString() : "-"}
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
