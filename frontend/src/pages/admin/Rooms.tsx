import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE } from "../../api/apiBase";

interface Student {
  id: number;
  name: string;
  rollNumber?: string;
  email: string;
  room?: {
    id: number;
    roomNumber: string;
    block: string;
  } | null;
}

interface Room {
  id: number;
  roomNumber: string;
  block: string;
  floor: number;
  designation?: string | null;
  capacity: number;
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "BLOCKED";
  _count?: {
    students: number;
  };
  students: {
    id: number;
    name: string;
    email: string;
    rollNumber?: string;
  }[];
}

interface AssignForm {
  studentId: number | null;
  roomId: number | null;
}

import SkeletonRooms from "../../components/skeleton/admin/SkeletonRooms";

export default function AdminRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState({
    roomNumber: "",
    block: "",
    floor: 0,
    designation: "",
    capacity: 1,
    status: "AVAILABLE" as Room["status"],
  });
  const [assignForm, setAssignForm] = useState<AssignForm>({
    studentId: null,
    roomId: null,
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(debouncedSearch && { search: debouncedSearch }),
      });

      const res = await axios.get(`${API_BASE}/rooms?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.data) {
        setRooms(res.data.data);
        setTotalPages(res.data.pagination.totalPages);
        setTotal(res.data.pagination.total);
      } else {
        // Fallback for old API response format
        setRooms(res.data);
      }
    } catch (err) {
      toast.error("Failed to fetch rooms");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      // Request all students with their room information
      const res = await axios.get<{ data: Student[]; totalItems: number }>(
        `${API_BASE}/students?limit=1000`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data && Array.isArray(res.data.data)) {
        setStudents(res.data.data);
      } else if (Array.isArray(res.data)) {
        setStudents(res.data);
      } else {
        console.error("Unexpected students response format:", res.data);
        toast.error("Error loading student data");
        setStudents([]);
      }
    } catch (err) {
      console.error("Error fetching students:", err);
      toast.error("Failed to fetch students");
      setStudents([]);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchStudents();
  }, [debouncedSearch, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        capacity: Number(form.capacity),
        floor: Number(form.floor),
        designation: form.designation || null,
      };
      await axios.post(`${API_BASE}/rooms`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Room created");
      setForm({
        roomNumber: "",
        block: "",
        floor: 0,
        designation: "",
        capacity: 1,
        status: "AVAILABLE",
      });
      fetchRooms();
    } catch (err) {
      toast.error("Failed to create room");
      setLoading(false);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!assignForm.studentId || !assignForm.roomId) {
        toast.error("Please select both a student and a room");
        return;
      }

      // Debug logs
      console.log("Assignment Form Values:", {
        studentId: assignForm.studentId,
        roomId: assignForm.roomId,
        studentIdType: typeof assignForm.studentId,
        roomIdType: typeof assignForm.roomId,
      });

      setLoading(true);
      const payload = {
        studentId: Number(assignForm.studentId),
        roomId: Number(assignForm.roomId),
      };

      console.log("Sending payload:", payload);

      const response = await axios.put(`${API_BASE}/rooms/assign`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(response.data.message || "Student assigned to room");
      setAssignForm({ studentId: null, roomId: null });

      // Refresh data
      await Promise.all([fetchRooms(), fetchStudents()]);
    } catch (err: any) {
      console.error("Assignment error:", err);

      // Detailed error logging
      if (err.response) {
        // Server responded with a non-2xx status
        console.error("Error response data:", err.response.data);
        console.error("Error response status:", err.response.status);
        toast.error(
          err.response.data.error ||
            `Server error: ${err.response.status} - ${err.response.statusText}` ||
            "Failed to assign student to room"
        );
      } else if (err.request) {
        // Request made but no response received
        console.error("No response received:", err.request);
        toast.error("No response from server. Check your connection.");
      } else {
        // Something else happened while setting up the request
        console.error("Error message:", err.message);
        toast.error(err.message || "Failed to assign student to room");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <SkeletonRooms />;

  return (
    <div className='p-2 sm:p-6'>
      <h1 className='text-2xl sm:text-3xl font-extrabold mb-6 text-blue-700'>
        Room Management
      </h1>

      <div className='flex flex-col lg:flex-row gap-4 justify-center items-stretch'>
        {/* Create Room */}
        <form
          onSubmit={handleCreate}
          className='space-y-2 bg-white p-4 sm:p-6 rounded-xl border shadow mb-4 max-w-md w-full'
        >
          <h2 className='font-semibold text-lg mb-2 text-blue-700'>
            Create Room
          </h2>
          <div className='space-y-1'>
            <label
              htmlFor='roomNumber'
              className='block text-sm font-medium text-gray-700'
            >
              Room Number *
            </label>
            <input
              id='roomNumber'
              type='text'
              name='roomNumber'
              value={form.roomNumber}
              onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
              className='w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              required
            />
          </div>

          <div className='space-y-1'>
            <label
              htmlFor='block'
              className='block text-sm font-medium text-gray-700'
            >
              Block *
            </label>
            <input
              id='block'
              type='text'
              name='block'
              value={form.block}
              onChange={(e) => setForm({ ...form, block: e.target.value })}
              className='w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              required
            />
          </div>

          <div className='space-y-1'>
            <label
              htmlFor='floor'
              className='block text-sm font-medium text-gray-700'
            >
              Floor Number *
            </label>
            <input
              id='floor'
              type='number'
              name='floor'
              value={form.floor}
              min='0'
              max='10'
              title='0 for Ground Floor, 1 for First Floor, etc.'
              onChange={(e) =>
                setForm({ ...form, floor: Number(e.target.value) })
              }
              className='w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              required
            />
            <p className='text-xs text-gray-500 mt-1'>
              0 = Ground Floor, 1 = First Floor, etc.
            </p>
          </div>

          <div className='space-y-1'>
            <label
              htmlFor='designation'
              className='block text-sm font-medium text-gray-700'
            >
              Designation
            </label>
            <input
              id='designation'
              type='text'
              name='designation'
              value={form.designation}
              onChange={(e) =>
                setForm({ ...form, designation: e.target.value })
              }
              className='w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              placeholder='e.g., Study Room, Storage (Optional)'
            />
          </div>

          <div className='space-y-1'>
            <label
              htmlFor='capacity'
              className='block text-sm font-medium text-gray-700'
            >
              Room Capacity *
            </label>
            <input
              id='capacity'
              type='number'
              name='capacity'
              value={form.capacity}
              min='1'
              max='10'
              onChange={(e) =>
                setForm({ ...form, capacity: Number(e.target.value) })
              }
              className='w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              required
            />
          </div>
          <select
            name='status'
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value as Room["status"] })
            }
            className='w-full p-2 border rounded'
          >
            <option value='AVAILABLE'>Available</option>
            <option value='OCCUPIED'>Occupied</option>
            <option value='RESERVED'>Reserved</option>
            <option value='BLOCKED'>Blocked</option>
          </select>
          <button
            type='submit'
            className='bg-gradient-to-r from-green-500 to-green-700 text-white px-4 py-2 rounded shadow hover:from-green-600 hover:to-green-800 transition'
          >
            Create Room
          </button>
        </form>

        {/* Assign Student to Room */}
        <form
          onSubmit={handleAssign}
          className='space-y-2 bg-white p-4 sm:p-6 rounded-xl border shadow mb-4 max-w-md w-full'
        >
          <h2 className='font-semibold text-lg mb-2 text-blue-700'>
            Assign Student to Room
          </h2>
          <div className='space-y-1'>
            <label
              htmlFor='studentId'
              className='block text-sm font-medium text-gray-700'
            >
              Select Student
            </label>
            <select
              id='studentId'
              name='studentId'
              value={assignForm.studentId?.toString() ?? ""}
              onChange={(e) => {
                const newValue = e.target.value
                  ? parseInt(e.target.value, 10)
                  : null;
                console.log("Student selection changed:", {
                  value: e.target.value,
                  parsed: newValue,
                  isNaN: isNaN(newValue as number),
                });
                setAssignForm({
                  ...assignForm,
                  studentId: newValue,
                });
              }}
              className='w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              required
            >
              <option value=''>Choose a student...</option>
              {Array.isArray(students) &&
                students
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({student.rollNumber || student.email})
                      {student.room
                        ? ` - Current: Room ${student.room.roomNumber} (${student.room.block})`
                        : " - Unassigned"}
                    </option>
                  ))}
            </select>
          </div>
          <div className='space-y-1'>
            <label
              htmlFor='roomId'
              className='block text-sm font-medium text-gray-700'
            >
              Select Room
            </label>
            <select
              id='roomId'
              name='roomId'
              value={assignForm.roomId?.toString() ?? ""}
              onChange={(e) => {
                const newValue = e.target.value
                  ? parseInt(e.target.value, 10)
                  : null;
                console.log("Room selection changed:", {
                  value: e.target.value,
                  parsed: newValue,
                  isNaN: isNaN(newValue as number),
                });
                setAssignForm({
                  ...assignForm,
                  roomId: newValue,
                });
              }}
              className='w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              required
            >
              <option value=''>Choose a room...</option>
              {rooms
                .filter(
                  (room) =>
                    room.status !== "BLOCKED" &&
                    room.status !== "RESERVED" &&
                    room.students.length < room.capacity &&
                    (room.status === "AVAILABLE" || room.status === "OCCUPIED")
                )
                .sort((a, b) => {
                  const blockCompare = a.block.localeCompare(b.block);
                  if (blockCompare !== 0) return blockCompare;
                  return a.roomNumber.localeCompare(b.roomNumber, undefined, {
                    numeric: true,
                  });
                })
                .map((room) => (
                  <option key={room.id} value={room.id}>
                    Room {room.roomNumber} ({room.block}) -{" "}
                    {room.students.length}/{room.capacity} occupied
                  </option>
                ))}
            </select>
          </div>
          <button
            type='submit'
            className='bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2 rounded shadow hover:from-blue-600 hover:to-blue-800 transition'
          >
            Assign
          </button>
        </form>
      </div>

      {/* Search Bar */}
      <div className='mt-6 mb-4'>
        <input
          type='text'
          placeholder='Search rooms by number, block, or designation...'
          className='border px-4 py-2 rounded w-full sm:w-1/2 md:w-1/3 shadow-sm'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Room List */}
      <div className='overflow-x-auto bg-white rounded-xl shadow border p-2 sm:p-4'>
        <div className='mb-4 text-sm text-gray-600'>
          Showing {rooms.length} of {total} rooms
        </div>
        {/* Table for desktop */}
        <table className='min-w-[700px] w-full text-left border-separate border-spacing-y-2 text-xs sm:text-sm hidden sm:table'>
          <thead className='bg-blue-50'>
            <tr>
              <th className='p-2 border-b'>Room Number</th>
              <th className='p-2 border-b'>Block</th>
              <th className='p-2 border-b'>Floor</th>
              <th className='p-2 border-b'>Designation</th>
              <th className='p-2 border-b'>Capacity</th>
              <th className='p-2 border-b'>Status</th>
              <th className='p-2 border-b'>Occupied</th>
              <th className='p-2 border-b'>Students</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr
                key={room.id}
                className='hover:bg-blue-50 rounded-lg transition'
              >
                <td className='p-2'>{room.roomNumber}</td>
                <td className='p-2'>{room.block}</td>
                <td className='p-2'>{room.floor}</td>
                <td className='p-2'>{room.designation || "-"}</td>
                <td className='p-2'>{room.capacity}</td>
                <td className='p-2'>
                  <span
                    className={
                      room.status === "AVAILABLE"
                        ? "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold"
                        : room.status === "OCCUPIED"
                        ? "bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold"
                        : room.status === "RESERVED"
                        ? "bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold"
                        : "bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold"
                    }
                  >
                    {room.status}
                  </span>
                </td>
                <td className='p-2'>{room.students.length}</td>
                <td className='p-2'>
                  {room.students.length > 0 ? (
                    <div className='flex flex-wrap gap-2'>
                      {room.students.map((s) => (
                        <span
                          key={s.id}
                          className='bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium shadow-sm'
                        >
                          {s.name} ({s.rollNumber})
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className='text-gray-400 italic'>Vacant</span>
                  )}
                </td>
              </tr>
            ))}
            {rooms.length === 0 && (
              <tr>
                <td className='p-4 text-center' colSpan={8}>
                  No rooms found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {/* Card layout for mobile */}
        <div className='sm:hidden flex flex-col gap-4'>
          {rooms.map((room) => (
            <div
              key={room.id}
              className='bg-blue-50 rounded-lg shadow p-3 text-xs'
            >
              <div className='flex justify-between mb-1'>
                <span className='font-bold'>Room {room.roomNumber}</span>
                <span className='bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium shadow-sm'>
                  {room.block}
                </span>
              </div>
              <div className='grid grid-cols-2 gap-x-2 gap-y-1'>
                <span className='font-semibold'>Floor:</span>
                <span>{room.floor}</span>
                <span className='font-semibold'>Designation:</span>
                <span>{room.designation || "-"}</span>
                <span className='font-semibold'>Capacity:</span>
                <span>{room.capacity}</span>
                <span className='font-semibold'>Status:</span>
                <span>{room.status}</span>
                <span className='font-semibold'>Occupied:</span>
                <span>{room.students.length}</span>
                <span className='font-semibold'>Students:</span>
                <span>
                  {room.students.length > 0
                    ? room.students
                        .map((s) => `${s.name} (${s.rollNumber})`)
                        .join(", ")
                    : "-"}
                </span>
              </div>
            </div>
          ))}
          {rooms.length === 0 && (
            <div className='p-4 text-center'>No rooms found</div>
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
