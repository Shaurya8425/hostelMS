// src/pages/AdminDashboard.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import RoomDiagram from "../../components/RoomDiagram";
import Spinner from "../../components/Spinner";
import { API_BASE } from "../../api/apiBase";
import { getLinenInventory } from "../../api/linenApi";
import SkeletonDashboard from "../../components/skeleton/admin/SkeletonDashboard";

function AdminDashboard() {
  const [stats, setStats] = useState<{
    students?: number;
    rooms?: number;
    leaves?: number;
    complaints?: number;
  }>({});
  const [loading, setLoading] = useState(true);
  const [linen, setLinen] = useState<{
    bedsheet: number;
    pillowCover: number;
  } | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [students, rooms, leaves, complaints] = await Promise.all([
        axios.get(`${API_BASE}/students`),
        axios.get(`${API_BASE}/rooms`),
        axios.get(`${API_BASE}/leaves`),
        axios.get(`${API_BASE}/complaints`),
      ]);

      setStats({
        students: students.data.totalItems,
        rooms: rooms.data.length,
        leaves: leaves.data.data.length,
        complaints: complaints.data.data.length,
      });

      // Fetch linen inventory
      try {
        const linenData = await getLinenInventory();
        setLinen(linenData);
      } catch (e) {
        setLinen(null);
      }
    } catch (error) {
      toast.error("Failed to fetch dashboard data");
      setStats({});
      setLinen(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <SkeletonDashboard />;
  }

  return (
    <div className='p-6 max-w-6xl mx-auto'>
      <h1 className='text-4xl font-extrabold mb-8 text-blue-900'>
        Admin Dashboard
      </h1>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-10'>
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
            title: "Bedsheets",
            count: linen ? (
              <div className='flex flex-col items-center text-sm'>
                <div className='text-2xl font-bold'>{linen.bedsheet}</div>
                <div className='text-white/90'>Available</div>
                <div className='text-xl font-semibold mt-1'>10</div>
                <div className='text-white/90'>Total</div>
              </div>
            ) : (
              <Spinner />
            ),
            color: "from-purple-500 to-purple-700",
          },
          {
            title: "Pillow Covers",
            count: linen ? (
              <div className='flex flex-col items-center text-sm'>
                <div className='text-2xl font-bold'>{linen.pillowCover}</div>
                <div className='text-white/90'>Available</div>
                <div className='text-xl font-semibold mt-1'>8</div>
                <div className='text-white/90'>Total</div>
              </div>
            ) : (
              <Spinner />
            ),
            color: "from-pink-500 to-pink-700",
          },
        ].map((card) => (
          <div
            key={card.title}
            className={`bg-gradient-to-br ${card.color} shadow-xl rounded-2xl p-6 border border-blue-100 flex flex-col items-center transition-transform hover:scale-105 min-w-[150px] min-h-[160px] w-full`}
          >
            <h2 className='text-lg font-semibold text-white mb-2 tracking-wide text-center break-words'>
              {card.title}
            </h2>
            <div className='text-4xl font-extrabold text-white drop-shadow-lg text-center'>
              {card.count ?? <Spinner />}
            </div>
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

export default AdminDashboard;
