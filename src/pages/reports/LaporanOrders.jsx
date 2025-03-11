import { useState, useEffect } from "react";
import { db } from "../../services/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { exportToExcel } from "../../utils/exportToExcel";

const LaporanOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [portofolioFilter, setPortofolioFilter] = useState("");

  const userData = JSON.parse(localStorage.getItem("user"));
  const userPeran = userData?.peran || "";
  const userBidang = userData?.bidang || "";

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const ordersRef = collection(db, "orders");
      let q = userPeran === "admin portofolio"
        ? query(ordersRef, where("portofolio", "==", userBidang))
        : ordersRef;

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => {
        const order = doc.data();
        return {
          id: doc.id,
          pelanggan: order.pelanggan || "-",
          statusOrder: order.statusOrder || "-",
          nomorOrder: order.nomorOrder || "-",
          tanggalOrder: formatDate(order.tanggalOrder),
          tanggalPekerjaan: formatDate(order.tanggalPekerjaan),
          lokasiPekerjaan: order.lokasiPekerjaan || "-",
          tonaseDs: order.tonaseDS || "-",
          nilaiProforma: formatCurrency(order.nilaiProforma),
          nomorInvoice: order.nomorInvoice || "-",
          portofolio: order.portofolio || "-",
        };
      });

      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    if (timestamp?.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString("id-ID");
    }
    return new Date(timestamp).toLocaleDateString("id-ID");
  };

  const formatCurrency = (value) => {
    return value ? `Rp ${parseFloat(value).toLocaleString("id-ID")}` : "Rp 0";
  };

  const handleFilter = () => {
    let filtered = orders;

    if (startDate && endDate) {
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.tanggalOrder);
        return orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
      });
    }

    if (portofolioFilter) {
      filtered = filtered.filter((order) => order.portofolio === portofolioFilter);
    }

    setFilteredOrders(filtered);
  };

  const handleExport = () => {
    exportToExcel(filteredOrders, "Laporan Orders");
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Laporan Order</h2>

      {/* Filter */}
      <div className="flex flex-wrap gap-4 mb-4">
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border p-2" />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border p-2" />
        
        {userPeran !== "admin portofolio" && (
          <select value={portofolioFilter} onChange={(e) => setPortofolioFilter(e.target.value)} className="border p-2">
            <option value="">Semua Portofolio</option>
            <option value="batubara">Batubara</option>
            <option value="ksp">KSP</option>
            <option value="pik">PIK</option>
            <option value="industri">Industri</option>
            <option value="hmpm">HMPM</option>
            <option value="aebt">AEBT</option>
            <option value="mineral">Mineral</option>
            <option value="halal">Halal</option>
            <option value="laboratorium">Laboratorium</option>
            <option value="serco">SERCO</option>
            <option value="lsi">LSI</option>
          </select>
        )}

        <button onClick={handleFilter} className="bg-blue-600 text-white px-4 py-2 rounded">
          Filter
        </button>
        <button onClick={handleExport} className="bg-green-600 text-white px-4 py-2 rounded">
          Export Excel
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              {["Nama Pelanggan", "Status Order", "Nomor Order", "Tanggal Order",
                "Tanggal Pekerjaan", "Lokasi Pekerjaan", "Tonase DS",
                "Nilai Proforma", "Nomor Invoice", "Portofolio"
              ].map((header, index) => (
                <th key={index} className="p-2 border text-sm font-bold">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order, index) => (
                <tr key={index} className="border">
                  {Object.values(order).map((value, i) => (
                    <td key={i} className="p-2 border text-sm">{value}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center p-4">
                  Tidak ada data ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LaporanOrders;
