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
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-4'>Room Management</h1>

      {/* Create Room */}
      <form
        onSubmit={handleCreate}
        className='space-y-2 bg-gray-50 p-4 rounded border mb-6 max-w-md'
      >
        <h2 className='font-semibold text-lg'>Create Room</h2>
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
          onChange={(e) => setForm({ ...form, floor: Number(e.target.value) })}
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
          className='bg-green-600 text-white px-4 py-2 rounded'
        >
          Create Room
        </button>
      </form>

      {/* Assign Student to Room */}
      <form
        onSubmit={handleAssign}
        className='space-y-2 bg-gray-50 p-4 rounded border mb-6 max-w-md'
      >
        <h2 className='font-semibold text-lg'>Assign Student to Room</h2>
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
          className='bg-blue-600 text-white px-4 py-2 rounded'
        >
          Assign
        </button>
      </form>

      {/* Room List */}
      <div className='overflow-x-auto'>
        <table className='w-full text-left border'>
          <thead className='bg-gray-100'>
            <tr>
              <th className='p-2 border'>Room Number</th>
              <th className='p-2 border'>Block</th>
              <th className='p-2 border'>Floor</th>
              <th className='p-2 border'>Designation</th>
              <th className='p-2 border'>Capacity</th>
              <th className='p-2 border'>Status</th>
              <th className='p-2 border'>Occupied</th>
              <th className='p-2 border'>Students</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id}>
                <td className='p-2 border'>{room.roomNumber}</td>
                <td className='p-2 border'>{room.block}</td>
                <td className='p-2 border'>{room.floor}</td>
                <td className='p-2 border'>{room.designation || "-"}</td>
                <td className='p-2 border'>{room.capacity}</td>
                <td className='p-2 border'>{room.status}</td>
                <td className='p-2 border'>{room.students.length}</td>
                <td className='p-2 border'>
                  {room.students.length > 0 ? (
                    <ul className='list-disc list-inside'>
                      {room.students.map((s) => (
                        <li key={s.id}>
                          {s.name} ({s.rollNumber})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    "Vacant"
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
