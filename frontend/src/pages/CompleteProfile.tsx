// src/pages/CompleteProfile.tsx
import { useState } from "react";
import axios from "axios";

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

      // Ensure year is sent as a number
      const payload = { ...form, year: Number(form.year) };

      const res = await axios.post(
        "http://localhost:3000/students/profile", // Change base URL if needed
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Profile created successfully");
      console.log(res.data);
      // Optionally redirect
      window.location.href = "/student-dashboard";
    } catch (err: any) {
      alert(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-md space-y-4'
    >
      <h2 className='text-2xl font-semibold text-center text-gray-800'>
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
        className='w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition'
      >
        Submit
      </button>
    </form>
  );
}
