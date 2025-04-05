import { useState, useEffect } from "react";
import { db } from "../../services/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { exportToExcel } from "../../utils/exportToExcel";
import { FileText } from "lucide-react";

const LaporanOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [portofolioFilter, setPortofolioFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);

  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem("user")) || {};
  const userPeran = userData.peran || "";
  const userBidang = userData.bidang || "";

  useEffect(() => {
    setMounted(true);
    fetchOrders();

    // HAPUS BAGIAN INI: Tidak perlu lagi menambahkan style dinamis
    // const style = document.createElement('style');
    // style.textContent = `
    //   tr:hover td[data-fixed="true"] {
    //     background-color: rgb(239, 246, 255) !important; /* blue-50 */
    //   }
    //   tr td[data-fixed="true"] {
    //     background-color: white !important;
    //   }
    // `;
    // document.head.appendChild(style);

    return () => {
      setMounted(false);
      // HAPUS BAGIAN INI: Hapus style saat unmount
      // const existingStyle = document.querySelector('style[data-dynamic-laporan-orders]'); // Beri ID jika perlu
      // if (existingStyle) {
      //   document.head.removeChild(existingStyle);
      // }
    };
  }, []);

  // Format date function
  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    // Tambahkan validasi tipe data timestamp sebelum memproses
    let date;
    if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else if (typeof timestamp === "string" || typeof timestamp === "number") {
       // Coba parse sebagai string/number (misal ISO string atau milliseconds)
       try {
         const parsedDate = new Date(timestamp);
         // Cek apakah hasil parsing valid
         if (!isNaN(parsedDate.getTime())) {
           date = parsedDate;
         }
       } catch (error) {
         // Abaikan error jika format tidak bisa diparse
       }
    } else if (timestamp instanceof Date && !isNaN(timestamp.getTime())) {
        // Jika sudah berupa objek Date yang valid
        date = timestamp;
    }

    // Jika date berhasil didapatkan, format ke id-ID
    if (date) {
        try {
            return date.toLocaleDateString("id-ID", {
                day: '2-digit', month: '2-digit', year: 'numeric'
            });
        } catch (e) {
            console.warn("Error formatting date:", timestamp, e);
            return "-"; // Fallback jika toLocaleDateString error
        }
    }

    // Fallback jika timestamp tidak bisa diproses
    // Coba parse sebagai format DD/MM/YYYY (jika data lama mungkin seperti ini)
    if (typeof timestamp === 'string' && timestamp.includes('/')) {
        try {
            const parts = timestamp.split('/');
            if (parts.length === 3) {
                 // Asumsikan format DD/MM/YYYY
                 const formattedDate = new Date(parts[2], parts[1] - 1, parts[0]);
                 if (!isNaN(formattedDate.getTime())) {
                    return formattedDate.toLocaleDateString("id-ID", {
                         day: '2-digit', month: '2-digit', year: 'numeric'
                    });
                 }
            }
        } catch (e) {
             // Abaikan error parsing
        }
    }


    console.warn("Unparseable/invalid date timestamp:", timestamp);
    return "-"; // Default fallback
  };

  // Format currency
  const formatCurrency = (amount) => {
    const number = Number(amount);
    if (isNaN(number)) return "Rp -"; // Handle non-numeric input gracefully
    return `Rp ${number.toLocaleString("id-ID")}`;
  };

  // Fetch orders from Firestore
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const ordersRef = collection(db, "orders");
      let q = null;

      // Tentukan query berdasarkan peran user
      if (userPeran === "admin portofolio") {
        q = query(ordersRef, where("portofolio", "==", userBidang), orderBy("createdAt", "desc")); // Konsisten order by createdAt
      } else if (["customer service", "admin keuangan", "koordinator"].includes(userPeran)) {
        q = query(ordersRef, orderBy("createdAt", "desc")); // Konsisten order by createdAt
      } else {
        setError("Anda tidak memiliki akses ke laporan ini.");
        setLoading(false);
        return;
      }

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => {
        const order = doc.data();

        // Pastikan nilai date/timestamp adalah objek Date atau null/undefined sebelum format
        const ensureValidDateInput = (ts) => {
           if (!ts) return null;
           if (ts.seconds) return new Date(ts.seconds * 1000); // Firestore Timestamp
           if (ts instanceof Date) return ts; // Sudah Date object
           if (typeof ts === 'string' || typeof ts === 'number') {
               const parsed = new Date(ts);
               return isNaN(parsed.getTime()) ? null : parsed; // Cek validitas hasil parse
           }
           return null; // Format tidak dikenali
        }

        return {
          ...order,
          id: doc.id,
          // Format tanggal setelah mengambil data, gunakan input Date yang valid
          tanggalStatusOrder: formatDate(ensureValidDateInput(order.tanggalStatusOrder)),
          tanggalSerahOrderKeCs: formatDate(ensureValidDateInput(order.tanggalSerahOrderKeCs)),
          tanggalOrder: formatDate(ensureValidDateInput(order.tanggalOrder)),
          tanggalPekerjaan: formatDate(ensureValidDateInput(order.tanggalPekerjaan)),
          proformaSerahKeOps: formatDate(ensureValidDateInput(order.proformaSerahKeOps)),
          proformaSerahKeDukbis: formatDate(ensureValidDateInput(order.proformaSerahKeDukbis)),
          tanggalPengirimanInvoice: formatDate(ensureValidDateInput(order.tanggalPengirimanInvoice)),
          tanggalPengirimanFaktur: formatDate(ensureValidDateInput(order.tanggalPengirimanFaktur)),
          distribusiSertifikatPengirimTanggal: formatDate(ensureValidDateInput(order.distribusiSertifikatPengirimTanggal)),
          distribusiSertifikatPenerimaTanggal: formatDate(ensureValidDateInput(order.distribusiSertifikatPenerimaTanggal)),
          createdAt: formatDate(ensureValidDateInput(order.createdAt)), // Format createdAt
          updatedAt: formatDate(ensureValidDateInput(order.updatedAt)), // Format updatedAt
          // Format currency
          nilaiProforma: formatCurrency(order.nilaiProforma),
          // Format number or return '-'
          tonaseDS: order.tonaseDS ? Number(order.tonaseDS).toLocaleString("id-ID") : "-",
          estimasiTonase: order.estimasiTonase ? Number(order.estimasiTonase).toLocaleString("id-ID") : "-",
          // Pastikan field lain ada atau beri default value
          pelanggan: order.pelanggan || "-",
          portofolio: order.portofolio || "-",
          statusOrder: order.statusOrder || "-",
          // ... tambahkan default untuk field lain jika perlu
        };
      });

      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError(`Terjadi kesalahan saat mengambil data: ${error.message}`);
    }
    setLoading(false);
  };


  const handleFilter = () => {
    let filtered = [...orders];

    // Filter by date range (menggunakan tanggal asli sebelum diformat jika memungkinkan, atau parse dari string)
    if (startDate && endDate) {
      const start = new Date(startDate);
      // Setel waktu ke awal hari
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
       // Setel waktu ke akhir hari untuk inklusif
      end.setHours(23, 59, 59, 999);


      filtered = filtered.filter(order => {
        // Coba parse tanggal 'createdAt' yang sudah diformat (DD/MM/YYYY)
        if (!order.createdAt || order.createdAt === "-") return false;

        const parts = order.createdAt.split('/');
        if (parts.length !== 3) return false; // Format tidak valid

        // Buat objek Date: new Date(year, monthIndex, day)
        const orderDate = new Date(parts[2], parts[1] - 1, parts[0]);
         orderDate.setHours(0,0,0,0); // Setel ke awal hari untuk perbandingan

        // Cek apakah tanggal valid dan berada dalam rentang
        return !isNaN(orderDate.getTime()) && orderDate >= start && orderDate <= end;
      });
    }

    // Filter by portofolio (case-insensitive)
    if (portofolioFilter && userPeran !== "admin portofolio") {
      filtered = filtered.filter(order =>
        order.portofolio?.toLowerCase() === portofolioFilter.toLowerCase()
      );
    }

    // Filter by status (case-sensitive, sesuai dropdown)
    if (statusFilter) {
      filtered = filtered.filter(order =>
        order.statusOrder === statusFilter
      );
    }

    setFilteredOrders(filtered);
  };

  const resetFilters = () => {
    setStartDate("");
    setEndDate("");
    setPortofolioFilter("");
    setStatusFilter("");
    setFilteredOrders(orders); // Kembali ke data asli (yang sudah diformat)
  };

  // Prepare data for export (opsional: unformat jika perlu)
  const prepareDataForExport = (data) => {
    return data.map(item => {
      const exportItem = { ...item };

      // Contoh: Hapus format dari nilaiProforma
      if (exportItem.nilaiProforma && typeof exportItem.nilaiProforma === 'string') {
         // Hapus 'Rp ', spasi, dan titik ribuan (jika pakai titik)
         // Jika pakai koma sebagai ribuan (id-ID), ganti koma
        exportItem.nilaiProforma = exportItem.nilaiProforma.replace(/[Rp.\s]/g, '').replace(/,/g, '');
      }
       if (exportItem.tonaseDS && typeof exportItem.tonaseDS === 'string') {
            exportItem.tonaseDS = exportItem.tonaseDS.replace(/\./g, ''); // Hapus titik ribuan
       }
       if (exportItem.estimasiTonase && typeof exportItem.estimasiTonase === 'string') {
           exportItem.estimasiTonase = exportItem.estimasiTonase.replace(/\./g, ''); // Hapus titik ribuan
       }

      // Anda bisa menambahkan un-formatting untuk tanggal jika ingin format ISO di Excel
      // Tapi biasanya Excel cukup pintar mengenali format DD/MM/YYYY

      return exportItem;
    });
  };


  const handleExport = () => {
    if (filteredOrders.length === 0) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }
    const exportData = prepareDataForExport(filteredOrders);
    const fileName = `Laporan_Orders_${new Date().toISOString().split('T')[0]}`;
    exportToExcel(exportData, fileName, allColumns); // Pass columns for header order
  };

  // Define all columns based on the Firebase schema
  // PERBAIKAN: Tambahkan properti 'width' (opsional) untuk kolom sticky
  const allColumns = [
    { key: "pelanggan", label: "Nama Pelanggan", fixed: true, width: "180px" }, // Lebar tetap untuk kolom pertama
    { key: "portofolio", label: "Portofolio", fixed: true, width: "120px" },   // Lebar tetap untuk kolom kedua
    { key: "statusOrder", label: "Status Order", fixed: true, width: "120px" }, // Lebar tetap untuk kolom ketiga
    { key: "tanggalStatusOrder", label: "Tanggal Status Order" },
    { key: "nomorOrder", label: "Nomor Order" },
    { key: "tanggalSerahOrderKeCs", label: "Tanggal Serah Order ke CS" },
    { key: "tanggalOrder", label: "Tanggal Order" },
    { key: "tanggalPekerjaan", label: "Tanggal Pekerjaan" },
    { key: "proformaSerahKeOps", label: "Proforma Serah Ke Ops" },
    { key: "proformaSerahKeDukbis", label: "Proforma Serah Ke Dukbis" },
    { key: "jenisPekerjaan", label: "Jenis Pekerjaan" },
    { key: "lokasiPekerjaan", label: "Lokasi Pekerjaan" },
    { key: "noSertifikatPM06", label: "No. Sertifikat PM06" },
    { key: "noSertifikat", label: "No. Sertifikat" },
    { key: "keteranganSertifikatPM06", label: "Keterangan Sertifikat PM06" },
    { key: "jenisSerifikat", label: "Jenis Sertifikat" },
    { key: "noSiSpk", label: "No SI/SPK" },
    { key: "namaTongkang", label: "Nama Tongkang" },
    { key: "estimasiTonase", label: "Estimasi Tonase" },
    { key: "tonaseDS", label: "Tonase DS" },
    { key: "nilaiProforma", label: "Nilai Proforma" },
    { key: "dokumenSelesaiINV", label: "Dokumen Selesai INV" },
    { key: "nomorInvoice", label: "Nomor Invoice" },
    { key: "fakturPajak", label: "Faktur Pajak" },
    { key: "tanggalPengirimanInvoice", label: "Tanggal Pengiriman Invoice" },
    { key: "tanggalPengirimanFaktur", label: "Tanggal Pengiriman Faktur" },
    { key: "distribusiSertifikatPengirim", label: "Distribusi Sertifikat Pengirim" },
    { key: "distribusiSertifikatPengirimTanggal", label: "Tanggal Distribusi Sertifikat (Pengirim)" },
    { key: "distribusiSertifikatPenerima", label: "Distribusi Sertifikat Penerima" },
    { key: "distribusiSertifikatPenerimaTanggal", label: "Tanggal Distribusi Sertifikat (Penerima)" },
    { key: "createdAt", label: "Dibuat Pada" },
    { key: "updatedAt", label: "Diperbarui Pada" },
  ];

  // List of portofolios for filter dropdown
  const portofolioList = ["BATUBARA", "KSP", "PIK", "INDUSTRI", "HMPM", "AEBT", "MINERAL", "HALAL", "LABORATORIUM", "SERCO", "LSI"];

  // Status options for filter dropdown
  const statusOptions = [ "Draft", "Diproses", "Archecking", "Selesai", "Next Order", "Closed"];

  // Get status badge styling
  const getStatusClass = (status) => {
    switch (status) {
      case "Closed":
      case "Selesai":
        return "inline-block px-3 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium";
      case "InProgress":
      case "Diproses":
        return "inline-block px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800 font-medium";
      case "New":
        return "inline-block px-3 py-1 text-xs rounded-full bg-purple-100 text-purple-800 font-medium";
      default:
        return "inline-block px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-800 font-medium";
    }
  };

  // Hitung offset kiri untuk setiap kolom sticky
  // Perhatikan urutan di allColumns
  const stickyOffsets = allColumns.reduce((acc, col, index) => {
      if (col.fixed) {
          const previousWidth = index > 0 && allColumns[index-1].fixed ? acc[allColumns[index-1].key] : 0;
          const previousElementWidth = index > 0 && allColumns[index-1].fixed ? parseFloat(allColumns[index-1].width) || 150 : 0; // Default width jika tidak diset
          acc[col.key] = previousWidth + previousElementWidth;
      }
      return acc;
  }, { firstCol: 0 }); // Offset kolom pertama adalah 0


  return (
    <div className={`p-6 transition-all duration-500 ${
      mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    }`}>
      <div className="max-w-full mx-auto bg-white rounded-xl shadow-md overflow-hidden mb-6">
        <div className="h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 animate-gradient-x"></div>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <FileText className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-800">Laporan Order</h2>
          </div>

          {/* Filter Section */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="text-sm font-medium text-blue-800 mb-3">Filter Laporan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir</label>
                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                   min={startDate} // Optional: end date tidak bisa sebelum start date
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {userPeran !== "admin portofolio" && (
                <div>
                  <label htmlFor="portofolioFilter" className="block text-sm font-medium text-gray-700 mb-1">Portofolio</label>
                  <select
                    id="portofolioFilter"
                    value={portofolioFilter}
                    onChange={(e) => setPortofolioFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Semua Portofolio</option>
                    {portofolioList.map(p => (
                      <option key={p} value={p.toLowerCase()}>{p}</option> // Value sebaiknya lowercase konsisten
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">Status Order</label>
                <select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Semua Status</option>
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <button
                onClick={handleFilter}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Terapkan Filter
              </button>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                Reset Filter
              </button>
              {userPeran !== "koordinator" && (
                <button
                  onClick={handleExport}
                  disabled={filteredOrders.length === 0 || loading} // Disable saat loading atau tidak ada data
                  className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ml-auto ${filteredOrders.length === 0 || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Export Excel
                </button>
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
             <div className="flex justify-center py-8">
               <div className="flex flex-col items-center">
                 <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 <p className="text-gray-600">Memuat data laporan...</p>
               </div>
             </div>
          ) : error ? (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
               <p className="font-bold">Error</p>
               <p>{error}</p>
            </div>
          ) : (
            <>
              {/* Order Count */}
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600">Menampilkan {filteredOrders.length} order</p>
              </div>

              {/* Table with fixed columns - PERBAIKAN */}
              <div className="relative rounded-lg border border-gray-200">
                <div className="overflow-x-auto">
                  {/* Tambahkan min-w yang cukup besar agar scroll muncul */}
                  <table className="min-w-[2000px] w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        {/* Render Kolom Header */}
                        {allColumns.map((col, index) => (
                          <th
                            key={col.key}
                            scope="col"
                            className={`
                              px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider
                              ${col.fixed ? 'sticky bg-gray-100 z-20 border-r border-gray-300 shadow-sm' : ''}
                              ${index === 0 ? 'left-0' : ''}
                              ${index === 1 ? `left-[${allColumns[0].width}]` : ''} /* Sesuaikan dengan lebar kolom 0 */
                              ${index === 2 ? `left-[calc(${allColumns[0].width}+${allColumns[1].width})]` : ''} /* Sesuaikan dengan lebar kolom 0+1 */
                            `}
                             style={col.fixed ? {
                                left: index === 0 ? '0' : index === 1 ? allColumns[0].width : `calc(${allColumns[0].width} + ${allColumns[1].width})`,
                                minWidth: col.width, // Terapkan minWidth
                                width: col.width     // Terapkan width
                              } : {}}
                          >
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
                          <tr key={order.id} className="group hover:bg-blue-50 transition-colors duration-150">
                            {/* Render Sel Data */}
                            {allColumns.map((col, index) => (
                              <td
                                key={`${order.id}-${col.key}`}
                                className={`
                                  px-4 py-3 text-sm text-gray-800 whitespace-nowrap
                                  ${col.fixed ? 'sticky bg-white group-hover:bg-blue-50 z-10 border-r border-gray-200 shadow-sm' : 'bg-white group-hover:bg-blue-50'}
                                  ${index === 0 ? 'left-0 font-medium text-gray-900' : ''} /* Kolom pertama sticky */
                                  ${index === 1 ? `left-[${allColumns[0].width}]` : ''} /* Kolom kedua sticky */
                                  ${index === 2 ? `left-[calc(${allColumns[0].width}+${allColumns[1].width})]` : ''} /* Kolom ketiga sticky */
                                `}
                                style={col.fixed ? {
                                  left: index === 0 ? '0' : index === 1 ? allColumns[0].width : `calc(${allColumns[0].width} + ${allColumns[1].width})`,
                                  minWidth: col.width, // Terapkan minWidth
                                  width: col.width     // Terapkan width
                                } : {}}
                              >
                                {col.key === "statusOrder" ? (
                                    <span className={getStatusClass(order[col.key] || '')}>
                                      {order[col.key] || '-'}
                                    </span>
                                ) : (
                                  order[col.key] !== null && order[col.key] !== undefined ? order[col.key] : '-' // Tampilkan '-' jika null/undefined
                                )}
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={allColumns.length} className="px-4 py-6 text-center text-gray-500">
                            Tidak ada data yang sesuai dengan filter
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LaporanOrders;