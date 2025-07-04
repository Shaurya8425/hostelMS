import { useEffect, useState } from "react";
import axios from "axios";

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

const statusColor: Record<Room["status"], string> = {
  AVAILABLE: "bg-green-100 border-green-500",
  OCCUPIED: "bg-yellow-100 border-yellow-500",
  RESERVED: "bg-blue-100 border-blue-500",
  BLOCKED: "bg-gray-200 border-gray-400 text-gray-400",
};

export default function RoomDiagram() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get("http://localhost:3000/rooms");
        setRooms(res.data);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  // Group rooms by block (wing)
  const wings = Array.from(new Set(rooms.map((r) => r.block)));

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
                  <div className='grid grid-cols-8 gap-2'>
                    {rooms
                      .filter((r) => r.block === wing && r.floor === floor)
                      .sort(
                        (a, b) => Number(a.roomNumber) - Number(b.roomNumber)
                      )
                      .map((room) => (
                        <div
                          key={room.id}
                          className={`border rounded p-2 text-center text-xs ${
                            statusColor[room.status]
                          }`}
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
                            <span className='font-semibold'>{room.status}</span>
                          </div>
                          <div>
                            {room.students.length > 0 ? (
                              <ul className='text-[10px]'>
                                {room.students.map((s) => (
                                  <li key={s.id}>
                                    {s.name} ({s.rollNumber})
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className='text-gray-400'>Vacant</span>
                            )}
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
