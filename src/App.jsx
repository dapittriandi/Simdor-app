import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Login from "./pages/auth/Login";
import DashboardCS from "./pages/dashboard/DashboardCS";
import DashboardKeuangan from "./pages/dashboard/DashboardKeuangan";
import DashboardPortofolio from "./pages/dashboard/DashboardPortofolio";
import OrderDetail from "./pages/orders/OrderDetail";
import CreateOrder from "./pages/orders/CreateOrders";
import LengkapiOrder from "./pages/orders/LengkapiOrder";
import OrdersPage from "./pages/orders/OrdersPage";
import EditOrder from "./pages/orders/EditOrder";
import DashboardKoordinator from "./pages/dashboard/DashboardKoordinator";
import LaporanOrders from "./pages/reports/LaporanOrders";
import DokumenOrder from "./pages/documents/DokumenOrder";
import ProfilePage from "./pages/profile/ProfilePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard-cs" element={<Layout><DashboardCS /></Layout>} />
        <Route path="/dashboard-keuangan" element={<Layout><DashboardKeuangan /></Layout>} />
        <Route path="/dashboard-portofolio" element={<Layout><DashboardPortofolio /></Layout>} />
        <Route path="/dashboard-koordinator" element={<Layout><DashboardKoordinator /></Layout>} />
        <Route path="/orders/:portofolio" element={<Layout><OrdersPage /></Layout>} />
        <Route path="/orders/:portofolio/create" element={<Layout><CreateOrder /></Layout>} />
        <Route path="/orders/:portofolio/detail/:id" element={<Layout><OrderDetail /></Layout>} />
        <Route path="/orders/:portofolio/detail/lengkapi/:id" element={<Layout><LengkapiOrder />
        </Layout>} />
        <Route path="/orders/:portofolio/detail/edit/:id" element={<Layout><EditOrder /></Layout>} />
        <Route path="/documents" element={<Layout><DokumenOrder /></Layout>} />
        <Route path="/laporan" element={<Layout><LaporanOrders /></Layout>} />
        <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />

      </Routes>
    </Router>
  );
}

export default App;
