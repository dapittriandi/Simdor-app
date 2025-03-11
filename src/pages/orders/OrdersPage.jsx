import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../services/firebase";
import { collection, query, where, orderBy, limit, startAfter, getDocs } from "firebase/firestore";
import debounce from "lodash.debounce"; // Import lodash untuk debounce

const OrdersPage = () => {
  const { portofolio } = useParams();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]); // Menyimpan semua data untuk searching di client
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Data user dari localStorage
  const userData = JSON.parse(localStorage.getItem("user"));
  const userPeran = userData?.peran || null;
  const userBidang = userData?.bidang || null;

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
  }, [portofolio, navigate, userPeran, userBidang, filterStatus, page]);

  // Fetch Orders dari Firestore
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const ordersRef = collection(db, "orders");
      let q = query(
        ordersRef,
        where("portofolio", "==", portofolio),
        orderBy("tanggalOrder", "desc"),
        limit(perPage)
      );

      if (filterStatus) {
        q = query(q, where("statusOrder", "==", filterStatus));
      }

      const querySnapshot = await getDocs(q);
      const ordersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAllOrders(ordersData); // Simpan semua data untuk pencarian di client-side
      setOrders(ordersData);
      setLastDoc(querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null);
      setHasNextPage(querySnapshot.docs.length === perPage);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
    setLoading(false);
  };

  // Search Function (Debounced)
  const debouncedSearch = useCallback(
    debounce((value) => {
      if (!value) {
        setOrders(allOrders); // Reset ke semua data jika searchQuery kosong
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

  const nextPage = () => {
    if (hasNextPage) {
      setPage(page + 1);
    }
  };

  const prevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  if (loading) return <p className="text-center text-gray-600">Loading orders...</p>;

  return (
    <div className="p-6">
      {userPeran === "admin portofolio" && (
        <button
          onClick={() => navigate(`/orders/${portofolio}/create`)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
        >
          + Tambah Order
        </button>
      )}

      <h2 className="text-2xl font-semibold mb-4">Daftar Order {portofolio?.toUpperCase()}</h2>

      {/* Pencarian & Filter */}
      <div className="flex space-x-4 mb-4">
        <input
          type="text"
          placeholder="Cari Nama Pelanggan / Nomor Order"
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
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-2 border">#</th>
              <th className="p-2 border">Nama Pelanggan</th>
              <th className="p-2 border">Status Order</th>
              <th className="p-2 border">Nomor Order</th>
              <th className="p-2 border">Tanggal Order</th>
              <th className="p-2 border">Lokasi Pekerjaan</th>
              <th className="p-2 border">Tonase DS</th>
              <th className="p-2 border">Nilai Proforma</th>
              <th className="p-2 border">Nomor Invoice</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order, index) => (
                <tr key={order.id} className="border">
                  <td className="p-2 border">{(page - 1) * perPage + index + 1}</td>
                  <td className="p-2 border">{order.pelanggan || "-"}</td>
                  <td className="p-2 border">{order.statusOrder || "-"}</td>
                  <td className="p-2 border">{order.nomorOrder || "-"}</td>
                  <td className="p-2 border">
                  {order.tanggalOrder
    ? order.tanggalOrder.seconds
      ? new Date(order.tanggalOrder.seconds * 1000).toLocaleDateString()
      : new Date(order.tanggalOrder).toLocaleDateString() // Jika berupa string
    : "-"}
                  </td>
                  <td className="p-2 border">{order.lokasiPekerjaan || "-"}</td>
                  <td className="p-2 border">{order.tonaseDS || "-"}</td>
                  <td className="p-2 border">Rp {order.nilaiProforma?.toLocaleString() || "-"}</td>
                  <td className="p-2 border">{order.nomorInvoice || "-"}</td>
                  <td className="p-2 border">
                    <button
                      onClick={() => navigate(`/orders/${portofolio}/detail/${order.id}`)}
                      className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="border p-2 text-center text-gray-500">
                  Tidak ada orders
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersPage;
