import React from "react";
import type { Student } from "../types/student";

interface StudentTableProps {
  students: Student[];
  editId: number | null;
  editForm: any;
  handleEditFormChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  handleEditSave: (id: number) => void;
  handleEditCancel: () => void;
  handleEditClick: (student: Student) => void;
  handleDeleteClick: (id: number) => void;
}

// This component is memoized to prevent unnecessary re-renders
const StudentTable = React.memo(
  ({
    students,
    editId,
    editForm,
    handleEditFormChange,
    handleEditSave,
    handleEditCancel,
    handleEditClick,
    handleDeleteClick,
  }: StudentTableProps) => {
    return (
      <>
        {/* Table for desktop and tablets */}
        <table className='min-w-[900px] w-full border-separate border-spacing-y-2 text-left text-xs md:text-sm hidden md:table'>
          <thead className='bg-blue-50'>
            <tr>
              <th className='p-2 border-b'>Name</th>
              <th className='p-2 border-b w-48 min-w-[10rem] max-w-[16rem]'>
                Email
              </th>
              <th className='p-2 border-b'>Designation</th>
              <th className='p-2 border-b'>Guardian</th>
              <th className='p-2 border-b'>Mobile</th>
              <th className='p-2 border-b'>Ticket #</th>
              <th className='p-2 border-b'>Division</th>
              <th className='p-2 border-b'>Course</th>
              <th className='p-2 border-b'>Room No.</th>
              <th className='p-2 border-b'>Linen Inventory</th>
              <th className='p-2 border-b'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className='hover:bg-blue-50 rounded-lg transition'>
                {editId === s.id ? (
                  <>
                    <td className='p-2 border min-w-0'>
                      <input
                        type='text'
                        name='name'
                        value={editForm.name}
                        onChange={handleEditFormChange}
                        className='p-1 border rounded w-full min-w-0 max-w-xs'
                      />
                    </td>
                    <td className='p-2 border w-48 min-w-[10rem] max-w-[16rem]'>
                      <input
                        type='email'
                        name='email'
                        value={editForm.email}
                        onChange={handleEditFormChange}
                        className='p-1 border rounded w-full max-w-xs'
                      />
                    </td>
                    <td className='p-2 border min-w-0'>
                      <input
                        type='text'
                        name='designation'
                        value={editForm.designation}
                        onChange={handleEditFormChange}
                        className='p-1 border rounded w-full min-w-0 max-w-xs'
                      />
                    </td>
                    <td className='p-2 border min-w-0'>
                      <input
                        type='text'
                        name='guardianName'
                        value={editForm.guardianName}
                        onChange={handleEditFormChange}
                        className='p-1 border rounded w-full min-w-0 max-w-xs'
                      />
                    </td>
                    <td className='p-2 border min-w-0'>
                      <input
                        type='text'
                        name='mobile'
                        value={editForm.mobile}
                        onChange={handleEditFormChange}
                        className='p-1 border rounded w-full min-w-0 max-w-xs'
                      />
                    </td>
                    <td className='p-2 border min-w-0'>
                      <input
                        type='text'
                        name='ticketNumber'
                        value={editForm.ticketNumber}
                        onChange={handleEditFormChange}
                        className='p-1 border rounded w-full min-w-0 max-w-xs'
                      />
                    </td>
                    <td className='p-2 border min-w-0'>
                      <input
                        type='text'
                        name='division'
                        value={editForm.division}
                        onChange={handleEditFormChange}
                        className='p-1 border rounded w-full min-w-0 max-w-xs'
                      />
                    </td>
                    <td className='p-2 border min-w-0'>
                      <input
                        type='text'
                        name='course'
                        value={editForm.course}
                        onChange={handleEditFormChange}
                        className='p-1 border rounded w-full min-w-0 max-w-xs'
                      />
                    </td>
                    <td className='p-2 border min-w-0'>
                      <input
                        type='text'
                        name='roomNumber'
                        value={editForm.roomNumber || ""}
                        onChange={handleEditFormChange}
                        className='p-1 border rounded w-full min-w-0 max-w-xs'
                      />
                    </td>
                    <td className='p-2 border min-w-0'>
                      <div className='space-y-2'>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Bedsheets
                          </label>
                          <input
                            type='number'
                            name='bedsheetCount'
                            min='0'
                            max='5'
                            value={editForm.bedsheetCount}
                            onChange={handleEditFormChange}
                            className='w-24 p-1 border rounded'
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Pillows
                          </label>
                          <input
                            type='number'
                            name='pillowCount'
                            min='0'
                            max='5'
                            value={editForm.pillowCount}
                            onChange={handleEditFormChange}
                            className='w-24 p-1 border rounded'
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Blankets
                          </label>
                          <input
                            type='number'
                            name='blanketCount'
                            min='0'
                            max='5'
                            value={editForm.blanketCount}
                            onChange={handleEditFormChange}
                            className='w-24 p-1 border rounded'
                          />
                        </div>
                      </div>
                    </td>
                    <td className='p-2 border space-x-2 min-w-0'>
                      <div className='flex flex-col sm:flex-row gap-2 justify-center items-center'>
                        <button
                          className='text-green-600 border border-green-600 px-2 py-1 rounded'
                          onClick={() => handleEditSave(s.id)}
                          type='button'
                        >
                          Save
                        </button>
                        <button
                          className='text-gray-600 border border-gray-600 px-2 py-1 rounded'
                          onClick={handleEditCancel}
                          type='button'
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className='p-2'>{s.name}</td>
                    <td
                      className='p-2 w-48 min-w-[10rem] max-w-[16rem] truncate'
                      title={s.email}
                    >
                      {s.email}
                    </td>
                    <td className='p-2'>{s.designation || "-"}</td>
                    <td className='p-2'>{s.guardianName || "-"}</td>
                    <td className='p-2'>{s.mobile || "-"}</td>
                    <td className='p-2'>{s.ticketNumber || "-"}</td>
                    <td className='p-2'>{s.division || "-"}</td>
                    <td className='p-2'>{s.course || "-"}</td>
                    <td className='p-2'>{s.roomNumber || "-"}</td>
                    <td className='p-2'>
                      <div className='space-y-1'>
                        <div className='text-xs'>
                          Bedsheets: {s.bedsheetCount}
                        </div>
                        <div className='text-xs'>Pillows: {s.pillowCount}</div>
                        <div className='text-xs'>
                          Blankets: {s.blanketCount}
                        </div>
                      </div>
                    </td>
                    <td className='p-2'>
                      <div className='flex flex-col sm:flex-row gap-2'>
                        <button
                          onClick={() => handleEditClick(s)}
                          className='text-blue-600'
                          title='Edit'
                        >
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                            className='h-5 w-5'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(s.id)}
                          className='text-red-600'
                          title='Delete'
                        >
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                            className='h-5 w-5'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td className='p-4 text-center' colSpan={11}>
                  No students found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Mobile layout */}
        <div className='md:hidden flex flex-col gap-4'>
          {students.map((s) => (
            <div
              key={s.id}
              className='bg-blue-50 rounded-lg shadow p-3 text-xs'
            >
              {editId === s.id ? (
                <div className='space-y-2'>
                  <div className='flex justify-between mb-1'>
                    <input
                      type='text'
                      name='name'
                      value={editForm.name}
                      onChange={handleEditFormChange}
                      className='font-bold p-1 border rounded w-full'
                    />
                  </div>
                  {/* Add more edit fields as needed for mobile */}
                  <div className='flex justify-end space-x-2'>
                    <button
                      className='bg-green-600 text-white px-3 py-1 rounded text-xs'
                      onClick={() => handleEditSave(s.id)}
                    >
                      Save
                    </button>
                    <button
                      className='bg-gray-600 text-white px-3 py-1 rounded text-xs'
                      onClick={handleEditCancel}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className='flex justify-between mb-1'>
                    <span className='font-bold'>{s.name}</span>
                    <div className='flex space-x-2'>
                      <button
                        onClick={() => handleEditClick(s)}
                        className='text-blue-600'
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                          className='h-4 w-4'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(s.id)}
                        className='text-red-600'
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                          className='h-4 w-4'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className='grid grid-cols-2 gap-x-2 gap-y-1 mt-2'>
                    <span className='font-semibold'>Email:</span>
                    <span className='truncate'>{s.email}</span>
                    <span className='font-semibold'>Phone:</span>
                    <span>{s.phone}</span>
                    {s.designation && (
                      <>
                        <span className='font-semibold'>Designation:</span>
                        <span>{s.designation}</span>
                      </>
                    )}
                    {s.roomNumber && (
                      <>
                        <span className='font-semibold'>Room:</span>
                        <span>{s.roomNumber}</span>
                      </>
                    )}
                    <span className='font-semibold'>Linen:</span>
                    <span>
                      Bedsheets: {s.bedsheetCount}, Pillows: {s.pillowCount},
                      Blankets: {s.blanketCount}
                    </span>
                  </div>
                </>
              )}
            </div>
          ))}
          {students.length === 0 && (
            <div className='p-4 text-center'>No students found</div>
          )}
        </div>
      </>
    );
  }
);

export default StudentTable;
