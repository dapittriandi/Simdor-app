import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut, LayoutDashboard, FileText, BarChart2, Folder, ChevronDown, ChevronUp } from "lucide-react";

export default function Sidebar() {
  const [user, setUser] = useState(null);
  const [isPortofolioOpen, setIsPortofolioOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMounted(true);
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
    return () => setMounted(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  if (!user) {
    return null;
  }

  const isActiveLink = (path) => {
    return location.pathname === path ? "bg-blue-700 text-white" : "";
  };

  const portofolioList = ["BATUBARA", "KSP", "PIK", "INDUSTRI", "HMPM", "AEBT", "MINERAL", "HALAL", "LABORATORIUM", "SERCO", "LSI"];

  return (
    <aside 
      className={`w-64 bg-gradient-to-b from-blue-800 to-blue-900 text-white shadow-xl flex flex-col h-screen transition-all duration-500 ease-in-out ${
        mounted ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
      }`}
    >
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 animate-gradient-x"></div>
      
      {/* Main content area with scrolling */}
      <div className="flex flex-col overflow-hidden h-full">
        {/* Header/Logo - Fixed */}
        <div className="p-6 border-b border-blue-700 flex-shrink-0">
          <h1 className="text-2xl font-bold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-blue-100 to-white">
            SIMDOR
          </h1>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {/* Dashboard Link based on role */}
            {user.peran === "customer service" && (
              <li>
                <Link
                  to="/dashboard-cs"
                  className={`flex items-center px-4 py-3 rounded-lg transition-all hover:bg-blue-700 group ${isActiveLink("/dashboard-cs")}`}
                >
                  <LayoutDashboard className="w-5 h-5 mr-3 text-blue-300 group-hover:text-white" />
                  <span>Dashboard CS</span>
                </Link>
              </li>
            )}

            {user.peran === "admin keuangan" && (
              <li>
                <Link
                  to="/dashboard-keuangan"
                  className={`flex items-center px-4 py-3 rounded-lg transition-all hover:bg-blue-700 group ${isActiveLink("/dashboard-keuangan")}`}
                >
                  <LayoutDashboard className="w-5 h-5 mr-3 text-blue-300 group-hover:text-white" />
                  <span>Dashboard Keuangan</span>
                </Link>
              </li>
            )}

            {user.peran === "admin portofolio" && (
              <li>
                <Link
                  to="/dashboard-portofolio"
                  className={`flex items-center px-4 py-3 rounded-lg transition-all hover:bg-blue-700 group ${isActiveLink("/dashboard-portofolio")}`}
                >
                  <LayoutDashboard className="w-5 h-5 mr-3 text-blue-300 group-hover:text-white" />
                  <span>Dashboard Portofolio</span>
                </Link>
              </li>
            )}

            {user.peran === "koordinator" && (
              <li>
                <Link
                  to="/dashboard-koordinator"
                  className={`flex items-center px-4 py-3 rounded-lg transition-all hover:bg-blue-700 group ${isActiveLink("/dashboard-koordinator")}`}
                >
                  <LayoutDashboard className="w-5 h-5 mr-3 text-blue-300 group-hover:text-white" />
                  <span>Dashboard Koordinator</span>
                </Link>
              </li>
            )}

            {/* Portofolio / Orders Section */}
            <li className="pt-2">
              <button
                onClick={() => setIsPortofolioOpen(!isPortofolioOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all hover:bg-blue-700 ${
                  isPortofolioOpen ? "bg-blue-700" : ""
                }`}
              >
                <div className="flex items-center">
                  <Folder className="w-5 h-5 mr-3 text-blue-300" />
                  <span>{user.peran === "admin portofolio" ? "Orders" : "Portofolio"}</span>
                </div>
                {isPortofolioOpen ? (
                  <ChevronUp className="w-4 h-4 text-blue-300" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-blue-300" />
                )}
              </button>

              {/* Dropdown Content with Scrollbar */}
              {isPortofolioOpen && (
                <div className="mt-1 ml-4 pl-6 border-l border-blue-700 space-y-1 overflow-y-auto max-h-48 scrollbar-thin scrollbar-thumb-blue-700 scrollbar-track-transparent">
                  {user.peran === "admin portofolio" ? (
                    <Link
                      to={`/orders/${user.bidang.toLowerCase()}`}
                      className="block py-2 px-3 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                    >
                      {user.bidang}
                    </Link>
                  ) : (
                    portofolioList.map((item) => (
                      <Link
                        key={item}
                        to={`/orders/${item.toLowerCase()}`}
                        className="block py-2 px-3 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                      >
                        {item}
                      </Link>
                    ))
                  )}
                </div>
              )}
            </li>

            {/* Dokumen - Only for Keuangan & Admin Portofolio */}
            {(user.peran === "admin keuangan" || user.peran === "admin portofolio") && (
              <li className="pt-2">
                <Link
                  to="/documents"
                  className={`flex items-center px-4 py-3 rounded-lg transition-all hover:bg-blue-700 group ${isActiveLink("/documents")}`}
                >
                  <FileText className="w-5 h-5 mr-3 text-blue-300 group-hover:text-white" />
                  <span>Dokumen</span>
                </Link>
              </li>
            )}

            {/* Laporan - All Users */}
            <li className="pt-2">
              <Link
                to="/laporan"
                className={`flex items-center px-4 py-3 rounded-lg transition-all hover:bg-blue-700 group ${isActiveLink("/laporan")}`}
              >
                <BarChart2 className="w-5 h-5 mr-3 text-blue-300 group-hover:text-white" />
                <span>Laporan</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* User Info & Logout - Fixed at bottom */}
      <div className="p-4 border-t border-blue-700 mt-auto flex-shrink-0">
        <div className="mb-4 px-4 py-3 bg-blue-700 bg-opacity-40 rounded-lg">
          <div className="text-sm font-medium text-blue-200">{user.peran}</div>
          <div className="text-white truncate">{user.email}</div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 p-3 rounded-lg flex items-center justify-center transition-all transform hover:scale-[1.01] shadow-lg"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Logout
        </button>
      </div>
    </aside>
  );
}