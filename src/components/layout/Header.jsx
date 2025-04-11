import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Bell, ChevronDown, LogOut, User } from "lucide-react";

export default function Header() {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState(2); // Sample notification count
  const userData = JSON.parse(localStorage.getItem("user")) || {};
  const [greeting, setGreeting] = useState("");
  
  useEffect(() => {
    setMounted(true);
    updateGreeting();
    // Update greeting every minute
    const intervalId = setInterval(updateGreeting, 60000);
    
    return () => {
      setMounted(false);
      clearInterval(intervalId);
    };
  }, []);
  
  // Function to determine the appropriate greeting based on time of day
  const updateGreeting = () => {
    const currentHour = new Date().getHours();
    
    if (currentHour >= 5 && currentHour < 12) {
      setGreeting("Selamat Pagi");
    } else if (currentHour >= 12 && currentHour < 15) {
      setGreeting("Selamat Siang");
    } else if (currentHour >= 15 && currentHour < 19) {
      setGreeting("Selamat Sore");
    } else {
      setGreeting("Selamat Malam");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (isDropdownOpen && !event.target.closest(".user-menu")) {
        setIsDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  return (
    <header className={`bg-white z-[9999] relative transition-all duration-500 ${
      mounted ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"
    }`}>
      {/* Top accent bar to match with sidebar */}
      <div className="h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 animate-gradient-x"></div>
      
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left side - Welcome message */}
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white p-2 rounded-lg shadow-sm mr-3">
            <h2 className="text-sm font-medium">Sistem Monitoring Data Order</h2>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{greeting}, {userData.nama || "User"}</h2>
            <p className="text-xs text-gray-500">
              {new Date().toLocaleDateString('id-ID', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>

        {/* Right side - Notifications & User Profile */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button className="p-2 text-gray-600 hover:text-blue-600 bg-gray-100 hover:bg-blue-50 rounded-full transition-all relative">
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full transform translate-x-1 -translate-y-1">
                  {notifications}
                </span>
              )}
            </button>
          </div>

          {/* User Profile Dropdown */}
          <div className="relative user-menu">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-1 md:space-x-2 rounded-lg py-1 pl-1 pr-2 md:pl-2 md:pr-3 border border-gray-200 hover:border-blue-400 bg-gray-50 hover:bg-blue-50 transition-all shadow-sm"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full flex items-center justify-center text-white font-medium shadow-sm">
                {userData.nama ? userData.nama.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
                  {userData.nama || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate max-w-[120px]">
                  {userData.peran || "Guest"}
                </p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50 animate-fade-in">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-800">{userData.nama || "User"}</p>
                  <p className="text-xs text-gray-500">{userData.email || ""}</p>
                  <div className="mt-2 px-2 py-1 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-xs text-blue-700">{userData.peran || "Guest"}</p>
                  </div>
                </div>
                <Link
                  to="/profile"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <User className="w-4 h-4 mr-2 text-gray-500" />
                  Profil Pengguna
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Bottom decorative border */}
      <div className="relative">
        {/* Subtle shadow above the border */}
        <div className="absolute bottom-0 w-full h-1 shadow-md"></div>
        
        {/* Attractive blue gradient border */}
        <div className="h-1 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 opacity-80"></div>
        
        {/* Decorative dotted pattern overlay */}
        <div className="absolute bottom-0 w-full h-1 bg-repeat-x" 
             style={{ 
               backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)', 
               backgroundSize: '6px 6px' 
             }}>
        </div>
      </div>
    </header>
  );
}