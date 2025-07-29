import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance"; // Import the configured instance
import { toast } from "react-toastify";
import { API_BASE } from "../../api/apiBase";
import SkeletonStudents from "../../components/skeleton/admin/SkeletonStudents";
import bed from "../../assets/bed-svgrepo-com.svg";
import pillow from "../../assets/pillow-svgrepo-com.svg";
import blankie from "../../assets/blanket-svgrepo-com.svg";
import {
  getArchivedStudents,
  permanentlyDeleteArchivedStudent,
  type ArchivedStudent,
} from "../../api/archivedStudentsApi";

interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  designation: string | null;
  guardianName: string | null;
  mobile: string | null;
  ticketNumber: string | null;
  division: string | null;
  course: string | null;
  fromDate: string | null;
  toDate: string | null;
  bedsheetCount: number;
  pillowCount: number;
  blanketCount: number;
  linenIssuedDate: string | null;
  roomNumber: string | null;
  room: any; // Add proper type if needed
  complaints: any[]; // Add proper type if needed
  leaves: any[]; // Add proper type if needed
  user: {
    email: string;
    role: string;
  };
}

export default function AdminStudents() {
  const [activeTab, setActiveTab] = useState<"current" | "archived">("current");
  const [students, setStudents] = useState<Student[]>([]);
  const [archivedStudents, setArchivedStudents] = useState<ArchivedStudent[]>(
    []
  );
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [archivedSearch, setArchivedSearch] = useState("");
  const [debouncedArchivedSearch, setDebouncedArchivedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [archivedPage, setArchivedPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [archivedTotalPages, setArchivedTotalPages] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  interface StudentForm {
    name: string;
    email: string;
    phone: string;
    gender: "MALE" | "FEMALE" | "OTHER";
    designation: string;
    guardianName: string;
    mobile: string;
    ticketNumber: string;
    division: string;
    course: string;
    roomNumber: string;
    fromDate: string;
    toDate: string;
    bedsheetCount: number;
    pillowCount: number;
    blanketCount: number;
  }

  const defaultForm: StudentForm = {
    name: "",
    email: "",
    phone: "",
    gender: "MALE",
    designation: "",
    guardianName: "",
    mobile: "",
    ticketNumber: "",
    division: "",
    course: "",
    roomNumber: "",
    fromDate: "",
    toDate: "",
    bedsheetCount: 1, // Default 1 bedsheet
    pillowCount: 2, // Default 2 pillows
    blanketCount: 0,
  };

  const [form, setForm] = useState<StudentForm>(defaultForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "MALE" as "MALE" | "FEMALE" | "OTHER",
    designation: "",
    guardianName: "",
    mobile: "",
    ticketNumber: "",
    division: "",
    course: "",
    roomNumber: "",
    fromDate: "",
    toDate: "",
    bedsheetCount: 0,
    pillowCount: 0,
    blanketCount: 0,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(true);

  // Function to validate JWT token format
  const isValidToken = (token: string | null): boolean => {
    if (!token) return false;

    // Simple check for JWT format (three parts separated by dots)
    const parts = token.split(".");
    return parts.length === 3;
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      console.log(
        "Fetching students with token:",
        token ? token.substring(0, 15) + "..." : "No token"
      );

      if (!token || !isValidToken(token)) {
        toast.error(
          "Authentication token missing or invalid. Please log in again."
        );
        return;
      }

      const res = await axiosInstance.get(
        `/students?search=${debouncedSearch}&page=${page}&limit=20`
      );

      console.log("Full API response:", res);
      console.log("Student data from API:", res.data);
      console.log("Meta data:", res.data.meta);
      console.log("Total pages from API:", res.data.meta?.totalPages);
      console.log("Current page:", page);
      console.log("Search query:", search);

      setStudents(res.data.data || []);
      setTotalPages(res.data.meta?.totalPages || 1);
    } catch (err: any) {
      console.error("Error fetching students:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });

      toast.error(
        "Failed to fetch students: " +
          (err.response?.data?.error || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchArchivedStudents = async () => {
    setLoading(true);
    try {
      if (!token || !isValidToken(token)) {
        toast.error(
          "Authentication token missing or invalid. Please log in again."
        );
        return;
      }

      const response = await getArchivedStudents(
        debouncedArchivedSearch,
        archivedPage,
        10
      );
      setArchivedStudents(response.data);
      setArchivedTotalPages(response.totalPages);
    } catch (err: any) {
      console.error("Error fetching archived students:", err);
      toast.error(
        "Failed to fetch archived students: " +
          (err.response?.data?.error || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  // Hook to check token on component mount
  useEffect(() => {
    // Check if token exists and is valid
    if (!token) {
      toast.error("You need to log in to access this page", {
        toastId: "login-required",
      });
      // You might want to redirect to login page here
      // window.location.href = "/login";
    } else {
      // Verify token by making an auth check request
      const verifyToken = async () => {
        try {
          await axiosInstance.get(`/auth/me`);
          // Token is valid, no action needed
        } catch (err) {
          // Token is invalid or expired
          toast.error("Your session has expired. Please log in again", {
            toastId: "token-expired",
          });
          localStorage.removeItem("token");
          // window.location.href = "/login";
        }
      };
      verifyToken();
    }
  }, [token]);

  // Debounce search inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedArchivedSearch(archivedSearch);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [archivedSearch]);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    setArchivedPage(1);
  }, [debouncedArchivedSearch]);

  useEffect(() => {
    if (activeTab === "current") {
      fetchStudents();
    } else {
      fetchArchivedStudents();
    }
    // eslint-disable-next-line
  }, [debouncedSearch, page, debouncedArchivedSearch, archivedPage, activeTab]);

  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);

      if (!token || !isValidToken(token)) {
        toast.error(
          "You must be logged in with a valid session to add a student"
        );
        return;
      }

      // Display the token for debugging (remove this in production)
      console.log(
        "Using token:",
        token ? token.substring(0, 15) + "..." : "No token"
      );

      // Basic validation
      if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email.trim())) {
        toast.error("Please enter a valid email address");
        return;
      }

      // Phone validation
      if (!/^\d{10}$/.test(form.phone.trim())) {
        toast.error("Please enter a valid 10-digit phone number");
        return;
      }

      // Date validation
      if (form.fromDate && form.toDate) {
        const fromDate = new Date(form.fromDate);
        const toDate = new Date(form.toDate);
        if (fromDate > toDate) {
          toast.error("From date cannot be after To date");
          return;
        }
      }

      // Check if email already exists as a user
      try {
        console.log(`Checking if email ${form.email.trim()} already exists...`);
        const checkResponse = await axiosInstance.get(
          `/students/check-email?email=${encodeURIComponent(form.email.trim())}`
        );

        console.log("Email check response:", checkResponse.data);

        if (checkResponse.data?.exists) {
          toast.error(
            "A user with this email already exists. Please use a different email address."
          );
          return;
        }
      } catch (checkError: any) {
        // Log error details
        console.error("Email check error:", {
          error: checkError,
          response: checkError.response?.data,
          status: checkError.response?.status,
        });

        // If the error is due to authorization or the endpoint doesn't exist,
        // we'll continue with student creation and let the backend handle any duplicate emails
        if (
          checkError.response?.status === 403 ||
          checkError.response?.status === 404
        ) {
          console.log("Continuing despite email check error");
        } else {
          toast.error(
            "Error checking email availability: " +
              (checkError.response?.data?.error || checkError.message)
          );
          return;
        }
      }

      // Build payload with proper validation
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(), // Ensure email is lowercase
        phone: form.phone.trim().replace(/\D/g, ""), // Remove any non-digit characters
        gender: form.gender,
        designation: form.designation.trim() || null,
        guardianName: form.guardianName.trim() || null,
        mobile: form.mobile.trim() || null,
        ticketNumber: form.ticketNumber.trim() || null,
        division: form.division.trim() || null,
        course: form.course.trim() || null,
        roomNumber: form.roomNumber.trim() || null,
        fromDate: form.fromDate ? new Date(form.fromDate).toISOString() : null,
        toDate: form.toDate ? new Date(form.toDate).toISOString() : null,
        bedsheetCount: Math.max(
          0,
          Math.min(5, Number(form.bedsheetCount) || 0)
        ),
        pillowCount: Math.max(0, Math.min(5, Number(form.pillowCount) || 0)),
        blanketCount: Math.max(0, Math.min(5, Number(form.blanketCount) || 0)),
        linenIssuedDate:
          Number(form.bedsheetCount) > 0 ||
          Number(form.pillowCount) > 0 ||
          Number(form.blanketCount) > 0
            ? new Date().toISOString()
            : null,
      };

      console.log("Sending payload:", JSON.stringify(payload, null, 2));

      // Add debug info for API base URL
      console.log("API Base URL:", API_BASE);

      // Function to retry API call in case of network errors
      const makeApiCall = async (retries = 2) => {
        try {
          return await axiosInstance.post(`/students`, payload, {
            headers: {
              "Content-Type": "application/json",
            },
          });
        } catch (err: any) {
          // If it's a network error and we have retries left, try again
          if (!err.response && retries > 0) {
            console.log(
              `Network error, retrying... (${retries} attempts left)`
            );
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
            return makeApiCall(retries - 1);
          }
          throw err; // Re-throw if it's not a network error or no retries left
        }
      };

      const response = await makeApiCall();

      console.log("Student creation response:", response.data);

      if (response.data) {
        toast.success("Student added successfully");
        setShowAddForm(false);
        setPage(1); // Reset to first page to show the newly added student
        setSearch(""); // Clear search to ensure new student is visible
        await fetchStudents();
        setForm(defaultForm);
      }
    } catch (error: any) {
      console.error("Add student error details:", {
        error: error,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
      });

      // Handle different types of errors
      if (!error.response) {
        // Network error or server not responding
        toast.error(
          "Cannot connect to the server. Please check your internet connection or try again later."
        );
      } else if (error.response?.status === 400) {
        // Bad request - typically validation errors
        const errorMessage =
          error.response.data?.error ||
          error.response.data?.details ||
          "Invalid student data";

        // Show more specific error for linen inventory issues
        if (errorMessage.includes("Not enough linen")) {
          const available = error.response.data?.available;
          if (available) {
            toast.error(
              `Not enough linen in inventory. Available: ${available.bedsheets} bedsheets, ${available.pillowCovers} pillows, ${available.blankets} blankets.`
            );
          } else {
            toast.error(
              "Not enough linen available in inventory. Please adjust the allocation."
            );
          }
        } else if (
          errorMessage.includes("already exists") ||
          errorMessage.includes("user not found") ||
          errorMessage.includes("unique constraint") ||
          errorMessage.includes("duplicate")
        ) {
          toast.error(
            "A user with this email already exists. Please use a different email address."
          );
        } else {
          toast.error(errorMessage);
        }
      } else if (error.response?.status === 401) {
        // Unauthorized
        toast.error("Session expired. Please login again.");
        // You might want to redirect to login here
      } else if (error.response?.status === 403) {
        // Forbidden
        toast.error("You don't have permission to add students");
      } else {
        // General error
        toast.error(
          error.response?.data?.error ||
            error.response?.data?.details ||
            "Failed to add student"
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    let processedValue: string | number = value;

    if (type === "number") {
      // Ensure number inputs are within valid ranges
      const numValue = parseInt(value) || 0;
      if (name === "blanketCount") {
        processedValue = Math.max(0, Math.min(1, numValue));
      } else if (name === "bedsheetCount" || name === "pillowCount") {
        processedValue = Math.max(0, Math.min(2, numValue));
      } else {
        processedValue = numValue;
      }
    }

    setForm((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  // Inline edit handlers
  const handleEditClick = (student: Student) => {
    setEditId(student.id);
    setEditForm({
      name: student.name,
      email: student.email,
      phone: student.phone,
      gender: student.gender,
      designation: student.designation || "",
      guardianName: student.guardianName || "",
      mobile: student.mobile || "",
      ticketNumber: student.ticketNumber || "",
      division: student.division || "",
      course: student.course || "",
      roomNumber: student.roomNumber || "",
      fromDate: student.fromDate || "",
      toDate: student.toDate || "",
      bedsheetCount: student.bedsheetCount,
      pillowCount: student.pillowCount,
      blanketCount: student.blanketCount,
    });
  };

  const handleEditFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;

    if (type === "checkbox") {
      setEditForm({ ...editForm, [name]: target.checked });
    } else if (type === "date") {
      // Ensure empty dates are null
      setEditForm({ ...editForm, [name]: value || null });
    } else {
      setEditForm({ ...editForm, [name]: value });
    }
  };

  const handleEditSave = async (id: number) => {
    try {
      // Process dates and create the payload
      const payload = {
        ...editForm,
        division: editForm.division || null,
        course: editForm.course || null,
        // Ensure dates are properly formatted
        fromDate: editForm.fromDate
          ? new Date(editForm.fromDate).toISOString()
          : null,
        toDate: editForm.toDate
          ? new Date(editForm.toDate).toISOString()
          : null,
        bedsheetCount: Math.max(
          0,
          Math.min(5, Number(editForm.bedsheetCount) || 0)
        ),
        pillowCount: Math.max(
          0,
          Math.min(5, Number(editForm.pillowCount) || 0)
        ),
        blanketCount: Math.max(
          0,
          Math.min(5, Number(editForm.blanketCount) || 0)
        ),
        linenIssuedDate:
          editForm.bedsheetCount > 0 ||
          editForm.pillowCount > 0 ||
          editForm.blanketCount > 0
            ? new Date().toISOString()
            : null,
      };
      if (!token) {
        toast.error("You must be logged in to update a student");
        return;
      }

      await axiosInstance.put(`/students/${id}`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      toast.success("Student updated successfully");
      setEditId(null);
      fetchStudents();
    } catch (err: any) {
      console.error("Error updating student:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to update student";
      toast.error(errorMessage);
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
      if (activeTab === "current") {
        // First, get the student data to know how many linens to return
        const studentToDelete = students.find((s) => s.id === deleteId);

        if (!studentToDelete) {
          toast.error("Student not found");
          setShowDeleteModal(false);
          setDeleteId(null);
          return;
        }

        // Archive the student (the backend now handles archiving)
        await axiosInstance.delete(`/students/${deleteId}`);

        toast.success("Student archived successfully");
        fetchStudents(); // Refresh the current students list
      } else {
        // Permanently delete archived student
        await permanentlyDeleteArchivedStudent(deleteId);
        toast.success("Archived student permanently deleted");
        fetchArchivedStudents(); // Refresh the archived students list
      }

      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (err) {
      console.error("Error deleting student:", err);
      toast.error(
        activeTab === "current"
          ? "Failed to archive student"
          : "Failed to delete archived student"
      );
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  if (loading) return <SkeletonStudents />;

  return (
    <div className='p-2 sm:p-4'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4'>
        <h1 className='text-2xl sm:text-3xl font-extrabold text-blue-900'>
          Student management
        </h1>
        {activeTab === "current" && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className='bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2 rounded shadow hover:from-blue-600 hover:to-blue-800 transition w-full sm:w-auto'
          >
            {showAddForm ? "Cancel" : "+ Add Student"}
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className='mb-6'>
        <div className='border-b border-gray-200'>
          <nav className='-mb-px flex space-x-8'>
            <button
              onClick={() => setActiveTab("current")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "current"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Current Students
            </button>
            <button
              onClick={() => setActiveTab("archived")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "archived"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Previous Students
            </button>
          </nav>
        </div>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleAdd}
          className='space-y-4 bg-white p-6 rounded-xl border shadow-lg mb-6 max-w-xl mx-auto'
        >
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-1'>
              <label className='block text-sm font-medium text-gray-700'>
                Full Name *
              </label>
              <input
                type='text'
                name='name'
                value={form.name}
                onChange={handleChange}
                className='w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                required
              />
            </div>

            <div className='space-y-1'>
              <label className='block text-sm font-medium text-gray-700'>
                Email Address *
              </label>
              <input
                type='email'
                name='email'
                value={form.email}
                onChange={handleChange}
                className='w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                required
              />
            </div>

            <div className='space-y-1'>
              <label className='block text-sm font-medium text-gray-700'>
                Phone Number *
              </label>
              <input
                type='text'
                name='phone'
                value={form.phone}
                onChange={handleChange}
                className='w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                required
              />
            </div>

            <div className='space-y-1'>
              <label className='block text-sm font-medium text-gray-700'>
                Gender *
              </label>
              <select
                name='gender'
                value={form.gender}
                onChange={handleChange}
                className='w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                required
              >
                <option value='MALE'>Male</option>
                <option value='FEMALE'>Female</option>
                <option value='OTHER'>Other</option>
              </select>
            </div>

            <div className='space-y-1'>
              <label className='block text-sm font-medium text-gray-700'>
                Designation
              </label>
              <input
                type='text'
                name='designation'
                value={form.designation}
                onChange={handleChange}
                className='w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder='e.g., Student, Officer, etc.'
              />
            </div>

            <div className='space-y-1'>
              <label className='block text-sm font-medium text-gray-700'>
                Guardian Name
              </label>
              <input
                type='text'
                name='guardianName'
                value={form.guardianName}
                onChange={handleChange}
                className='w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder='Guardian/Parent name'
              />
            </div>

            <div className='space-y-1'>
              <label className='block text-sm font-medium text-gray-700'>
                Mobile Number
              </label>
              <input
                type='text'
                name='mobile'
                value={form.mobile}
                onChange={handleChange}
                className='w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder='Alternative mobile number'
              />
            </div>

            <div className='space-y-1'>
              <label className='block text-sm font-medium text-gray-700'>
                Ticket Number
              </label>
              <input
                type='text'
                name='ticketNumber'
                value={form.ticketNumber}
                onChange={handleChange}
                className='w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder='Reference ticket number'
              />
            </div>

            <div className='space-y-1'>
              <label className='block text-sm font-medium text-gray-700'>
                Division
              </label>
              <input
                type='text'
                name='division'
                value={form.division}
                onChange={handleChange}
                className='w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>

            <div className='space-y-1'>
              <label className='block text-sm font-medium text-gray-700'>
                Course
              </label>
              <input
                type='text'
                name='course'
                value={form.course}
                onChange={handleChange}
                className='w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>

            <div className='space-y-1'>
              <label className='block text-sm font-medium text-gray-700'>
                Room No.
              </label>
              <input
                type='text'
                name='roomNumber'
                value={form.roomNumber}
                onChange={handleChange}
                className='w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder='e.g., 101, A-203, etc.'
              />
            </div>

            <div className='space-y-1'>
              <label className='block text-sm font-medium text-gray-700'>
                From Date
              </label>
              <input
                type='date'
                name='fromDate'
                value={form.fromDate}
                onChange={handleChange}
                className='w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>

            <div className='space-y-1'>
              <label className='block text-sm font-medium text-gray-700'>
                To Date
              </label>
              <input
                type='date'
                name='toDate'
                value={form.toDate}
                onChange={handleChange}
                className='w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>
          </div>

          <div className='border-t pt-4 mt-4'>
            <h3 className='text-lg font-medium text-gray-900 mb-3'>
              Linen Allocation
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='space-y-1'>
                <label className='block text-sm font-medium text-gray-700'>
                  Bedsheets
                </label>
                <div className='flex items-center space-x-2'>
                  <input
                    type='number'
                    name='bedsheetCount'
                    min='0'
                    max='5'
                    value={form.bedsheetCount}
                    onChange={handleChange}
                    className='w-24 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  />
                  <span className='text-sm text-gray-500'>Max: 5</span>
                </div>
              </div>

              <div className='space-y-1'>
                <label className='block text-sm font-medium text-gray-700'>
                  Pillows
                </label>
                <div className='flex items-center space-x-2'>
                  <input
                    type='number'
                    name='pillowCount'
                    min='0'
                    max='5'
                    value={form.pillowCount}
                    onChange={handleChange}
                    className='w-24 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  />
                  <span className='text-sm text-gray-500'>Max: 5</span>
                </div>
              </div>

              <div className='space-y-1'>
                <label className='block text-sm font-medium text-gray-700'>
                  Blankets (Optional)
                </label>
                <div className='flex items-center space-x-2'>
                  <input
                    type='number'
                    name='blanketCount'
                    min='0'
                    max='5'
                    value={form.blanketCount}
                    onChange={handleChange}
                    className='w-24 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  />
                  <span className='text-sm text-gray-500'>Max: 5</span>
                </div>
              </div>
            </div>
          </div>

          <div className='flex justify-end space-x-3 pt-4'>
            <button
              type='button'
              onClick={() => setShowAddForm(false)}
              className='px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={submitting}
              className='px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg hover:from-blue-600 hover:to-blue-800 transition disabled:opacity-50 flex items-center justify-center'
            >
              {submitting ? (
                <>
                  <svg
                    className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    ></path>
                  </svg>
                  Adding Student...
                </>
              ) : (
                "Add Student"
              )}
            </button>
          </div>
        </form>
      )}

      <input
        type='text'
        placeholder={
          activeTab === "current"
            ? "Search current students by name or email"
            : "Search archived students by name or email"
        }
        className='border px-4 py-2 rounded w-full sm:w-1/2 md:w-1/3 mb-6 shadow-sm'
        value={activeTab === "current" ? search : archivedSearch}
        onChange={(e) =>
          activeTab === "current"
            ? setSearch(e.target.value)
            : setArchivedSearch(e.target.value)
        }
      />

      <div className='w-full overflow-x-auto bg-white rounded-xl shadow border p-1 sm:p-4'>
        {activeTab === "current" ? (
          <>
            {/* Current Students Table for desktop and tablets */}
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
                  <tr
                    key={s.id}
                    className='hover:bg-blue-50 rounded-lg transition'
                  >
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
                              className='text-gray-600 border border-gray-400 px-2 py-1 rounded'
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
                            <div className='flex items-center gap-2'>
                              <span className='text-sm text-gray-600'>
                                <img className='w-4' src={bed} alt='' />
                              </span>
                              <span className='font-medium'>Bedsheets:</span>
                              <div className='flex flex-col'>
                                <span className='bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs'>
                                  {s.bedsheetCount} issued
                                </span>
                                <span className='text-xs text-gray-500 mt-1'>
                                  {s.linenIssuedDate
                                    ? `Last updated: ${new Date(
                                        s.linenIssuedDate
                                      ).toLocaleDateString()}`
                                    : "None issued"}
                                </span>
                              </div>
                            </div>
                            <div className='flex items-center gap-2'>
                              <span className='text-sm text-gray-600'>
                                <img className='w-4' src={pillow} alt='' />
                              </span>
                              <span className='font-medium'>Pillows:</span>
                              <div className='flex flex-col'>
                                <span className='bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs'>
                                  {s.pillowCount} issued
                                </span>
                                <span className='text-xs text-gray-500 mt-1'>
                                  {s.linenIssuedDate
                                    ? `Last updated: ${new Date(
                                        s.linenIssuedDate
                                      ).toLocaleDateString()}`
                                    : "None issued"}
                                </span>
                              </div>
                            </div>
                            <div className='flex items-center gap-2'>
                              <span className='text-sm text-gray-600'>
                                <img className='w-4' src={blankie} alt='' />
                              </span>
                              <span className='font-medium'>Blankets:</span>
                              <div className='flex flex-col'>
                                <span className='bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs'>
                                  {s.blanketCount} issued
                                </span>
                                <span className='text-xs text-gray-500 mt-1'>
                                  {s.linenIssuedDate
                                    ? `Last updated: ${new Date(
                                        s.linenIssuedDate
                                      ).toLocaleDateString()}`
                                    : "None issued"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className='p-2 space-x-2'>
                          <div className='flex flex-col sm:flex-row gap-2 justify-center items-center'>
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
            {/* Card layout for mobile and small screens */}
            <div className='md:hidden flex flex-col gap-4'>
              {students.map((s) => (
                <div
                  key={s.id}
                  className='bg-blue-50 rounded-lg shadow p-3 text-xs'
                >
                  {editId === s.id ? (
                    <>
                      <div className='flex justify-between mb-1'>
                        <input
                          type='text'
                          name='name'
                          value={editForm.name}
                          onChange={handleEditFormChange}
                          className='font-bold p-1 border rounded w-full'
                        />
                      </div>
                      <div className='grid grid-cols-2 gap-x-2 gap-y-1'>
                        <span className='font-semibold'>Email:</span>
                        <input
                          type='email'
                          name='email'
                          value={editForm.email}
                          onChange={handleEditFormChange}
                          className='p-1 border rounded w-full'
                        />
                        <span className='font-semibold'>Designation:</span>
                        <input
                          type='text'
                          name='designation'
                          value={editForm.designation}
                          onChange={handleEditFormChange}
                          className='p-1 border rounded w-full'
                        />
                        <span className='font-semibold'>Guardian Name:</span>
                        <input
                          type='text'
                          name='guardianName'
                          value={editForm.guardianName}
                          onChange={handleEditFormChange}
                          className='p-1 border rounded w-full'
                        />
                        <span className='font-semibold'>Mobile:</span>
                        <input
                          type='text'
                          name='mobile'
                          value={editForm.mobile}
                          onChange={handleEditFormChange}
                          className='p-1 border rounded w-full'
                        />
                        <span className='font-semibold'>Ticket Number:</span>
                        <input
                          type='text'
                          name='ticketNumber'
                          value={editForm.ticketNumber}
                          onChange={handleEditFormChange}
                          className='p-1 border rounded w-full'
                        />
                        <span className='font-semibold'>Division:</span>
                        <input
                          type='text'
                          name='division'
                          value={editForm.division}
                          onChange={handleEditFormChange}
                          className='p-1 border rounded w-full'
                        />
                        <span className='font-semibold'>Course:</span>
                        <input
                          type='text'
                          name='course'
                          value={editForm.course}
                          onChange={handleEditFormChange}
                          className='p-1 border rounded w-full'
                        />
                        <span className='font-semibold'>Room No.:</span>
                        <input
                          type='text'
                          name='roomNumber'
                          value={editForm.roomNumber}
                          onChange={handleEditFormChange}
                          className='p-1 border rounded w-full'
                        />
                        <span className='font-semibold'>Gender:</span>
                        <select
                          name='gender'
                          value={editForm.gender}
                          onChange={handleEditFormChange}
                          className='p-1 border rounded w-full'
                        >
                          <option value='MALE'>Male</option>
                          <option value='FEMALE'>Female</option>
                          <option value='OTHER'>Other</option>
                        </select>
                        <span className='font-semibold'>Linen Inventory:</span>
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
                              className='p-1 border rounded w-full'
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
                              className='p-1 border rounded w-full'
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
                              max='2'
                              value={editForm.blanketCount}
                              onChange={handleEditFormChange}
                              className='p-1 border rounded w-full'
                            />
                          </div>
                        </div>
                      </div>
                      <div className='flex gap-2 mt-2'>
                        <button
                          className='text-green-600 mr-2 border border-green-600 px-2 py-1 rounded'
                          onClick={() => handleEditSave(s.id)}
                          type='button'
                        >
                          Save
                        </button>
                        <button
                          className='text-gray-600 border border-gray-400 px-2 py-1 rounded'
                          onClick={handleEditCancel}
                          type='button'
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className='flex justify-between mb-1'>
                        <span className='font-bold'>{s.name}</span>
                        {/* Removed rollNumber display */}
                      </div>
                      <div className='grid grid-cols-2 gap-x-2 gap-y-1'>
                        <span className='font-semibold'>Email:</span>
                        <span>{s.email}</span>
                        <span className='font-semibold'>Designation:</span>
                        <span>{s.designation || "-"}</span>
                        <span className='font-semibold'>Guardian:</span>
                        <span>{s.guardianName || "-"}</span>
                        <span className='font-semibold'>Mobile:</span>
                        <span>{s.mobile || "-"}</span>
                        <span className='font-semibold'>Ticket Number:</span>
                        <span>{s.ticketNumber || "-"}</span>
                        <span className='font-semibold'>Division:</span>
                        <span>{s.division || "-"}</span>
                        <span className='font-semibold'>Course:</span>
                        <span>{s.course || "-"}</span>
                        <span className='font-semibold'>Room No.:</span>
                        <span>{s.roomNumber || "-"}</span>
                        <span className='font-semibold'>Linen Inventory:</span>
                        <div>
                          <div>Bedsheets: {s.bedsheetCount} issued</div>
                          <div>Pillows: {s.pillowCount} issued</div>
                          <div>Blankets: {s.blanketCount} issued</div>
                        </div>
                      </div>
                      <div className='flex gap-2 mt-2'>
                        <button
                          className='bg-gradient-to-r from-blue-500 to-blue-700 text-white px-3 py-1 rounded shadow hover:from-blue-600 hover:to-blue-800 transition font-semibold'
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
        ) : (
          <>
            {/* Archived Students Table for desktop and tablets */}
            <table className='min-w-[900px] w-full border-separate border-spacing-y-2 text-left text-xs md:text-sm hidden md:table'>
              <thead className='bg-red-50'>
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
                  <th className='p-2 border-b'>Room</th>
                  <th className='p-2 border-b'>Archived Date</th>
                  <th className='p-2 border-b'>Archived By</th>
                  <th className='p-2 border-b'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {archivedStudents.map((s) => (
                  <tr
                    key={s.id}
                    className='hover:bg-red-50 rounded-lg transition'
                  >
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
                      {new Date(s.deletedAt).toLocaleDateString()}
                    </td>
                    <td className='p-2'>{s.deletedBy || "-"}</td>
                    <td className='p-2 space-x-2'>
                      <div className='flex flex-col sm:flex-row gap-2 justify-center items-center'>
                        <button
                          className='bg-gradient-to-r from-red-500 to-red-700 text-white px-3 py-1 rounded shadow hover:from-red-600 hover:to-red-800 transition font-semibold text-xs'
                          onClick={() => handleDeleteClick(s.id)}
                          type='button'
                          title='Permanently delete this record'
                        >
                          Permanent Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {archivedStudents.length === 0 && (
                  <tr>
                    <td className='p-4 text-center' colSpan={12}>
                      No archived students found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Card layout for mobile and small screens - Archived Students */}
            <div className='md:hidden flex flex-col gap-4'>
              {archivedStudents.map((s) => (
                <div
                  key={s.id}
                  className='bg-red-50 rounded-lg shadow p-3 text-xs'
                >
                  <div className='flex justify-between mb-1'>
                    <span className='font-bold'>{s.name}</span>
                    <span className='text-red-600 text-xs font-semibold'>
                      ARCHIVED
                    </span>
                  </div>
                  <div className='grid grid-cols-2 gap-x-2 gap-y-1'>
                    <span className='font-semibold'>Email:</span>
                    <span>{s.email}</span>
                    <span className='font-semibold'>Designation:</span>
                    <span>{s.designation || "-"}</span>
                    <span className='font-semibold'>Guardian:</span>
                    <span>{s.guardianName || "-"}</span>
                    <span className='font-semibold'>Mobile:</span>
                    <span>{s.mobile || "-"}</span>
                    <span className='font-semibold'>Ticket Number:</span>
                    <span>{s.ticketNumber || "-"}</span>
                    <span className='font-semibold'>Division:</span>
                    <span>{s.division || "-"}</span>
                    <span className='font-semibold'>Course:</span>
                    <span>{s.course || "-"}</span>
                    <span className='font-semibold'>Room:</span>
                    <span>{s.roomNumber || "-"}</span>
                    <span className='font-semibold'>Archived Date:</span>
                    <span>{new Date(s.deletedAt).toLocaleDateString()}</span>
                    <span className='font-semibold'>Archived By:</span>
                    <span>{s.deletedBy || "-"}</span>
                  </div>
                  <div className='flex gap-2 mt-2'>
                    <button
                      className='bg-gradient-to-r from-red-500 to-red-700 text-white px-3 py-1 rounded shadow hover:from-red-600 hover:to-red-800 transition font-semibold text-xs'
                      onClick={() => handleDeleteClick(s.id)}
                      type='button'
                    >
                      Permanent Delete
                    </button>
                  </div>
                </div>
              ))}
              {archivedStudents.length === 0 && (
                <div className='p-4 text-center'>
                  No archived students found
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50'>
          <div className='bg-white p-6 rounded-xl shadow-lg w-96'>
            <h2 className='text-lg font-semibold mb-4'>
              {activeTab === "current"
                ? "Confirm Archive"
                : "Confirm Permanent Delete"}
            </h2>
            <p className='mb-3'>
              {activeTab === "current"
                ? "Are you sure you want to archive this student? The student data will be moved to the previous students section."
                : "Are you sure you want to permanently delete this archived student record? This action cannot be undone."}
            </p>
            {deleteId &&
              ((activeTab === "current" &&
                students.find((s) => s.id === deleteId)) ||
                (activeTab === "archived" &&
                  archivedStudents.find((s) => s.id === deleteId))) && (
                <div className='mb-6 p-2 bg-blue-50 rounded text-sm'>
                  {activeTab === "current" ? (
                    <>
                      <p className='font-medium text-blue-800 mb-1'>
                        Note about linen items:
                      </p>
                      {(() => {
                        const student = students.find((s) => s.id === deleteId);
                        const totalItems =
                          (student?.bedsheetCount || 0) +
                          (student?.pillowCount || 0) +
                          (student?.blanketCount || 0);

                        if (totalItems > 0) {
                          return (
                            <ul className='list-disc list-inside text-blue-700'>
                              {(student?.bedsheetCount ?? 0) > 0 && (
                                <li>
                                  {student?.bedsheetCount ?? 0} bedsheet(s) will
                                  be marked as used
                                </li>
                              )}
                              {(student?.pillowCount ?? 0) > 0 && (
                                <li>
                                  {student?.pillowCount ?? 0} pillow(s) will be
                                  marked as used
                                </li>
                              )}
                              {(student?.blanketCount ?? 0) > 0 && (
                                <li>
                                  {student?.blanketCount} blanket(s) will be
                                  marked as used
                                </li>
                              )}
                            </ul>
                          );
                        } else {
                          return (
                            <p className='text-gray-600'>
                              This student has no linen items.
                            </p>
                          );
                        }
                      })()}
                    </>
                  ) : (
                    <p className='font-medium text-red-800'>
                      This will permanently delete the archived student record.
                    </p>
                  )}
                </div>
              )}
            <div className='flex justify-end space-x-2'>
              <button
                className='px-4 py-2 bg-gray-200 rounded hover:bg-gray-300'
                onClick={handleDeleteCancel}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 text-white rounded hover:opacity-90 ${
                  activeTab === "current"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
                onClick={handleDeleteConfirm}
              >
                {activeTab === "current" ? "Archive" : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className='flex flex-col sm:flex-row justify-between items-center mt-6 gap-4'>
        <button
          disabled={activeTab === "current" ? page === 1 : archivedPage === 1}
          onClick={() =>
            activeTab === "current"
              ? setPage((p) => p - 1)
              : setArchivedPage((p) => p - 1)
          }
          className='px-4 py-2 border rounded disabled:opacity-50 bg-white shadow-sm w-full sm:w-auto'
        >
          Previous
        </button>
        <p className='font-semibold'>
          Page {activeTab === "current" ? page : archivedPage} of{" "}
          {activeTab === "current" ? totalPages : archivedTotalPages}
        </p>
        <button
          disabled={
            activeTab === "current"
              ? page === totalPages
              : archivedPage === archivedTotalPages
          }
          onClick={() =>
            activeTab === "current"
              ? setPage((p) => p + 1)
              : setArchivedPage((p) => p + 1)
          }
          className='px-4 py-2 border rounded disabled:opacity-50 bg-white shadow-sm w-full sm:w-auto'
        >
          Next
        </button>
      </div>
    </div>
  );
}
