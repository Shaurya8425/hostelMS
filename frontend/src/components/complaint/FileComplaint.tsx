import { useState } from "react";
import { fileComplaint } from "../../api/complaintApi";

export default function FileComplaint({
  studentId,
  onComplaintFiled,
}: {
  studentId: number | null;
  onComplaintFiled: (complaint: any) => void;
}) {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!studentId) throw new Error("Student ID not found");
      const res = await fileComplaint({ subject, description, studentId });
      alert("Complaint filed successfully!");
      setSubject("");
      setDescription("");
      onComplaintFiled(res.data.data); // Add new complaint to list instantly
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to file complaint");
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <input
        type='text'
        placeholder='Subject'
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className='border px-3 py-2 w-full'
        required
      />
      <textarea
        placeholder='Description'
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className='border px-3 py-2 w-full'
        required
      />
      <button
        type='submit'
        className='bg-blue-500 text-white px-4 py-2 rounded'
        disabled={!studentId}
      >
        Submit Complaint
      </button>
    </form>
  );
}
