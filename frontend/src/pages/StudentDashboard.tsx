import { useEffect } from "react";
import axios from "axios";
import Complaint from "./Complaint";
import { Link } from "react-router-dom";

export default function StudentDashboard() {
  useEffect(() => {
    const checkProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get("http://localhost:3000/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { user } = res.data;
        if (user.role === "STUDENT" && user.studentId === null) {
          window.location.href = "/complete-profile";
          return;
        }
      } catch (err) {
        // If unauthorized, redirect to login
        if (
          typeof err === "object" &&
          err !== null &&
          "response" in err &&
          typeof (err as any).response === "object" &&
          ((err as any).response.status === 401 ||
            (err as any).response.status === 403)
        ) {
          localStorage.removeItem("token");
          window.location.href = "/"; // or your login route
        }
      }
    };

    checkProfile();
  }, []);

  return (
    <div className='flex flex-col max-w-3xl mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-4'>Student Dashboard</h1>
      <Link to='/complaint' className='text-blue-500'>
        Complaint
      </Link>
      <Link to='/leave' className='text-blue-500'>
        Leave
      </Link>
      <Link to='/fee' className='text-blue-500'>
        Fees
      </Link>
      <Link to='/rooms' className='text-blue-500'>
        Rooms
      </Link>
    </div>
  );
}
