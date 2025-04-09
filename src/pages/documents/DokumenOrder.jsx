import { useState, useEffect } from "react";
import { getOrders } from "../../services/orderServices";
import { FileText, Search, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

const DokumenOrder = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [mounted, setMounted] = useState(false);

  // ✅ Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ✅ Ambil user dari localStorage (DILUAR IF)
  useEffect(() => {
    setMounted(true);
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser || null);
    
    return () => setMounted(false);
  }, []);

  // ✅ Ambil data order dari Firestore
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const data = await getOrders();
        setOrders(data);
      } catch (error) {
        console.error("Gagal mengambil data orders:", error);
      }
      setLoading(false);
    };

    fetchOrders();
  }, []);

  // **Cegah pemanggilan hooks dalam kondisi IF**
  const userPortofolio = user?.bidang || "";
  const userPeran = user?.peran || "";

  // ✅ Filter berdasarkan portofolio (DILUAR IF)
  useEffect(() => {
    let displayedOrders = [];
  
    if (userPeran === "admin portofolio") {
      displayedOrders = orders.filter(order => order.portofolio === userPortofolio);
    } else if (userPeran === "admin keuangan") {
      // displayedOrders = orders.map(order => ({
      //   pelanggan: order.pelanggan,
      //   nomorOrder: order.nomorOrder,
      //   fakturPajak: order.documents?.fakturPajak || { fileUrl: null, fileName: "Tidak Ada" },
      //   invoice: order.documents?.invoice || { fileUrl: null, fileName: "Tidak Ada" },
      // }));
      // Untuk user selain admin portofolio, tampilkan semua data apa adanya
    displayedOrders = orders;
    }
  
    setFilteredOrders(displayedOrders);
  }, [orders, userPeran, userPortofolio]);
  
  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      handleReset();
    } else {
      let results = orders.filter(order =>
        order.pelanggan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.nomorOrder?.toLowerCase().includes(searchQuery.toLowerCase())
      );
  
      // 🔒 Filter berdasarkan portofolio jika user adalah admin portofolio
      if (userPeran === "admin portofolio" && userPortofolio) {
        results = results.filter(order => order.portofolio === userPortofolio);
      }
  
      // 🔒 Jika admin keuangan: mapping ke data tertentu saja
      if (userPeran === "admin keuangan") {
        results = results.map(order => ({
          pelanggan: order.pelanggan,
          nomorOrder: order.nomorOrder,
          fakturPajak: order.documents?.fakturPajak || { fileUrl: null, fileName: "Tidak Ada" },
          invoice: order.documents?.invoice || { fileUrl: null, fileName: "Tidak Ada" },
        }));
      }
  
      setFilteredOrders(results);
    }
  
    setIsSearching(true);
    setCurrentPage(1);
  };
  

  const handleReset = () => {
    setSearchQuery("");  // Kosongkan input pencarian
    setIsSearching(false);
    setCurrentPage(1);   // Reset ke halaman pertama
  
    let displayedOrders = [];
  
    if (userPeran === "admin portofolio") {
      displayedOrders = orders.filter(order => order.portofolio === userPortofolio);
    } else if (userPeran === "admin keuangan") {
      displayedOrders = orders.map(order => ({
        pelanggan: order.pelanggan,
        nomorOrder: order.nomorOrder,
        fakturPajak: order.documents?.fakturPajak || { fileUrl: null, fileName: "Tidak Ada" },
        invoice: order.documents?.invoice || { fileUrl: null, fileName: "Tidak Ada" },
      }));
    }
  
    setFilteredOrders(displayedOrders); // Tampilkan data sesuai peran
  };
  
  // ✅ Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  // ✅ Siapkan data untuk ditampilkan di tabel
const dokumenToRender = paginatedOrders.map((order) => {
  if (userPeran === "admin keuangan") {
    return {
      pelanggan: order.pelanggan,
      nomorOrder: order.nomorOrder,
      fakturPajak: order.documents?.fakturPajak || { fileUrl: null, fileName: "Tidak Ada" },
      invoice: order.documents?.invoice || { fileUrl: null, fileName: "Tidak Ada" },
    };
  }

  // Untuk selain admin keuangan (termasuk admin portofolio), tampilkan full order
  return order;
});


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-600">Memuat data pengguna...</p>
      </div>
    );
  }

  const getStatusClass = (status) => {
    if (status === "Tidak Ada" || !status || (typeof status === "object" && !status.fileUrl)) {
      return "inline-flex items-center px-3 py-1.5 text-xs rounded-full bg-red-100 text-red-800";
    }
    return "inline-flex items-center px-3 py-1.5 text-xs rounded-full bg-green-100 text-green-800";
  };

  return (
    <div className={`p-6 max-w-6xl mx-auto transition-all duration-700 ${
      mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
    }`}>
      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        {/* Blue accent top bar with gradient animation */}
        <div className="h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 animate-gradient-x"></div>
        
        <div className="p-6">
          <div className="flex items-center mb-6">
            <FileText className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-800">Daftar Dokumen Order</h2>
          </div>

          {/* 🔍 Input Pencarian dengan styling yang ditingkatkan */}
          <div className="flex flex-col md:flex-row gap-2 mb-6">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                placeholder="Cari berdasarkan Nomor Order atau Nama Pelanggan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all focus:outline-none"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium rounded-lg transition-all transform hover:scale-[1.01] shadow-md"
            >
              <Search className="h-5 w-5 md:mr-2 inline-block" />
              <span className="hidden md:inline">Cari</span>
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-all transform hover:scale-[1.01] shadow-md"
            >
              <RefreshCw className="h-5 w-5 md:mr-2 inline-block" />
              <span className="hidden md:inline">Reset</span>
            </button>
          </div>

          {/* 📄 Tabel Data dengan desain yang lebih nyaman dilihat */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm mb-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Pelanggan</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nomor Order</th>
                  {userPeran === "admin portofolio" && <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">SI/SPK</th>}
                  {userPeran === "admin portofolio" && <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sertifikat</th>}
                  {userPeran === "admin portofolio" && <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sertifikat PM06</th>}
                  {userPeran === "admin keuangan" && <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Faktur Pajak</th>}
                  {userPeran === "admin keuangan" && <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Invoice</th>}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dokumenToRender.length > 0 ? (
                  dokumenToRender.map((order, index) => (
                    <tr key={order.nomorOrder || index} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.pelanggan || "-"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{order.nomorOrder || "-"}</div>
                      </td>

                      {/* Admin Portofolio */}
                      {userPeran === "admin portofolio" && (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {order.documents?.siSpk?.fileUrl ? (
                              <a 
                                href={order.documents.siSpk.fileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors shadow-sm"
                              >
                                <FileText className="w-3.5 h-3.5 mr-1" />
                                Lihat Dokumen
                              </a>
                            ) : (
                              <span className={getStatusClass("Tidak Ada")}>Tidak Ada</span>
                            )}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {order.documents?.sertifikat?.fileUrl ? (
                              <a 
                                href={order.documents.sertifikat.fileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors shadow-sm"
                              >
                                <FileText className="w-3.5 h-3.5 mr-1" />
                                Lihat Dokumen
                              </a>
                            ) : (
                              <span className={getStatusClass("Tidak Ada")}>Tidak Ada</span>
                            )}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {order.documents?.sertifikatPM06?.fileUrl ? (
                              <a 
                                href={order.documents.sertifikatPM06.fileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors shadow-sm"
                              >
                                <FileText className="w-3.5 h-3.5 mr-1" />
                                Lihat Dokumen
                              </a>
                            ) : (
                              <span className={getStatusClass("Tidak Ada")}>Tidak Ada</span>
                            )}
                          </td>
                        </>
                      )} 

                      {/* Admin Keuangan */}
                      {userPeran === "admin keuangan" && (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {order.fakturPajak?.fileUrl ? (
                              <a 
                                href={order.fakturPajak.fileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors shadow-sm"
                              >
                                <FileText className="w-3.5 h-3.5 mr-1" />
                                Lihat Dokumen
                              </a>
                            ) : (
                              <span className={getStatusClass("Tidak Ada")}>Tidak Ada</span>
                            )}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {order.invoice?.fileUrl ? (
                              <a 
                                href={order.invoice.fileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors shadow-sm"
                              >
                                <FileText className="w-3.5 h-3.5 mr-1" />
                                Lihat Dokumen
                              </a>
                            ) : (
                              <span className={getStatusClass("Tidak Ada")}>Tidak Ada</span>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={userPeran === "admin portofolio" ? 5 : 4} className="px-6 py-10 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <div className="rounded-full bg-gray-100 p-3 mb-2">
                          <FileText className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-base">{isSearching ? "Tidak ada hasil pencarian." : "Tidak ada data dokumen yang tersedia."}</p>
                        <p className="text-sm text-gray-400 mt-1">
                          {isSearching ? "Coba ubah atau reset filter pencarian." : "Dokumen akan muncul di sini ketika tersedia."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 🔄 Pagination dengan desain yang lebih menarik */}
          {filteredOrders.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
                <div className="text-sm text-gray-600 flex items-center">
                  <div className="bg-blue-100 text-blue-600 p-1 rounded-full mr-2">
                    <FileText className="h-4 w-4" />
                  </div>
                  Menampilkan <span className="font-medium mx-1">{startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredOrders.length)}</span> dari <span className="font-medium ml-1">{filteredOrders.length}</span> dokumen
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="p-2 rounded-lg bg-white border border-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  <div className="px-4 py-2 text-sm bg-blue-50 border border-blue-100 rounded-lg font-medium text-blue-800">
                    Halaman {currentPage} dari {Math.max(1, totalPages)}
                  </div>
                  
                  <button
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="p-2 rounded-lg bg-white border border-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DokumenOrder;