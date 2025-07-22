// src/pages/Signup.tsx
import { useState } from "react";
import { signup } from "../api/authApi";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function Signup() {
  const [form, setForm] = useState<{
    name: string;
    email: string;
    password: string;
    role: "STUDENT" | "ADMIN";
  }>({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await signup(form);
      toast.success("Signup successful!");
      console.log(res.data);
    } catch (err: any) {
      toast.error("Signup failed!");
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center px-2 sm:px-4'>
      <div className='w-full max-w-4xl bg-white shadow-xl rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2'>
        {/* Left Panel with welcome message */}
        <div className='bg-gradient-to-br from-blue-500 to-cyan-500 text-white p-6 sm:p-10 flex flex-col justify-between min-h-[220px]'>
          <div>
            <h1 className='text-lg font-bold'>🏨 HMS</h1>
            <h2 className='mt-6 sm:mt-10 text-2xl sm:text-3xl font-semibold'>
              Create an Account
            </h2>
            <p className='mt-3 sm:mt-4 text-xs sm:text-sm leading-relaxed'>
              Join the Hostel Management System to easily manage rooms,
              students, fees, leave requests, and more — whether you're a
              student or an admin.
            </p>
          </div>
          <p className='text-xs sm:text-sm mt-6 sm:mt-10'>
            © 2025 Hostel Management System
          </p>
        </div>

        {/* Right Panel with signup form */}
        <div className='p-6 sm:p-10 flex flex-col justify-center'>
          <h2 className='text-xl sm:text-2xl font-bold text-blue-600'>
            Signup
          </h2>
          <p className='text-xs sm:text-sm text-gray-500 mt-2'>
            Fill in your details to create a new HMS account.
          </p>

          <form
            onSubmit={handleSubmit}
            className='mt-4 sm:mt-6 space-y-3 sm:space-y-4'
          >
            <input
              name='name'
              placeholder='Full Name'
              onChange={handleChange}
              className='w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm'
              required
            />

            <input
              name='email'
              type='email'
              placeholder='Email Address'
              onChange={handleChange}
              className='w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm'
              required
            />

            <input
              name='password'
              type='password'
              placeholder='Create Password'
              onChange={handleChange}
              className='w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm'
              required
            />

            <select
              name='role'
              onChange={handleChange}
              className='w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm'
              required
            >
              <option value=''>Select Role</option>
              <option value='STUDENT'>Student</option>
              <option value='ADMIN'>Admin</option>
            </select>

            <button
              type='submit'
              className='w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition duration-200 text-sm'
            >
              Create Account
            </button>
          </form>

          <div className='flex justify-between text-xs sm:text-sm mt-4 text-gray-600'>
            <p>
              Already have an account?{" "}
              <Link to='/login' className='text-blue-500 hover:underline'>
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
