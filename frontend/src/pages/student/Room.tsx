import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

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
  const token = localStorage.getItem("token") || "";

  // Fetch studentId from /auth/me or localStorage
  useEffect(() => {
    let id = Number(localStorage.getItem("studentId"));
    if (id && id > 0) {
      setStudentId(id);
    } else if (token) {
      axios
        .get("http://localhost:3000/auth/me", {
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
    try {
      const res = await axios.get("http://localhost:3000/rooms");
      const allRooms = res.data as Room[];
      const id = sid || studentId;
      const roomWithStudent = allRooms.find((room) =>
        room.students.some((s) => s.id === id)
      );
      setRooms(allRooms);
      setCurrentRoom(roomWithStudent || null);
    } catch (err) {
      toast.error("Failed to load rooms");
    }
  };

  const handleAssign = async (roomId: number) => {
    try {
      if (!studentId) throw new Error("Student ID not found");
      await axios.put(
        "http://localhost:3000/rooms/assign",
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

  return (
    <div className='p-6 max-w-5xl mx-auto'>
      <h2 className='text-2xl font-bold mb-4'>Room Information</h2>

      {/* Current Room */}
      {currentRoom ? (
        <div className='bg-blue-100 p-4 rounded mb-6'>
          <h3 className='text-lg font-semibold'>Your Room</h3>
          <p>
            <strong>Room:</strong> {currentRoom.roomNumber} -{" "}
            {currentRoom.block}
          </p>
          <p>
            <strong>Roommates:</strong>{" "}
            {currentRoom.students
              .filter((s) => s.id !== studentId)
              .map((s) => `${s.name} (${s.rollNumber})`)
              .join(", ") || "No roommates yet"}
          </p>
        </div>
      ) : (
        <div className='bg-yellow-100 p-4 rounded mb-6'>
          <p>You haven't been assigned a room yet.</p>
        </div>
      )}

      {/* Available Rooms */}
      <h3 className='text-lg font-semibold mb-2'>Available Rooms</h3>
      <div className='grid md:grid-cols-2 gap-4'>
        {rooms
          .filter((room) => room.students.length < room.capacity)
          .map((room) => (
            <div
              key={room.id}
              className='border p-4 rounded shadow flex justify-between items-center'
            >
              <div>
                <p>
                  <strong>{room.roomNumber}</strong> - Block {room.block}
                </p>
                <p>
                  Capacity: {room.students.length}/{room.capacity}
                </p>
              </div>
              {!currentRoom && (
                <button
                  onClick={() => handleAssign(room.id)}
                  className='bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600'
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
