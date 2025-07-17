import { useState } from "react";
import { fileComplaint } from "../../api/complaintApi";
import { toast } from "react-toastify";

export default function FileComplaint({
  studentEmail,
  onComplaintFiled,
}: {
  studentEmail: string | null;
  onComplaintFiled: (complaint: any) => void;
}) {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (subject.trim().length < 3) {
      toast.error("Subject must be at least 3 characters long");
      return;
    }
    if (description.trim().length < 5) {
      toast.error("Description must be at least 5 characters long");
      return;
    }
    try {
      if (!studentEmail) throw new Error("Student email not found");
      const res = await fileComplaint({ subject, description, studentEmail });
      toast.success("Complaint filed successfully!");
      setSubject("");
      setDescription("");
      onComplaintFiled(res.data.data); // Add new complaint to list instantly
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to file complaint");
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <input
        type='text'
        placeholder='Subject'
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className='border px-3 py-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow-sm'
        required
      />
      <textarea
        placeholder='Description'
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className='border px-3 py-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow-sm min-h-[80px]'
        required
      />
      <button
        type='submit'
        className='bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2 rounded shadow hover:from-blue-600 hover:to-blue-800 transition font-semibold'
        disabled={!studentEmail}
      >
        Submit Complaint
      </button>
    </form>
  );
}
