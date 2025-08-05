import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE } from "../../api/apiBase";
import SkeletonComplaints from "../../components/skeleton/admin/SkeletonComplaints";

interface Complaint {
  id: number;
  subject: string;
  description: string;
  status: "PENDING" | "RESOLVED" | "REJECTED";
  createdAt: string;
  student: {
    id: number;
    name: string;
    email: string;
  };
}

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
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

  const fetchComplaints = async () => {
    // Don't set loading to true here anymore for better UX
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(statusFilter !== "ALL" && { status: statusFilter }),
      });

      const res = await axios.get(`${API_BASE}/complaints?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.data) {
        setComplaints(res.data.data);
        setTotalPages(res.data.pagination.totalPages);
        setTotal(res.data.pagination.total);
      } else {
        // Fallback for old API response format
        setComplaints(res.data.data || []);
      }
    } catch (err) {
      toast.error("Failed to fetch complaints");
    } finally {
      setTableLoading(false);
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    id: number,
    newStatus: Complaint["status"]
  ) => {
    try {
      await axios.patch(
        `${API_BASE}/complaints/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Status updated");
      fetchComplaints();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [debouncedSearch, statusFilter, page]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <SkeletonComplaints />;

  return (
    <div className='p-2 sm:p-6'>
      <h1 className='text-2xl sm:text-3xl font-extrabold mb-6 text-blue-900'>
        Complaint Management
      </h1>

      {/* Search and Filter Bar */}
      <div className='mb-6 flex flex-col sm:flex-row gap-4'>
        <input
          type='text'
          placeholder='Search complaints by subject, description, or student...'
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
          <option value='RESOLVED'>Resolved</option>
          <option value='REJECTED'>Rejected</option>
        </select>
      </div>

      <div className='overflow-x-auto bg-white rounded-xl shadow border p-2 sm:p-4'>
        <div className='mb-4 text-sm text-gray-600'>
          Showing {complaints.length} of {total} complaints
        </div>
        {/* Table for desktop */}
        <table className='min-w-[700px] w-full text-center border-separate border-spacing-y-2 text-xs sm:text-sm hidden sm:table'>
          <thead className='bg-blue-50'>
            <tr>
              <th className='p-2 border-b text-center'>Subject</th>
              <th className='p-2 border-b text-center'>Description</th>
              <th className='p-2 border-b text-center'>Student</th>
              <th className='p-2 border-b text-center'>Status</th>
              <th className='p-2 border-b text-center'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(tableLoading ? [] : complaints).map((c) => (
              <tr key={c.id} className='hover:bg-blue-50 rounded-lg transition'>
                <td className='p-2 text-center'>{c.subject}</td>
                <td className='p-2 text-center'>{c.description}</td>
                <td className='p-2 text-center'>
                  <span className='bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium shadow-sm'>
                    {c.student.name}
                  </span>
                  <div className='text-xs text-gray-500 mt-1'>
                    {c.student.email}
                  </div>
                </td>
                <td className='p-2 text-center'>
                  <span
                    className={
                      c.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold"
                        : c.status === "RESOLVED"
                        ? "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold"
                        : "bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold"
                    }
                  >
                    {c.status}
                  </span>
                </td>
                <td className='p-2 space-x-2 text-center'>
                  <select
                    className='border p-1 rounded shadow-sm bg-white'
                    value={c.status}
                    onChange={(e) =>
                      handleStatusChange(
                        c.id,
                        e.target.value as Complaint["status"]
                      )
                    }
                  >
                    <option value='PENDING'>Pending</option>
                    <option value='RESOLVED'>Resolved</option>
                    <option value='REJECTED'>Rejected</option>
                  </select>
                </td>
              </tr>
            ))}
            {tableLoading && (
              <tr>
                <td colSpan={5} className='p-8 text-center'>
                  <div className='flex items-center justify-center space-x-2'>
                    <div className='w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
                    <span className='text-gray-600'>Loading...</span>
                  </div>
                </td>
              </tr>
            )}
            {!tableLoading && complaints.length === 0 && (
              <tr>
                <td className='p-4 text-center' colSpan={5}>
                  No complaints found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {/* Card layout for mobile */}
        <div className='sm:hidden flex flex-col gap-4'>
          {(tableLoading ? [] : complaints).map((c) => (
            <div
              key={c.id}
              className='bg-blue-50 rounded-lg shadow p-3 text-xs'
            >
              <div className='flex justify-between mb-1'>
                <span className='font-bold'>{c.subject}</span>
                <span className='bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium shadow-sm'>
                  {c.student.name}
                </span>
              </div>
              <div className='grid grid-cols-2 gap-x-2 gap-y-1'>
                <span className='font-semibold'>Student Email:</span>
                <span>{c.student.email}</span>
                <span className='font-semibold'>Description:</span>
                <span>{c.description}</span>
                <span className='font-semibold'>Status:</span>
                <span>
                  <span
                    className={
                      c.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold"
                        : c.status === "RESOLVED"
                        ? "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold"
                        : "bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold"
                    }
                  >
                    {c.status}
                  </span>
                </span>
              </div>
              <div className='flex gap-2 mt-2'>
                <select
                  className='border p-1 rounded shadow-sm bg-white'
                  value={c.status}
                  onChange={(e) =>
                    handleStatusChange(
                      c.id,
                      e.target.value as Complaint["status"]
                    )
                  }
                >
                  <option value='PENDING'>Pending</option>
                  <option value='RESOLVED'>Resolved</option>
                  <option value='REJECTED'>Rejected</option>
                </select>
              </div>
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
          {!tableLoading && complaints.length === 0 && (
            <div className='p-4 text-center text-gray-500'>
              No complaints found
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
