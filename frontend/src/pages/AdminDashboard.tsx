// src/pages/AdminDashboard.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import RoomDiagram from "../components/RoomDiagram";
import Spinner from "../components/Spinner";

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
      <h1 className='text-4xl font-extrabold mb-8 text-blue-900'>
        Admin Dashboard
      </h1>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-10'>
        {[
          {
            title: "Total Students",
            count: stats.students,
            color: "from-blue-500 to-blue-700",
          },
          {
            title: "Rooms",
            count: stats.rooms,
            color: "from-green-500 to-green-700",
          },
          {
            title: "Leaves",
            count: stats.leaves,
            color: "from-yellow-400 to-yellow-600",
          },
          {
            title: "Complaints",
            count: stats.complaints,
            color: "from-red-500 to-red-700",
          },
          {
            title: "Payments",
            count: stats.payments,
            color: "from-purple-500 to-purple-700",
          },
        ].map((card) => (
          <div
            key={card.title}
            className={`bg-gradient-to-br ${card.color} shadow-xl rounded-2xl p-6 border border-blue-100 flex flex-col items-center transition-transform hover:scale-105 min-w-[150px] min-h-[120px] w-full`}
          >
            <h2 className='text-lg font-semibold text-white mb-2 tracking-wide text-center break-words'>
              {card.title}
            </h2>
            <p className='text-4xl font-extrabold text-white drop-shadow-lg text-center'>
              {card.count ?? <Spinner />}
            </p>
          </div>
        ))}
      </div>
      <div className='bg-white rounded-2xl shadow-xl p-6 border mb-8 overflow-x-auto'>
        <h2 className='text-xl font-bold mb-4 text-blue-800'>
          Room Assignment Overview
        </h2>
        <RoomDiagram />
      </div>
    </div>
  );
}
