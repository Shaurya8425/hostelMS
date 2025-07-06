import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function StudentNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, isAuthenticated } = useAuth();
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  // Hide navbar on login and root routes
  if (!isAuthenticated || ["/login", "/"].includes(location.pathname))
    return null;
  return (
    <nav className='bg-gradient-to-r from-green-700 to-green-900 text-white px-4 py-3 flex flex-wrap md:flex-nowrap justify-between items-center shadow-lg rounded-b-2xl'>
      <h1 className='text-white font-extrabold text-2xl tracking-wider drop-shadow-lg mb-2 md:mb-0'>
        🎓 HMS
      </h1>
      <input type='checkbox' id='student-menu-toggle' className='hidden peer' />
      <label
        htmlFor='student-menu-toggle'
        className='md:hidden cursor-pointer ml-auto mr-4'
      >
        <span className='text-3xl'>&#9776;</span>
      </label>
      <div className='w-full md:w-auto flex-col md:flex-row gap-6 font-semibold text-lg hidden peer-checked:flex md:flex'>
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
        <button
          onClick={handleLogout}
          className='mt-2 md:mt-0 px-4 py-1 font-bold rounded-full bg-white text-green-700 border-2 border-green-600 shadow hover:bg-green-50 hover:text-red-600 transition'
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
