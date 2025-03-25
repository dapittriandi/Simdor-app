import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../services/firebase";
import { collection, query, where, orderBy, limit, startAfter, getDocs } from "firebase/firestore";
import debounce from "lodash.debounce";

const OrdersPage = () => {
  const { portofolio } = useParams();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // ✅ Pagination State
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
      navigate("/login");
      return;
    }

    if (userPeran === "admin portofolio" && userBidang !== portofolio) {
      alert("Anda tidak memiliki akses!");
      navigate("/dashboard-portofolio");
      return;
    }

    fetchOrders();
  }, [portofolio, userPeran, userBidang, currentPage, filterStatus]);

  // ✅ Fetch data orders dari Firestore
  const fetchOrders = async () => {
    setLoading(true);
    try {
      let q = query(
        collection(db, "orders"),
        where("portofolio", "==", portofolio),
        orderBy("tanggalOrder", "desc"),
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
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
    setLoading(false);
  };

  // ✅ Fungsi Pencarian (Debounce)
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

  // ✅ Fungsi Filter Status Order
  useEffect(() => {
    if (!filterStatus) {
      setOrders(allOrders);
    } else {
      const filtered = allOrders.filter((order) => order.statusOrder === filterStatus);
      setOrders(filtered);
    }
  }, [filterStatus, allOrders]);

  // ✅ Fungsi Reset Pencarian & Filter
  const handleReset = () => {
    setSearchQuery("");
    setFilterStatus("");
    setOrders(allOrders);
  };

  // ✅ Fungsi untuk mengecek kelengkapan data
  const checkKelengkapan = (order) => {
    const requiredFields = [
      "pelanggan",
      "statusOrder",
      "nomorOrder",
      "tanggalOrder",
      "lokasiPekerjaan",
      "tonaseDS",
      "nilaiProforma",
      "nomorInvoice",
    ];
    return requiredFields.every((field) => order[field]) ? "✅ Lengkap" : "❌ Tidak Lengkap";
  };

  // ✅ Pagination Control
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

  if (loading) return <p className="text-center text-gray-600">⏳ Loading orders...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Daftar Order {portofolio?.toUpperCase()}</h2>

      {userPeran === "admin portofolio" && (
        <button
          onClick={() => navigate(`/orders/${portofolio}/create`)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
        >
          + Tambah Order
        </button>
      )}

      {/* 🔍 Pencarian & Filter */}
      <div className="flex space-x-4 mb-4">
        <input
          type="text"
          placeholder="Cari Nama Pelanggan / Nomor Order..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="p-2 border rounded w-1/3"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">Semua Status</option>
          <option value="Diproses">Diproses</option>
          <option value="Selesai">Selesai</option>
          <option value="Closed">Closed</option>
          <option value="Next Order">Next Order</option>
          <option value="Archecking">Archecking</option>
        </select>
        <button
          onClick={handleReset}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Reset
        </button>
      </div>

      {/* 📄 Tabel Data */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-2 border">#</th>
              <th className="p-2 border">Nama Pelanggan</th>
              <th className="p-2 border">Status Order</th>
              <th className="p-2 border">Nomor Order</th>
              <th className="p-2 border">Tanggal Order</th>
              <th className="p-2 border">Kelengkapan Data</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr key={order.id} className="border">
                <td className="p-2 border">{(currentPage - 1) * perPage + index + 1}</td>
                <td className="p-2 border">{order.pelanggan || "-"}</td>
                <td className="p-2 border">{order.statusOrder || "-"}</td>
                <td className="p-2 border">{order.nomorOrder || "-"}</td>
                <td className="p-2 border">
                  {order.tanggalOrder
                    ? new Date(order.tanggalOrder.seconds * 1000).toLocaleDateString()
                    : "-"}
                </td>
                <td className="p-2 border">{checkKelengkapan(order)}</td>
                <td className="p-2 border">
                  <button onClick={() => navigate(`/orders/${portofolio}/detail/${order.id}`)} className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600">
                    Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔄 Pagination */}
      <div className="flex justify-between mt-4">
        <button onClick={prevPage} disabled={currentPage === 1} className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50">Previous</button>
        <span>Halaman {currentPage}</span>
        <button onClick={nextPage} disabled={!hasNextPage} className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50">Next</button>
      </div>
    </div>
  );
};

export default OrdersPage;
