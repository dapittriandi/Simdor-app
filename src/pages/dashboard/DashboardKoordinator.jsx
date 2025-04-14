import { useState, useEffect } from "react";
import { db } from "../../services/firebase";
import { collection, query, getDocs } from "firebase/firestore";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import {
  ChartBarIcon, // For Trends
  ClockIcon, // For In Process
  CheckCircleIcon, // For Completed
  ClipboardDocumentListIcon, // For Total Orders
  CurrencyDollarIcon, // For Financial data
  BuildingLibraryIcon, // For Portfolio
  TableCellsIcon, // For Status breakdown
  ExclamationTriangleIcon // For errors (if needed)
} from '@heroicons/react/24/outline'; // Use outline icons like in DashboardCS

// Function to capitalize first letter of each word
const capitalizeFirstLetter = (str) => {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const DashboardKoordinator = () => {
  const [summary, setSummary] = useState({
    totalOrders: 0,
    totalProforma: 0,
    statusCounts: {},
    orderTrends: [],
    revenueByPortofolio: {},
  });

  const getCurrentMonthYear = () => {
    const now = new Date();
    const month = now.getMonth(); // 0-11 (January = 0, December = 11)
    const year = now.getFullYear(); // Get full year (e.g., 2025)
    return { month, year };
  };

  const getLast12Months = () => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];
  
    const { month, year } = getCurrentMonthYear();
  
    const last12Months = [];
  
    for (let i = 0; i < 12; i++) {
      const currentMonth = (month - i + 12) % 12;
      const currentYear = currentMonth > month ? year - 1 : year;
      last12Months.unshift(`${months[currentMonth]} ${currentYear}`);
    }
  
    return last12Months;
  };
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); // State for fetch errors

  useEffect(() => {
    fetchOrderSummary();
  }, []);

  const fetchOrderSummary = async () => {
    setIsLoading(true);
    setError(null); // Reset error state
    try {
      const ordersRef = collection(db, "orders");
      const snapshot = await getDocs(query(ordersRef));

      let totalOrders = 0;
      let totalProforma = 0;

      const statusCounts = {
        Draft: 0, Diproses: 0, Selesai: 0, Closed: 0, Hold: 0, "Next Order": 0, Archecking: 0,
      };

      const orderTrends = {};
      const revenueByPortofolio = {
        Batubara: 0, Ksp: 0, Pik: 0, Industri: 0, Hmpm: 0, Aebt: 0, Mineral: 0,
        Halal: 0, Laboratorium: 0, Serco: 0, Lsi: 0,
      };

      const months = getLast12Months(); // Ambil 12 bulan terakhir

      snapshot.forEach((doc) => {
        const data = doc.data();
        totalOrders++;
        totalProforma += Number(data.nilaiProforma) || 0;
  
        // Hitung jumlah order berdasarkan status
        if (data.statusOrder && statusCounts.hasOwnProperty(data.statusOrder)) {
          statusCounts[data.statusOrder] += 1;
        }
  
        // Hitung jumlah order per bulan
        if (data.tanggalOrder?.seconds) {
          const orderDate = new Date(data.tanggalOrder.seconds * 1000);
          const monthYear = orderDate.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
  
          // Hanya simpan bulan yang ada dalam 12 bulan terakhir
          if (months.includes(monthYear)) {
            orderTrends[monthYear] = (orderTrends[monthYear] || 0) + 1;
          }
        }
  
        // Format portofolio agar cocok dengan daftar tetap
        if (data.portofolio) {
          const formattedPortofolio = capitalizeFirstLetter(data.portofolio.trim());
  
          if (revenueByPortofolio.hasOwnProperty(formattedPortofolio)) {
            revenueByPortofolio[formattedPortofolio] += Number(data.nilaiProforma) || 0;
          } else {
            console.warn(`⚠️ Portofolio tidak dikenal: ${formattedPortofolio}`);
          }
        }
      });

    // Sort months chronologically like in CS dashboard
    const orderTrendsArray = months.map((month) => ({
      bulan: month,
      jumlah: orderTrends[month] || 0, // Defaultkan ke 0 jika tidak ada data untuk bulan tersebut
    }));


      setSummary({
        totalOrders,
        totalProforma,
        statusCounts,
        orderTrends: orderTrendsArray,
        revenueByPortofolio,
      });
    } catch (err) {
      console.error("Gagal mengambil ringkasan order:", err);
      setError("Tidak dapat memuat data ringkasan. Silakan coba lagi nanti."); // Set error message
    } finally {
      setIsLoading(false);
    }
  };

  const statusList = ["Draft", "Diproses", "Selesai", "Closed", "Hold", "Next Order", "Archecking"];
  const portofolioList = ["Batubara", "Ksp", "Pik", "Industri", "Hmpm", "Aebt", "Mineral", "Halal", "Laboratorium", "Serco", "Lsi"];

  // Skeletons copied from CS dashboard for consistent loading states
  const SummaryCardSkeleton = () => (
    <div className="bg-white shadow-md rounded-lg p-5 border border-gray-200 animate-pulse">
      <div className="flex justify-between items-start mb-2">
        <div className="h-5 w-3/5 bg-gray-200 rounded"></div> {/* Skeleton Title */}
        <div className="h-6 w-6 bg-gray-200 rounded"></div> {/* Skeleton Icon */}
      </div>
      <div className="h-8 w-1/3 bg-gray-300 rounded mt-3"></div> {/* Skeleton Number */}
    </div>
  );

  const ChartSkeleton = () => (
    <div className="h-[300px] bg-gray-100 rounded animate-pulse flex items-center justify-center border border-gray-200">
      <p className="text-gray-400 text-sm">Memuat data grafik...</p>
    </div>
  );

  // Function to assign colors to status badges
  const getStatusClass = (status) => {
    switch (status) {
      case "Closed":
        return "px-2.5 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-200";
      case "Diproses":
        return "px-2.5 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800 border border-blue-200";
      case "Archecking":
         return "px-2.5 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "Draft":
        return "px-2.5 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-800 border border-gray-200";
      case "Selesai":
         return "px-2.5 py-0.5 text-xs font-medium rounded-full bg-teal-100 text-teal-800 border border-teal-200";
      case "Next Order":
         return "px-2.5 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-800 border border-purple-200";
      case "Hold":
         return "px-2.5 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-800 border border-orange-200";
      default:
        return "px-2.5 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800 border border-red-200";
    }
  };

  return (
    // Background page & padding to match CS dashboard
    <div className="bg-slate-100 min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto"> {/* Match max width with CS dashboard */}
        {/* Page title */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-2">
            <TableCellsIcon className="h-7 w-7 text-blue-600" />
            Dashboard Koordinator
          </h2>
          {/* Could add action buttons here if needed */}
        </div>

        {/* Display Error Message If Any */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center gap-3" role="alert">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600"/>
            <div>
              <p className="font-semibold">Gagal Memuat Data</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Summary Order Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {isLoading ? (
            <>
              <SummaryCardSkeleton />
              <SummaryCardSkeleton />
              <SummaryCardSkeleton />
            </>
          ) : (
            <>
              {/* Total Orders Card */}
              <div className="bg-white shadow-md rounded-lg p-5 border border-gray-200 transition hover:shadow-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base font-semibold text-gray-600">Total Order</h3>
                  <ClipboardDocumentListIcon className="h-6 w-6 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-blue-600 mt-1">{summary.totalOrders}</p>
              </div>
              
              {/* Total Proforma Value Card */}
              <div className="bg-white shadow-md rounded-lg p-5 border border-gray-200 transition hover:shadow-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base font-semibold text-gray-600">Total Nilai Proforma</h3>
                  <CurrencyDollarIcon className="h-6 w-6 text-emerald-500" />
                </div>
                <p className="text-3xl font-bold text-emerald-500 mt-1">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(summary.totalProforma)}
                </p>
              </div>
              
              {/* Status Summary Card */}
              <div className="bg-white shadow-md rounded-lg p-5 border border-gray-200 transition hover:shadow-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base font-semibold text-gray-600">Status Order</h3>
                  <TableCellsIcon className="h-6 w-6 text-indigo-500" />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {statusList.map((status) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className={getStatusClass(status)}>{status}</span>
                      <span className="font-semibold text-gray-700">{summary.statusCounts[status] || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Grid for Portfolio Revenue and Chart (similar to CS dashboard layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Portfolio Revenue (wider column) */}
          <div className="lg:col-span-3 bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <BuildingLibraryIcon className="h-6 w-6 text-gray-600"/>
                Pendapatan per Portofolio
              </h3>
            </div>
            <div className="p-5">
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {Array(6).fill(0).map((_, index) => (
                    <div key={index} className="h-20 bg-gray-100 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="mb-5 px-4 py-3 bg-blue-50 rounded-lg border border-blue-100 inline-block">
                    <p className="text-sm font-medium text-gray-600">Total Nilai Portofolio:</p>
                    <p className="text-xl font-bold text-emerald-600">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
                        Object.values(summary.revenueByPortofolio).reduce((sum, value) => sum + value, 0)
                      )}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {portofolioList.map((portofolio) => (
                      <div 
                        key={portofolio} 
                        className="p-4 bg-white rounded-lg border border-gray-200 transition hover:shadow-md"
                      >
                        <p className="text-sm font-medium text-gray-700">{portofolio.toUpperCase()}</p>
                        <p className="text-lg font-bold text-emerald-600 mt-1">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(summary.revenueByPortofolio[portofolio] || 0)}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Monthly Trend Chart (narrower column) */}
          <div className="lg:col-span-3 bg-white shadow-md rounded-lg border border-gray-200">
            <div className="p-5 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <ChartBarIcon className="h-6 w-6 text-gray-600"/>
                Tren Order per Bulan
              </h3>
            </div>
            <div className="p-5">
              {isLoading ? (
                <ChartSkeleton />
              ) : summary.orderTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={summary.orderTrends} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}> {/* Match margins */}
                    <defs>
                      <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#93C5FD" stopOpacity={0.4}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="bulan" fontSize={11} />
                    <YAxis 
                      fontSize={11}  
                      domain={['auto', 'auto']} // Biarkan YAxis otomatis menyesuaikan dengan data
                      tickFormatter={(value) => value.toLocaleString()} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px' }}
                      labelStyle={{ fontWeight: 'bold', color: '#333' }}
                    />
                    <Legend wrapperStyle={{fontSize: "12px"}} />
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <Bar dataKey="jumlah" name="Jumlah Order" fill="url(#colorUv)" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-center text-gray-500">
                  Tidak ada data tren untuk ditampilkan.
                </div>
              )}
            </div>
          </div>
        </div> {/* End Grid for Portfolio & Chart */}

      </div> {/* End max-w-7xl */}
    </div> // End bg-slate-100
  );
};

export default DashboardKoordinator;