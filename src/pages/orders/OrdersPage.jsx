import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../services/firebase";
import { collection, query, where, orderBy, limit, startAfter, getDocs } from "firebase/firestore";
import debounce from "lodash.debounce";
import {
  ChartBarIcon,
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'; // Use outline icons like in DashboardCS

const OrdersPage = () => {
  const { portofolio } = useParams();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [lastDoc, setLastDoc] = useState(null);
  const [firstDoc, setFirstDoc] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const perPage = 10;

  // Data user dari localStorage
  const userData = JSON.parse(localStorage.getItem("user")) || {};
  const userPeran = userData.peran || "";
  const userBidang = userData.bidang || "";

  useEffect(() => {
    if (!userPeran) {
      alert("Anda tidak memiliki akses!");
      navigate("/");
      return;
    }

    if (userPeran === "admin portofolio" && userBidang !== portofolio) {
      alert("Anda tidak memiliki akses!");
      navigate("/");
      return;
    }

    fetchOrders();
  }, [portofolio, userPeran, userBidang, currentPage, filterStatus]);

  // Fetch data orders dari Firestore
  const fetchOrders = async () => {
    setLoading(true);
    try {
      let q = query(
        collection(db, "orders"),
        where("portofolio", "==", portofolio),
        orderBy("createdAt", "desc"),
        limit(perPage)
      );

      if (filterStatus) {
        q = query(q, where("statusOrder", "==", filterStatus));
      }

      if (currentPage > 1 && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      const ordersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setOrders(ordersData);
      setAllOrders(ordersData);
      setFirstDoc(querySnapshot.docs[0] || null);
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1] || null);
      setHasNextPage(querySnapshot.docs.length === perPage);
    } catch (err) {
      console.error("Error fetching orders:", err);
      // Error notification removed
    }
    setLoading(false);
  };

  // Fungsi Pencarian (Debounce)
  const debouncedSearch = useCallback(
    debounce((value) => {
      if (!value) {
        setOrders(allOrders);
      } else {
        const searchLower = value.toLowerCase();
        const filteredOrders = allOrders.filter(
          (order) =>
            order.pelanggan?.toLowerCase().includes(searchLower) ||
            order.nomorOrder?.toLowerCase().includes(searchLower)
        );
        setOrders(filteredOrders);
      }
    }, 500),
    [allOrders]
  );

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    debouncedSearch(e.target.value);
  };

  // Fungsi Filter Status Order
  useEffect(() => {
    if (!filterStatus) {
      setOrders(allOrders);
    } else {
      const filtered = allOrders.filter((order) => order.statusOrder === filterStatus);
      setOrders(filtered);
    }
  }, [filterStatus, allOrders]);

  // Fungsi Reset Pencarian & Filter
  const handleReset = () => {
    setSearchQuery("");
    setFilterStatus("");
    setOrders(allOrders);
  };

  // // Fungsi untuk mengecek kelengkapan data
  // const checkKelengkapan = (order) => {
  //   const requiredFields = [
  //     "pelanggan",
  //     "statusOrder",
  //     "nomorOrder",
  //     "tanggalOrder",
  //     "lokasiPekerjaan",
  //     "tonaseDS",
  //     "nilaiProforma",
  //     "nomorInvoice",
  //   ];

  //   const isComplete = requiredFields.every((field) => order[field]);
  //   return { 
  //     isComplete, 
  //     text: isComplete ? "Lengkap" : "Tidak Lengkap" 
  //   };
  // };

  const checkKelengkapan = (order, userPeran) => {
    // Definisikan field yang harus diisi berdasarkan peran
    const requiredFields = {
      "admin portofolio": [
        "pelanggan",
        "statusOrder",
        "tanggalStatusOrder",
        "tanggalSerahOrderKeCs",
        "tanggalPekerjaan",
        "proformaSerahKeOps",
        "proformaSerahKeDukbis",
        "jenisSertifikat",
        "keteranganSertifikatPM06",
        "noSiSpk",
        "jenisPekerjaan",
        "namaTongkang",
        "lokasiPekerjaan",
        "estimasiTonase",
        "tonaseDS",
        "nilaiProforma",
        "distribusiSertifikatPengirim",
        "distribusiSertifikatPengirimTanggal",
        "distribusiSertifikatPenerima",
        "distribusiSertifikatPenerimaTanggal",
      ],
      "customer service": ["nomorOrder", "tanggalOrder"],
      "admin keuangan": [
        "tanggalPengirimanInvoice",
        "tanggalPengirimanFaktur",
        "nomorInvoice",
        "fakturPajak",
        "dokumenSelesaiINV",
        "distribusiSertifikatPengirim",
        "distribusiSertifikatPengirimTanggal",
        "distribusiSertifikatPenerima",
        "distribusiSertifikatPenerimaTanggal",
      ],
      "koordinator": [
        "pelanggan",
        "statusOrder",
        "tanggalStatusOrder",
        "tanggalSerahOrderKeCs",
        "tanggalPekerjaan",
        "proformaSerahKeOps",
        "proformaSerahKeDukbis",
        "jenisSertifikat",
        "keteranganSertifikatPM06",
        "noSiSpk",
        "jenisPekerjaan",
        "namaTongkang",
        "lokasiPekerjaan",
        "estimasiTonase",
        "tonaseDS",
        "nilaiProforma",
        "tanggalPengirimanInvoice",
        "tanggalPengirimanFaktur",
        "nomorInvoice",
        "fakturPajak",
        "dokumenSelesaiINV",
        "nomorOrder", 
        "tanggalOrder",
        "distribusiSertifikatPengirim",
        "distribusiSertifikatPengirimTanggal",
        "distribusiSertifikatPenerima",
        "distribusiSertifikatPenerimaTanggal",
      ],
    };
  
    // Ambil fields yang harus diisi untuk peran yang sedang aktif
    const fieldsToCheck = requiredFields[userPeran] || [];
  
    // Cek apakah semua field yang diperlukan sudah terisi
    const isComplete = fieldsToCheck.every((field) => order[field]);
  
    return {
      isComplete,
      text: isComplete ? "Lengkap" : "Tidak Lengkap",
    };
  };
  

  // Get status badge styling
  const getStatusClass = (status) => {
    switch (status) {
      case "Entry":
        return "px-2.5 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-200";
      case "Diproses - Lapangan":
        return "px-2.5 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800 border border-blue-200";
      case "Invoice":
         return "px-2.5 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "New Order":
        return "px-2.5 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-800 border border-gray-200";
      case "Selesai":
         return "px-2.5 py-0.5 text-xs font-medium rounded-full bg-teal-100 text-teal-800 border border-teal-200";
      case "Diproses - Sertifikat":
         return "px-2.5 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-800 border border-purple-200";
      case "Closed Order":
         return "px-2.5 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-800 border border-orange-200";
      default:
        return "px-2.5 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800 border border-red-200";
    }
  };

  // Pagination Control
  const nextPage = () => {
    if (hasNextPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Skeletons for loading states
  const TableRowSkeleton = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-3 whitespace-nowrap"><div className="h-4 w-4 bg-gray-200 rounded"></div></td>
      <td className="px-6 py-3 whitespace-nowrap"><div className="h-4 w-32 bg-gray-200 rounded"></div></td>
      <td className="px-6 py-3 whitespace-nowrap"><div className="h-5 w-16 bg-gray-200 rounded-full"></div></td>
      <td className="px-6 py-3 whitespace-nowrap"><div className="h-4 w-20 bg-gray-200 rounded"></div></td>
      <td className="px-6 py-3 whitespace-nowrap"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
      <td className="px-6 py-3 whitespace-nowrap"><div className="h-5 w-16 bg-gray-200 rounded-full"></div></td>
      <td className="px-6 py-3 whitespace-nowrap"><div className="h-8 w-16 bg-gray-200 rounded"></div></td>
    </tr>
  );

  return (
    // Background page & padding to match CS dashboard
    <div className="bg-slate-100 min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto"> {/* Match max width with CS dashboard */}
        {/* Page title */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-2">
            <ClipboardDocumentListIcon className="h-7 w-7 text-blue-600" />
            Daftar Order {portofolio?.toUpperCase()}
          </h2>
          {/* Action Button moved to title row */}
          {userPeran === "admin portofolio" && (
            <button
              onClick={() => navigate(`/orders/${portofolio}/create`)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Tambah Order
            </button>
          )}
        </div>

        {/* Error notification removed */}

        {/* Main Content */}
        <div className="bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <MagnifyingGlassIcon className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Cari Nama Pelanggan / Nomor Order..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all focus:outline-none"
                />
              </div>
              
              <div className="relative w-full md:w-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FunnelIcon className="w-5 h-5" />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-10 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all focus:outline-none appearance-none"
                >
                  <option value="">Semua Status</option>
                  <option value="New Order">New Order</option>
                  <option value="Entry">Entry</option>
                  <option value="Diproses - Lapangan">Diproses - Lapangan</option>
                  <option value="Diproses - Sertifikat">Diproses - Sertifikat</option>
                  <option value="Closed Order">Closed Order</option>
                  <option value="Invoice">Invoice</option>
                  <option value="Selesai">Selesai</option>
                  {/* <option value="Archecking">Archecking</option> */}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
              
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all focus:outline-none flex items-center justify-center"
              >
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Reset
              </button>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Pelanggan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Order</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nomor Order</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Order</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelengkapan Data</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[...Array(5)].map((_, index) => (
                      <TableRowSkeleton key={index} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Empty State */}
            {!loading && orders.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="bg-gray-100 p-4 rounded-full inline-flex items-center justify-center mb-4">
                  <DocumentTextIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-700">Tidak ada data order</h3>
                <p className="text-gray-500 mt-1">Tidak ada order yang sesuai dengan filter yang dipilih</p>
              </div>
            )}

            {/* Table Data */}
            {!loading && orders.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Pelanggan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Order</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nomor Order</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Order</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelengkapan Data</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order, index) => {
                      const kelengkapan = checkKelengkapan(order, userPeran);
                      return (
                        <tr key={order.id} className="hover:bg-slate-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {(currentPage - 1) * perPage + index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {order.pelanggan || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={getStatusClass(order.statusOrder)}>
                              {order.statusOrder || "-"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {order.nomorOrder || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {order.tanggalOrder
                              ? new Date(order.tanggalOrder.seconds * 1000).toLocaleDateString("id-ID", {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                })
                              : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                              kelengkapan.isComplete 
                                ? "bg-green-100 text-green-800 border border-green-200" 
                                : "bg-red-100 text-red-800 border border-red-200"
                            }`}>
                              {kelengkapan.isComplete ? "✓" : "✗"} {kelengkapan.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button 
                              onClick={() => navigate(`/orders/${portofolio}/detail/${order.id}`)} 
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                            >
                              Detail
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!loading && orders.length > 0 && (
              <div className="flex justify-between items-center mt-6">
                <button 
                  onClick={prevPage} 
                  disabled={currentPage === 1} 
                  className={`flex items-center px-4 py-2 rounded-lg border ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                      : "bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
                  }`}
                >
                  <ChevronLeftIcon className="w-5 h-5 mr-1" />
                  Previous
                </button>
                
                <div className="text-sm font-medium text-gray-700">
                  Halaman <span className="font-semibold text-blue-600">{currentPage}</span>
                </div>
                
                <button 
                  onClick={nextPage} 
                  disabled={!hasNextPage} 
                  className={`flex items-center px-4 py-2 rounded-lg border ${
                    !hasNextPage
                      ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                      : "bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
                  }`}
                >
                  Next
                  <ChevronRightIcon className="w-5 h-5 ml-1" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;