import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  branch: string;
  year: number;
  rollNumber: string;
  gender: string;
}

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    branch: "",
    year: 1,
    rollNumber: "",
    gender: "MALE",
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    branch: "",
    year: 1,
    rollNumber: "",
    gender: "MALE",
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const token = localStorage.getItem("token");

  const fetchStudents = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3000/students?search=${search}&page=${page}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStudents(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      toast.error("Failed to fetch students");
    }
  };

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line
  }, [search, page]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    try {
      await axios.delete(`http://localhost:3000/students/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Student deleted");
      fetchStudents();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Ensure year is sent as a number
      const payload = { ...form, year: Number(form.year) };
      await axios.post("http://localhost:3000/students", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Student added successfully");
      setShowAddForm(false);
      fetchStudents();
      setForm({
        name: "",
        email: "",
        phone: "",
        branch: "",
        year: 1,
        rollNumber: "",
        gender: "MALE",
      });
    } catch (err) {
      toast.error("Failed to add student");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Inline edit handlers
  const handleEditClick = (student: Student) => {
    setEditId(student.id);
    setEditForm({
      name: student.name,
      email: student.email,
      phone: student.phone,
      branch: student.branch,
      year: student.year,
      rollNumber: student.rollNumber,
      gender: student.gender,
    });
  };

  const handleEditFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSave = async (id: number) => {
    try {
      const payload = { ...editForm, year: Number(editForm.year) };
      await axios.put(`http://localhost:3000/students/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Student updated successfully");
      setEditId(null);
      fetchStudents();
    } catch (err) {
      toast.error("Failed to update student");
    }
  };

  const handleEditCancel = () => {
    setEditId(null);
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`http://localhost:3000/students/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Student deleted");
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchStudents(); // Refresh the list
    } catch (err) {
      toast.error("Failed to delete");
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  return (
    <div className='p-6'>
      <div className='flex justify-between items-center mb-4'>
        <h1 className='text-2xl font-bold'>Student Management</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className='bg-blue-600 text-white px-4 py-2 rounded'
        >
          {showAddForm ? "Cancel" : "+ Add Student"}
        </button>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleAdd}
          className='space-y-2 bg-gray-50 p-4 rounded border mb-4'
        >
          <input
            type='text'
            name='name'
            placeholder='Name'
            value={form.name}
            onChange={handleChange}
            className='w-full p-2 border rounded'
            required
          />
          <input
            type='email'
            name='email'
            placeholder='Email'
            value={form.email}
            onChange={handleChange}
            className='w-full p-2 border rounded'
            required
          />
          <input
            type='text'
            name='phone'
            placeholder='Phone'
            value={form.phone}
            onChange={handleChange}
            className='w-full p-2 border rounded'
            required
          />
          <input
            type='text'
            name='branch'
            placeholder='Branch'
            value={form.branch}
            onChange={handleChange}
            className='w-full p-2 border rounded'
            required
          />
          <input
            type='number'
            name='year'
            placeholder='Year'
            value={form.year}
            onChange={handleChange}
            className='w-full p-2 border rounded'
            required
          />
          <input
            type='text'
            name='rollNumber'
            placeholder='Roll Number'
            value={form.rollNumber}
            onChange={handleChange}
            className='w-full p-2 border rounded'
            required
          />
          <select
            name='gender'
            value={form.gender}
            onChange={handleChange}
            className='w-full p-2 border rounded'
          >
            <option value='MALE'>Male</option>
            <option value='FEMALE'>Female</option>
            <option value='OTHER'>Other</option>
          </select>
          <button
            type='submit'
            className='bg-green-600 text-white px-4 py-2 rounded'
          >
            Add Student
          </button>
        </form>
      )}

      <input
        type='text'
        placeholder='Search by name or roll number'
        className='border px-4 py-2 rounded w-full md:w-1/3 mb-4'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className='overflow-x-auto'>
        <table className='w-full text-left border'>
          <thead className='bg-gray-100'>
            <tr>
              <th className='p-2 border'>Name</th>
              <th className='p-2 border'>Email</th>
              <th className='p-2 border'>Roll No</th>
              <th className='p-2 border'>Year</th>
              <th className='p-2 border'>Branch</th>
              <th className='p-2 border'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                {editId === s.id ? (
                  <>
                    <td className='p-2 border'>
                      <input
                        type='text'
                        name='name'
                        value={editForm.name}
                        onChange={handleEditFormChange}
                        className='p-1 border rounded w-full'
                      />
                    </td>
                    <td className='p-2 border'>
                      <input
                        type='email'
                        name='email'
                        value={editForm.email}
                        onChange={handleEditFormChange}
                        className='p-1 border rounded w-full'
                      />
                    </td>
                    <td className='p-2 border'>
                      <input
                        type='text'
                        name='rollNumber'
                        value={editForm.rollNumber}
                        onChange={handleEditFormChange}
                        className='p-1 border rounded w-full'
                      />
                    </td>
                    <td className='p-2 border'>
                      <input
                        type='number'
                        name='year'
                        value={editForm.year}
                        onChange={handleEditFormChange}
                        className='p-1 border rounded w-full'
                      />
                    </td>
                    <td className='p-2 border'>
                      <input
                        type='text'
                        name='branch'
                        value={editForm.branch}
                        onChange={handleEditFormChange}
                        className='p-1 border rounded w-full'
                      />
                    </td>
                    <td className='p-2 border space-x-2'>
                      <button
                        className='text-green-600 mr-2'
                        onClick={() => handleEditSave(s.id)}
                        type='button'
                      >
                        Save
                      </button>
                      <button
                        className='text-gray-600'
                        onClick={handleEditCancel}
                        type='button'
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className='p-2 border'>{s.name}</td>
                    <td className='p-2 border'>{s.email}</td>
                    <td className='p-2 border'>{s.rollNumber}</td>
                    <td className='p-2 border'>{s.year}</td>
                    <td className='p-2 border'>{s.branch}</td>
                    <td className='p-2 border space-x-2'>
                      <button
                        className='text-blue-600 mr-2'
                        onClick={() => handleEditClick(s)}
                        type='button'
                      >
                        Edit
                      </button>
                      <button
                        className='text-red-600'
                        onClick={() => handleDeleteClick(s.id)}
                        type='button'
                      >
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td className='p-4 text-center' colSpan={6}>
                  No students found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50'>
          <div className='bg-white p-6 rounded shadow-lg w-80'>
            <h2 className='text-lg font-semibold mb-4'>Confirm Delete</h2>
            <p className='mb-6'>
              Are you sure you want to delete this student?
            </p>
            <div className='flex justify-end space-x-2'>
              <button
                className='px-4 py-2 bg-gray-200 rounded hover:bg-gray-300'
                onClick={handleDeleteCancel}
              >
                Cancel
              </button>
              <button
                className='px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700'
                onClick={handleDeleteConfirm}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className='flex justify-between mt-4'>
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className='px-4 py-2 border rounded disabled:opacity-50'
        >
          Previous
        </button>
        <p>
          Page {page} of {totalPages}
        </p>
        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className='px-4 py-2 border rounded disabled:opacity-50'
        >
          Next
        </button>
      </div>
    </div>
  );
}
