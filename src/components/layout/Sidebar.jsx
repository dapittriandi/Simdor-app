import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

export default function Sidebar() {
  const [user, setUser] = useState(null);
  const [isPortofolioOpen, setIsPortofolioOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/"); // Redirect ke halaman login
  };

  if (!user) {
    return null; // Mencegah UI berkedip saat loading
  }

  return (
    <aside className="w-64 bg-gray-900 text-white p-4 min-h-screen flex flex-col justify-between">
      <div>
        <h1 className="text-2xl font-bold mb-6">SIMDOR</h1>
        <nav>
          <ul>
            {/* Dashboard berdasarkan peran */}
            {user.peran === "customer service" && (
              <li className="mb-2 hover:text-gray-400">
                <Link to="/dashboard-cs">Dashboard CS</Link>
              </li>
            )}
            {user.peran === "admin keuangan" && (
              <li className="mb-2 hover:text-gray-400">
                <Link to="/dashboard-keuangan">Dashboard Keuangan</Link>
              </li>
            )}
            {user.peran === "admin portofolio" && (
              <li className="mb-2 hover:text-gray-400">
                <Link to={`/dashboard-portofolio`}>Dashboard Portofolio</Link>
              </li>
            )}
            {user.peran === "koordinator" && (
              <li className="mb-2 hover:text-gray-400">
                <Link to={`/dashboard-koordinator`}>Dashboard Koordinator</Link>
              </li>
            )}

            {/* Portofolio / Orders */}
            <li className="mt-2">
              <button
                onClick={() => setIsPortofolioOpen(!isPortofolioOpen)}
                className="w-full text-left p-2 hover:bg-gray-700 flex justify-between items-center"
              >
                {user.peran === "admin portofolio" ? "Orders" : "Portofolio"}
                <span>{isPortofolioOpen ? "▲" : "▼"}</span>
              </button>
              {isPortofolioOpen && (
                <ul className="ml-4 text-sm">
                  {user.peran === "admin portofolio" ? (
                    <li className="hover:text-gray-400">
                      <Link to={`/orders/${user.bidang.toLowerCase()}`}>{user.bidang}</Link>
                    </li>
                  ) : (
                    ["BATUBARA", "KSP", "PIK", "INDUSTRI", "HMPM", "AEBT", "MINERAL", "HALAL", "LABORATORIUM", "SERCO", "LSI"].map((item) => (
                      <li key={item} className="hover:text-gray-400">
                        <Link to={`/orders/${item.toLowerCase()}`}>{item}</Link>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </li>

            {/* Dokumen - Hanya untuk Keuangan & Admin Portofolio */}
            {(user.peran === "admin keuangan" || user.peran === "admin portofolio") && (
              <li className="mt-4 hover:text-gray-400">
                <Link to="/documents">Dokumen</Link>
              </li>
            )}

            {/* Laporan - Semua User Bisa Akses */}
            <li className="mt-4 hover:text-gray-400">
              <Link to="/laporan">Laporan</Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Logout */}
      <button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-700 p-2 rounded flex items-center justify-center">
        <LogOut className="w-5 h-5 mr-2" />
        Logout
      </button>
    </aside>
  );
}
