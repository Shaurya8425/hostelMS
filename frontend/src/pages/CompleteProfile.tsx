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

      const payload = { ...form, year: Number(form.year) };

      await axios.post(`${API_BASE}/students/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Profile completed successfully ✅", {
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
      className='max-w-md mx-auto mt-10 bg-white p-8 rounded-xl shadow-xl space-y-5 border border-gray-100'
    >
      <h2 className='text-3xl font-bold text-center text-blue-700'>
        Complete Your Profile
      </h2>

      <input
        name='name'
        placeholder='Full Name'
        onChange={handleChange}
        required
        className='w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
      />

      <input
        name='phone'
        placeholder='Phone Number'
        onChange={handleChange}
        required
        className='w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
      />

      <input
        name='branch'
        placeholder='Branch (e.g., CSE, ECE)'
        onChange={handleChange}
        required
        className='w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
      />

      <input
        name='year'
        type='number'
        placeholder='Year (e.g., 1, 2, 3)'
        onChange={handleChange}
        required
        className='w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
      />

      <input
        name='rollNumber'
        placeholder='Roll Number'
        onChange={handleChange}
        required
        className='w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
      />

      <select
        name='gender'
        onChange={handleChange}
        value={form.gender}
        className='w-full px-4 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500'
      >
        <option value='MALE'>Male</option>
        <option value='FEMALE'>Female</option>
        <option value='OTHER'>Other</option>
      </select>

      <button
        type='submit'
        className='w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition'
      >
        Submit
      </button>
    </form>
  );
}
