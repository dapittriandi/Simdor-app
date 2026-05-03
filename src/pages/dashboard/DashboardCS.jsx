import { useState, useEffect } from "react";
import { db } from "../../services/firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import {
  ClipboardDocumentListIcon,
  ClockIcon,
  CheckCircleIcon,
  ListBulletIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../components/layout/ThemeContext";

/* ─────────────────────────────────────────────
   STYLES  (same design language as Header.jsx)
───────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&display=swap');

.dcs-root { font-family: 'DM Sans', sans-serif; }

.dcs-bg-dark  { background: #070b18; min-height: 100vh; }
.dcs-bg-light { background: #f0f4ff; min-height: 100vh; }

.dcs-title-dark  { color: rgba(219,234,254,0.92); }
.dcs-title-light { color: #1e3a6e; }

/* Stat Cards */
.dcs-card-dark {
  background: rgba(13,20,45,0.75);
  border: 1px solid rgba(99,148,255,0.12);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03);
  border-radius: 16px;
  transition: border-color 0.22s, box-shadow 0.22s, transform 0.22s;
}
.dcs-card-dark:hover {
  border-color: rgba(96,165,250,0.3);
  box-shadow: 0 8px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(96,165,250,0.1);
  transform: translateY(-2px);
}
.dcs-card-light {
  background: rgba(255,255,255,0.88);
  border: 1px solid rgba(59,130,246,0.12);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 2px 16px rgba(59,130,246,0.07), inset 0 1px 0 rgba(255,255,255,0.9);
  border-radius: 16px;
  transition: border-color 0.22s, box-shadow 0.22s, transform 0.22s;
}
.dcs-card-light:hover {
  border-color: rgba(59,130,246,0.28);
  box-shadow: 0 6px 28px rgba(59,130,246,0.12);
  transform: translateY(-2px);
}

/* Panel (table / chart) */
.dcs-panel-dark {
  background: rgba(13,20,45,0.7);
  border: 1px solid rgba(99,148,255,0.1);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 4px 24px rgba(0,0,0,0.35);
  border-radius: 18px;
  overflow: hidden;
}
.dcs-panel-light {
  background: rgba(255,255,255,0.9);
  border: 1px solid rgba(59,130,246,0.1);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 2px 20px rgba(59,130,246,0.06);
  border-radius: 18px;
  overflow: hidden;
}

.dcs-panel-hdr-dark  { border-bottom: 1px solid rgba(99,148,255,0.1); }
.dcs-panel-hdr-light { border-bottom: 1px solid rgba(59,130,246,0.08); }

/* Typography */
.dcs-label-dark  { color: rgba(148,163,220,0.75); }
.dcs-label-light { color: #5878a8; }
.dcs-num-dark    { color: rgba(219,234,254,0.95); }
.dcs-num-light   { color: #1e3a6e; }
.dcs-muted-dark  { color: rgba(148,163,220,0.55); }
.dcs-muted-light { color: #7b95c4; }

.dcs-icon-wrap {
  width: 42px; height: 42px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

/* Table */
.dcs-thead-dark  { background: rgba(7,11,24,0.6); }
.dcs-thead-light { background: rgba(240,246,255,0.7); }
.dcs-th-dark  { color: rgba(148,163,220,0.65); font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; padding: 12px 16px; }
.dcs-th-light { color: #6885b5; font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; padding: 12px 16px; }
.dcs-td-dark  { color: rgba(179,193,240,0.85); font-size: 13px; padding: 11px 16px; border-bottom: 1px solid rgba(99,148,255,0.06); }
.dcs-td-light { color: #334e7a; font-size: 13px; padding: 11px 16px; border-bottom: 1px solid rgba(59,130,246,0.06); }
.dcs-td-name-dark  { color: rgba(219,234,254,0.9); font-weight: 500; }
.dcs-td-name-light { color: #1e3a6e; font-weight: 500; }
.dcs-tr-hover-dark:hover  { background: rgba(59,130,246,0.05); }
.dcs-tr-hover-light:hover { background: rgba(59,130,246,0.04); }

/* Error */
.dcs-error-dark  { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25); border-radius: 12px; color: rgba(252,165,165,0.9); }
.dcs-error-light { background: rgba(254,226,226,0.8); border: 1px solid rgba(239,68,68,0.2); border-radius: 12px; color: #b91c1c; }

/* Skeleton */
@keyframes skeletonShimmer {
  0%,100% { opacity: 0.4; } 50% { opacity: 0.8; }
}
.dcs-skeleton-dark  { background: rgba(99,148,255,0.1); border-radius: 6px; animation: skeletonShimmer 1.6s ease-in-out infinite; }
.dcs-skeleton-light { background: rgba(59,130,246,0.08); border-radius: 6px; animation: skeletonShimmer 1.6s ease-in-out infinite; }

/* Accent bar */
.dcs-card-accent {
  height: 3px; border-radius: 3px 3px 0 0;
  background: linear-gradient(90deg, var(--c1), var(--c2));
}

/* Entry animation */
@keyframes dcsCardIn {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
.dcs-animate { animation: dcsCardIn 0.5s cubic-bezier(0.22,1,0.36,1) both; }

/* Tooltip */
.dcs-tooltip-dark {
  background: rgba(7,11,24,0.96) !important;
  border: 1px solid rgba(99,148,255,0.2) !important;
  border-radius: 10px !important;
  box-shadow: 0 8px 24px rgba(0,0,0,0.5) !important;
  font-family: 'DM Sans', sans-serif !important;
}
.dcs-tooltip-light {
  background: rgba(248,251,255,0.98) !important;
  border: 1px solid rgba(59,130,246,0.18) !important;
  border-radius: 10px !important;
  box-shadow: 0 6px 20px rgba(59,130,246,0.1) !important;
  font-family: 'DM Sans', sans-serif !important;
}
`;

/* ─────────────────────────────────────────────
   STATUS BADGE
───────────────────────────────────────────── */
const STATUS_CONFIG = {
  "Entry":                  { bg: "rgba(16,185,129,0.15)",  border: "rgba(16,185,129,0.3)",  color: "#34d399" },
  "Diproses - Lapangan":    { bg: "rgba(59,130,246,0.15)",  border: "rgba(59,130,246,0.3)",  color: "#60a5fa" },
  "Archecking":             { bg: "rgba(245,158,11,0.15)",  border: "rgba(245,158,11,0.3)",  color: "#fbbf24" },
  "New Order":              { bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.25)",color: "#94a3b8" },
  "Selesai":                { bg: "rgba(20,184,166,0.15)",  border: "rgba(20,184,166,0.3)",  color: "#2dd4bf" },
  "Diproses - Sertifikat":  { bg: "rgba(139,92,246,0.15)",  border: "rgba(139,92,246,0.3)",  color: "#a78bfa" },
  "Closed":                 { bg: "rgba(249,115,22,0.15)",  border: "rgba(249,115,22,0.3)",  color: "#fb923c" },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { bg: "rgba(239,68,68,0.15)", border: "rgba(239,68,68,0.3)", color: "#f87171" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 500,
      background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color,
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />
      {status}
    </span>
  );
};

/* ─────────────────────────────────────────────
   STAT CARD CONFIG
───────────────────────────────────────────── */
const CARD_DEFS = (summary) => [
  {
    label: "Total Order",
    value: summary.totalOrders,
    Icon: ClipboardDocumentListIcon,
    c1: "#1d4ed8", c2: "#60a5fa",
    iconBg: "rgba(59,130,246,0.18)", iconColor: "#60a5fa",
    delay: "0ms",
  },
  {
    label: "Sedang Proses Lapangan",
    value: summary.processingOrders,
    sub: "Status: Diproses - Lapangan",
    Icon: ClockIcon,
    c1: "#d97706", c2: "#fb923c",
    iconBg: "rgba(245,158,11,0.18)", iconColor: "#fbbf24",
    delay: "70ms",
  },
  {
    label: "Order Selesai",
    value: summary.completedOrders,
    sub: "Status: Selesai",
    Icon: CheckCircleIcon,
    c1: "#0d9488", c2: "#2dd4bf",
    iconBg: "rgba(20,184,166,0.18)", iconColor: "#2dd4bf",
    delay: "140ms",
  },
  {
    label: "Status Lain",
    value: summary.otherStatusOrders,
    sub: "New Order, Entry, Closed, dll.",
    Icon: ListBulletIcon,
    c1: "#6366f1", c2: "#a78bfa",
    iconBg: "rgba(139,92,246,0.18)", iconColor: "#a78bfa",
    delay: "210ms",
  },
];

/* ─────────────────────────────────────────────
   SKELETON HELPERS
───────────────────────────────────────────── */
const Sk = ({ w, h, d, extraStyle = {} }) => (
  <div className={`dcs-skeleton-${d ? "dark" : "light"}`} style={{ width: w, height: h, ...extraStyle }} />
);

const SummaryCardSkeleton = ({ d }) => (
  <div className={`dcs-card-${d ? "dark" : "light"} p-5`} style={{ borderRadius: 16 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
      <Sk w="55%" h={14} d={d} />
      <Sk w={42} h={42} d={d} extraStyle={{ borderRadius: 12 }} />
    </div>
    <Sk w="35%" h={36} d={d} extraStyle={{ marginTop: 8 }} />
    <Sk w="50%" h={11} d={d} extraStyle={{ marginTop: 10 }} />
  </div>
);

const TableRowSkeleton = ({ d }) => (
  <tr>
    {[4, 28, 22, 16, 16, 16].map((w, i) => (
      <td key={i} className={`dcs-td-${d ? "dark" : "light"}`}>
        <Sk w={`${w}%`} h={13} d={d} />
      </td>
    ))}
  </tr>
);

const ChartSkeleton = ({ d }) => (
  <div style={{ height: 380, display: "flex", alignItems: "flex-end", gap: 8, padding: "24px 8px 0" }}>
    {[55, 70, 45, 80, 65, 90, 50, 75, 60, 85, 40, 72].map((h, i) => (
      <Sk key={i} w="100%" h={`${h}%`} d={d} extraStyle={{ borderRadius: "4px 4px 0 0", flex: 1 }} />
    ))}
  </div>
);

/* ─────────────────────────────────────────────
   CUSTOM RECHARTS TOOLTIP
───────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label, d }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={`dcs-tooltip-${d ? "dark" : "light"}`} style={{ padding: "10px 14px" }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: d ? "rgba(148,163,220,0.7)" : "#6885b5", marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 16, fontWeight: 600, color: d ? "#93c5fd" : "#1d4ed8" }}>
        {payload[0].value}{" "}
        <span style={{ fontSize: 12, fontWeight: 400, opacity: 0.7 }}>order</span>
      </p>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const DashboardCS = () => {
  const { isDark } = useTheme();
  const d = isDark;

  const [summary, setSummary] = useState({
    totalOrders: 0,
    processingOrders: 0,
    completedOrders: 0,
    otherStatusOrders: 0,
    recentOrders: [],
    orderTrends: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("user")) || {};
  const userPeran = userData.peran || "";

  useEffect(() => {
    if (!userPeran || userPeran !== "customer service") {
      alert("Anda tidak memiliki akses!");
      navigate("/");
      return;
    }
    fetchOrderSummary();
  }, [userPeran]);

  const getLast12Months = () => {
    const MONTHS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const result = [];
    for (let i = 0; i < 12; i++) {
      const m = (month - i + 12) % 12;
      const y = m > month ? year - 1 : year;
      result.unshift(`${MONTHS[m]} ${y}`);
    }
    return result;
  };

  const fetchOrderSummary = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const snapshot = await getDocs(
        query(collection(db, "orders"), orderBy("createdAt", "desc"))
      );
      const months = getLast12Months();
      let totalOrders = snapshot.size;
      let processingOrdersCount = 0;
      let completedOrdersCount = 0;
      let otherStatusOrdersCount = 0;
      let orderTrendsData = {};
      let recentOrdersData = [];

      const formatDate = (ts) => {
        if (!ts || typeof ts.seconds !== "number") return "—";
        try {
          return new Date(ts.seconds * 1000).toLocaleDateString("id-ID", {
            day: "2-digit", month: "short", year: "numeric",
          });
        } catch { return "—"; }
      };

      snapshot.forEach((doc) => {
        const data = doc.data();
        const status = data.statusOrder || "Unknown";

        if (status === "Selesai") completedOrdersCount++;
        else if (status === "Diproses - Lapangan") processingOrdersCount++;
        else otherStatusOrdersCount++;

        if (recentOrdersData.length < 10) {
          recentOrdersData.push({
            id: doc.id,
            pelanggan: data.pelanggan || "—",
            portofolio: data.portofolio || "—",
            statusOrder: status,
            tanggalOrder: formatDate(data.tanggalOrder),
            createdAt: formatDate(data.createdAt),
          });
        }

        if (data.createdAt?.seconds) {
          try {
            const orderDate = new Date(data.tanggalOrder.seconds * 1000);
            const monthYear = orderDate.toLocaleDateString("id-ID", { month: "short", year: "numeric" });
            orderTrendsData[monthYear] = (orderTrendsData[monthYear] || 0) + 1;
          } catch { /* skip */ }
        }
      });

      setSummary({
        totalOrders,
        processingOrders: processingOrdersCount,
        completedOrders: completedOrdersCount,
        otherStatusOrders: otherStatusOrdersCount,
        recentOrders: recentOrdersData,
        orderTrends: months.map((m) => ({ bulan: m, jumlah: orderTrendsData[m] || 0 })),
      });
    } catch (err) {
      console.error("Gagal mengambil ringkasan order:", err);
      setError("Tidak dapat memuat data ringkasan. Silakan coba lagi nanti.");
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Render ── */
  return (
    <>
      <style>{STYLES}</style>
      <div
        className={`dcs-root dcs-bg-${d ? "dark" : "light"}`}
        style={{ padding: "28px 24px 48px", transition: "background 0.4s" }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>

          {/* Page Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
            <div className="dcs-animate" style={{ animationDelay: "0ms" }}>
              <h2
                className={`dcs-title-${d ? "dark" : "light"}`}
                style={{ fontSize: 26, fontWeight: 600, margin: 0, display: "flex", alignItems: "center", gap: 10 }}
              >
                <ChartBarIcon style={{ width: 26, height: 26, color: "#3b82f6", flexShrink: 0 }} />
                Dashboard Customer Service
              </h2>
              <p
                className={`dcs-muted-${d ? "dark" : "light"}`}
                style={{ fontSize: 13, margin: "4px 0 0 36px" }}
              >
                Ringkasan aktivitas order secara real-time
              </p>
            </div>

            <button
              onClick={fetchOrderSummary}
              className="dcs-animate"
              style={{
                animationDelay: "50ms",
                display: "flex", alignItems: "center", gap: 7,
                padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 500,
                background: d ? "rgba(59,130,246,0.12)" : "rgba(59,130,246,0.08)",
                border: `1px solid ${d ? "rgba(96,165,250,0.25)" : "rgba(59,130,246,0.2)"}`,
                color: d ? "#93c5fd" : "#2563eb",
                cursor: "pointer", transition: "all 0.2s",
              }}
            >
              <ArrowPathIcon style={{ width: 15, height: 15 }} />
              Refresh
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              className={`dcs-error-${d ? "dark" : "light"}`}
              style={{ marginBottom: 24, padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: 12 }}
            >
              <ExclamationTriangleIcon style={{ width: 20, height: 20, flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ fontWeight: 600, fontSize: 14, margin: "0 0 2px" }}>Gagal Memuat Data</p>
                <p style={{ fontSize: 13, margin: 0, opacity: 0.85 }}>{error}</p>
              </div>
            </div>
          )}

          {/* Stat Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
            {isLoading
              ? [0,1,2,3].map((i) => <SummaryCardSkeleton key={i} d={d} />)
              : CARD_DEFS(summary).map(({ label, value, sub, Icon, c1, c2, iconBg, iconColor, delay }) => (
                <div
                  key={label}
                  className={`dcs-card-${d ? "dark" : "light"} dcs-animate`}
                  style={{ animationDelay: delay, overflow: "hidden" }}
                >
                  <div className="dcs-card-accent" style={{ "--c1": c1, "--c2": c2 }} />
                  <div style={{ padding: "16px 18px 18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <p className={`dcs-label-${d ? "dark" : "light"}`} style={{ fontSize: 13, fontWeight: 500, margin: 0, lineHeight: 1.35, maxWidth: "calc(100% - 54px)" }}>
                        {label}
                      </p>
                      <div className="dcs-icon-wrap" style={{ background: iconBg }}>
                        <Icon style={{ width: 20, height: 20, color: iconColor }} />
                      </div>
                    </div>
                    <p
                      className={`dcs-num-${d ? "dark" : "light"}`}
                      style={{ fontSize: 34, fontWeight: 700, margin: "0 0 4px", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}
                    >
                      {value.toLocaleString()}
                    </p>
                    {sub && (
                      <p className={`dcs-muted-${d ? "dark" : "light"}`} style={{ fontSize: 11.5, margin: 0 }}>{sub}</p>
                    )}
                  </div>
                </div>
              ))
            }
          </div>

          {/* Table Panel */}
          <div
            className={`dcs-panel-${d ? "dark" : "light"} dcs-animate`}
            style={{ animationDelay: "280ms", marginBottom: 24 }}
          >
            <div
              className={`dcs-panel-hdr-${d ? "dark" : "light"}`}
              style={{ padding: "18px 22px", display: "flex", alignItems: "center", gap: 10 }}
            >
              <ListBulletIcon style={{ width: 20, height: 20, color: d ? "rgba(148,163,220,0.6)" : "#6885b5", flexShrink: 0 }} />
              <div>
                <h3
                  className={`dcs-title-${d ? "dark" : "light"}`}
                  style={{ fontSize: 15, fontWeight: 600, margin: 0 }}
                >
                  Daftar 10 Order Terkini
                </h3>
                <p className={`dcs-muted-${d ? "dark" : "light"}`} style={{ fontSize: 12, margin: "2px 0 0" }}>
                  Diurutkan berdasarkan waktu pembuatan terbaru
                </p>
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
                <thead className={`dcs-thead-${d ? "dark" : "light"}`}>
                  <tr>
                    {["#", "Pelanggan", "Portofolio", "Status", "Tgl. Order", "Tgl. Dibuat"].map((h) => (
                      <th key={h} className={`dcs-th-${d ? "dark" : "light"}`} style={{ textAlign: "left" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading
                    ? [0,1,2,3,4].map((i) => <TableRowSkeleton key={i} d={d} />)
                    : summary.recentOrders.length > 0
                      ? summary.recentOrders.map((order, idx) => (
                        <tr
                          key={order.id}
                          className={`dcs-tr-hover-${d ? "dark" : "light"}`}
                          style={{ transition: "background 0.15s" }}
                        >
                          <td className={`dcs-td-${d ? "dark" : "light"}`} style={{ paddingLeft: 22, width: 48 }}>
                            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, opacity: 0.5 }}>
                              {String(idx + 1).padStart(2, "0")}
                            </span>
                          </td>
                          <td className={`dcs-td-${d ? "dark" : "light"} dcs-td-name-${d ? "dark" : "light"}`} style={{ whiteSpace: "nowrap" }}>
                            {order.pelanggan}
                          </td>
                          <td className={`dcs-td-${d ? "dark" : "light"}`} style={{ whiteSpace: "nowrap" }}>
                            {order.portofolio}
                          </td>
                          <td className={`dcs-td-${d ? "dark" : "light"}`}>
                            <StatusBadge status={order.statusOrder} />
                          </td>
                          <td className={`dcs-td-${d ? "dark" : "light"}`} style={{ whiteSpace: "nowrap", fontFamily: "'DM Mono', monospace", fontSize: 12 }}>
                            {order.tanggalOrder}
                          </td>
                          <td className={`dcs-td-${d ? "dark" : "light"}`} style={{ whiteSpace: "nowrap", fontFamily: "'DM Mono', monospace", fontSize: 12 }}>
                            {order.createdAt}
                          </td>
                        </tr>
                      ))
                      : (
                        <tr>
                          <td colSpan={6} style={{ textAlign: "center", padding: "36px 16px" }}>
                            <p className={`dcs-muted-${d ? "dark" : "light"}`} style={{ fontSize: 13, margin: 0 }}>
                              Tidak ada data order terbaru.
                            </p>
                          </td>
                        </tr>
                      )
                  }
                </tbody>
              </table>
            </div>
          </div>

          {/* Chart Panel */}
          <div
            className={`dcs-panel-${d ? "dark" : "light"} dcs-animate`}
            style={{ animationDelay: "350ms" }}
          >
            <div
              className={`dcs-panel-hdr-${d ? "dark" : "light"}`}
              style={{ padding: "18px 22px", display: "flex", alignItems: "center", gap: 10 }}
            >
              <ChartBarIcon style={{ width: 20, height: 20, color: d ? "rgba(148,163,220,0.6)" : "#6885b5", flexShrink: 0 }} />
              <div>
                <h3
                  className={`dcs-title-${d ? "dark" : "light"}`}
                  style={{ fontSize: 15, fontWeight: 600, margin: 0 }}
                >
                  Tren Order per Bulan
                </h3>
                <p className={`dcs-muted-${d ? "dark" : "light"}`} style={{ fontSize: 12, margin: "2px 0 0" }}>
                  Ditampilkan dalam 12 bulan terakhir berdasarkan tanggal order
                </p>
              </div>
            </div>
            <div style={{ padding: "16px 20px 24px" }}>
              {isLoading
                ? <ChartSkeleton d={d} />
                : summary.orderTrends.length > 0
                  ? (
                    <ResponsiveContainer width="100%" height={380}>
                      <BarChart data={summary.orderTrends} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
                        <defs>
                          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={d ? "#3b82f6" : "#2563eb"} stopOpacity={0.95} />
                            <stop offset="100%" stopColor={d ? "#60a5fa" : "#93c5fd"} stopOpacity={0.5} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={d ? "rgba(99,148,255,0.08)" : "rgba(59,130,246,0.08)"}
                        />
                        <XAxis
                          dataKey="bulan"
                          tick={{ fontSize: 11, fill: d ? "rgba(148,163,220,0.6)" : "#7b95c4", fontFamily: "'DM Sans', sans-serif" }}
                          axisLine={{ stroke: d ? "rgba(99,148,255,0.12)" : "rgba(59,130,246,0.1)" }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: d ? "rgba(148,163,220,0.6)" : "#7b95c4", fontFamily: "'DM Sans', sans-serif" }}
                          axisLine={false}
                          tickLine={false}
                          domain={["auto", "auto"]}
                          tickFormatter={(v) => v.toLocaleString()}
                        />
                        <Tooltip
                          content={<CustomTooltip d={d} />}
                          cursor={{ fill: d ? "rgba(59,130,246,0.06)" : "rgba(59,130,246,0.05)", radius: 6 }}
                        />
                        <Legend
                          wrapperStyle={{
                            fontSize: 12,
                            color: d ? "rgba(148,163,220,0.7)" : "#7b95c4",
                            fontFamily: "'DM Sans', sans-serif",
                            paddingTop: 12,
                          }}
                        />
                        <Bar
                          dataKey="jumlah"
                          name="Jumlah Order"
                          fill="url(#barGrad)"
                          radius={[6, 6, 0, 0]}
                          barSize={22}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )
                  : (
                    <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <p className={`dcs-muted-${d ? "dark" : "light"}`} style={{ fontSize: 13 }}>
                        Tidak ada data tren untuk ditampilkan.
                      </p>
                    </div>
                  )
              }
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default DashboardCS;