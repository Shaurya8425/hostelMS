import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import SkeletonRoom from "../../components/SkeletonRoom";
import { API_BASE } from "../../api/apiBase";

type Room = {
  id: number;
  roomNumber: string;
  block: string;
  capacity: number;
  students: {
    id: number;
    name: string;
    rollNumber: string;
  }[];
};

export default function StudentRoom() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token") || "";

  // Fetch studentId from /auth/me or localStorage
  useEffect(() => {
    let id = Number(localStorage.getItem("studentId"));
    if (id && id > 0) {
      setStudentId(id);
    } else if (token) {
      axios
        .get(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const user = res.data.user;
          if (user && user.studentId) {
            setStudentId(user.studentId);
            localStorage.setItem("studentId", user.studentId.toString());
          }
        });
    }
  }, [token]);

  const fetchRooms = async (sid?: number) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/rooms`);
      const allRooms = res.data as Room[];
      const id = sid || studentId;
      const roomWithStudent = allRooms.find((room) =>
        room.students.some((s) => s.id === id)
      );
      setRooms(allRooms);
      setCurrentRoom(roomWithStudent || null);
    } catch (err) {
      toast.error("Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (roomId: number) => {
    try {
      if (!studentId) throw new Error("Student ID not found");
      await axios.put(
        `${API_BASE}/rooms/assign`,
        { studentId, roomId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Room assigned successfully");
      fetchRooms(studentId); // Refresh room data
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to assign room");
    }
  };

  useEffect(() => {
    if (studentId) fetchRooms(studentId);
  }, [studentId]);

  if (loading) return <SkeletonRoom />;

  return (
    <div className='p-6 max-w-5xl mx-auto'>
      <h2 className='text-3xl font-extrabold mb-8 text-blue-900 flex items-center gap-2'>
        <span role='img' aria-label='room'>
          🛏️
        </span>{" "}
        Room Information
      </h2>

      {/* Current Room */}
      {currentRoom ? (
        <div className='bg-gradient-to-r from-blue-100 to-blue-200 p-6 rounded-xl mb-8 shadow border'>
          <h3 className='text-xl font-bold mb-2 text-blue-800'>Your Room</h3>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2'>
            <div>
              <span className='font-semibold'>Room:</span>{" "}
              {currentRoom.roomNumber} - {currentRoom.block}
            </div>
            <div>
              <span className='font-semibold'>Capacity:</span>{" "}
              {currentRoom.students.length}/{currentRoom.capacity}
            </div>
            <div className='sm:col-span-2'>
              <span className='font-semibold'>Roommates:</span>{" "}
              {currentRoom.students
                .filter((s) => s.id !== studentId)
                .map((s) => `${s.name} (${s.rollNumber})`)
                .join(", ") || (
                <span className='text-gray-500 italic'>No roommates yet</span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className='bg-gradient-to-r from-yellow-100 to-yellow-200 p-6 rounded-xl mb-8 shadow border'>
          <p className='text-yellow-800 font-semibold'>
            You haven't been assigned a room yet.
          </p>
        </div>
      )}

      {/* Available Rooms */}
      <h3 className='text-xl font-bold mb-4 text-blue-800'>Available Rooms</h3>
      {/* Grid for md+ screens */}
      <div className='hidden md:grid md:grid-cols-2 gap-6'>
        {rooms
          .filter((room) => room.students.length < room.capacity)
          .map((room) => (
            <div
              key={room.id}
              className='bg-white border p-6 rounded-xl shadow flex justify-between items-center hover:shadow-lg transition'
            >
              <div>
                <p className='font-bold text-lg text-blue-700'>
                  {room.roomNumber}{" "}
                  <span className='text-xs text-gray-500'>
                    - Block {room.block}
                  </span>
                </p>
                <p className='text-sm text-gray-700 mb-1'>
                  Capacity:{" "}
                  <span className='font-semibold'>{room.students.length}</span>{" "}
                  / {room.capacity}
                </p>
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
              </div>
              {!currentRoom && (
                <button
                  onClick={() => handleAssign(room.id)}
                  className='bg-gradient-to-r from-green-500 to-green-700 text-white px-4 py-2 rounded-full shadow hover:from-green-600 hover:to-green-800 font-semibold transition'
                >
                  Choose
                </button>
              )}
            </div>
          ))}
      </div>
      {/* Card layout for mobile */}
      <div className='md:hidden flex flex-col gap-4'>
        {rooms
          .filter((room) => room.students.length < room.capacity)
          .map((room) => (
            <div
              key={room.id}
              className='bg-white border p-4 rounded-xl shadow flex flex-col gap-2 hover:shadow-lg transition'
            >
              <div className='flex justify-between'>
                <span className='font-bold text-base text-blue-700'>
                  {room.roomNumber}
                </span>
                <span className='text-xs text-gray-500'>
                  Block {room.block}
                </span>
              </div>
              <div className='text-xs text-gray-700'>
                Capacity:{" "}
                <span className='font-semibold'>{room.students.length}</span> /{" "}
                {room.capacity}
              </div>
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
              {!currentRoom && (
                <button
                  onClick={() => handleAssign(room.id)}
                  className='bg-gradient-to-r from-green-500 to-green-700 text-white px-4 py-2 rounded-full shadow hover:from-green-600 hover:to-green-800 font-semibold transition mt-2'
                >
                  Choose
                </button>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
