// src/pages/Login.tsx
import { useState } from "react";
import { login } from "../api/authApi";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await login(form);
      alert("Login successful");

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
      alert(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name='email'
        type='email'
        placeholder='Email'
        onChange={handleChange}
      />
      <input
        name='password'
        type='password'
        placeholder='Password'
        onChange={handleChange}
      />
      <button type='submit'>Login</button>
    </form>
  );
}
