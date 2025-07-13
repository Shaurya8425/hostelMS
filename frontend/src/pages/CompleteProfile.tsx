import { useState } from "react";
import axios from "axios";
import { API_BASE } from "../api/apiBase";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CompleteProfile() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    branch: "",
    year: "",
    rollNumber: "",
    gender: "MALE",
    division: "",
    course: "",
    fromDate: "",
    toDate: "",
    linenIssued: "NA",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      const payload = {
        ...form,
        year: Number(form.year),
        fromDate: form.fromDate ? new Date(form.fromDate) : null,
        toDate: form.toDate ? new Date(form.toDate) : null,
        division: form.division || null,
        course: form.course || null,
      };

      await axios.post(`${API_BASE}/students/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Profile completed successfully", {
        position: "top-center",
        autoClose: 2000,
      });

      setTimeout(() => {
        window.location.href = "/student/dashboard";
      }, 2200);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Something went wrong", {
        position: "top-center",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='max-w-2xl mx-auto mt-10 bg-white p-10 rounded-2xl shadow-2xl border border-gray-200 space-y-6'
    >
      <h2 className='text-3xl font-bold text-center text-blue-700 mb-6'>
        Complete Your Profile
      </h2>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
        {/* Personal Details */}
        <div className='space-y-2'>
          <label className='text-sm text-gray-700'>Full Name</label>
          <input
            name='name'
            placeholder='e.g. Shaurya Yadav'
            onChange={handleChange}
            required
            className='input-field'
          />
        </div>
        <div className='space-y-2'>
          <label className='text-sm text-gray-700'>Phone Number</label>
          <input
            name='phone'
            placeholder='e.g. 9876543210'
            onChange={handleChange}
            required
            className='input-field'
          />
        </div>

        {/* Academic Details */}
        <div className='space-y-2'>
          <label className='text-sm text-gray-700'>Branch</label>
          <input
            name='branch'
            placeholder='e.g. CSE'
            onChange={handleChange}
            required
            className='input-field'
          />
        </div>
        <div className='space-y-2'>
          <label className='text-sm text-gray-700'>Year</label>
          <input
            name='year'
            type='number'
            placeholder='e.g. 2'
            onChange={handleChange}
            required
            className='input-field'
          />
        </div>

        <div className='space-y-2'>
          <label className='text-sm text-gray-700'>Roll Number</label>
          <input
            name='rollNumber'
            placeholder='e.g. 12345678'
            onChange={handleChange}
            required
            className='input-field'
          />
        </div>
        <div className='space-y-2'>
          <label className='text-sm text-gray-700'>Gender</label>
          <select
            name='gender'
            onChange={handleChange}
            value={form.gender}
            className='input-field'
          >
            <option value='MALE'>Male</option>
            <option value='FEMALE'>Female</option>
            <option value='OTHER'>Other</option>
          </select>
        </div>

        {/* Optional Fields */}
        <div className='space-y-2'>
          <label className='text-sm text-gray-700'>Division (optional)</label>
          <input
            name='division'
            placeholder='e.g. A'
            onChange={handleChange}
            className='input-field'
          />
        </div>
        <div className='space-y-2'>
          <label className='text-sm text-gray-700'>Course (optional)</label>
          <input
            name='course'
            placeholder='e.g. B.Tech'
            onChange={handleChange}
            className='input-field'
          />
        </div>

        {/* Date Range */}
        <div className='space-y-2'>
          <label className='text-sm text-gray-700'>From Date (optional)</label>
          <input
            type='date'
            name='fromDate'
            onChange={handleChange}
            className='input-field'
          />
        </div>
        <div className='space-y-2'>
          <label className='text-sm text-gray-700'>To Date (optional)</label>
          <input
            type='date'
            name='toDate'
            onChange={handleChange}
            className='input-field'
          />
        </div>

        {/* Linen */}
        <div className='space-y-2'>
          <label className='text-sm text-gray-700'>Linen Issued</label>
          <select
            name='linenIssued'
            onChange={handleChange}
            value={form.linenIssued}
            className='input-field'
          >
            <option value='NA'>Not Issued</option>
            <option value='Y'>Issued</option>
          </select>
        </div>
      </div>

      <button
        type='submit'
        className='w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition'
      >
        Submit Profile
      </button>
    </form>
  );
}
