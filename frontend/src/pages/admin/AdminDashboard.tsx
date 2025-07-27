// src/pages/AdminDashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { toast } from "react-toastify";
import RoomDiagram from "../../components/RoomDiagram";
import Spinner from "../../components/Spinner";

import { getLinenInventory } from "../../api/linenApi";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);
import SkeletonDashboard from "../../components/skeleton/admin/SkeletonDashboard";

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<{
    students?: number;
    rooms?: number;
    leaves?: number;
    complaints?: number;
  }>({});
  const [loading, setLoading] = useState(true);
  const [linen, setLinen] = useState<{
    bedsheet: { total: number; active: number; inHand: number };
    pillowCover: { total: number; active: number; inHand: number };
    blanket: { total: number; active: number; inHand: number };
  } | null>(null);
  const [bedStats, setBedStats] = useState<{
    totalBeds: number;
    occupiedBeds: number;
  }>({
    totalBeds: 0,
    occupiedBeds: 0,
  });
  const [wingStats, setWingStats] = useState<{
    [key: string]: { totalBeds: number; occupiedBeds: number };
  }>({});

  const fetchStats = async () => {
    setLoading(true);
    try {
      console.log("Fetching dashboard data...");
      // Fetch all data in parallel
      const [studentsRes, roomsRes, leavesRes, complaintsRes, linenRes] =
        await Promise.all([
          axiosInstance.get("/students"),
          axiosInstance.get("/rooms"),
          axiosInstance.get("/leaves"),
          axiosInstance.get("/complaints"),
          getLinenInventory(),
        ]).catch((error) => {
          console.error("API Error:", error.response?.data || error.message);
          throw error;
        });

      console.log("API Responses:", {
        students: studentsRes.data,
        rooms: roomsRes.data,
        leaves: leavesRes.data,
        complaints: complaintsRes.data,
        linen: linenRes,
      });

      // Calculate total and occupied beds
      // Get room data from response
      const roomsData = Array.isArray(roomsRes.data)
        ? roomsRes.data
        : roomsRes.data.data || [];
      console.log("Room data:", roomsData);

      // Calculate bed stats
      const totalBeds = roomsData.reduce(
        (acc: number, room: any) => acc + (Number(room.capacity) || 0),
        0
      );
      const occupiedBeds = roomsData.reduce(
        (acc: number, room: any) =>
          acc +
          ((Array.isArray(room.students) ? room.students.length : 0) || 0),
        0
      );

      setBedStats({
        totalBeds,
        occupiedBeds,
      });

      // Calculate wing-wise bed stats
      const wingStats: {
        [key: string]: { totalBeds: number; occupiedBeds: number };
      } = {};
      roomsData.forEach((room: any) => {
        const wing = room.block;
        if (!wingStats[wing]) {
          wingStats[wing] = { totalBeds: 0, occupiedBeds: 0 };
        }
        wingStats[wing].totalBeds += Number(room.capacity) || 0;
        wingStats[wing].occupiedBeds +=
          (Array.isArray(room.students) ? room.students.length : 0) || 0;
      });

      setWingStats(wingStats);

      // Set dashboard stats
      setStats({
        students:
          studentsRes.data.meta?.totalItems ||
          (Array.isArray(studentsRes.data.data)
            ? studentsRes.data.data.length
            : 0),
        rooms: roomsData.length,
        leaves: Array.isArray(leavesRes.data.data)
          ? leavesRes.data.data.length
          : 0,
        complaints: Array.isArray(complaintsRes.data.data)
          ? complaintsRes.data.data.length
          : 0,
      });

      // Update linen inventory
      console.log("Linen response data:", linenRes);
      if (linenRes) {
        setLinen({
          bedsheet: {
            total: parseInt(String(linenRes.bedsheet)) || 0,
            active: parseInt(String(linenRes.bedsheetActive)) || 0,
            inHand: parseInt(String(linenRes.bedsheetInHand)) || 0,
          },
          pillowCover: {
            total: parseInt(String(linenRes.pillowCover)) || 0,
            active: parseInt(String(linenRes.pillowActive)) || 0,
            inHand: parseInt(String(linenRes.pillowInHand)) || 0,
          },
          blanket: {
            total: parseInt(String(linenRes.blanket)) || 0,
            active: parseInt(String(linenRes.blanketActive)) || 0,
            inHand: parseInt(String(linenRes.blanketInHand)) || 0,
          },
        });
      }
    } catch (error: any) {
      console.error("Dashboard Error:", error.response?.data || error.message);
      toast.error(
        error.response?.data?.error || "Failed to fetch dashboard data"
      );
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
      <div className='grid lg:grid-cols-5 gap-8 mb-10'>
        <div className='lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-8'>
          {[
            {
              title: "Total Students",
              count: stats.students,
              color: "from-indigo-500 to-indigo-700",
              path: "/admin/students",
            },
            {
              title: "Rooms",
              count: stats.rooms,
              color: "from-emerald-500 to-emerald-700",
              path: "/admin/rooms",
            },
            {
              title: "Leaves",
              count: stats.leaves,
              color: "from-amber-400 to-amber-600",
              path: "/admin/leaves",
            },
            {
              title: "Complaints",
              count: stats.complaints,
              color: "from-rose-500 to-rose-700",
              path: "/admin/complaints",
            },
          ].map((card) => (
            <div
              key={card.title}
              onClick={() => card.path && navigate(card.path)}
              className={`bg-gradient-to-br ${
                card.color
              } shadow-xl rounded-2xl p-6 border border-blue-100 flex flex-col items-center transition-transform hover:scale-105 min-w-[150px] min-h-[160px] w-full ${
                card.path ? "cursor-pointer" : ""
              }`}
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
        <div className='lg:col-span-2'>
          <div
            className={`bg-gradient-to-br from-violet-500 to-violet-700 shadow-xl rounded-2xl p-8 border border-violet-400/30 flex flex-col items-center transition-all duration-300 hover:scale-105 min-w-[150px] h-full w-full relative hover:shadow-2xl`}
          >
            <div className='absolute inset-0 bg-gradient-to-t from-violet-600/30 to-transparent rounded-2xl'></div>
            <h2 className='text-xl font-bold text-white mb-6 tracking-wide text-center break-words relative'>
              Linen Inventory
            </h2>
            {linen ? (
              <div className='flex flex-col items-center text-sm relative z-10 w-full'>
                <div className='bg-white/10 rounded-xl px-8 py-4 mb-4'>
                  <div className='text-3xl font-bold text-white text-center'>
                    {linen.bedsheet.inHand +
                      linen.pillowCover.inHand +
                      linen.blanket.inHand}
                  </div>
                  <div className='text-white/90 font-medium text-center mt-1'>
                    Total Items in Stock
                  </div>
                </div>
                <div className='grid grid-cols-3 gap-4 w-full mt-4'>
                  <div className='bg-white/10 rounded-xl p-4 transition-all duration-200 hover:bg-white/20 group'>
                    <div className='text-2xl font-bold text-center text-white mb-1'>
                      {linen.bedsheet.inHand}
                    </div>
                    <div className='text-white/90 text-xs text-center font-medium'>
                      Bedsheets
                    </div>
                  </div>
                  <div className='bg-white/10 rounded-xl p-4 transition-all duration-200 hover:bg-white/20 group'>
                    <div className='text-2xl font-bold text-center text-white mb-1'>
                      {linen.pillowCover.inHand}
                    </div>
                    <div className='text-white/90 text-xs text-center font-medium'>
                      Pillow Covers
                    </div>
                  </div>
                  <div className='bg-white/10 rounded-xl p-4 transition-all duration-200 hover:bg-white/20 group'>
                    <div className='text-2xl font-bold text-center text-white mb-1'>
                      {linen.blanket.inHand}
                    </div>
                    <div className='text-white/90 text-xs text-center font-medium'>
                      Blankets
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/admin/linen")}
                  className='group px-6 py-2.5 bg-white/20 text-white text-sm rounded-lg hover:bg-white/30 mt-8 flex items-center gap-2 font-medium transition-all duration-200 hover:shadow-lg'
                >
                  <span>View Details</span>
                  <svg
                    className='w-4 h-4 transform transition-transform group-hover:translate-x-1'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 5l7 7-7 7'
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <Spinner />
            )}
          </div>
        </div>
      </div>
      <div className='flex flex-col gap-8 mb-8'>
        <div className='bg-white rounded-2xl shadow-xl p-6 border max-w-6xl mx-auto w-full'>
          <h2 className='text-xl font-bold mb-6 text-blue-800'>
            Bed Occupancy Overview
          </h2>

          {/* Overall Occupancy */}
          <div className='mb-8'>
            <h3 className='text-lg font-semibold mb-4 text-blue-700 text-center'>
              Overall Hostel Occupancy
            </h3>
            <div className='flex flex-col items-center'>
              <div className='w-64 h-64'>
                <Pie
                  data={{
                    labels: ["Available Beds", "Occupied Beds"],
                    datasets: [
                      {
                        data: [
                          bedStats.totalBeds - bedStats.occupiedBeds,
                          bedStats.occupiedBeds,
                        ],
                        backgroundColor: ["#22c55e", "#3b82f6"],
                        borderColor: ["#16a34a", "#2563eb"],
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: "bottom",
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const label = context.label || "";
                            const value = context.raw || 0;
                            const total = bedStats.totalBeds;
                            const percentage = (
                              ((value as number) / total) *
                              100
                            ).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
              <div className='mt-4 text-center text-gray-600'>
                <p className='font-medium'>
                  Total Capacity: {bedStats.totalBeds} beds
                </p>
                <p className='text-sm'>
                  Available: {bedStats.totalBeds - bedStats.occupiedBeds} |
                  Occupied: {bedStats.occupiedBeds}
                </p>
              </div>
            </div>
          </div>

          {/* Wing-wise Occupancy */}
          <div>
            <h3 className='text-lg font-semibold mb-6 text-blue-700 text-center'>
              Wing-wise Occupancy
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
              {Object.entries(wingStats)
                .sort(([wingA], [wingB]) => wingA.localeCompare(wingB))
                .map(([wing, stats]) => (
                  <div key={wing} className='flex flex-col items-center'>
                    <h4 className='text-md font-medium mb-4 text-gray-800'>
                      {wing}
                    </h4>
                    <div className='w-48 h-48'>
                      <Pie
                        data={{
                          labels: ["Available", "Occupied"],
                          datasets: [
                            {
                              data: [
                                stats.totalBeds - stats.occupiedBeds,
                                stats.occupiedBeds,
                              ],
                              backgroundColor: ["#22c55e", "#ef4444"],
                              borderColor: ["#16a34a", "#dc2626"],
                              borderWidth: 1,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: {
                              position: "bottom",
                              labels: {
                                font: {
                                  size: 11,
                                },
                              },
                            },
                            tooltip: {
                              callbacks: {
                                label: (context) => {
                                  const label = context.label || "";
                                  const value = context.raw || 0;
                                  const total = stats.totalBeds;
                                  const percentage =
                                    total > 0
                                      ? (
                                          ((value as number) / total) *
                                          100
                                        ).toFixed(1)
                                      : "0";
                                  return `${label}: ${value} (${percentage}%)`;
                                },
                              },
                            },
                          },
                        }}
                      />
                    </div>
                    <div className='mt-3 text-center text-gray-600'>
                      <p className='font-medium text-sm'>
                        Total: {stats.totalBeds} beds
                      </p>
                      <p className='text-xs'>
                        Available: {stats.totalBeds - stats.occupiedBeds} |
                        Occupied: {stats.occupiedBeds}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className='bg-white rounded-2xl shadow-xl p-6 border max-w-4xl mx-auto w-full'>
          <h2 className='text-xl font-bold mb-4 text-blue-800'>
            Linen Inventory Overview
          </h2>
          <div className='flex flex-col items-center space-y-8'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-8 w-full'>
              <div className='flex flex-col items-center'>
                <h3 className='text-lg font-semibold mb-4 text-blue-700'>
                  Distribution
                </h3>
                <div className='w-64 h-64'>
                  <Pie
                    data={{
                      labels: ["Bedsheets", "Pillow Covers", "Blankets"],
                      datasets: [
                        {
                          data: linen
                            ? [
                                linen.bedsheet.total,
                                linen.pillowCover.total,
                                linen.blanket.total,
                              ]
                            : [],
                          backgroundColor: ["#60a5fa", "#34d399", "#f472b6"],
                          borderColor: ["#3b82f6", "#059669", "#db2777"],
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: "bottom",
                        },
                        tooltip: {
                          callbacks: {
                            label: (context) => {
                              const label = context.label || "";
                              const value = context.raw || 0;
                              const total = linen
                                ? linen.bedsheet.total +
                                  linen.pillowCover.total +
                                  linen.blanket.total
                                : 0;
                              const percentage =
                                total > 0
                                  ? (((value as number) / total) * 100).toFixed(
                                      1
                                    )
                                  : "0";
                              return `${label}: ${value} (${percentage}%)`;
                            },
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>

              <div className='flex flex-col items-center'>
                <h3 className='text-lg font-semibold mb-4 text-blue-700'>
                  Status Overview
                </h3>
                <div
                  className='w-full'
                  style={{
                    height: "300px",
                    minHeight: "250px",
                    maxHeight: "400px",
                  }}
                >
                  <Bar
                    data={{
                      labels: ["Bedsheets", "Pillow Covers", "Blankets"],
                      datasets: [
                        {
                          label: "Total",
                          data: linen
                            ? [
                                linen.bedsheet.total,
                                linen.pillowCover.total,
                                linen.blanket.total,
                              ]
                            : [],
                          backgroundColor: "#3b82f6",
                        },
                        {
                          label: "In Stock",
                          data: linen
                            ? [
                                linen.bedsheet.inHand,
                                linen.pillowCover.inHand,
                                linen.blanket.inHand,
                              ]
                            : [],
                          backgroundColor: "#22c55e",
                        },
                        {
                          label: "In Use",
                          data: linen
                            ? [
                                linen.bedsheet.active,
                                linen.pillowCover.active,
                                linen.blanket.active,
                              ]
                            : [],
                          backgroundColor: "#f97316",
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "bottom",
                        },
                        tooltip: {
                          mode: "index",
                          intersect: false,
                        },
                      },
                      scales: {
                        x: {
                          grid: {
                            display: false,
                          },
                        },
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: "#e5e7eb",
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>

            <div className='text-center text-gray-600 pt-4 border-t w-full'>
              <p className='font-medium'>
                Total Items In Stock:{" "}
                {linen
                  ? linen.bedsheet.inHand +
                    linen.pillowCover.inHand +
                    linen.blanket.inHand
                  : 0}
              </p>
              <p className='text-sm'>
                Bedsheets: {linen?.bedsheet.inHand || 0} /{" "}
                {linen?.bedsheet.total || 0} (Active:{" "}
                {linen?.bedsheet.active || 0}) | Pillow Covers:{" "}
                {linen?.pillowCover.inHand || 0} /{" "}
                {linen?.pillowCover.total || 0} (Active:{" "}
                {linen?.pillowCover.active || 0}) | Blankets:{" "}
                {linen?.blanket.inHand || 0} / {linen?.blanket.total || 0}{" "}
                (Active: {linen?.blanket.active || 0})
              </p>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-2xl shadow-xl p-6 border max-w-4xl mx-auto w-full'>
          <h2 className='text-xl font-bold mb-4 text-blue-800'>
            Room Assignment Overview
          </h2>
          <RoomDiagram />
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
