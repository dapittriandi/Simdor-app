import { useState, useEffect } from "react";
import { db } from "../../services/firebase";
import { collection, query, getDocs } from "firebase/firestore";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

// Fungsi untuk mengkapitalisasi huruf pertama setiap kata
const capitalizeFirstLetter = (str) => {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const DashboardKoordinator = () => {
  const [summary, setSummary] = useState({
    totalOrders: 0,
    totalProforma: 0,
    statusCounts: {},
    orderTrends: [],
    revenueByPortofolio: {},
  });

  useEffect(() => {
    fetchOrderSummary();
  }, []);

  const fetchOrderSummary = async () => {
    try {
      const ordersRef = collection(db, "orders");
      const snapshot = await getDocs(query(ordersRef));

      let totalOrders = 0;
      let totalProforma = 0;

      const statusCounts = {
        Draft: 0, Diproses: 0, Selesai: 0, Closed: 0, Hold: 0, "Next Order": 0, Archecking: 0,
      };

      const orderTrends = {};
      const revenueByPortofolio = {
        Batubara: 0, KSP: 0, PIK: 0, Industri: 0, HMPM: 0, AEBT: 0, Mineral: 0,
        Halal: 0, Laboratorium: 0, SERCO: 0, LSI: 0,
      };

      snapshot.forEach((doc) => {
        const data = doc.data();
        totalOrders++;
        totalProforma += Number(data.nilaiProforma) || 0;

        // Hitung jumlah order berdasarkan status
        if (data.statusOrder && statusCounts.hasOwnProperty(data.statusOrder)) {
          statusCounts[data.statusOrder] += 1;
        }

        // Hitung jumlah order per bulan
        if (data.tanggalOrder?.seconds) {
          const orderDate = new Date(data.tanggalOrder.seconds * 1000);
          const monthYear = `${orderDate.getMonth() + 1}/${orderDate.getFullYear()}`;
          orderTrends[monthYear] = (orderTrends[monthYear] || 0) + 1;
        }

        // Format portofolio agar cocok dengan daftar tetap
        if (data.portofolio) {
          const formattedPortofolio = capitalizeFirstLetter(data.portofolio.trim());

          if (revenueByPortofolio.hasOwnProperty(formattedPortofolio)) {
            revenueByPortofolio[formattedPortofolio] += Number(data.nilaiProforma) || 0;
          } else {
            console.warn(`⚠️ Portofolio tidak dikenal: ${formattedPortofolio}`);
          }
        }
      });

      // Konversi orderTrends menjadi array untuk grafik
      const orderTrendsArray = Object.keys(orderTrends)
        .sort((a, b) => new Date(a) - new Date(b))
        .map((key) => ({
          bulan: key,
          jumlah: orderTrends[key],
        }));

      setSummary({
        totalOrders,
        totalProforma,
        statusCounts,
        orderTrends: orderTrendsArray,
        revenueByPortofolio,
      });
    } catch (error) {
      console.error("Gagal mengambil ringkasan order:", error);
    }
  };

  const statusList = ["Draft", "Diproses", "Selesai", "Closed", "Hold", "Next Order", "Archecking"];
  const portofolioList = ["Batubara", "KSP", "PIK", "Industri", "HMPM", "AEBT", "Mineral", "Halal", "Laboratorium", "SERCO", "LSI"];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">📊 Dashboard Koordinator</h2>

      {/* Ringkasan Order */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white shadow-lg p-4 rounded-lg">
          <h3 className="text-lg font-semibold">Total Order</h3>
          <p className="text-3xl font-bold text-blue-500">{summary.totalOrders}</p>
        </div>
        <div className="bg-white shadow-lg p-4 rounded-lg">
          <h3 className="text-lg font-semibold">Total Nilai Proforma</h3>
          <p className="text-3xl font-bold text-green-500">Rp {summary.totalProforma.toLocaleString()}</p>
        </div>
        <div className="bg-white shadow-lg p-4 rounded-lg">
          <h3 className="text-lg font-semibold">Status Order</h3>
          <div className="space-y-2 text-sm">
            {statusList.map((status) => (
              <p key={status}>
                <strong>{status}:</strong> {summary.statusCounts[status] || 0}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Pendapatan per Portofolio */}
      <div className="bg-white shadow-lg p-6 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-4">💰 Pendapatan per Portofolio</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {portofolioList.map((portofolio) => (
            <div key={portofolio} className="p-4 bg-gray-100 rounded-lg">
              <p className="text-md font-semibold">{portofolio.toUpperCase()}</p>
              <p className="text-lg font-bold text-green-600">
                Rp {summary.revenueByPortofolio[portofolio]?.toLocaleString() || "0"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Grafik Tren Order */}
      <div className="bg-white shadow-lg p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">📈 Tren Order per Bulan</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={summary.orderTrends}>
            <XAxis dataKey="bulan" />
            <YAxis />
            <Tooltip />
            <CartesianGrid strokeDasharray="3 3" />
            <Bar dataKey="jumlah" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardKoordinator;
