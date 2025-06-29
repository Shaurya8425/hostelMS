import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
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
        <Route path='/student-dashboard' element={<StudentDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
