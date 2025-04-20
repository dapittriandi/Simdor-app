import { useState, useEffect } from "react";
import { db } from "../../services/firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore"; // Hapus limit jika tidak dipakai untuk summary
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import {
  ChartBarIcon, // Untuk Tren
  ClockIcon, // Untuk Proses
  CheckCircleIcon, // Untuk Selesai
  ClipboardDocumentListIcon, // Untuk Total Order
  ListBulletIcon, // Untuk Daftar Order
  ExclamationTriangleIcon // Untuk error (jika perlu)
} from '@heroicons/react/24/outline'; // Gunakan outline icons

const DashboardCS = () => {
  const [summary, setSummary] = useState({
    totalOrders: 0,
    processingOrders: 0, // Status "Diproses", "Archecking" ?
    completedOrders: 0, // Status "Closed"
    otherStatusOrders: 0, // Status "Draft", "Selesai", "Next Order"?
    recentOrders: [],
    orderTrends: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); // State untuk error fetching

  useEffect(() => {
    fetchOrderSummary();
  }, []);

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
  
    // Array untuk menyimpan bulan dalam format "Bulan Tahun" (misalnya "Mar 2025")
    const last12Months = [];
  
    for (let i = 0; i < 12; i++) {
      const currentMonth = (month - i + 12) % 12;
      const currentYear = currentMonth > month ? year - 1 : year;
      last12Months.unshift(`${months[currentMonth]} ${currentYear}`);
    }
  
    return last12Months;
  };
  
  const fetchOrderSummary = async () => {
    setIsLoading(true);
    setError(null); // Reset error state
    try {
      const ordersRef = collection(db, "orders");
      const q = query(ordersRef, orderBy("createdAt", "desc")); // Urutkan semua
      const snapshot = await getDocs(q);


      
      let totalOrders = snapshot.size;
      let processingOrdersCount = 0;
      let completedOrdersCount = 0;
      let otherStatusOrdersCount = 0;
      let orderTrendsData = {};
      const months = getLast12Months(); // Ambil 12 bulan terakhir
      let recentOrdersData = [];

      const processingStatuses = ["Diproses - Lapangan"]; // Definisikan status 'processing'
      const completedStatus = "Selesai";

      snapshot.forEach((doc) => {
        const data = doc.data();
        const status = data.statusOrder || "Unknown";

        // Klasifikasi Status
        if (status === completedStatus) {
          completedOrdersCount++;
        } else if (processingStatuses.includes(status)) {
          processingOrdersCount++;
        } else {
          // Semua status lain (Draft, Selesai, Next Order, Unknown, etc.)
          otherStatusOrdersCount++;
        }

        // Ambil 10 order terbaru untuk tabel
        if (recentOrdersData.length < 10) {
            // Format tanggal dengan lebih aman
            const formatDate = (timestamp) => {
              if (!timestamp || typeof timestamp.seconds !== 'number') return "-";
              try {
                return new Date(timestamp.seconds * 1000).toLocaleDateString('id-ID', {
                  day: '2-digit', month: 'short', year: 'numeric'
                });
              } catch (e) {
                return "-";
              }
            };

          recentOrdersData.push({
            id: doc.id,
            pelanggan: data.pelanggan || "-",
            portofolio: data.portofolio || "-",
            statusOrder: status,
            // Cek tanggalOrder sebelum format
            tanggalOrder: formatDate(data.tanggalOrder),
            createdAt: formatDate(data.createdAt), // Format tanggal dibuat
          });
        }
        // Hitung jumlah order per bulan (berdasarkan createdAt)
        if (data.createdAt?.seconds) {
          try {
            const orderDate = new Date(data.tanggalOrder.seconds * 1000);
            // Format Bulan-Tahun (misal: Mar 2025)
            const monthYear = orderDate.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
            orderTrendsData[monthYear] = (orderTrendsData[monthYear] || 0) + 1;
          } catch (e) {
            console.warn("Invalid date for trend calculation:", data.createdAt);
          }
        }
      });

      // Menyusun array berdasarkan bulan yang telah diurutkan
      const orderTrendsArray = months.map((month) => ({
        bulan: month,
        jumlah: orderTrendsData[month] || 0, // Isi dengan 0 jika tidak ada data untuk bulan tersebut
      }));

      setSummary({
        totalOrders,
        processingOrders: processingOrdersCount,
        completedOrders: completedOrdersCount,
        otherStatusOrders: otherStatusOrdersCount, // Simpan hitungan status lain
        recentOrders: recentOrdersData,
        orderTrends: orderTrendsArray,
      });

    } catch (err) {
      console.error("Gagal mengambil ringkasan order:", err);
      setError("Tidak dapat memuat data ringkasan. Silakan coba lagi nanti."); // Set pesan error
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi styling status badge yang diperbarui
  const getStatusClass = (status) => {
    switch (status) {
      case "Entry":
        return "px-2.5 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-200";
      case "Diproses - Lapangan":
        return "px-2.5 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800 border border-blue-200";
      case "Archecking":
         return "px-2.5 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "New Order":
        return "px-2.5 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-800 border border-gray-200";
      case "Selesai":
         return "px-2.5 py-0.5 text-xs font-medium rounded-full bg-teal-100 text-teal-800 border border-teal-200";
      case "Diproses - Sertifikat":
         return "px-2.5 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-800 border border-purple-200";
      case "Closed":
         return "px-2.5 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-800 border border-orange-200";
      default:
        return "px-2.5 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800 border border-red-200";
    }
  };

  // Komponen Skeleton untuk Kartu Ringkasan
  const SummaryCardSkeleton = () => (
      <div className="bg-white shadow-md rounded-lg p-5 border border-gray-200 animate-pulse">
          <div className="flex justify-between items-start mb-2">
            <div className="h-5 w-3/5 bg-gray-200 rounded"></div> {/* Skeleton Title */}
            <div className="h-6 w-6 bg-gray-200 rounded"></div> {/* Skeleton Icon */}
          </div>
          <div className="h-8 w-1/3 bg-gray-300 rounded mt-3"></div> {/* Skeleton Number */}
      </div>
  );

  // Komponen Skeleton untuk Baris Tabel
  const TableRowSkeleton = () => (
      <tr className="animate-pulse">
          <td className="px-4 py-3 border-b border-gray-200"><div className="h-4 w-4 bg-gray-200 rounded"></div></td>
          <td className="px-4 py-3 border-b border-gray-200"><div className="h-4 w-3/4 bg-gray-200 rounded"></div></td>
          <td className="px-4 py-3 border-b border-gray-200"><div className="h-4 w-1/2 bg-gray-200 rounded"></div></td>
          <td className="px-4 py-3 border-b border-gray-200"><div className="h-5 w-16 bg-gray-200 rounded-full"></div></td>
          <td className="px-4 py-3 border-b border-gray-200"><div className="h-4 w-20 bg-gray-200 rounded"></div></td>
          <td className="px-4 py-3 border-b border-gray-200"><div className="h-4 w-20 bg-gray-200 rounded"></div></td>
      </tr>
  );

  // Komponen Skeleton untuk Grafik
  const ChartSkeleton = () => (
       <div className="h-[300px] bg-gray-100 rounded animate-pulse flex items-center justify-center border border-gray-200">
            <p className="text-gray-400 text-sm">Memuat data grafik...</p>
       </div>
  );


  return (
    // Background halaman & padding lebih baik
    <div className="bg-slate-100 min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto"> {/* Max width sedikit lebih besar */}
        {/* Judul Halaman */}
        <div className="flex items-center justify-between mb-6">
             <h2 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-2">
                <ChartBarIcon className="h-7 w-7 text-blue-600" />
                Dashboard Customer Service
             </h2>
             {/* Bisa tambahkan tombol aksi di sini jika perlu */}
        </div>

        {/* Tampilkan Pesan Error Jika Ada */}
        {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center gap-3" role="alert">
                 <ExclamationTriangleIcon className="h-6 w-6 text-red-600"/>
                <div>
                    <p className="font-semibold">Gagal Memuat Data</p>
                    <p>{error}</p>
                </div>
            </div>
        )}

        {/* Grid Ringkasan Order */}
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
                    {/* Kartu Total Order */}
                    <div className="bg-white shadow-md rounded-lg p-5 border border-gray-200 transition hover:shadow-lg">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-base font-semibold text-gray-600">Total Order</h3>
                            <ClipboardDocumentListIcon className="h-6 w-6 text-blue-500" />
                        </div>
                        <p className="text-3xl font-bold text-blue-600 mt-1">{summary.totalOrders}</p>
                    </div>
                     {/* Kartu Order Diproses */}
                     <div className="bg-white shadow-md rounded-lg p-5 border border-gray-200 transition hover:shadow-lg">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-base font-semibold text-gray-600">Sedang Diproses</h3>
                            <ClockIcon className="h-6 w-6 text-orange-500" />
                        </div>
                        <p className="text-3xl font-bold text-orange-500 mt-1">{summary.processingOrders}</p>
                        <p className="text-xs text-gray-500 mt-1">Status: Diproses, Archecking</p>
                    </div>
                     {/* Kartu Order Selesai (Closed) */}
                     <div className="bg-white shadow-md rounded-lg p-5 border border-gray-200 transition hover:shadow-lg">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-base font-semibold text-gray-600">Order Closed</h3>
                            <CheckCircleIcon className="h-6 w-6 text-green-500" />
                        </div>
                        <p className="text-3xl font-bold text-green-500 mt-1">{summary.completedOrders}</p>
                         <p className="text-xs text-gray-500 mt-1">Status: Closed</p>
                    </div>
                    {/* Kartu Status Lain (jika perlu ditampilkan) */}
                     <div className="bg-white shadow-md rounded-lg p-5 border border-gray-200 transition hover:shadow-lg">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-base font-semibold text-gray-600">Status Lain</h3>
                             <ListBulletIcon className="h-6 w-6 text-gray-500" />
                        </div>
                        <p className="text-3xl font-bold text-gray-600 mt-1">{summary.otherStatusOrders}</p>
                         <p className="text-xs text-gray-500 mt-1">Status: Draft, Selesai, Next Order, dll.</p>
                    </div>
                </>
            )}
        </div>

        {/* Grid untuk Tabel dan Grafik (side-by-side di layar besar) */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Kolom Daftar Order Terkini (lebih lebar) */}
            <div className="lg:col-span-2 bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <ListBulletIcon className="h-6 w-6 text-gray-600"/>
                    Daftar 10 Order Terkini
                  </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pelanggan</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Portofolio</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tgl. Order</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tgl. Dibuat</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <>
                                    <TableRowSkeleton />
                                    <TableRowSkeleton />
                                    <TableRowSkeleton />
                                    <TableRowSkeleton />
                                    <TableRowSkeleton />
                                </>
                            ) : summary.recentOrders.length > 0 ? (
                                summary.recentOrders.map((order, index) => (
                                    <tr key={order.id} className="hover:bg-slate-50 transition-colors duration-150">
                                        <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{order.pelanggan}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{order.portofolio}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={getStatusClass(order.statusOrder)}>
                                                {order.statusOrder}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{order.tanggalOrder}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{order.createdAt}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-4 py-6 text-center text-gray-500">
                                        Tidak ada data order terbaru.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Kolom Grafik Tren Order */}
            <div className="lg:col-span-2 bg-white shadow-md rounded-lg border border-gray-200">
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
                            <BarChart data={summary.orderTrends} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}> {/* Adjust margin */}
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
         </div> {/* Akhir Grid Tabel & Grafik */}

      </div> {/* Akhir max-w-7xl */}
    </div> // Akhir bg-slate-100
  );
};

export default DashboardCS;