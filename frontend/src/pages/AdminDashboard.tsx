// src/pages/AdminDashboard.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import RoomDiagram from "../components/RoomDiagram";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>({});

  const fetchStats = async () => {
    const [students, rooms, leaves, complaints, payments] = await Promise.all([
      axios.get("http://localhost:3000/students"),
      axios.get("http://localhost:3000/rooms"),
      axios.get("http://localhost:3000/leaves"),
      axios.get("http://localhost:3000/complaints"),
      axios.get("http://localhost:3000/payments"),
    ]);

    setStats({
      students: students.data.totalItems,
      rooms: rooms.data.length,
      leaves: leaves.data.data.length,
      complaints: complaints.data.data.length,
      payments: payments.data.data.length,
    });
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className='p-6 max-w-6xl mx-auto'>
      <h1 className='text-3xl font-bold mb-4'>Admin Dashboard</h1>
      <div className='grid grid-cols-2 md:grid-cols-3 gap-6'>
        {[
          { title: "Total Students", count: stats.students },
          { title: "Rooms", count: stats.rooms },
          { title: "Leaves", count: stats.leaves },
          { title: "Complaints", count: stats.complaints },
          { title: "Payments", count: stats.payments },
        ].map((card) => (
          <div
            key={card.title}
            className='bg-white shadow-md rounded-lg p-4 border'
          >
            <h2 className='text-lg font-semibold'>{card.title}</h2>
            <p className='text-2xl font-bold text-blue-600'>
              {card.count ?? "..."}
            </p>
          </div>
        ))}
      </div>
      <RoomDiagram />
      <div className='flex flex-col gap-1'>
        <Link to='/admin/students' className='text-blue-500'>
          Students
        </Link>
        <Link to='/admin/complaints' className='text-blue-500'>
          Complaints
        </Link>
        <Link to='/admin/rooms' className='text-blue-500'>
          Rooms
        </Link>
        <Link to='/admin/leaves' className='text-blue-500'>
          Leaves
        </Link>
        <Link to='/admin/fees' className='text-blue-500'>
          Fees
        </Link>
      </div>
    </div>
  );
}
