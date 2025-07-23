// src/pages/AdminDashboard.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import RoomDiagram from "../../components/RoomDiagram";
import Spinner from "../../components/Spinner";
import { API_BASE } from "../../api/apiBase";
import { getLinenInventory, updateLinenInventory } from "../../api/linenApi";
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
    bedsheet: { current: number; total: number };
    pillowCover: { current: number; total: number };
  } | null>(null);
  const [editingBedsheets, setEditingBedsheets] = useState(false);
  const [editingPillowCovers, setEditingPillowCovers] = useState(false);
  const [editLinen, setEditLinen] = useState({
    bedsheet: 0,
    pillowCover: 0,
  });

  const handleLinenUpdate = async (type: "bedsheet" | "pillowCover") => {
    try {
      const addAmount = editLinen[type]; // This is the amount to add

      // Calculate new values by adding the input amount to current values
      const newBedsheetCurrent =
        type === "bedsheet"
          ? linen!.bedsheet.current + addAmount
          : linen!.bedsheet.current;
      const newPillowCurrent =
        type === "pillowCover"
          ? linen!.pillowCover.current + addAmount
          : linen!.pillowCover.current;

      // Update both current and total in the backend
      const updated = await updateLinenInventory({
        bedsheet: newBedsheetCurrent,
        pillowCover: newPillowCurrent,
      });

      // Update the state with new values
      setLinen({
        bedsheet: {
          current: updated.bedsheet,
          total:
            type === "bedsheet"
              ? linen!.bedsheet.total + addAmount
              : linen!.bedsheet.total,
        },
        pillowCover: {
          current: updated.pillowCover,
          total:
            type === "pillowCover"
              ? linen!.pillowCover.total + addAmount
              : linen!.pillowCover.total,
        },
      });

      if (type === "bedsheet") setEditingBedsheets(false);
      if (type === "pillowCover") setEditingPillowCovers(false);
      toast.success("Linen inventory updated successfully");
    } catch (error) {
      toast.error("Failed to update linen inventory");
    }
  };

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
        setLinen({
          bedsheet: {
            current: linenData.bedsheet,
            total: linenData.bedsheet,
          },
          pillowCover: {
            current: linenData.pillowCover,
            total: linenData.pillowCover,
          },
        });
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
            color: "from-indigo-500 to-indigo-700",
          },
          {
            title: "Rooms",
            count: stats.rooms,
            color: "from-emerald-500 to-emerald-700",
          },
          {
            title: "Leaves",
            count: stats.leaves,
            color: "from-amber-400 to-amber-600",
          },
          {
            title: "Complaints",
            count: stats.complaints,
            color: "from-rose-500 to-rose-700",
          },
          {
            title: "Bedsheets",
            count: linen ? (
              <div className='flex flex-col items-center text-sm'>
                {editingBedsheets ? (
                  <>
                    <div className='text-white/90 mb-1'>Add Inventory:</div>
                    <input
                      type='number'
                      value={editLinen.bedsheet}
                      onChange={(e) =>
                        setEditLinen((prev) => ({
                          ...prev,
                          bedsheet: parseInt(e.target.value) || 0,
                        }))
                      }
                      min='0'
                      placeholder='Amount to add'
                      className='w-24 px-2 py-1 text-black rounded border focus:outline-none focus:ring-2 focus:ring-purple-400'
                    />
                    <div className='flex gap-2 mt-2'>
                      <button
                        onClick={() => handleLinenUpdate("bedsheet")}
                        className='px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700'
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setEditingBedsheets(false);
                          setEditLinen((prev) => ({ ...prev, bedsheet: 0 }));
                        }}
                        className='px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700'
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className='text-2xl font-bold'>
                      {linen.bedsheet.current}
                    </div>
                    <div className='text-white/90'>Current Inventory</div>
                    <div className='text-xl font-semibold mt-1'>
                      {linen.bedsheet.total}
                    </div>
                    <div className='text-white/90'>Total</div>
                    <button
                      onClick={() => {
                        setEditLinen({
                          ...editLinen,
                          bedsheet: linen.bedsheet.current,
                        });
                        setEditingBedsheets(true);
                      }}
                      className='px-2 py-1 bg-white/20 text-white text-xs rounded hover:bg-white/30 mt-2'
                    >
                      Edit Inventory
                    </button>
                  </>
                )}
              </div>
            ) : (
              <Spinner />
            ),
            color: "from-violet-500 to-violet-700",
          },
          {
            title: "Pillow Covers",
            count: linen ? (
              <div className='flex flex-col items-center text-sm'>
                {editingPillowCovers ? (
                  <>
                    <div className='text-white/90 mb-1'>Add Inventory:</div>
                    <input
                      type='number'
                      value={editLinen.pillowCover}
                      onChange={(e) =>
                        setEditLinen((prev) => ({
                          ...prev,
                          pillowCover: parseInt(e.target.value) || 0,
                        }))
                      }
                      min='0'
                      placeholder='Amount to add'
                      className='w-24 px-2 py-1 text-black rounded border focus:outline-none focus:ring-2 focus:ring-pink-400'
                    />
                    <div className='flex gap-2 mt-2'>
                      <button
                        onClick={() => handleLinenUpdate("pillowCover")}
                        className='px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700'
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setEditingPillowCovers(false);
                          setEditLinen((prev) => ({ ...prev, pillowCover: 0 }));
                        }}
                        className='px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700'
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className='text-2xl font-bold'>
                      {linen.pillowCover.current}
                    </div>
                    <div className='text-white/90'>Current Inventory</div>
                    <div className='text-xl font-semibold mt-1'>
                      {linen.pillowCover.total}
                    </div>
                    <div className='text-white/90'>Total</div>
                    <button
                      onClick={() => {
                        setEditLinen({
                          ...editLinen,
                          pillowCover: linen.pillowCover.current,
                        });
                        setEditingPillowCovers(true);
                      }}
                      className='px-2 py-1 bg-white/20 text-white text-xs rounded hover:bg-white/30 mt-2'
                    >
                      Edit Inventory
                    </button>
                  </>
                )}
              </div>
            ) : (
              <Spinner />
            ),
            color: "from-fuchsia-500 to-fuchsia-700",
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
