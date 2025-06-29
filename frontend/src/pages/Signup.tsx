// src/pages/Signup.tsx
import { useState } from "react";
import { signup } from "../api/authApi";

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
      alert("Signup successful");
      console.log(res.data);
    } catch (err: any) {
      alert(err.response?.data?.error || "Signup failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name='name' placeholder='Name' onChange={handleChange} />
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
      <select name='role' onChange={handleChange}>
        <option value='STUDENT'>Student</option>
        <option value='ADMIN'>Admin</option>
      </select>
      <button type='submit'>Signup</button>
    </form>
  );
}

