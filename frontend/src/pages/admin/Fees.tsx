import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

interface Fee {
  id: number;
  studentId: number;
  amount: number;
  dueDate: string;
  status: "PENDING" | "PAID";
  paidAt?: string | null;
  student: {
    name: string;
    rollNumber: string;
  };
}

export default function AdminFees() {
  const [fees, setFees] = useState<Fee[]>([]);
  const [form, setForm] = useState({
    studentId: "",
    amount: "",
    dueDate: "",
  });
  const [showForm, setShowForm] = useState(false);
  const token = localStorage.getItem("token");

  const fetchFees = async () => {
    try {
      const res = await axios.get("http://localhost:3000/payments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFees(res.data.data);
    } catch {
      toast.error("Failed to fetch fee records");
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddFee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        studentId: Number(form.studentId),
        amount: Number(form.amount),
        dueDate: form.dueDate,
      };
      await axios.post("http://localhost:3000/payments", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Fee record added");
      fetchFees();
      setForm({ studentId: "", amount: "", dueDate: "" });
      setShowForm(false);
    } catch {
      toast.error("Failed to add fee");
    }
  };

  const markAsPaid = async (id: number) => {
    const paidAt = new Date().toISOString();
    try {
      await axios.patch(
        `http://localhost:3000/payments/${id}/pay`,
        { paidAt },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Marked as paid");
      fetchFees();
    } catch {
      toast.error("Failed to mark as paid");
    }
  };

  return (
    <div className='p-2 sm:p-6'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4'>
        <h1 className='text-2xl sm:text-3xl font-extrabold text-blue-900'>
          Fee Management
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className='bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2 rounded shadow hover:from-blue-600 hover:to-blue-800 transition w-full sm:w-auto'
        >
          {showForm ? "Cancel" : "+ Add Fee"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAddFee}
          className='bg-white p-4 sm:p-6 border rounded-xl shadow space-y-2 mb-6 max-w-md w-full'
        >
          <input
            type='number'
            name='studentId'
            placeholder='Student ID'
            value={form.studentId}
            onChange={handleFormChange}
            className='w-full p-2 border rounded'
            required
          />
          <input
            type='number'
            name='amount'
            placeholder='Amount'
            value={form.amount}
            onChange={handleFormChange}
            className='w-full p-2 border rounded'
            required
          />
          <input
            type='date'
            name='dueDate'
            value={form.dueDate}
            onChange={handleFormChange}
            className='w-full p-2 border rounded'
            required
          />
          <button
            type='submit'
            className='bg-gradient-to-r from-green-500 to-green-700 text-white px-4 py-2 rounded shadow hover:from-green-600 hover:to-green-800 transition'
          >
            Add Fee
          </button>
        </form>
      )}

      <div className='overflow-x-auto bg-white rounded-xl shadow border p-2 sm:p-4'>
        <table className='min-w-[700px] w-full border-separate border-spacing-y-2 text-left text-xs sm:text-sm'>
          <thead className='bg-blue-50'>
            <tr>
              <th className='p-2 border-b'>Student</th>
              <th className='p-2 border-b'>Roll No</th>
              <th className='p-2 border-b'>Amount</th>
              <th className='p-2 border-b'>Due Date</th>
              <th className='p-2 border-b'>Status</th>
              <th className='p-2 border-b'>Paid At</th>
              <th className='p-2 border-b'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {fees.map((fee) => (
              <tr
                key={fee.id}
                className='hover:bg-blue-50 rounded-lg transition'
              >
                <td className='p-2'>
                  <span className='bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium shadow-sm'>
                    {fee.student.name}
                  </span>
                </td>
                <td className='p-2'>{fee.student.rollNumber}</td>
                <td className='p-2'>₹{fee.amount}</td>
                <td className='p-2'>{new Date(fee.dueDate).toDateString()}</td>
                <td className='p-2'>
                  <span
                    className={
                      fee.status === "PAID"
                        ? "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold"
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
                <td className='p-2'>
                  {fee.status === "PENDING" && (
                    <button
                      onClick={() => markAsPaid(fee.id)}
                      className='bg-gradient-to-r from-green-500 to-green-700 text-white px-2 py-1 rounded shadow hover:from-green-600 hover:to-green-800 text-sm transition'
                    >
                      Mark as Paid
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {fees.length === 0 && (
              <tr>
                <td className='p-4 text-center' colSpan={7}>
                  No fee records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
