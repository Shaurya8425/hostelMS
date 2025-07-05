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
  division?: string;
  course?: string;
  fromDate?: string;
  toDate?: string;
  linenIssued?: "Y" | "NA";
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
    division: "",
    course: "",
    fromDate: "",
    toDate: "",
    linenIssued: "Y",
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
    division: "",
    course: "",
    fromDate: "",
    toDate: "",
    linenIssued: "Y",
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
        division: "",
        course: "",
        fromDate: "",
        toDate: "",
        linenIssued: "Y",
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
      division: student.division || "",
      course: student.course || "",
      fromDate: student.fromDate || "",
      toDate: student.toDate || "",
      linenIssued: student.linenIssued || "Y",
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
    <div className='p-2 sm:p-4'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4'>
        <h1 className='text-2xl sm:text-3xl font-extrabold text-blue-900'>
          Student Management
        </h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className='bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2 rounded shadow hover:from-blue-600 hover:to-blue-800 transition w-full sm:w-auto'
        >
          {showAddForm ? "Cancel" : "+ Add Student"}
        </button>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleAdd}
          className='space-y-2 bg-white p-4 sm:p-6 rounded-xl border shadow mb-6 max-w-md w-full'
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
          <input
            type='text'
            name='division'
            placeholder='Division'
            value={form.division}
            onChange={handleChange}
            className='w-full p-2 border rounded'
          />
          <input
            type='text'
            name='course'
            placeholder='Course'
            value={form.course}
            onChange={handleChange}
            className='w-full p-2 border rounded'
          />
          <input
            type='date'
            name='fromDate'
            placeholder='From Date'
            value={form.fromDate}
            onChange={handleChange}
            className='w-full p-2 border rounded'
          />
          <input
            type='date'
            name='toDate'
            placeholder='To Date'
            value={form.toDate}
            onChange={handleChange}
            className='w-full p-2 border rounded'
          />
          <select
            name='linenIssued'
            value={form.linenIssued}
            onChange={handleChange}
            className='w-full p-2 border rounded'
          >
            <option value='Y'>Y</option>
            <option value='NA'>N/A</option>
          </select>
          <button
            type='submit'
            className='bg-gradient-to-r from-green-500 to-green-700 text-white px-4 py-2 rounded shadow hover:from-green-600 hover:to-green-800 transition'
          >
            Add Student
          </button>
        </form>
      )}

      <input
        type='text'
        placeholder='Search by name or roll number'
        className='border px-4 py-2 rounded w-full sm:w-1/2 md:w-1/3 mb-6 shadow-sm'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className='overflow-x-auto bg-white rounded-xl shadow border p-2 sm:p-4'>
        <table className='min-w-[700px] w-full border-separate border-spacing-y-2 text-left text-xs sm:text-sm'>
          <thead className='bg-blue-50'>
            <tr>
              <th className='p-2 border-b'>Name</th>
              <th className='p-2 border-b'>Email</th>
              <th className='p-2 border-b'>Roll No</th>
              <th className='p-2 border-b'>Year</th>
              <th className='p-2 border-b'>Branch</th>
              <th className='p-2 border-b'>Division</th>
              <th className='p-2 border-b'>Course</th>
              <th className='p-2 border-b'>From</th>
              <th className='p-2 border-b'>To</th>
              <th className='p-2 border-b'>Linen Issued</th>
              <th className='p-2 border-b'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className='hover:bg-blue-50 rounded-lg transition'>
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
                    <td className='p-2 border'>
                      <input
                        type='text'
                        name='division'
                        value={editForm.division}
                        onChange={handleEditFormChange}
                        className='p-1 border rounded w-full'
                      />
                    </td>
                    <td className='p-2 border'>
                      <input
                        type='text'
                        name='course'
                        value={editForm.course}
                        onChange={handleEditFormChange}
                        className='p-1 border rounded w-full'
                      />
                    </td>
                    <td className='p-2 border'>
                      <input
                        type='date'
                        name='fromDate'
                        value={editForm.fromDate}
                        onChange={handleEditFormChange}
                        className='p-1 border rounded w-full'
                      />
                    </td>
                    <td className='p-2 border'>
                      <input
                        type='date'
                        name='toDate'
                        value={editForm.toDate}
                        onChange={handleEditFormChange}
                        className='p-1 border rounded w-full'
                      />
                    </td>
                    <td className='p-2 border'>
                      <select
                        name='linenIssued'
                        value={editForm.linenIssued}
                        onChange={handleEditFormChange}
                        className='p-1 border rounded w-full'
                      >
                        <option value='Y'>Y</option>
                        <option value='NA'>N/A</option>
                      </select>
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
                    <td className='p-2'>{s.name}</td>
                    <td className='p-2'>{s.email}</td>
                    <td className='p-2'>
                      <span className='bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium shadow-sm'>
                        {s.rollNumber}
                      </span>
                    </td>
                    <td className='p-2'>{s.year}</td>
                    <td className='p-2'>{s.branch}</td>
                    <td className='p-2'>{s.division}</td>
                    <td className='p-2'>{s.course}</td>
                    <td className='p-2'>
                      {s.fromDate
                        ? new Date(s.fromDate).toLocaleDateString()
                        : ""}
                    </td>
                    <td className='p-2'>
                      {s.toDate ? new Date(s.toDate).toLocaleDateString() : ""}
                    </td>
                    <td className='p-2'>{s.linenIssued}</td>
                    <td className='p-2 space-x-2'>
                      <button
                        className='bg-gradient-to-r from-blue-500 to-blue-700 text-white px-3 py-1 rounded shadow hover:from-blue-600 hover:to-blue-800 transition font-semibold mr-2'
                        onClick={() => handleEditClick(s)}
                        type='button'
                      >
                        Edit
                      </button>
                      <button
                        className='bg-gradient-to-r from-red-500 to-red-700 text-white px-3 py-1 rounded shadow hover:from-red-600 hover:to-red-800 transition font-semibold'
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
          <div className='bg-white p-6 rounded-xl shadow-lg w-80'>
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

      <div className='flex flex-col sm:flex-row justify-between items-center mt-6 gap-4'>
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className='px-4 py-2 border rounded disabled:opacity-50 bg-white shadow-sm w-full sm:w-auto'
        >
          Previous
        </button>
        <p className='font-semibold'>
          Page {page} of {totalPages}
        </p>
        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className='px-4 py-2 border rounded disabled:opacity-50 bg-white shadow-sm w-full sm:w-auto'
        >
          Next
        </button>
      </div>
    </div>
  );
}
