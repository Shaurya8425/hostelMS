import { useState, useEffect } from "react";
import {
  getBedOccupancyData,
  type BedOccupancyData,
} from "../api/bedOccupancyApi";
import { toast } from "react-toastify";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

interface BedOccupancyDashboardProps {
  summaryOnly?: boolean;
}

const BedOccupancyDashboard = ({
  summaryOnly = false,
}: BedOccupancyDashboardProps) => {
  const [occupancyData, setOccupancyData] = useState<BedOccupancyData | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30); // Default to last 30 days
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const fetchOccupancyData = async () => {
    if (!startDate || !endDate) return;

    setLoading(true);
    try {
      const data = await getBedOccupancyData(startDate, endDate);
      setOccupancyData(data);
    } catch (error: any) {
      console.error("Error fetching bed occupancy data:", error);
      toast.error(
        error.response?.data?.error || "Failed to fetch bed occupancy data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOccupancyData();
  }, []);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (new Date(startDate) >= new Date(endDate)) {
      toast.error("Start date must be before end date");
      return;
    }
    fetchOccupancyData();
  };

  // Pie chart data for overall occupancy
  const pieChartData = occupancyData
    ? {
        labels: ["Occupied Bed Days", "Available Bed Days"],
        datasets: [
          {
            data: [
              occupancyData.summary.totalOccupiedBedDays,
              occupancyData.summary.availableBedDays,
            ],
            backgroundColor: ["#3B82F6", "#E5E7EB"],
            borderColor: ["#1D4ED8", "#9CA3AF"],
            borderWidth: 2,
          },
        ],
      }
    : null;

  // Bar chart data for wing-wise occupancy
  const barChartData = occupancyData
    ? {
        labels: Object.keys(occupancyData.wingStats).sort((a, b) => {
          // Custom sort to ensure A, B, C order
          const order = ["A", "B", "C"];
          const indexA = order.indexOf(a);
          const indexB = order.indexOf(b);

          // If both wings are in our order array, sort by their position
          if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
          }
          // If only one is in order array, prioritize it
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          // If neither is in order array, fall back to alphabetical
          return a.localeCompare(b);
        }),
        datasets: [
          {
            label: "Total Beds",
            data: Object.keys(occupancyData.wingStats)
              .sort((a, b) => {
                // Same custom sort for consistency
                const order = ["A", "B", "C"];
                const indexA = order.indexOf(a);
                const indexB = order.indexOf(b);

                if (indexA !== -1 && indexB !== -1) {
                  return indexA - indexB;
                }
                if (indexA !== -1) return -1;
                if (indexB !== -1) return 1;
                return a.localeCompare(b);
              })
              .map((key) => occupancyData.wingStats[key].totalBeds),
            backgroundColor: "rgba(34, 197, 94, 0.6)",
            borderColor: "rgba(34, 197, 94, 1)",
            borderWidth: 1,
            yAxisID: "y1",
          },
          {
            label: "Occupancy Percentage",
            data: Object.keys(occupancyData.wingStats)
              .sort((a, b) => {
                // Same custom sort for consistency
                const order = ["A", "B", "C"];
                const indexA = order.indexOf(a);
                const indexB = order.indexOf(b);

                if (indexA !== -1 && indexB !== -1) {
                  return indexA - indexB;
                }
                if (indexA !== -1) return -1;
                if (indexB !== -1) return 1;
                return a.localeCompare(b);
              })
              .map((key) => occupancyData.wingStats[key].occupancyPercentage),
            backgroundColor: "rgba(59, 130, 246, 0.6)",
            borderColor: "rgba(59, 130, 246, 1)",
            borderWidth: 1,
            yAxisID: "y",
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || "";
            const value = context.raw || 0;
            const total =
              (occupancyData?.summary.totalOccupiedBedDays || 0) +
              (occupancyData?.summary.availableBedDays || 0);
            const percentage = total
              ? ((value / total) * 100).toFixed(1)
              : "0.0";
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const datasetLabel = context.dataset.label || "";
            const value = context.raw || 0;
            const wingIndex = context.dataIndex;

            if (datasetLabel === "Occupancy Percentage") {
              return `${datasetLabel}: ${value.toFixed(1)}%`;
            } else {
              // For Total Beds, also show occupancy info
              const wingStats = Object.values(occupancyData?.wingStats || {});
              const wingData = wingStats[wingIndex] as any;
              const occupancyPercentage = wingData
                ? wingData.occupancyPercentage || 0
                : 0;
              return `${datasetLabel}: ${value} (${occupancyPercentage.toFixed(
                1
              )}% occupied)`;
            }
          },
        },
      },
    },
    scales: {
      y: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function (value: any) {
            return value + "%";
          },
        },
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: "Occupancy %",
        },
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return value;
          },
        },
        title: {
          display: true,
          text: "Total Beds",
        },
      },
    },
  };

  return (
    <div className={summaryOnly ? "" : "p-6 max-w-7xl mx-auto"}>
      {!summaryOnly && (
        <h1 className='text-3xl font-bold text-blue-900 mb-6'>
          Bed Days Occupancy Analysis
        </h1>
      )}

      {/* Date Filter Form - only show in detailed view */}
      {!summaryOnly && (
        <div className='bg-white rounded-lg shadow p-6 mb-6'>
          <h2 className='text-lg font-semibold mb-4'>Time Filter</h2>
          <form
            onSubmit={handleFilterSubmit}
            className='flex flex-wrap gap-4 items-end'
          >
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Start Date
              </label>
              <input
                type='date'
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className='border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                End Date
              </label>
              <input
                type='date'
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className='border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                required
              />
            </div>
            <button
              type='submit'
              disabled={loading}
              className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition'
            >
              {loading ? "Loading..." : "Apply Filter"}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className='flex justify-center items-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
        </div>
      ) : occupancyData ? (
        <>
          {/* Summary Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            <div className='bg-white rounded-lg shadow p-6'>
              <h3 className='text-sm font-medium text-gray-500'>Total Beds</h3>
              <p className='text-3xl font-bold text-blue-600'>
                {occupancyData.summary.totalBeds}
              </p>
            </div>
            <div className='bg-white rounded-lg shadow p-6'>
              <h3 className='text-sm font-medium text-gray-500'>
                Total Bed Days
              </h3>
              <p className='text-3xl font-bold text-green-600'>
                {occupancyData.summary.totalPossibleBedDays}
              </p>
            </div>
            <div className='bg-white rounded-lg shadow p-6'>
              <h3 className='text-sm font-medium text-gray-500'>
                Occupied Bed Days
              </h3>
              <p className='text-3xl font-bold text-purple-600'>
                {occupancyData.summary.totalOccupiedBedDays}
              </p>
            </div>
            <div className='bg-white rounded-lg shadow p-6'>
              <h3 className='text-sm font-medium text-gray-500'>
                Occupancy Rate
              </h3>
              <p className='text-3xl font-bold text-orange-600'>
                {occupancyData.summary.occupancyPercentage}%
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
            {/* Pie Chart */}
            <div className='bg-white rounded-lg shadow p-6'>
              <h3 className='text-lg font-semibold mb-4'>
                Overall Bed Days Distribution
              </h3>
              {pieChartData && (
                <div className='h-80'>
                  <Pie data={pieChartData} options={chartOptions} />
                </div>
              )}
            </div>

            {/* Bar Chart */}
            <div className='bg-white rounded-lg shadow p-6'>
              <h3 className='text-lg font-semibold mb-4'>
                Wing-wise Beds & Occupancy Analysis
              </h3>
              {barChartData && (
                <div className='h-80'>
                  <Bar data={barChartData} options={barChartOptions} />
                </div>
              )}
            </div>
          </div>

          {/* Tables - only show in detailed view */}
          {!summaryOnly && (
            <>
              {/* Wing-wise Statistics Table */}
              <div className='bg-white rounded-lg shadow mb-8'>
                <div className='p-6'>
                  <h3 className='text-lg font-semibold mb-4'>
                    Wing-wise Statistics
                  </h3>
                  <div className='overflow-x-auto'>
                    <table className='min-w-full divide-y divide-gray-200'>
                      <thead className='bg-gray-50'>
                        <tr>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            Wing/Block
                          </th>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            Total Beds
                          </th>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            Possible Bed Days
                          </th>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            Occupied Bed Days
                          </th>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            Occupancy %
                          </th>
                        </tr>
                      </thead>
                      <tbody className='bg-white divide-y divide-gray-200'>
                        {Object.entries(occupancyData.wingStats)
                          .sort(([wingA], [wingB]) => {
                            // Custom sort to ensure A, B, C order
                            const order = ["A", "B", "C"];
                            const indexA = order.indexOf(wingA);
                            const indexB = order.indexOf(wingB);

                            // If both wings are in our order array, sort by their position
                            if (indexA !== -1 && indexB !== -1) {
                              return indexA - indexB;
                            }
                            // If only one is in order array, prioritize it
                            if (indexA !== -1) return -1;
                            if (indexB !== -1) return 1;
                            // If neither is in order array, fall back to alphabetical
                            return wingA.localeCompare(wingB);
                          })
                          .map(([wing, stats]: [string, any]) => (
                            <tr key={wing}>
                              <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                                {wing}
                              </td>
                              <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                {stats.totalBeds}
                              </td>
                              <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                {stats.totalPossibleBedDays}
                              </td>
                              <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                {stats.occupiedBedDays}
                              </td>
                              <td className='px-6 py-4 whitespace-nowrap'>
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    stats.occupancyPercentage >= 80
                                      ? "bg-red-100 text-red-800"
                                      : stats.occupancyPercentage >= 60
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  {stats.occupancyPercentage.toFixed(1)}%
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Student Occupancy Table */}
              <div className='bg-white rounded-lg shadow'>
                <div className='p-6'>
                  <h3 className='text-lg font-semibold mb-4'>
                    Individual Student Bed Days
                  </h3>
                  <div className='overflow-x-auto'>
                    <table className='min-w-full divide-y divide-gray-200'>
                      <thead className='bg-gray-50'>
                        <tr>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            Student Name
                          </th>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            Room
                          </th>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            From Date
                          </th>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            To Date
                          </th>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            Bed Days
                          </th>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className='bg-white divide-y divide-gray-200'>
                        {occupancyData.studentOccupancy.map(
                          (student: any, index: number) => (
                            <tr
                              key={`${student.type}-${student.studentId}-${index}`}
                            >
                              <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                                {student.studentName}
                              </td>
                              <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                {student.room}
                              </td>
                              <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                {student.fromDate}
                              </td>
                              <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                {student.toDate}
                              </td>
                              <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                <span className='font-semibold text-blue-600'>
                                  {student.bedDays}
                                </span>
                              </td>
                              <td className='px-6 py-4 whitespace-nowrap'>
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    student.type === "current"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {student.type === "current"
                                    ? "Active"
                                    : "Archived"}
                                </span>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      ) : (
        <div className='text-center py-12'>
          <p className='text-gray-500'>
            Select a date range to view bed occupancy data
          </p>
        </div>
      )}
    </div>
  );
};

export default BedOccupancyDashboard;
