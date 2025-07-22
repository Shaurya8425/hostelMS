import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE } from "../../api/apiBase";

interface Student {
  id: number;
  name: string;
  rollNumber: string;
  email: string;
}

interface AssignForm {
  studentEmail: string;
  roomId: string;
}

interface Room {
  id: number;
  roomNumber: string;
  block: string;
  floor: number;
  designation?: string | null;
  capacity: number;
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "BLOCKED";
  students: {
    id: number;
    name: string;
    rollNumber: string;
  }[];
}

import SkeletonRooms from "../../components/skeleton/admin/SkeletonRooms";

export default function AdminRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [form, setForm] = useState({
    roomNumber: "",
    block: "",
    floor: 0,
    designation: "",
    capacity: 1,
    status: "AVAILABLE" as Room["status"],
  });
  const [assignForm, setAssignForm] = useState<AssignForm>({
    studentEmail: "",
    roomId: "",
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(res.data);
    } catch (err) {
      toast.error("Failed to fetch rooms");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${API_BASE}/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(res.data.data)) {
        setStudents(res.data.data);
      } else {
        setStudents([]);
      }
    } catch (err) {
      setStudents([]);
      toast.error("Failed to fetch students");
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchStudents();
  }, []);

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
    setLoading(true);
    try {
      await axios.put(
        `${API_BASE}/rooms/assign`,
        {
          studentEmail: assignForm.studentEmail,
          roomId: Number(assignForm.roomId),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Student assigned to room");
      setAssignForm({ studentEmail: "", roomId: "" });
      fetchRooms();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.error || "Failed to assign student to room"
      );
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
          <input
            type='text'
            name='roomNumber'
            placeholder='Room Number'
            value={form.roomNumber}
            onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
            className='w-full p-2 border rounded'
            required
          />
          <input
            type='text'
            name='block'
            placeholder='Block'
            value={form.block}
            onChange={(e) => setForm({ ...form, block: e.target.value })}
            className='w-full p-2 border rounded'
            required
          />
          <input
            type='number'
            name='floor'
            placeholder='Floor (0=Ground, 1=First)'
            value={form.floor}
            onChange={(e) =>
              setForm({ ...form, floor: Number(e.target.value) })
            }
            className='w-full p-2 border rounded'
            required
          />
          <input
            type='text'
            name='designation'
            placeholder='Designation (optional)'
            value={form.designation}
            onChange={(e) => setForm({ ...form, designation: e.target.value })}
            className='w-full p-2 border rounded'
          />
          <input
            type='number'
            name='capacity'
            placeholder='Capacity'
            value={form.capacity}
            onChange={(e) =>
              setForm({ ...form, capacity: Number(e.target.value) })
            }
            className='w-full p-2 border rounded'
            required
          />
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
          <select
            name='studentEmail'
            value={assignForm.studentEmail}
            onChange={(e) =>
              setAssignForm({ ...assignForm, studentEmail: e.target.value })
            }
            className='w-full p-2 border rounded'
            required
          >
            <option value=''>Select Student</option>
            {Array.isArray(students) &&
              students.map((s) => (
                <option key={s.id} value={s.email}>
                  {s.name} ({s.rollNumber})
                </option>
              ))}
          </select>
          <select
            name='roomId'
            value={assignForm.roomId}
            onChange={(e) =>
              setAssignForm({ ...assignForm, roomId: e.target.value })
            }
            className='w-full p-2 border rounded'
            required
          >
            <option value=''>Select Room</option>
            {rooms
              .filter((r) => r.status !== "BLOCKED" && r.status !== "RESERVED")
              .map((r) => (
                <option key={r.id} value={r.id}>
                  {r.roomNumber} ({r.block}) - {r.students.length}/{r.capacity}
                </option>
              ))}
          </select>
          <button
            type='submit'
            className='bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2 rounded shadow hover:from-blue-600 hover:to-blue-800 transition'
          >
            Assign
          </button>
        </form>
      </div>

      {/* Room List */}
      <div className='overflow-x-auto bg-white rounded-xl shadow border p-2 sm:p-4 mt-4'>
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
    </div>
  );
}
