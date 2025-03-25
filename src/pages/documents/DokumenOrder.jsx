import { useState, useEffect } from "react";
import { getOrders } from "../../services/orderServices";

const DokumenOrder = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // ✅ Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ✅ Ambil user dari localStorage (DILUAR IF)
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser || null);
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
      displayedOrders = orders.map(order => ({
        pelanggan: order.pelanggan,
        nomorOrder: order.nomorOrder,
        fakturPajak: order.documents?.fakturPajak || { fileUrl: null, fileName: "Tidak Ada" },
        invoice: order.documents?.invoice || { fileUrl: null, fileName: "Tidak Ada" },
      }));
    }
  
    setFilteredOrders(displayedOrders);
  }, [orders, userPeran, userPortofolio]);
  

  // ✅ Fungsi pencarian dengan tombol
  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      handleReset();
    } else {
      let results = orders.filter(order =>
        order.pelanggan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.nomorOrder.toLowerCase().includes(searchQuery.toLowerCase())
      );
  
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
        fakturPajak: order.documents?.fakturPajak || "Tidak Ada",
        invoice: order.documents?.invoice || "Tidak Ada",
      }));
    }
  
    setFilteredOrders(displayedOrders); // Tampilkan data sesuai peran
  };
  

  // ✅ Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  if (loading) return <p className="text-center text-gray-600">Loading...</p>;
  if (!user) return <p className="text-center text-gray-600">Memuat data pengguna...</p>;

  return (
    <div className="max-w-6xl mx-auto mt-5 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Daftar Dokumen Order</h2>

      {/* 🔍 Input Pencarian */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Cari berdasarkan Nomor Order atau Nama Pelanggan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border rounded-lg"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Cari
        </button>
        <button
          onClick={handleReset}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-200"
        >
          Reset
        </button>
      </div>

      {/* 📄 Tabel Data */}
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Nama Pelanggan</th>
            <th className="border p-2">Nomor Order</th>
            {userPeran === "admin portofolio" && <th className="border p-2">SI/SPK</th>}
            {userPeran === "admin portofolio" && <th className="border p-2">Sertifikat</th>}
            {userPeran === "admin portofolio" && <th className="border p-2">Sertifikat PM06</th>}
            {userPeran === "admin keuangan" && <th className="border p-2">Faktur Pajak</th>}
            {userPeran === "admin keuangan" && <th className="border p-2">Invoice</th>}
          </tr>
        </thead>
        <tbody>
          {paginatedOrders.length > 0 ? (
            paginatedOrders.map(order => (
              <tr key={order.nomorOrder} className="border-t">
                <td className="border p-2">{order.pelanggan}</td>
                <td className="border p-2">{order.nomorOrder}</td>

                {/* Admin Portofolio */}
                {userPeran === "admin portofolio" && (
                  <>
                    <td className="border p-2">
                      {order.documents?.siSpk ? (
                        <a href={order.documents.siSpk.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          Lihat SI/SPK
                        </a>
                      ) : "Tidak Ada"}
                    </td>

                    <td className="border p-2">
                      {order.documents?.sertifikat ? (
                        <a href={order.documents.sertifikat.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          Lihat Sertifikat
                        </a>
                      ) : "Tidak Ada"}
                    </td>

                    <td className="border p-2">
                      {order.documents?.sertifikatPM06 ? (
                        <a href={order.documents.sertifikatPM06.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          Lihat Sertifikat PM06
                        </a>
                      ) : "Tidak Ada"}
                    </td>

                  </>
                )} 

                {/* Admin Keuangan */}
                {userPeran === "admin keuangan" && (
                  <>
                    <td className="border p-2">
                      {order.fakturPajak?.fileUrl ? (
                        <a href={order.fakturPajak.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          Lihat Faktur Pajak
                        </a>
                      ) : "Tidak Ada"}
                    </td>

                    <td className="border p-2">
                      {order.invoice?.fileUrl ? (
                        <a href={order.invoice.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          Lihat Invoice
                        </a>
                      ) : "Tidak Ada"}
                    </td>
                  </>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center text-gray-600 p-4">
                {isSearching ? "Tidak ada hasil pencarian." : "Tidak ada data order yang cocok."}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 🔄 Pagination */}
      <div className="flex justify-between mt-4">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(prev => prev - 1)}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>Halaman {currentPage} dari {totalPages}</span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(prev => prev + 1)}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default DokumenOrder;
