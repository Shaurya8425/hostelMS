import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE } from "../../api/apiBase";
import SkeletonLeaves from "../../components/skeleton/admin/SkeletonLeaves";

interface Leave {
  id: number;
  fromDate: string;
  toDate: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  student: {
    id: number;
    name: string;
    email: string;
  };
}

export default function AdminLeaves() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const token = localStorage.getItem("token");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when search or filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const fetchLeaves = async () => {
    // Don't set loading to true here anymore for better UX
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(statusFilter !== "ALL" && { status: statusFilter }),
      });

      const res = await axios.get(`${API_BASE}/leaves?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.data) {
        setLeaves(res.data.data);
        setTotalPages(res.data.pagination.totalPages);
        setTotal(res.data.pagination.total);
      } else {
        // Fallback for old API response format
        setLeaves(res.data.data || []);
      }
    } catch (err) {
      toast.error("Failed to fetch leave applications");
    } finally {
      setTableLoading(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [debouncedSearch, statusFilter, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusUpdate = async (
    id: number,
    status: "APPROVED" | "REJECTED"
  ) => {
    setLoading(true);
    try {
      await axios.patch(
        `${API_BASE}/leaves/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Leave ${status.toLowerCase()} successfully`);
      await fetchLeaves();
    } catch (err) {
      toast.error("Failed to update leave status");
      setLoading(false);
    }
  };

  if (loading) {
    return <SkeletonLeaves />;
  }

  return (
    <div className='p-2 sm:p-6'>
      <h1 className='text-2xl sm:text-3xl font-extrabold mb-6 text-blue-900'>
        Leave Applications
      </h1>

      {/* Search and Filter Bar */}
      <div className='mb-6 flex flex-col sm:flex-row gap-4'>
        <input
          type='text'
          placeholder='Search leaves by reason or student name...'
          className='border px-4 py-2 rounded flex-1 shadow-sm'
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setTableLoading(true);
          }}
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setTableLoading(true);
          }}
          className='border px-4 py-2 rounded shadow-sm'
        >
          <option value='ALL'>All Status</option>
          <option value='PENDING'>Pending</option>
          <option value='APPROVED'>Approved</option>
          <option value='REJECTED'>Rejected</option>
        </select>
      </div>

      <div className='overflow-x-auto bg-white rounded-xl shadow border p-2 sm:p-4'>
        <div className='mb-4 text-sm text-gray-600'>
          Showing {leaves.length} of {total} leave applications
        </div>
        {/* Table for desktop */}
        <table className='min-w-[700px] w-full border-separate border-spacing-y-2 text-center text-xs sm:text-sm hidden sm:table'>
          <thead className='bg-blue-50'>
            <tr>
              <th className='p-2 border-b text-center'>Student</th>
              <th className='p-2 border-b text-center'>Email</th>
              <th className='p-2 border-b text-center'>From</th>
              <th className='p-2 border-b text-center'>To</th>
              <th className='p-2 border-b text-center'>Reason</th>
              <th className='p-2 border-b text-center'>Status</th>
              <th className='p-2 border-b text-center'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(tableLoading ? [] : leaves).map((leave) => (
              <tr
                key={leave.id}
                className='hover:bg-blue-50 rounded-lg transition'
              >
                <td className='p-2 text-center'>
                  <span className='bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium shadow-sm'>
                    {leave.student.name}
                  </span>
                </td>
                <td className='p-2 text-center'>{leave.student.email}</td>
                <td className='p-2 text-center'>
                  {new Date(leave.fromDate).toDateString()}
                </td>
                <td className='p-2 text-center'>
                  {new Date(leave.toDate).toDateString()}
                </td>
                <td className='p-2 text-center'>{leave.reason}</td>
                <td className='p-2 text-center'>
                  <span
                    className={
                      leave.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold"
                        : leave.status === "APPROVED"
                        ? "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold"
                        : "bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold"
                    }
                  >
                    {leave.status}
                  </span>
                </td>
                <td className='p-2 space-x-2 text-center'>
                  {leave.status === "PENDING" ? (
                    <div className='flex justify-center space-x-2'>
                      <button
                        onClick={() => handleStatusUpdate(leave.id, "APPROVED")}
                        className='bg-gradient-to-r from-green-500 to-green-700 text-white px-2 py-1 rounded shadow hover:from-green-600 hover:to-green-800 text-sm transition'
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(leave.id, "REJECTED")}
                        className='bg-gradient-to-r from-red-500 to-red-700 text-white px-2 py-1 rounded shadow hover:from-red-600 hover:to-red-800 text-sm transition'
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className='text-gray-500 text-sm'>
                      {leave.status === "APPROVED"
                        ? "✓ Approved"
                        : "✗ Rejected"}
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {tableLoading && (
              <tr>
                <td colSpan={7} className='p-8 text-center'>
                  <div className='flex items-center justify-center space-x-2'>
                    <div className='w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
                    <span className='text-gray-600'>Loading...</span>
                  </div>
                </td>
              </tr>
            )}
            {!tableLoading && leaves.length === 0 && (
              <tr>
                <td className='p-4 text-center' colSpan={7}>
                  No leave applications found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {/* Card layout for mobile */}
        <div className='sm:hidden flex flex-col gap-4'>
          {(tableLoading ? [] : leaves).map((leave) => (
            <div
              key={leave.id}
              className='bg-blue-50 rounded-lg shadow p-3 text-xs'
            >
              <div className='flex justify-between mb-1'>
                <span className='font-bold'>{leave.student.name}</span>
                <span className='bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium shadow-sm'>
                  {leave.student.email}
                </span>
              </div>
              <div className='grid grid-cols-2 gap-x-2 gap-y-1'>
                <span className='font-semibold'>From:</span>
                <span>{new Date(leave.fromDate).toLocaleDateString()}</span>
                <span className='font-semibold'>To:</span>
                <span>{new Date(leave.toDate).toLocaleDateString()}</span>
                <span className='font-semibold'>Reason:</span>
                <span>{leave.reason}</span>
                <span className='font-semibold'>Status:</span>
                <span>
                  <span
                    className={
                      leave.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold"
                        : leave.status === "APPROVED"
                        ? "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold"
                        : "bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold"
                    }
                  >
                    {leave.status}
                  </span>
                </span>
              </div>
              {leave.status === "PENDING" ? (
                <div className='flex gap-2 mt-2'>
                  <button
                    onClick={() => handleStatusUpdate(leave.id, "APPROVED")}
                    className='bg-gradient-to-r from-green-500 to-green-700 text-white px-2 py-1 rounded shadow hover:from-green-600 hover:to-green-800 text-sm transition'
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(leave.id, "REJECTED")}
                    className='bg-gradient-to-r from-red-500 to-red-700 text-white px-2 py-1 rounded shadow hover:from-red-600 hover:to-red-800 text-sm transition'
                  >
                    Reject
                  </button>
                </div>
              ) : (
                <div className='mt-2'>
                  <span className='text-gray-500 text-sm'>
                    {leave.status === "APPROVED" ? "✓ Approved" : "✗ Rejected"}
                  </span>
                </div>
              )}
            </div>
          ))}
          {tableLoading && (
            <div className='p-8 text-center'>
              <div className='flex items-center justify-center space-x-2'>
                <div className='w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
                <span className='text-gray-600'>Loading...</span>
              </div>
            </div>
          )}
          {!tableLoading && leaves.length === 0 && (
            <div className='p-4 text-center text-gray-500'>
              No leave applications found.
            </div>
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      <div className='flex flex-col sm:flex-row justify-between items-center mt-6 gap-4'>
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className='px-4 py-2 border rounded disabled:opacity-50 bg-white shadow-sm w-full sm:w-auto'
        >
          Previous
        </button>
        <p className='font-semibold'>
          Page {page} of {totalPages}
        </p>
        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className='px-4 py-2 border rounded disabled:opacity-50 bg-white shadow-sm w-full sm:w-auto'
        >
          Next
        </button>
      </div>
    </div>
  );
}
