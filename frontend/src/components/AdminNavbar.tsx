import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminNavbar() {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth();
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  if (!isAuthenticated) return null;
  return (
    <nav className='bg-gradient-to-r from-green-500 to-green-700 text-white px-4 py-3 flex flex-wrap md:flex-nowrap justify-between items-center shadow-lg rounded-b-2xl'>
      <h1 className='text-white font-extrabold text-2xl tracking-wider drop-shadow-lg mb-2 md:mb-0'>
        🏨 HMS
      </h1>
      <input type='checkbox' id='admin-menu-toggle' className='hidden peer' />
      <label
        htmlFor='admin-menu-toggle'
        className='md:hidden cursor-pointer ml-auto mr-4'
      >
        <span className='text-3xl'>&#9776;</span>
      </label>
      <div className='w-full md:w-auto flex-col md:flex-row gap-6 font-semibold text-lg hidden peer-checked:flex md:flex'>
        <Link
          to='/admin/dashboard'
          className='hover:text-yellow-200 transition'
        >
          Dashboard
        </Link>
        <Link to='/admin/students' className='hover:text-yellow-200 transition'>
          Students
        </Link>
        <Link to='/admin/rooms' className='hover:text-yellow-200 transition'>
          Rooms
        </Link>
        <Link
          to='/admin/complaints'
          className='hover:text-yellow-200 transition'
        >
          Complaints
        </Link>
        <Link to='/admin/leaves' className='hover:text-yellow-200 transition'>
          Leaves
        </Link>
        <Link to='/admin/fees' className='hover:text-yellow-200 transition'>
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
