import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

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

export default function AdminRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [form, setForm] = useState({
    roomNumber: "",
    block: "",
    floor: 0,
    designation: "",
    capacity: 1,
    status: "AVAILABLE",
  });
  const [assignForm, setAssignForm] = useState({ studentId: "", roomId: "" });
  const [students, setStudents] = useState<
    {
      id: number;
      name: string;
      rollNumber: string;
    }[]
  >([]);
  const token = localStorage.getItem("token");

  const fetchRooms = async () => {
    try {
      const res = await axios.get("http://localhost:3000/rooms", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(res.data);
    } catch (err) {
      toast.error("Failed to fetch rooms");
    }
  };

  // Fetch students for assignment
  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:3000/students", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Use the correct array from the paginated response
      if (Array.isArray(res.data.data)) {
        setStudents(res.data.data);
      } else {
        setStudents([]);
      }
    } catch (err) {
      setStudents([]); // fallback to empty array on error
      toast.error("Failed to fetch students");
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchStudents();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        capacity: Number(form.capacity),
        floor: Number(form.floor),
        designation: form.designation || null,
      };
      await axios.post("http://localhost:3000/rooms", payload, {
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
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(
        "http://localhost:3000/rooms/assign",
        {
          studentId: Number(assignForm.studentId),
          roomId: Number(assignForm.roomId),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Student assigned to room");
      setAssignForm({ studentId: "", roomId: "" });
      fetchRooms();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.error || "Failed to assign student to room"
      );
    }
  };

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
            name='studentId'
            value={assignForm.studentId}
            onChange={(e) =>
              setAssignForm({ ...assignForm, studentId: e.target.value })
            }
            className='w-full p-2 border rounded'
            required
          >
            <option value=''>Select Student</option>
            {Array.isArray(students) &&
              students.map((s) => (
                <option key={s.id} value={s.id}>
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
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.roomNumber} ({r.block})
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
        <table className='min-w-[700px] w-full text-left border-separate border-spacing-y-2 text-xs sm:text-sm'>
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
      </div>
    </div>
  );
}
