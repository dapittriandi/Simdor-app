import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { Search, Bell, User, LogOut, ChevronDown } from "lucide-react";

export default function Header() {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Ambil data user dari localStorage
  const userData = JSON.parse(localStorage.getItem("user")) || {};
  const userName = userData?.nama || "User";
  const userRole = userData?.peran || "Guest";

  // Fungsi Logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="flex justify-between items-center bg-white p-4 shadow-md">
      {/* 🔍 Search Bar */}
      <div className="flex items-center space-x-4 bg-gray-100 p-2 rounded-lg">
        <Search className="w-5 h-5 text-gray-500" />
        <input 
          type="text" 
          placeholder="Search..." 
          className="bg-transparent outline-none text-sm w-32 md:w-64"
        />
      </div>

      {/* 🔔 Notifikasi & User Profile */}
      <div className="flex items-center space-x-4 relative">
        <Bell className="w-6 h-6 cursor-pointer hover:text-gray-500" />

        {/* User Menu */}
        <div className="relative">
          <button 
            className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-200"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <User className="w-5 h-5 text-gray-600" />
            <span className="hidden md:block text-sm font-medium">{userName}</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2">
              <div className="px-4 py-2 text-sm text-gray-700 font-semibold">
                {userName} <br />
                <span className="text-gray-500">{userRole}</span>
              </div>
              <hr />
              <Link 
                to="/profile" 
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:underline"
              >
                Profil
              </Link>
              <hr />
              <button 
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-gray-100"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
