import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Complaint from "./pages/student/Complaint";
import Leave from "./pages/student/Leave";
import AdminStudents from "./pages/admin/Student";
import AdminComplaints from "./pages/admin/Complaints";
import AdminRooms from "./pages/admin/Rooms";
import AdminLeaves from "./pages/admin/Leaves";
import RoomDetails from "./pages/admin/RoomDetails";
import AdminNavbar from "./components/AdminNavbar";
import StudentNavbar from "./components/StudentNavbar";
import { getUserRole } from "./utils/getUserRole";
import { AuthProvider } from "./context/AuthContext";
import HomePage from "./pages/Home";
import LinenDetails from "./pages/admin/LinenDetails";
import BedOccupancyPage from "./pages/admin/BedOccupancy";

function App() {
  const role = getUserRole();
  return (
    <AuthProvider>
      <Router>
        {role === "ADMIN" && <AdminNavbar />}
        {role === "STUDENT" && <StudentNavbar />}
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<Signup />} />
          <Route
            path='admin/dashboard'
            element={
              <ProtectedRoute role='ADMIN'>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path='/admin/students'
            element={
              <ProtectedRoute role='ADMIN'>
                <AdminStudents />
              </ProtectedRoute>
            }
          />
          <Route
            path='/admin/rooms/:id'
            element={
              <ProtectedRoute role='ADMIN'>
                <RoomDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path='/admin/complaints'
            element={
              <ProtectedRoute role='ADMIN'>
                <AdminComplaints />
              </ProtectedRoute>
            }
          />
          <Route
            path='/admin/rooms'
            element={
              <ProtectedRoute role='ADMIN'>
                <AdminRooms />
              </ProtectedRoute>
            }
          />
          <Route
            path='/admin/leaves'
            element={
              <ProtectedRoute role='ADMIN'>
                <AdminLeaves />
              </ProtectedRoute>
            }
          />
          <Route
            path='/admin/linen'
            element={
              <ProtectedRoute role='ADMIN'>
                <LinenDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path='/admin/bed-occupancy'
            element={
              <ProtectedRoute role='ADMIN'>
                <BedOccupancyPage />
              </ProtectedRoute>
            }
          />

          {/* Student Pages */}
          <Route
            path='student/dashboard'
            element={
              <ProtectedRoute role='STUDENT'>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path='/student/complaints'
            element={
              <ProtectedRoute role='STUDENT'>
                <Complaint />
              </ProtectedRoute>
            }
          />
          <Route
            path='/student/leaves'
            element={
              <ProtectedRoute role='STUDENT'>
                <Leave />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
      <ToastContainer />
    </AuthProvider>
  );
}

export default App;
