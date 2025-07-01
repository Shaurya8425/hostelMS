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
    <div className='p-6'>
      <div className='flex justify-between mb-4'>
        <h1 className='text-2xl font-bold'>Fee Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className='bg-blue-600 text-white px-4 py-2 rounded'
        >
          {showForm ? "Cancel" : "+ Add Fee"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAddFee}
          className='bg-gray-50 p-4 border rounded space-y-2 mb-4'
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
            className='bg-green-600 text-white px-4 py-2 rounded'
          >
            Add Fee
          </button>
        </form>
      )}

      <div className='overflow-x-auto'>
        <table className='w-full border text-left'>
          <thead className='bg-gray-100'>
            <tr>
              <th className='p-2 border'>Student</th>
              <th className='p-2 border'>Roll No</th>
              <th className='p-2 border'>Amount</th>
              <th className='p-2 border'>Due Date</th>
              <th className='p-2 border'>Status</th>
              <th className='p-2 border'>Paid At</th>
              <th className='p-2 border'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {fees.map((fee) => (
              <tr key={fee.id}>
                <td className='p-2 border'>{fee.student.name}</td>
                <td className='p-2 border'>{fee.student.rollNumber}</td>
                <td className='p-2 border'>₹{fee.amount}</td>
                <td className='p-2 border'>
                  {new Date(fee.dueDate).toDateString()}
                </td>
                <td className='p-2 border'>
                  <span
                    className={`px-2 py-1 text-white rounded ${
                      fee.status === "PAID" ? "bg-green-600" : "bg-yellow-500"
                    }`}
                  >
                    {fee.status}
                  </span>
                </td>
                <td className='p-2 border'>
                  {fee.paidAt ? new Date(fee.paidAt).toLocaleDateString() : "-"}
                </td>
                <td className='p-2 border'>
                  {fee.status === "PENDING" && (
                    <button
                      onClick={() => markAsPaid(fee.id)}
                      className='bg-green-600 text-white px-2 py-1 rounded text-sm'
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
