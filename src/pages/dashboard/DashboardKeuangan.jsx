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
  ExclamationTriangleIcon // For errors (if needed)
} from '@heroicons/react/24/outline'; // Use outline icons like in DashboardCS
import { useNavigate } from "react-router-dom";

// Function to capitalize first letter of each word
const capitalizeFirstLetter = (str) => {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

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

const DashboardKeuangan = () => {
  const [summary, setSummary] = useState({
    totalOrders: 0,
    inProcessOrders: 0,
    completedOrders: 0,
    totalInvoice: 0,
    totalProforma: 0,
    revenueByPortofolio: {},
    orderTrends: [],
  });
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); // State for fetch errors
  const userData = JSON.parse(localStorage.getItem("user")) || {};
  const userPeran = userData.peran || "";
  // const userBidang = userData.bidang || "";

  useEffect(() => {
    if (!userPeran) {
      alert("Anda tidak memiliki akses!");
      navigate("/");
      return;
    }

    if (userPeran !== "admin keuangan") {
      alert("Anda tidak memiliki akses!");
      navigate("/");
      return;
    }
    fetchOrderSummary();
  }, [userPeran]);

 // Fungsi untuk memformat portofolio menjadi huruf kapital
  const formatPortofolio = (portofolio) => {
    if (!portofolio) return '';
    return portofolio.trim().toUpperCase(); // Mengubah semua huruf menjadi kapital
  };

  const formatCurrencyShort = (value) => {
    if (value >= 1_000_000_000_000) {
      return `${(value / 1_000_000_000_000).toFixed(1)} Triliun`;
    } else if (value >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(1)} Miliar`;
    } else if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)} Juta`;
    } else if (value >= 1_000) {
      return `${(value / 1_000).toFixed(1)} Ribu`;
    } else {
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
    }
  };
  
  

  const fetchOrderSummary = async () => {
    setIsLoading(true);
    setError(null); // Reset error state
    try {
      const ordersRef = collection(db, "orders");
      const snapshot = await getDocs(query(ordersRef));
  
      let totalOrders = snapshot.size;
      let totalInvoice = 0;
      let totalProforma = 0;
      let inProcessOrders = 0;
      let completedOrders = 0;
      let revenueByPortofolio = {
        BATUBARA: 0, KSP: 0, PIK: 0, INDUSTRI: 0, HMPM: 0, AEBT: 0, MINERAL: 0,
        HALAL: 0, LABORATORIUM: 0, SERCO: 0, LSI: 0,
      };
      const orderTrends = {};
      const months = getLast12Months(); // Ambil 12 bulan terakhir
  
      snapshot.forEach((doc) => {
        const data = doc.data();
  
        // Hitung total proforma (nilai dari data.nilaiProforma)
        totalInvoice += isNaN(Number(data.nilaiInvoice)) ? 0 : Number(data.nilaiInvoice);
        totalProforma += isNaN(Number(data.nilaiProforma)) ? 0 : Number(data.nilaiProforma);
  
        // Hitung jumlah order berdasarkan status
        if (data.statusOrder === "Penerbitan Proforma") inProcessOrders++;
        if (data.statusOrder === "Selesai") completedOrders++;
  
        // Hitung jumlah order per bulan berdasarkan tanggalOrder
        if (data.tanggalOrder?.seconds) {
          const orderDate = new Date(data.tanggalOrder.seconds * 1000);
          const monthYear = orderDate.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
  
          // Menghitung trend berdasarkan bulan
          if (months.includes(monthYear)) {
            orderTrends[monthYear] = (orderTrends[monthYear] || 0) + 1;
          }
        }
        
        
        if (data.portofolio) {
          const formattedPortofolio = formatPortofolio(data.portofolio); // Format portofolio menjadi huruf kapital
          // console.log("Formatted Portofolio:", formattedPortofolio); // Debug log untuk memastikan portofolio diformat dengan benar
          if (revenueByPortofolio.hasOwnProperty(formattedPortofolio)) {
            revenueByPortofolio[formattedPortofolio] += isNaN(Number(data.nilaiInvoice)) ? 0 : Number(data.nilaiInvoice);
          } else {
            // Menangani portofolio yang tidak dikenal
            console.warn(`⚠️ Portofolio tidak dikenal: ${formattedPortofolio}`);
          }
          }
      });
  
      // Mengonversi orderTrends ke array yang siap untuk chart
      const orderTrendsArray = months.map((month) => ({
        bulan: month,
        jumlah: orderTrends[month] || 0, // Isi dengan 0 jika bulan tidak ada order
      }));
  
      setSummary({
        totalOrders,
        totalInvoice,
        totalProforma,
        inProcessOrders,
        completedOrders,
        revenueByPortofolio,
        orderTrends: orderTrendsArray,
      });
  
    } catch (err) {
      console.error("Error fetching order summary:", err);
      setError("Tidak dapat memuat data ringkasan. Silakan coba lagi nanti.");
    } finally {
      setIsLoading(false);
    }
  };
  

  const portofolioList = ["BATUBARA", "KSP", "PIK", "INDUSTRI", "HMPM", "AEBT", "MINERAL", "HALAL", "LABORATORIUM", "SERCO", "LSI"];
  
  // Calculate total portfolio value
  const totalPortfolioValue = Object.values(summary.revenueByPortofolio).reduce((sum, value) => sum + value, 0);

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

  return (
    // Background page & padding to match CS dashboard
    <div className="bg-slate-100 min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto"> {/* Match max width with CS dashboard */}
        {/* Page title */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-2">
            <BuildingLibraryIcon className="h-7 w-7 text-blue-600" />
            Dashboard Keuangan
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {isLoading ? (
            <>
              <SummaryCardSkeleton />
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
              
              {/* In Process Orders Card */}
              <div className="bg-white shadow-md rounded-lg p-5 border border-gray-200 transition hover:shadow-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base font-semibold text-gray-600">Proses Invoice dari Order yang Sudah terbit Proforma</h3>
                  <ClockIcon className="h-6 w-6 text-orange-500" />
                </div>
                <p className="text-3xl font-bold text-orange-500 mt-1">{summary.inProcessOrders}</p>
                <p className="text-xs text-gray-500 mt-1">Status: Penerbitan Proforma</p>
              </div>
              
              {/* Completed Orders Card */}
              <div className="bg-white shadow-md rounded-lg p-5 border border-gray-200 transition hover:shadow-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base font-semibold text-gray-600">Order Selesai</h3>
                  <CheckCircleIcon className="h-6 w-6 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-green-500 mt-1">{summary.completedOrders}</p>
                <p className="text-xs text-gray-500 mt-1">Status: Selesai</p>
              </div>
              
              {/* Total Proforma Value Card */}
              <div className="bg-white shadow-md rounded-lg p-5 border border-gray-200 transition hover:shadow-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base font-semibold text-gray-600">Total Proforma (PAD)</h3>
                  <CurrencyDollarIcon className="h-6 w-6 text-emerald-500" />
                </div>
                <p className="text-3xl font-bold text-emerald-500 mt-1">
                {formatCurrencyShort(summary.totalProforma)}
                </p>
              </div>
              {/* Total Proforma Value Card */}
              <div className="bg-white shadow-md rounded-lg p-5 border border-gray-200 transition hover:shadow-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base font-semibold text-gray-600">Total Invoice (Fee)</h3>
                  <CurrencyDollarIcon className="h-6 w-6 text-emerald-500" />
                </div>
                <p className="text-3xl font-bold text-emerald-500 mt-1">
                {formatCurrencyShort(summary.totalInvoice)}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Grid for Portfolio Revenue and Chart (similar to CS dashboard layout) */}
        <div className="grid grid-colzs-1 lg:grid-cols-2 gap-8">
          {/* Portfolio Revenue (wider column) */}
          <div className="lg:col-span-2 bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <CurrencyDollarIcon className="h-6 w-6 text-gray-600"/>
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
                    <p className="text-xl font-bold text-emerald-600 text-sm md:text-xl break-words">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalPortfolioValue)}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {portofolioList.map((portofolio) => (
                      <div 
                        key={portofolio} 
                        className="p-4 bg-white rounded-lg border border-gray-200 transition hover:shadow-md"
                      >
                        <p className="text-sm font-medium text-gray-700">{portofolio.toUpperCase()}</p>
                        <p className="text-lg font-bold text-emerald-600 mt-1 text-sm md:text-xl break-words">
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
          <div className="lg:col-span-2 bg-white shadow-md rounded-lg border border-gray-200">
            <div className="p-5 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <ChartBarIcon className="h-6 w-6 text-gray-600"/>
                Tren Order per Bulan
              </h3>
              <h4 className="text-lg font-regular text-gray-800 flex items-center gap-2" >
                    Tren order di tampilkan 12 bulan dari orderan terakhir
                  </h4>
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

export default DashboardKeuangan;