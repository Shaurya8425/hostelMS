import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../api/apiBase";
import bed from "../assets/bed-bold-svgrepo-com.svg";
import { useNavigate } from "react-router-dom";

interface Room {
  id: number;
  roomNumber: string;
  block: string;
  floor: number;
  designation?: string | null;
  capacity: number;
  status:
    | "AVAILABLE"
    | "OCCUPIED"
    | "RESERVED"
    | "BLOCKED"
    | "PARTIALLY_OCCUPIED";
  students: {
    id: number;
    name: string;
    rollNumber: string;
  }[];
}

const getDisplayStatus = (room: Room) => {
  if (room.status === "BLOCKED") return "BLOCKED";
  if (room.status === "RESERVED") return "RESERVED";
  if (room.students.length >= room.capacity) return "OCCUPIED";
  if (room.students.length > 0) return "PARTIALLY_OCCUPIED";
  return "VACANT";
};

const statusColor: Record<
  Room["status"] | "VACANT" | "PARTIALLY_OCCUPIED",
  string
> = {
  VACANT: "bg-blue-50 border-blue-500",
  OCCUPIED: "bg-red-100 border-red-500",
  PARTIALLY_OCCUPIED: "bg-yellow-100 border-yellow-500",
  RESERVED: "bg-blue-100 border-blue-500",
  BLOCKED: "bg-gray-200 border-gray-400 text-gray-400",
  AVAILABLE: "bg-blue-50 border-blue-500", // Keep for backward compatibility
};

export default function RoomDiagram() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get(`${API_BASE}/rooms?limit=1000`);
        // Handle paginated response - extract the data array
        const roomsData = res.data.data || res.data;
        setRooms(Array.isArray(roomsData) ? roomsData : []);
      } catch (error) {
        console.error("Error fetching rooms:", error);
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  // Group rooms by block (wing) and sort wings alphabetically
  const wings = Array.from(new Set(rooms.map((r) => r.block))).sort();

  return (
    <div className='my-8'>
      {wings.map((wing) => (
        <div key={wing} className='mb-12'>
          <h2 className='text-2xl font-bold mb-2'>{wing}</h2>
          <h3 className='text-xl font-bold mb-4'>Hostel Room Map</h3>
          {loading ? (
            <div className='text-center py-8'>Loading...</div>
          ) : (
            Array.from(
              rooms
                .filter((r) => r.block === wing)
                .reduce((acc, room) => acc.add(room.floor), new Set<number>())
            )
              .sort()
              .map((floor) => (
                <div key={floor} className='mb-8'>
                  <h4 className='font-semibold mb-2'>
                    {floor === 0 ? "Ground Floor" : `Floor ${floor}`}
                  </h4>
                  <div className='grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 w-full overflow-x-auto'>
                    {rooms
                      .filter((r) => r.block === wing && r.floor === floor)
                      .sort(
                        (a, b) => Number(a.roomNumber) - Number(b.roomNumber)
                      )
                      .map((room) => (
                        <div
                          key={room.id}
                          onClick={() => navigate(`/admin/rooms/${room.id}`)}
                          className={`border rounded p-2 text-center text-xs min-w-[90px] ${
                            statusColor[getDisplayStatus(room)]
                          } cursor-pointer hover:shadow-md transition-shadow`}
                          title={
                            room.designation
                              ? `${room.roomNumber} (${room.designation})`
                              : room.roomNumber
                          }
                        >
                          <div className='font-bold text-base'>
                            {room.roomNumber}
                          </div>
                          {room.designation && (
                            <div className='italic text-xs mb-1'>
                              {room.designation}
                            </div>
                          )}
                          <div className='mb-1'>
                            <span className='font-semibold'>
                              {room.students.length >= room.capacity
                                ? "OCCUPIED"
                                : room.students.length > 0
                                ? "PARTIALLY OCCUPIED"
                                : room.status === "AVAILABLE"
                                ? "VACANT"
                                : room.status}
                            </span>
                          </div>
                          <div className='flex flex-wrap gap-1 justify-center'>
                            {[...Array(room.capacity)].map((_, index) => {
                              const isOccupied = index < room.students.length;
                              const student = room.students[index];
                              return (
                                <div
                                  key={index}
                                  className={`relative border p-1 rounded ${
                                    isOccupied ? "bg-red-200" : "bg-green-200"
                                  }`}
                                  title={
                                    student
                                      ? `${student.name} (${student.rollNumber})`
                                      : "Vacant"
                                  }
                                >
                                  <span className='text-[10px]'>
                                    <img className='w-4' src={bed} alt='' />
                                  </span>
                                  <span className='absolute -top-1 -right-1 text-[8px] font-bold'>
                                    B{index + 1}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))
          )}
        </div>
      ))}
    </div>
  );
}
