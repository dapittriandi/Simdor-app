import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Login from "./pages/auth/Login";
import DashboardCS from "./pages/dashboard/DashboardCS";
import DashboardKeuangan from "./pages/dashboard/DashboardKeuangan";
import DashboardPortofolio from "./pages/dashboard/DashboardPortofolio";
import OrdersPage from "./pages/orders/OrdersPage";
import OrderDetail from "./pages/orders/OrderDetail";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard-cs" element={<Layout><DashboardCS /></Layout>} />
        <Route path="/dashboard-keuangan" element={<Layout><DashboardKeuangan /></Layout>} />
        <Route path="/dashboard-portofolio" element={<Layout><DashboardPortofolio /></Layout>} />
        <Route path="/orders/:portofolio" element={<Layout><OrdersPage /></Layout>} />
        <Route path="/orders/:portofolio/order-detail/:id" element={<Layout><OrderDetail /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
