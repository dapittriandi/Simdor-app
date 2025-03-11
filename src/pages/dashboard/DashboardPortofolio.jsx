import { useState, useEffect } from "react";
import { db } from "../../services/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

const DashboardPortofolio = () => {
  const userData = JSON.parse(localStorage.getItem("user"));
  const userBidang = userData?.bidang || "";

  const [totalOrders, setTotalOrders] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [orderTrends, setOrderTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderSummary = async () => {
      setLoading(true);
      try {
        const ordersRef = collection(db, "orders");

        // Fetch total orders
        const totalQuery = query(ordersRef, where("portofolio", "==", userBidang));
        const totalSnapshot = await getDocs(totalQuery);
        setTotalOrders(totalSnapshot.size);

        // Fetch completed (closed) orders
        const closedQuery = query(
          ordersRef,
          where("portofolio", "==", userBidang),
          where("statusOrder", "==", "Closed")
        );
        const closedSnapshot = await getDocs(closedQuery);
        setCompletedOrders(closedSnapshot.size);

        // Calculate pending orders (total - closed)
        setPendingOrders(totalSnapshot.size - closedSnapshot.size);

        // Calculate total revenue
        let revenue = 0;
        let trends = {};

        totalSnapshot.forEach((doc) => {
          const data = doc.data();
          revenue += Number(data.nilaiProforma) || 0;

          if (data.tanggalOrder?.seconds) {
            const orderDate = new Date(data.tanggalOrder.seconds * 1000);
            const monthYear = `${orderDate.getMonth() + 1}/${orderDate.getFullYear()}`;
            trends[monthYear] = (trends[monthYear] || 0) + 1;
          }
        });

        setTotalRevenue(revenue);

        // Convert trends object to array & urutkan berdasarkan bulan
        const trendsArray = Object.keys(trends)
          .sort((a, b) => new Date(`01/${a}`) - new Date(`01/${b}`))
          .map((key) => ({
            bulan: key,
            jumlah: trends[key],
          }));

        setOrderTrends(trendsArray);
      } catch (error) {
        console.error("Error fetching order summary:", error);
      }
      setLoading(false);
    };

    fetchOrderSummary();
  }, [userBidang]);

  if (loading) return <p className="text-center text-gray-600">🔄 Loading data...</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white shadow-xl rounded-lg">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Dashboard Portofolio ({userBidang.toUpperCase()})</h2>

      {/* Ringkasan Order */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 shadow-lg p-6 rounded-lg text-white text-center">
          <h3 className="text-lg font-semibold">Total Order</h3>
          <p className="text-4xl font-bold">{totalOrders}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-700 shadow-lg p-6 rounded-lg text-white text-center">
          <h3 className="text-lg font-semibold">Order Selesai</h3>
          <p className="text-4xl font-bold">{completedOrders}</p>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-red-700 shadow-lg p-6 rounded-lg text-white text-center">
          <h3 className="text-lg font-semibold">Order Belum Selesai</h3>
          <p className="text-4xl font-bold">{pendingOrders}</p>
        </div>
      </div>

      {/* Total Revenue */}
      <div className="bg-white shadow-lg p-6 rounded-lg mb-6 text-center">
        <h3 className="text-lg font-semibold mb-2">Total Pendapatan</h3>
        <h2 className="text-4xl font-bold text-green-600">Rp {totalRevenue.toLocaleString()}</h2>
      </div>

      {/* Grafik Tren Order - Bar Chart */}
      <div className="bg-white shadow-lg p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-center">Tren Order</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={orderTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="bulan" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="jumlah" fill="#3b82f6" name="Jumlah Order" barSize={50} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardPortofolio;
