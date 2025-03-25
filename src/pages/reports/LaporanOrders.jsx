import { useState, useEffect } from "react";
import { db } from "../../services/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { exportToExcel } from "../../utils/exportToExcel";

const LaporanOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [portofolioFilter, setPortofolioFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Ambil Data User
  const userData = JSON.parse(localStorage.getItem("user")) || {};
  const userPeran = userData.peran || "";
  const userBidang = userData.bidang || "";

  useEffect(() => {
    fetchOrders();
  }, []);

  // ✅ Fungsi Format Tanggal (Pastikan Semua Data Aman)
  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString("id-ID");
    }
    if (typeof timestamp === "string" || typeof timestamp === "number") {
      return new Date(timestamp).toLocaleDateString("id-ID");
    }
    return "-";
  };

  // ✅ Ambil Data Order dari Firestore
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const ordersRef = collection(db, "orders");
      let q = null;

      if (userPeran === "admin portofolio") {
        q = query(ordersRef, where("portofolio", "==", userBidang), orderBy("tanggalOrder", "desc"));
      } else if (["customer service", "admin keuangan", "koordinator"].includes(userPeran)) {
        q = query(ordersRef, orderBy("tanggalOrder", "desc"));
      } else {
        setError("Anda tidak memiliki akses ke laporan ini.");
        setLoading(false);
        return;
      }

      if (!q) return;

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => {
        const order = doc.data();
        return {
          ...order,
          id: doc.id,
          tanggalStatusOrder: formatDate(order.tanggalStatusOrder),
          tanggalSerahOrderKeCs: formatDate(order.tanggalSerahOrderKeCs),
          tanggalOrder: formatDate(order.tanggalOrder),
          tanggalPekerjaan: formatDate(order.tanggalPekerjaan),
          proformaSerahKeOps: formatDate(order.proformaSerahKeOps),
          proformaSerahKeDukbis: formatDate(order.proformaSerahKeDukbis),
          tanggalPengirimanInvoice: formatDate(order.tanggalPengirimanInvoice),
          tanggalPengirimanFaktur: formatDate(order.tanggalPengirimanFaktur),
          distribusiSertifikatPengirimTanggal: formatDate(order.distribusiSertifikatPengirimTanggal),
          distribusiSertifikatPenerimaTanggal: formatDate(order.distribusiSertifikatPenerimaTanggal),
          updatedAt: formatDate(order.updatedAt),
        };
      });

      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Terjadi kesalahan saat mengambil data.");
    }
    setLoading(false);
  };

  const handleFilter = () => {
    let filtered = [...orders];

    if (startDate && endDate) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.tanggalOrder);
        return orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
      });
    }

    if (portofolioFilter && userPeran !== "admin portofolio") {
      filtered = filtered.filter(order => order.portofolio === portofolioFilter);
    }

    setFilteredOrders(filtered);
  };

  const handleExport = () => {
    exportToExcel(filteredOrders, "Laporan Orders");
  };

  // ✅ Semua Peran Melihat Semua Field
  const allColumns = [
    { key: "pelanggan", label: "Nama Pelanggan" },
    { key: "statusOrder", label: "Status Order" },
    { key: "tanggalStatusOrder", label: "Tanggal Status Order", isDate: true },
    { key: "tanggalSerahOrderKeCs", label: "Tanggal Serah Order ke CS", isDate: true },
    { key: "nomorOrder", label: "Nomor Order" },
    { key: "tanggalOrder", label: "Tanggal Order", isDate: true },
    { key: "tanggalPekerjaan", label: "Tanggal Pekerjaan", isDate: true },
    { key: "noSiSpk", label: "No SI/SPK" },
    { key: "jenisPekerjaan", label: "Jenis Pekerjaan" },
    { key: "namaTongkang", label: "Nama Tongkang" },
    { key: "lokasiPekerjaan", label: "Lokasi Pekerjaan" },
    { key: "estimasiTonase", label: "Estimasi Tonase" },
    { key: "tonaseDS", label: "Tonase DS" },
    { key: "nilaiProforma", label: "Nilai Proforma" },
    { key: "tanggalPengirimanInvoice", label: "Tanggal Pengiriman Invoice", isDate: true },
    { key: "tanggalPengirimanFaktur", label: "Tanggal Pengiriman Faktur", isDate: true },
    { key: "nomorInvoice", label: "Nomor Invoice" },
    { key: "fakturPajak", label: "Faktur Pajak" },
    { key: "dokumenSelesaiINV", label: "Dokumen Selesai INV" },
  ];

  if (loading) return <p>⏳ Memuat data...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Laporan Order</h2>

      {/* 🔹 Filter */}
      <div className="flex flex-wrap gap-4 mb-4">
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border p-2" />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border p-2" />

        {userPeran !== "admin portofolio" && (
          <select value={portofolioFilter} onChange={(e) => setPortofolioFilter(e.target.value)} className="border p-2">
            <option value="">Semua Portofolio</option>
            <option value="batubara">Batubara</option>
            <option value="mineral">Mineral</option>
            <option value="industri">Industri</option>
            <option value="ksp">KSP</option>
            <option value="pik">PIK</option>
            <option value="hmpm">HMPM</option>
            <option value="aebt">AEBT</option>
            <option value="halal">Halal</option>
            <option value="laboratorium">Laboratorium</option>
            <option value="serco">SERCO</option>
            <option value="lsi">LSI</option>
          </select>
        )}

        <button onClick={handleFilter} className="bg-blue-600 text-white px-4 py-2 rounded">Filter</button>
        {userPeran !== "koordinator" && <button onClick={handleExport} className="bg-green-600 text-white px-4 py-2 rounded">Export Excel</button>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 min-w-max">
          <thead><tr className="bg-gray-200">{allColumns.map(col => <th key={col.key} className="p-2 border">{col.label}</th>)}</tr></thead>
          <tbody>{filteredOrders.map(order => <tr key={order.id}>{allColumns.map(col => <td key={col.key} className="p-2 border">{order[col.key] || "-"}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </div>
  );
};

export default LaporanOrders;
