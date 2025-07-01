import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CompleteProfile from "./pages/CompleteProfile";
import Complaint from "./pages/Complaint";
import Leave from "./pages/Leave";
import Fees from "./pages/Fees";
import StudentRoom from "./pages/student/Room";
import AdminStudents from "./pages/admin/Student";
import AdminComplaints from "./pages/admin/Complaints";
import AdminRooms from "./pages/admin/Rooms";
import AdminLeaves from "./pages/admin/Leaves";
import AdminFees from "./pages/admin/Fees";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/signup' element={<Signup />} />
          <Route
            path='/admin-dashboard'
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
            path='/admin/Fees'
            element={
              <ProtectedRoute role='ADMIN'>
                <AdminFees />
              </ProtectedRoute>
            }
          />


          {/* Student Pages */}
          <Route
            path='/student-dashboard'
            element={
              <ProtectedRoute role='STUDENT'>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path='/complete-profile'
            element={
              <ProtectedRoute role='STUDENT'>
                <CompleteProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path='/complaint'
            element={
              <ProtectedRoute role='STUDENT'>
                <Complaint />
              </ProtectedRoute>
            }
          />
          <Route
            path='/leave'
            element={
              <ProtectedRoute role='STUDENT'>
                <Leave />
              </ProtectedRoute>
            }
          />
          <Route
            path='/fee'
            element={
              <ProtectedRoute role='STUDENT'>
                <Fees />
              </ProtectedRoute>
            }
          />
          <Route
            path='/rooms'
            element={
              <ProtectedRoute role='STUDENT'>
                <StudentRoom />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
      <ToastContainer />
    </>
  );
}

export default App;
