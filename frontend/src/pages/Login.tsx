// src/pages/Login.tsx
import { useState } from "react";
import { login } from "../api/authApi";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await login(form);
      toast.success("Login successful");

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      if (user.studentId) {
        localStorage.setItem("studentId", user.studentId.toString());
      }

      if (user.role === "ADMIN") {
        window.location.href = "/admin-dashboard";
      } else {
        window.location.href = "/student-dashboard";
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100 px-4'>
      <div className='w-full max-w-4xl bg-white shadow-xl rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2'>
        {/* Left Panel */}
        <div className='bg-gradient-to-br from-blue-500 to-cyan-500 text-white p-10 flex flex-col justify-between'>
          <div>
            <h1 className='text-lg font-bold'>🏨 HMS</h1>
            <h2 className='mt-10 text-3xl font-semibold'>Welcome to HMS</h2>
            <p className='mt-4 text-sm leading-relaxed'>
              Manage student accommodation, room allocation, complaints, and
              leave records efficiently with our Hostel Management System.
            </p>
          </div>
          <p className='text-sm mt-10'>© 2025 Hostel Management System</p>
        </div>

        {/* Right Panel */}
        <div className='p-10 flex flex-col justify-center'>
          <h2 className='text-2xl font-bold text-blue-600'>Login to HMS</h2>
          <p className='text-sm text-gray-500 mt-2'>
            Enter your credentials to access the dashboard.
          </p>

          <form onSubmit={handleSubmit} className='mt-6 space-y-4'>
            <input
              name='email'
              type='email'
              placeholder='Email'
              onChange={handleChange}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400'
              required
            />
            <input
              name='password'
              type='password'
              placeholder='Password'
              onChange={handleChange}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400'
              required
            />

            <div className='flex items-center'>
              <input type='checkbox' id='remember' className='mr-2' />
              <label htmlFor='remember' className='text-sm text-gray-600'>
                Remember me
              </label>
            </div>

            <button
              type='submit'
              className='w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition duration-200'
            >
              LOGIN
            </button>
          </form>

          <div className='flex justify-between text-sm mt-4 text-gray-600'>
            <p>
              New User?{" "}
              <Link to='/signup' className='text-blue-500 hover:underline'>
                Signup
              </Link>
            </p>
            <button className='text-blue-500 hover:underline'>
              Forgot password?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
