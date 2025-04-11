import { useState, useEffect } from "react";
import { User, Mail, Shield, Folder, Loader, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
    fetchUserData();
    return () => setMounted(false);
  }, []);

  const fetchUserData = async () => {
    try {
      const userFromStorage = localStorage.getItem("user");
      if (!userFromStorage) {
        throw new Error("User data tidak ditemukan.");
      }
      const parsedUser = JSON.parse(userFromStorage);
     
      // Cek apakah parsedUser valid dan memiliki properti yang dibutuhkan
      if (!parsedUser || typeof parsedUser !== "object") {
        throw new Error("User data tidak valid.");
      }
      
      // Pastikan properti tidak undefined sebelum digunakan
      const role = parsedUser?.peran || "Unknown Role";
      const bidang = parsedUser?.bidang || "Unknown Portofolio";
      
      setUserData({
        ...parsedUser,
        peran: role,
        bidang: bidang,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // Function to get role-based color
  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case "customer service":
        return "bg-blue-600";
      case "admin keuangan":
        return "bg-green-600";
      case "admin portofolio":
        return "bg-purple-600";
      case "koordinator":
        return "bg-orange-600";
      default:
        return "bg-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <Loader className="w-8 h-8 mx-auto text-blue-600 animate-spin" />
          <p className="mt-3 text-gray-600 text-sm">Memuat profil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg shadow-sm max-w-md mx-auto mt-6">
        <p className="text-sm flex items-center">
          <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
          </svg>
          {error}
        </p>
      </div>
    );
  }

  return (
    <div 
      className={`w-full max-w-md mx-auto transition-all duration-700 transform ${
        mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Blue accent top bar with gradient animation */}
        <div className="h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 animate-gradient-x"></div>
        
        {/* Header section with role badge */}
        <div className="relative bg-gradient-to-b from-blue-800 to-blue-900 px-4 py-6 text-center text-white">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-300 rounded-full transform translate-x-1/2 translate-y-1/2"></div>
          </div>
          
          <div className="relative z-10">
            {/* Profile Avatar - Placeholder with user's initial */}
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-blue-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg border-2 border-white">
              {userData.nama ? userData.nama.charAt(0).toUpperCase() : "U"}
            </div>
            
            <h1 className="text-xl font-bold tracking-wide bg-clip-text text-white mb-1">
              {userData.nama || "Pengguna SIMDOR"}
            </h1>
            
            {/* Role badge */}
            <div className="inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 opacity-90 shadow-sm text-white capitalize" 
              style={{backgroundColor: getRoleColor(userData.peran).replace('bg-', '')}}
            >
              {userData.peran}
            </div>
          </div>
        </div>
        
        {/* Profile information */}
        <div className="px-4 py-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Informasi Pengguna</h2>
          
          <div className="space-y-2">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg transition-all hover:bg-blue-50 shadow-sm">
              <User className="w-4 h-4 text-blue-600 mr-3" />
              <div>
                <p className="text-xs text-gray-500">Nama Lengkap</p>
                <p className="font-medium text-sm text-gray-800">{userData.nama || "-"}</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-gray-50 rounded-lg transition-all hover:bg-blue-50 shadow-sm">
              <Mail className="w-4 h-4 text-blue-600 mr-3" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium text-sm text-gray-800">{userData.email || "-"}</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-gray-50 rounded-lg transition-all hover:bg-blue-50 shadow-sm">
              <Shield className="w-4 h-4 text-blue-600 mr-3" />
              <div>
                <p className="text-xs text-gray-500">Peran</p>
                <p className="font-medium text-sm text-gray-800 capitalize">{userData.peran}</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-gray-50 rounded-lg transition-all hover:bg-blue-50 shadow-sm">
              <Folder className="w-4 h-4 text-blue-600 mr-3" />
              <div>
              <p className="text-xs text-gray-500">
                {userData.peran?.toLowerCase() === "admin portofolio" ? "Portofolio" : "Bidang"}
              </p>
              <p className="font-medium text-sm text-gray-800">
                {userData.bidang || "-"}
              </p>
              </div>
            </div>
            
            {/* Back button */}
            <button 
              onClick={handleGoBack}
              className="w-full mt-4 flex items-center justify-center p-3 text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 rounded-lg transition-all shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="font-medium">Kembali</span>
            </button>
          </div>
        </div>
        
        {/* Footer with blue accent */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} SUCOFINDO. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;