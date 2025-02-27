import { useState } from "react";
import { Link } from "react-router-dom";

export default function Sidebar() {
  const [isPortofolioOpen, setIsPortofolioOpen] = useState(false);

  return (
    <aside className="w-64 bg-gray-900 text-white p-4">
      <h1 className="text-2xl font-bold mb-6">SIMDOR</h1>
      <nav>
        <ul>
          <li className="mb-2 hover:text-gray-400">
            <Link to="/dashboard-cs">Dashboard CS</Link>
          </li>
          {/* <li className="mb-2 hover:text-gray-400">
            <Link to="/dashboard-keuangan">Dashboard Keuangan</Link>
          </li> */}
          <li>
            <button 
              onClick={() => setIsPortofolioOpen(!isPortofolioOpen)}
              className="w-full text-left p-2 hover:bg-gray-700 flex justify-between items-center"
            >
              Portofolio <span>{isPortofolioOpen ? "▲" : "▼"}</span>
            </button>
            {isPortofolioOpen && (
              <ul className="ml-4 text-sm">
                {["BATUBARA", "KSP", "PIK", "INDUSTRI", "HMPM", 
                    "AEBT", "MINERAL", "HALAL", "LABORATORIUM", 
                    "SERCO", "LSI"].map((item) => (
                  <li key={item} className="hover:text-gray-400">
                    <Link to={`/orders/${item.toLowerCase()}`}>{item}</Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
          <li className="mt-4 hover:text-gray-400">
            <Link to="/laporan">Laporan</Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
