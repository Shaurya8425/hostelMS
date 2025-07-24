import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../../api/apiBase";
import RoomDetailsSkeleton from "../../components/skeleton/RoomDetailsSkeleton";

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
    email: string;
  }[];
}

export default function RoomDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedRoom, setEditedRoom] = useState<Partial<Room>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await axios.get(`${API_BASE}/rooms/${id}`);
        if (!res.data) {
          throw new Error("Room not found");
        }
        setRoom(res.data);
        setEditedRoom(res.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.data?.error) {
          setError(err.response.data.error);
        } else {
          setError(
            err instanceof Error ? err.message : "Failed to fetch room details"
          );
        }
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id]);

  const handleSave = async () => {
    try {
      const res = await axios.put(`${API_BASE}/rooms/${id}`, editedRoom);
      setRoom(res.data);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Failed to update room");
      }
    }
  };

  if (loading) return <RoomDetailsSkeleton />;
  if (error)
    return (
      <div className='p-4 max-w-2xl mx-auto'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
          <div className='flex items-center'>
            <svg
              className='w-5 h-5 text-red-500 mr-2'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                clipRule='evenodd'
              />
            </svg>
            <h3 className='text-sm font-medium text-red-800'>{error}</h3>
          </div>
        </div>
      </div>
    );
  if (!room)
    return (
      <div className='p-4 max-w-2xl mx-auto'>
        <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
          <div className='flex items-center'>
            <svg
              className='w-5 h-5 text-yellow-500 mr-2'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                clipRule='evenodd'
              />
            </svg>
            <h3 className='text-sm font-medium text-yellow-800'>
              Room not found
            </h3>
          </div>
        </div>
      </div>
    );

  return (
    <div className='p-4 max-w-2xl mx-auto'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>Room Details</h1>
        <button
          onClick={() => navigate(-1)}
          className='px-4 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200'
        >
          Back
        </button>
      </div>

      <div className='bg-white shadow-lg rounded-lg overflow-hidden border border-gray-100'>
        <div className='border-b border-gray-100 bg-gray-50 px-6 py-4'>
          <div className='flex justify-between items-center'>
            <h2 className='text-lg font-medium text-gray-800'>
              Room Information
            </h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className='inline-flex items-center px-3 py-1.5 border border-blue-500 text-blue-500 hover:bg-blue-50 rounded-md text-sm font-medium transition-colors'
              >
                <svg
                  className='w-4 h-4 mr-1.5'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                  />
                </svg>
                Edit Details
              </button>
            )}
          </div>
        </div>
        <div className='p-6'>
          {isEditing ? (
            // Edit Form
            <div className='space-y-6'>
              <div className='grid grid-cols-2 gap-6'>
                <div className='bg-gray-50 rounded-lg p-4'>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Room Number
                  </label>
                  <input
                    type='text'
                    value={editedRoom.roomNumber || ""}
                    onChange={(e) =>
                      setEditedRoom({
                        ...editedRoom,
                        roomNumber: e.target.value,
                      })
                    }
                    className='block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white'
                  />
                </div>
                <div className='bg-gray-50 rounded-lg p-4'>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Block
                  </label>
                  <input
                    type='text'
                    value={editedRoom.block || ""}
                    onChange={(e) =>
                      setEditedRoom({ ...editedRoom, block: e.target.value })
                    }
                    className='block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white'
                  />
                </div>
                <div className='bg-gray-50 rounded-lg p-4'>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Floor
                  </label>
                  <input
                    type='number'
                    value={editedRoom.floor || 0}
                    min='0'
                    onChange={(e) =>
                      setEditedRoom({
                        ...editedRoom,
                        floor: parseInt(e.target.value),
                      })
                    }
                    className='block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white'
                  />
                </div>
                <div className='bg-gray-50 rounded-lg p-4'>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Capacity
                  </label>
                  <input
                    type='number'
                    value={editedRoom.capacity || 0}
                    min='1'
                    onChange={(e) =>
                      setEditedRoom({
                        ...editedRoom,
                        capacity: parseInt(e.target.value),
                      })
                    }
                    className='block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white'
                  />
                </div>
                <div className='bg-gray-50 rounded-lg p-4'>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Status
                  </label>
                  <select
                    value={editedRoom.status}
                    onChange={(e) =>
                      setEditedRoom({
                        ...editedRoom,
                        status: e.target.value as Room["status"],
                      })
                    }
                    className='block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white'
                  >
                    <option value='AVAILABLE'>Available</option>
                    <option value='OCCUPIED'>Occupied</option>
                    <option value='RESERVED'>Reserved</option>
                    <option value='BLOCKED'>Blocked</option>
                  </select>
                </div>
                <div className='bg-gray-50 rounded-lg p-4'>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Designation
                  </label>
                  <input
                    type='text'
                    value={editedRoom.designation || ""}
                    onChange={(e) =>
                      setEditedRoom({
                        ...editedRoom,
                        designation: e.target.value,
                      })
                    }
                    className='block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white'
                    placeholder='Optional'
                  />
                </div>
              </div>

              <div className='border-t border-gray-100 pt-6'>
                <div className='flex justify-end space-x-3'>
                  <button
                    onClick={() => setIsEditing(false)}
                    className='px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center'
                  >
                    <svg
                      className='w-4 h-4 mr-1.5'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='2'
                        d='M6 18L18 6M6 6l12 12'
                      />
                    </svg>
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className='px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center'
                  >
                    <svg
                      className='w-4 h-4 mr-1.5'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='2'
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // View Mode
            <div className='space-y-6'>
              <div className='grid grid-cols-2 gap-6'>
                <div className='bg-gray-50 rounded-lg p-4'>
                  <h3 className='text-sm font-medium text-gray-500 mb-2'>
                    Room Number
                  </h3>
                  <p className='text-lg font-semibold text-gray-900'>
                    {room.roomNumber}
                  </p>
                </div>
                <div className='bg-gray-50 rounded-lg p-4'>
                  <h3 className='text-sm font-medium text-gray-500 mb-2'>
                    Block
                  </h3>
                  <p className='text-lg font-semibold text-gray-900'>
                    {room.block}
                  </p>
                </div>
                <div className='bg-gray-50 rounded-lg p-4'>
                  <h3 className='text-sm font-medium text-gray-500 mb-2'>
                    Floor
                  </h3>
                  <p className='text-lg font-semibold text-gray-900'>
                    {room.floor === 0 ? "Ground Floor" : `Floor ${room.floor}`}
                  </p>
                </div>
                <div className='bg-gray-50 rounded-lg p-4'>
                  <h3 className='text-sm font-medium text-gray-500 mb-2'>
                    Capacity
                  </h3>
                  <p className='text-lg font-semibold text-gray-900'>
                    {room.capacity} beds
                  </p>
                </div>
                <div className='bg-gray-50 rounded-lg p-4'>
                  <h3 className='text-sm font-medium text-gray-500 mb-2'>
                    Status
                  </h3>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium
                    ${
                      room.status === "AVAILABLE"
                        ? "bg-green-100 text-green-800"
                        : room.status === "OCCUPIED"
                        ? "bg-yellow-100 text-yellow-800"
                        : room.status === "RESERVED"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {room.status.charAt(0) + room.status.slice(1).toLowerCase()}
                  </span>
                </div>
                <div className='bg-gray-50 rounded-lg p-4'>
                  <h3 className='text-sm font-medium text-gray-500 mb-2'>
                    Designation
                  </h3>
                  <p className='text-lg font-semibold text-gray-900'>
                    {room.designation || "-"}
                  </p>
                </div>
              </div>

              <div className='bg-white border border-gray-100 rounded-lg overflow-hidden'>
                <div className='bg-gray-50 px-4 py-3 border-b border-gray-100'>
                  <h3 className='text-lg font-medium text-gray-900'>
                    Current Occupants
                  </h3>
                </div>
                {room.students.length > 0 ? (
                  <ul className='divide-y divide-gray-100'>
                    {room.students.map((student) => (
                      <li
                        key={student.id}
                        className='p-4 hover:bg-gray-50 transition-colors'
                      >
                        <div className='flex items-center space-x-4'>
                          <div className='flex-shrink-0'>
                            <div className='w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center'>
                              <span className='text-lg font-medium text-gray-600'>
                                {student.name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className='flex-1 min-w-0'>
                            <p className='text-sm font-medium text-gray-900 truncate'>
                              {student.name}
                            </p>
                            <p className='text-sm text-gray-500 truncate'>
                              {student.email}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className='p-4 text-center'>
                    <svg
                      className='mx-auto h-12 w-12 text-gray-300'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={1}
                        d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                      />
                    </svg>
                    <p className='mt-2 text-sm text-gray-500'>
                      No current occupants
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
