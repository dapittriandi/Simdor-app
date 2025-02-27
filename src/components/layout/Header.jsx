import { useNavigate } from "react-router-dom";
import { Search, Bell, User, LogOut } from "lucide-react";

export default function Header() {
  const navigate = useNavigate(); // Hook navigasi

  const handleLogout = () => {
    localStorage.removeItem("token"); // Hapus token atau session
    navigate("/"); // Redirect ke halaman login
  };

  return (
    <div className="flex justify-between items-center bg-white p-4 shadow">
      {/* Search Bar */}
      <div className="flex items-center space-x-4">
        <Search className="w-5 h-5" />
        <input 
          type="text" 
          placeholder="Search" 
          className="border rounded p-2"
        />
      </div>

      {/* Notifikasi & User Menu */}
      <div className="flex items-center space-x-4">
        <Bell className="w-5 h-5 cursor-pointer hover:text-gray-500" />
        <User className="w-5 h-5 cursor-pointer hover:text-gray-500" />
        <LogOut 
          className="w-5 h-5 cursor-pointer text-red-600 hover:text-red-800" 
          onClick={handleLogout} 
        />
      </div>
    </div>
  );
}
