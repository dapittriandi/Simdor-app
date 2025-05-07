import { useState, useEffect } from "react";
import { db } from "../../services/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import {
  ChartBarIcon, // For Trends
  ClockIcon, // For In Process
  CheckCircleIcon, // For Completed
  ClipboardDocumentListIcon, // For Total Orders
  CurrencyDollarIcon, // For Financial data
  ExclamationTriangleIcon // For errors (if needed)
} from '@heroicons/react/24/outline'; // Use outline icons like in DashboardCS
import { useNavigate } from "react-router-dom";

const DashboardPortofolio = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [totalOrders, setTotalOrders] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [totalRevenue, setTotalRevenue,] = useState(0);
  const [TotalRevenueProforma, setTotalRevenueProforma] = useState(0);
  const [orderTrends, setOrderTrends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); // State for fetch errors

  // Fungsi untuk mendapatkan bulan dan tahun saat ini
const getCurrentMonthYear = () => {
  const now = new Date();
  const month = now.getMonth(); // 0-11 (January = 0, December = 11)
  const year = now.getFullYear(); // Get full year (e.g., 2025)
  return { month, year };
};

// Fungsi untuk mendapatkan array 12 bulan terakhir, mulai dari bulan sekarang
const getLast12Months = () => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ];

  const { month, year } = getCurrentMonthYear();

  // Array untuk menyimpan bulan dalam format "Bulan Tahun" (misalnya "Mar 2025")
  const last12Months = [];

  // Menambahkan bulan dan tahun dalam format yang benar
  for (let i = 0; i < 12; i++) {
    const currentMonth = (month - i + 12) % 12;
    const currentYear = currentMonth > month ? year - 1 : year;
    last12Months.unshift(`${months[currentMonth]} ${currentYear}`);
  }

  return last12Months;
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

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUserData(storedUser);
    const userPeran = storedUser.peran || "";
    if (!userPeran) {
      alert("Anda tidak memiliki akses!");
      navigate("/");
      return;
    }

    if (userPeran !== "admin portofolio") {
      alert("Anda tidak memiliki akses!");
      navigate("/");
      return;
    }
  }, []);
  

  useEffect(() => {
    if (userData?.bidang) {
      fetchOrderSummary(userData.bidang);
    }
  }, [userData]);

  const fetchOrderSummary = async (userBidang) => {
    setIsLoading(true);
    setError(null); // Reset error state
    try {
      const ordersRef = collection(db, "orders");

      // Fetch total orders
      const totalQuery = query(ordersRef, where("portofolio", "==", userBidang));
      const totalSnapshot = await getDocs(totalQuery);
      setTotalOrders(totalSnapshot.size);

      // Fetch completed (closed) orders
      const closedQuery = query(
        ordersRef,
        where("portofolio", "==", userBidang),
        where("statusOrder", "in", ["Selesai"])  // Menambahkan "Selesai"
      );

      const closedSnapshot = await getDocs(closedQuery);
      setCompletedOrders(closedSnapshot.size);

      // Calculate pending orders (total - closed)
      setPendingOrders(totalSnapshot.size - closedSnapshot.size);

      // Calculate total revenue
      let revenue = 0;
      let revenueProforma = 0;
      let trends = {};

      totalSnapshot.forEach((doc) => {
        const data = doc.data();
        revenue += Number(data.nilaiInvoice) || 0;
        revenueProforma += Number(data.nilaiProforma) || 0;

        if (data.tanggalOrder?.seconds) {
          const orderDate = new Date(data.tanggalOrder.seconds * 1000);
          // Format Month-Year (ex: Mar 2025) to match CS dashboard
          const monthYear = orderDate.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
          trends[monthYear] = (trends[monthYear] || 0) + 1;
        }
      });

      setTotalRevenue(revenue);
      setTotalRevenueProforma(revenueProforma);

      // Ambil bulan yang tetap (12 bulan terakhir)
    const months = getLast12Months();

    // totalSnapshot.forEach((doc) => {
    //   const data = doc.data();

    //   if (data.tanggalOrder?.seconds) {
    //     const orderDate = new Date(data.tanggalOrder.seconds * 1000);
    //     const monthYear = orderDate.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });

    //     // Update trends jika bulan tersebut ada
    //     if (months.includes(monthYear)) {
    //       trends[monthYear] = (trends[monthYear] || 0) + 1;
    //     }
    //   }
    // });

    // setTotalRevenue(revenue);

    // Siapkan data untuk chart dengan tren per bulan
    const orderTrends = months.map((month) => ({
      bulan: month,
      jumlah: trends[month] || 0,  // Jika tidak ada data untuk bulan itu, set ke 0
    }));

    setOrderTrends(orderTrends);
    } catch (err) {
      console.error("Error fetching order summary:", err);
      setError("Tidak dapat memuat data ringkasan. Silakan coba lagi nanti."); // Set error message
    } finally {
      setIsLoading(false);
    }
  };

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

  if (!userData) return null;

  return (
    // Background page & padding to match CS dashboard
    <div className="bg-slate-100 min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto"> {/* Match max width with CS dashboard */}
        {/* Page title */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-2">
            <ChartBarIcon className="h-7 w-7 text-blue-600" />
            Dashboard Portofolio <span className="text-blue-600">({userData.bidang?.toUpperCase()})</span>
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

        {isLoading ? (
          // Loading state
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
          </div>
        ) : (
          <>
            {/* Summary Order Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {/* Total Orders Card */}
              <div className="bg-white shadow-md rounded-lg p-5 border border-gray-200 transition hover:shadow-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base font-semibold text-gray-600">Total Order Port. {userData.bidang?.toUpperCase()}</h3>
                  <ClipboardDocumentListIcon className="h-6 w-6 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-blue-600 mt-1">{totalOrders}</p>
              </div>
              
              {/* Completed Orders Card */}
              <div className="bg-white shadow-md rounded-lg p-5 border border-gray-200 transition hover:shadow-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base font-semibold text-gray-600">Order Selesai</h3>
                  <CheckCircleIcon className="h-6 w-6 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-green-500 mt-1">{completedOrders}</p>
                <p className="text-xs text-gray-500 mt-1">Status: Selesai</p>
              </div>
              
              {/* Pending Orders Card */}
              <div className="bg-white shadow-md rounded-lg p-5 border border-gray-200 transition hover:shadow-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base font-semibold text-gray-600">Order Proses/Order yang belum selesai</h3>
                  <ClockIcon className="h-6 w-6 text-orange-500" />
                </div>
                <p className="text-3xl font-bold text-orange-500 mt-1">{pendingOrders}</p>
                <p className="text-xs text-gray-500 mt-1">Sedang dalam proses</p>
              </div>
              
              {/* Total Revenue Card */}
              <div className="bg-white shadow-md rounded-lg p-5 border border-gray-200 transition hover:shadow-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base font-semibold text-gray-600">Total Nilai Invoice (Fee) Port. {userData.bidang?.toUpperCase()}</h3>
                  <CurrencyDollarIcon className="h-6 w-6 text-emerald-500" />
                </div>
                <p className="text-2xl font-bold text-emerald-500 mt-1">
                {formatCurrencyShort(totalRevenue)}
                </p>
              </div>
              <div className="bg-white shadow-md rounded-lg p-5 border border-gray-200 transition hover:shadow-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base font-semibold text-gray-600">Total Nilai Proforma (PAD) Port. {userData.bidang?.toUpperCase()}</h3>
                  <CurrencyDollarIcon className="h-6 w-6 text-emerald-500" />
                </div>
                <p className="text-2xl font-bold text-emerald-500 mt-1">
                  {formatCurrencyShort(TotalRevenueProforma)}
                </p>
              </div>
            </div>

            {/* Grid for Progress and Chart (similar to CS dashboard layout) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Progress Bar (wider column) */}
              <div className="lg:col-span-3 bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <CheckCircleIcon className="h-6 w-6 text-gray-600"/>
                    Progress Penyelesaian Order
                  </h3>
                </div>
                <div className="p-5">
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Order Selesai: {completedOrders} dari {totalOrders}
                      </span>
                      <span className="text-sm font-medium text-blue-600">
                        {totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                        style={{width: `${totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0}%`}}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-lg border border-blue-100">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                      <span className="font-medium text-gray-700">
                        {totalOrders === 0 
                          ? "Belum ada order" 
                          : completedOrders === totalOrders 
                            ? "Semua order selesai!" 
                            : `${pendingOrders} order masih dalam proses`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Trend Chart (wider column) */}
              <div className="lg:col-span-3 bg-white shadow-md rounded-lg border border-gray-200">
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
                  {orderTrends.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={orderTrends} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}> {/* Match margins */}
                        <defs>
                          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#93C5FD" stopOpacity={0.4}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="bulan" fontSize={11} />
                        <YAxis fontSize={11}/>
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
                    <div className="h-[300px] flex flex-col items-center justify-center text-center text-gray-500">
                      <ExclamationTriangleIcon className="h-12 w-12 text-blue-400 mb-3" />
                      <p>Tidak ada data tren untuk ditampilkan.</p>
                    </div>
                  )}
                </div>
              </div>
            </div> {/* End Grid for Progress & Chart */}
          </>
        )}
      </div> {/* End max-w-7xl */}
    </div> // End bg-slate-100
  );
};

export default DashboardPortofolio;