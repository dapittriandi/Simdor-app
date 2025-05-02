import { useState, useEffect } from "react";
import { auth, db } from "../../services/firebase";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import logo from '../../assets/logo/logo-sci.jpeg';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [mounted, setMounted] = useState(false);
  
  // State baru untuk multiple roles
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [userRoles, setUserRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const lowerEmail = email.toLowerCase();
      const userCredential = await signInWithEmailAndPassword(auth, lowerEmail, password);
      const user = userCredential.user;
      
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", lowerEmail));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Mengecek peran pengguna (bisa multiple)
        let roles = [];
        
        // Iterasi melalui semua dokumen yang cocok dengan email ini
        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          // Tambahkan docId ke userData untuk referensi
          roles.push({
            id: doc.id,
            ...userData
          });
        });
        
        if (roles.length > 1) {
          // Jika memiliki lebih dari satu peran, tampilkan modal
          setUserRoles(roles);
          setShowRoleModal(true);
          setIsLoading(false);
        } else if (roles.length === 1) {
          // Jika hanya memiliki satu peran, lanjutkan login seperti biasa
          const userData = roles[0];
          navigateBasedOnRole(userData);
        } else {
          setError("Data pengguna tidak ditemukan.");
          setIsLoading(false);
        }
      } else {
        setError("Data pengguna tidak ditemukan di Firestore.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Login gagal. Periksa email dan password.");
      setIsLoading(false);
    }
  };

  const navigateBasedOnRole = (userData) => {
    const { peran } = userData;
    
    localStorage.setItem("user", JSON.stringify(userData));
    
    if (peran === "customer service") {
      navigate("/dashboard-cs");
    } else if (peran === "admin keuangan") {
      navigate("/dashboard-keuangan");
    } else if (peran === "admin portofolio") {
      navigate("/dashboard-portofolio");
    } else if (peran === "koordinator") {
      navigate("/dashboard-koordinator");
    } else {
      setError("Peran tidak dikenali.");
    }
  };

  const handleRoleSelect = (selectedUserData) => {
    setShowRoleModal(false);
    navigateBasedOnRole(selectedUserData);
  };

  const handleForgotPassword = () => {
    setShowForgotModal(true);
    setResetEmail(email);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetMessage("");
    setError("");
    setIsResetting(true);

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage("Email reset password telah dikirim. Silakan periksa inbox Anda.");
      setTimeout(() => {
        setShowForgotModal(false);
        setResetMessage("");
      }, 5000);
    } catch (err) {
      setError("Gagal mengirim email reset password. Pastikan email terdaftar.");
    } finally {
      setIsResetting(false);
    }
  };

  const handleModalOutsideClick = (e) => {
    if (e.target.id === "modal-backdrop") {
      setShowForgotModal(false);
      setError("");
      setResetMessage("");
    }
  };

  const handleRoleModalOutsideClick = (e) => {
    if (e.target.id === "role-modal-backdrop") {
      // Biarkan user tetap memilih peran, jadi tidak tutup modal
      // Modal ini harus direspon
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-sky-200 p-4 overflow-hidden">
      {/* Enhanced animated background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-64 bg-blue-600 opacity-10 rounded-br-full transform -translate-x-1/4 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 opacity-10 rounded-full transform translate-x-1/4 translate-y-1/4"></div>
        <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-blue-400 opacity-5 rounded-full animate-pulse"></div>
        <div className="absolute top-2/3 left-2/3 w-40 h-40 bg-blue-300 opacity-10 rounded-full animate-pulse"></div>
        <div className="absolute top-1/4 right-1/4 w-24 h-24 bg-blue-400 opacity-20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/3 w-16 h-16 bg-blue-500 opacity-5 rounded-full animate-pulse"></div>
      </div>
      
      <div 
        className={`w-full max-w-md relative z-10 transition-all duration-700 transform ${
          mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Blue accent top bar with gradient animation */}
          <div className="h-2 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 animate-gradient-x"></div>
          
          <div className="p-8">
            {/* Logo with subtle entrance animation */}
            <div className="flex justify-center mb-6">
              <img 
                src={logo} 
                alt="Logo-sci" 
                className="h-20 transform transition-all duration-700 hover:scale-105"
              />
            </div>
            
            {/* Enhanced title with modern styling */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-800">Monitoring Data Order</h1>
              <p className="text-gray-600 mt-1">Masuk ke akun Anda</p>
              <div className="mt-3 mx-auto w-16 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
            </div>
            
            {/* Form with enhanced styling and animations */}
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="px-4 py-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg shadow-sm animate-fade-in">
                  <p className="text-sm flex items-center">
                    <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                    </svg>
                    {error}
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="Masukkan email Anda"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all focus:outline-none"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password Anda"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-500 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="text-right">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline focus:outline-none transition-colors"
                >
                  Lupa password?
                </button>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium rounded-lg transition-all transform hover:scale-[1.01] shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 disabled:opacity-70 relative overflow-hidden group"
              >
                <span className="absolute top-0 left-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity"></span>
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memproses...
                  </span>
                ) : "Login"}
              </button>
            </form>
          </div>
          
          {/* Footer with blue accent */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-600">
              © {new Date().getFullYear()} PT. SUCOFINDO CABANG JAMBI. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Forgot Password Modal */}
      {showForgotModal && (
        <div 
          id="modal-backdrop"
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
          onClick={handleModalOutsideClick}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 transform transition-all duration-300 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold text-gray-800">Reset Password</h3>
              <button 
                onClick={() => {
                  setShowForgotModal(false);
                  setError("");
                  setResetMessage("");
                }}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
              </button>
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg shadow-sm animate-fade-in">
                <p className="text-sm">{error}</p>
              </div>
            )}

            {resetMessage && (
              <div className="mb-4 px-4 py-3 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg shadow-sm animate-fade-in">
                <p className="text-sm flex items-center">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  {resetMessage}
                </p>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <input
                    id="resetEmail"
                    type="email"
                    placeholder="Masukkan email Anda"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="pl-10 w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all focus:outline-none"
                    required
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Masukkan email yang terdaftar untuk menerima instruksi reset password.
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setError("");
                    setResetMessage("");
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {isResetting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Memproses...
                    </span>
                  ) : "Kirim Link Reset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Selection Modal */}
      {showRoleModal && (
        <div 
          id="role-modal-backdrop"
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
          onClick={(e) => {
            if (e.target.id === "role-modal-backdrop") {
              setShowRoleModal(false);
            }
          }}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 transform transition-all duration-300 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Pilih Portofolio</h3>
              <button 
                onClick={() => setShowRoleModal(false)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none transition-colors p-1 rounded-full hover:bg-gray-100"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
              </button>
            </div>

            <div className="mb-5">
              <p className="text-gray-600 text-base">
                Anda memiliki akses ke beberapa portofolio. Silakan pilih salah satu untuk melanjutkan:
              </p>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 mb-5">
              {userRoles.map((role, index) => {
                // Menentukan ikon dan warna berdasarkan peran
                let icon, bgColor, hoverBgColor, borderColor;
                
                switch(role.peran) {
                  case "customer service":
                    icon = (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                      </svg>
                    );
                    bgColor = "bg-blue-50";
                    hoverBgColor = "hover:bg-blue-100";
                    borderColor = "border-blue-200";
                    break;
                  case "admin keuangan":
                    icon = (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    );
                    bgColor = "bg-green-50";
                    hoverBgColor = "hover:bg-green-100";
                    borderColor = "border-green-200";
                    break;
                  case "admin portofolio":
                    icon = (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                        <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                      </svg>
                    );
                    bgColor = "bg-purple-50";
                    hoverBgColor = "hover:bg-purple-100";
                    borderColor = "border-purple-200";
                    break;
                  case "koordinator":
                    icon = (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                      </svg>
                    );
                    bgColor = "bg-yellow-50";
                    hoverBgColor = "hover:bg-yellow-100";
                    borderColor = "border-yellow-200";
                    break;
                  default:
                    icon = (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    );
                    bgColor = "bg-gray-50";
                    hoverBgColor = "hover:bg-gray-100";
                    borderColor = "border-gray-200";
                }
                
                // Tambahkan informasi detail tambahan jika ada
                let additionalInfo = "";
                if (role.portofolio) {
                  additionalInfo = `${role.portofolio}`;
                } else if (role.bidang) {
                  additionalInfo = `${role.bidang.toUpperCase()}`;
                }
                
                return (
                  <button
                    key={index}
                    onClick={() => handleRoleSelect(role)}
                    className={`w-full flex items-center p-4 rounded-lg border ${borderColor} ${bgColor} ${hoverBgColor} transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transform hover:scale-[1.01] hover:shadow-md`}
                  >
                    <div className="flex-shrink-0 p-2 rounded-full mr-4 text-blue-600 bg-white shadow-sm">
                      {icon}
                    </div>
                    <div className="text-left flex-grow">
                      <div className="font-semibold text-lg capitalize">{role.peran}</div>
                      {additionalInfo && (
                        <div className="text-gray-600 mt-1">{additionalInfo}</div>
                      )}
                    </div>
                    <div className="ml-2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </div>
                  </button>
                );
              })}
            </div>
            
            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <button
                onClick={() => setShowRoleModal(false)}
                className="px-4 py-2 text-gray-600 font-medium rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Batal
              </button>
              <p className="text-sm text-gray-500">
                Pilih portofolio yang sesuai
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
                    