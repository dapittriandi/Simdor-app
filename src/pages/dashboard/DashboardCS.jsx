import { useState, useEffect } from "react";
import { db } from "../../services/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const DashboardCS = () => {
  const [summary, setSummary] = useState({
    totalOrders: 0,
    processingOrders: 0,
    completedOrders: 0,
    recentOrders: [],
    orderTrends: [],
  });

  useEffect(() => {
    fetchOrderSummary();
  }, []);

  const fetchOrderSummary = async () => {
    try {
      const ordersRef = collection(db, "orders");
      
      // Ambil semua order
      const snapshot = await getDocs(query(ordersRef, orderBy("createdAt", "desc")));

      let totalOrders = snapshot.size;
      let processingOrders = 0;
      let completedOrders = 0;
      let orderTrends = {};
      let recentOrders = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.statusOrder === "Closed") {
          completedOrders++;
        } else {
          processingOrders++;
        }

        // Ambil 10 order terbaru berdasarkan createdAt
        if (recentOrders.length < 10) {
          recentOrders.push({
            id: doc.id,
            pelanggan: data.pelanggan || "-",
            portofolio: data.portofolio || "-",
            statusOrder: data.statusOrder || "-",
            tanggalOrder: data.tanggalOrder?.seconds ? new Date(data.tanggalOrder.seconds * 1000).toLocaleDateString() : "-",
            createdAt: data.createdAt?.seconds ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : "-",
          });
        }

        // Hitung jumlah order per bulan
        if (data.createdAt?.seconds) {
          const orderDate = new Date(data.createdAt.seconds * 1000);
          const monthYear = `${orderDate.getMonth() + 1}/${orderDate.getFullYear()}`;
          orderTrends[monthYear] = (orderTrends[monthYear] || 0) + 1;
        }
      });

      // Konversi orderTrends menjadi array untuk grafik
      const orderTrendsArray = Object.keys(orderTrends).map((key) => ({
        bulan: key,
        jumlah: orderTrends[key],
      }));

      setSummary({
        totalOrders,
        processingOrders,
        completedOrders,
        recentOrders,
        orderTrends: orderTrendsArray,
      });
    } catch (error) {
      console.error("Gagal mengambil ringkasan order:", error);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Dashboard Customer Service</h2>

      {/* Ringkasan Order */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white shadow-lg p-4 rounded-lg">
          <h3 className="text-lg font-semibold">Total Order</h3>
          <p className="text-3xl font-bold text-blue-500">{summary.totalOrders}</p>
        </div>
        <div className="bg-white shadow-lg p-4 rounded-lg">
          <h3 className="text-lg font-semibold">Order Sedang Diproses</h3>
          <p className="text-3xl font-bold text-orange-500">{summary.processingOrders}</p>
        </div>
        <div className="bg-white shadow-lg p-4 rounded-lg">
          <h3 className="text-lg font-semibold">Order Selesai (Closed)</h3>
          <p className="text-3xl font-bold text-green-500">{summary.completedOrders}</p>
        </div>
      </div>

      {/* Daftar Order Terkini */}
      <div className="bg-white shadow-lg p-6 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-4">Daftar Order Terkini</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-2 border">#</th>
                <th className="p-2 border">Nama Pelanggan</th>
                <th className="p-2 border">Portofolio</th>
                <th className="p-2 border">Status Order</th>
                <th className="p-2 border">Tanggal Order</th>
                <th className="p-2 border">Tanggal Order Dibuat</th>
              </tr>
            </thead>
            <tbody>
              {summary.recentOrders.length > 0 ? (
                summary.recentOrders.map((order, index) => (
                  <tr key={order.id} className="border">
                    <td className="p-2 border">{index + 1}</td>
                    <td className="p-2 border">{order.pelanggan}</td>
                    <td className="p-2 border">{order.portofolio}</td>
                    <td className="p-2 border">{order.statusOrder}</td>
                    <td className="p-2 border">{order.tanggalOrder}</td>
                    <td className="p-2 border">{order.createdAt}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="border p-2 text-center text-gray-500">
                    Tidak ada order terbaru
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grafik Tren Order */}
      <div className="bg-white shadow-lg p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Tren Order per Bulan</h3>
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

export default DashboardCS;
