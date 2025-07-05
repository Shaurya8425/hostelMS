import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function StudentNavbar() {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth();
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  if (!isAuthenticated) return null;
  return (
    <nav className='bg-gradient-to-r from-green-700 to-green-900 text-white px-6 py-3 flex justify-between items-center shadow-lg rounded-b-2xl'>
      <h1 className='text-white font-extrabold text-2xl tracking-wider drop-shadow-lg'>
        🎓 HMS
      </h1>
      <div className='flex gap-6 font-semibold text-lg'>
        <Link
          to='/student/dashboard'
          className='hover:text-yellow-200 transition'
        >
          Dashboard
        </Link>
        <Link to='/student/room' className='hover:text-yellow-200 transition'>
          Room
        </Link>
        <Link
          to='/student/complaints'
          className='hover:text-yellow-200 transition'
        >
          Complaints
        </Link>
        <Link to='/student/leaves' className='hover:text-yellow-200 transition'>
          Leaves
        </Link>
        <Link to='/student/fees' className='hover:text-yellow-200 transition'>
          Fees
        </Link>
      </div>
      <button
        onClick={handleLogout}
        className='ml-4 px-4 py-1 font-bold rounded-full bg-white text-green-700 border-2 border-green-600 shadow hover:bg-green-50 hover:text-red-600 transition'
      >
        Logout
      </button>
    </nav>
  );
}
