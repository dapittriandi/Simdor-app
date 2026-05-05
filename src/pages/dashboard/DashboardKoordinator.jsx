import { useState, useEffect } from "react";
import { db } from "../../services/firebase";
import { collection, query, getDocs } from "firebase/firestore";
import { useUser } from "../../context/UserContext";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import {
  ChartBarIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  BuildingLibraryIcon,
  TableCellsIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../components/layout/ThemeContext"; // sesuaikan path jika perlu

/* ─────────────────────────────────────────────
   STYLES — selaras dengan palet Header.jsx
───────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&display=swap');

.dk-root { font-family: 'DM Sans', sans-serif; }

/* ── Page background ── */
.dk-bg-dark  { background: #070b18; min-height: 100vh; }
.dk-bg-light { background: #f0f6ff; min-height: 100vh; }

/* ── Section title ── */
.dk-title-dark  { color: #e2e8f5; }
.dk-title-light { color: #1e3a5f; }
.dk-subtitle-dark  { color: rgba(99,148,255,0.5); }
.dk-subtitle-light { color: rgba(37,99,235,0.5); }

/* ── Glass card base ── */
.dk-card-dark {
  background: rgba(12,18,40,0.75);
  backdrop-filter: blur(24px) saturate(160%);
  -webkit-backdrop-filter: blur(24px) saturate(160%);
  border: 1px solid rgba(99,148,255,0.13);
  box-shadow: 0 4px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.03);
  border-radius: 18px;
  transition: border-color 0.25s, box-shadow 0.25s;
}
.dk-card-dark:hover {
  border-color: rgba(96,165,250,0.28);
  box-shadow: 0 8px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(96,165,250,0.08);
}

.dk-card-light {
  background: rgba(240,246,255,0.82);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(59,130,246,0.14);
  box-shadow: 0 4px 24px rgba(59,130,246,0.08), inset 0 1px 0 rgba(255,255,255,0.7);
  border-radius: 18px;
  transition: border-color 0.25s, box-shadow 0.25s;
}
.dk-card-light:hover {
  border-color: rgba(59,130,246,0.28);
  box-shadow: 0 8px 36px rgba(59,130,246,0.13);
}

/* ── Card header divider ── */
.dk-card-divider-dark  { border-bottom: 1px solid rgba(99,148,255,0.1); }
.dk-card-divider-light { border-bottom: 1px solid rgba(59,130,246,0.1); }

/* ── Stat card accent glow ── */
.dk-stat-glow-blue  { box-shadow: 0 0 28px rgba(59,130,246,0.18); }
.dk-stat-glow-green { box-shadow: 0 0 28px rgba(16,185,129,0.16); }
.dk-stat-glow-purple{ box-shadow: 0 0 28px rgba(139,92,246,0.16); }
.dk-stat-glow-amber { box-shadow: 0 0 28px rgba(245,158,11,0.16); }

/* ── Stat number ── */
.dk-num-blue   { background: linear-gradient(135deg,#3b82f6,#93c5fd); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
.dk-num-green  { background: linear-gradient(135deg,#10b981,#6ee7b7); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
.dk-num-purple { background: linear-gradient(135deg,#8b5cf6,#c4b5fd); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
.dk-num-amber  { background: linear-gradient(135deg,#f59e0b,#fde68a); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }

/* ── Icon wrapper ── */
.dk-icon-dark  { background: rgba(255,255,255,0.05); border: 1px solid rgba(99,148,255,0.15); border-radius: 12px; }
.dk-icon-light { background: rgba(255,255,255,0.8);  border: 1px solid rgba(59,130,246,0.16); border-radius: 12px; box-shadow: 0 1px 4px rgba(59,130,246,0.08); }

/* ── Card label text ── */
.dk-label-dark  { color: rgba(148,163,220,0.7); font-size: 13px; font-weight: 500; }
.dk-label-light { color: #4b6ea8; font-size: 13px; font-weight: 500; }

/* ── Status badge variants ── */
.dk-badge { display:inline-flex; align-items:center; padding:2px 10px; border-radius:20px; font-size:11px; font-weight:600; letter-spacing:0.03em; white-space:nowrap; }

.dk-badge-gray-dark   { background:rgba(99,148,255,0.08);  border:1px solid rgba(99,148,255,0.2);  color:rgba(179,193,240,0.85); }
.dk-badge-gray-light  { background:rgba(241,245,249,1);     border:1px solid rgba(203,213,225,1);   color:#475569; }

.dk-badge-green-dark  { background:rgba(16,185,129,0.12); border:1px solid rgba(16,185,129,0.25); color:#6ee7b7; }
.dk-badge-green-light { background:rgba(220,252,231,1);   border:1px solid rgba(134,239,172,1);   color:#15803d; }

.dk-badge-blue-dark   { background:rgba(59,130,246,0.12); border:1px solid rgba(59,130,246,0.25); color:#93c5fd; }
.dk-badge-blue-light  { background:rgba(219,234,254,1);   border:1px solid rgba(147,197,253,1);   color:#1d4ed8; }

.dk-badge-purple-dark  { background:rgba(139,92,246,0.12); border:1px solid rgba(139,92,246,0.25); color:#c4b5fd; }
.dk-badge-purple-light { background:rgba(237,233,254,1);   border:1px solid rgba(196,181,253,1);   color:#6d28d9; }

.dk-badge-yellow-dark  { background:rgba(245,158,11,0.12); border:1px solid rgba(245,158,11,0.25); color:#fde68a; }
.dk-badge-yellow-light { background:rgba(254,243,199,1);   border:1px solid rgba(253,230,138,1);   color:#b45309; }

.dk-badge-orange-dark  { background:rgba(249,115,22,0.12); border:1px solid rgba(249,115,22,0.25); color:#fdba74; }
.dk-badge-orange-light { background:rgba(255,237,213,1);   border:1px solid rgba(253,186,116,1);   color:#c2410c; }

.dk-badge-teal-dark   { background:rgba(20,184,166,0.12); border:1px solid rgba(20,184,166,0.25); color:#5eead4; }
.dk-badge-teal-light  { background:rgba(204,251,241,1);   border:1px solid rgba(153,246,228,1);   color:#0f766e; }

.dk-badge-red-dark    { background:rgba(239,68,68,0.12); border:1px solid rgba(239,68,68,0.25); color:#fca5a5; }
.dk-badge-red-light   { background:rgba(254,226,226,1);  border:1px solid rgba(252,165,165,1);  color:#b91c1c; }

/* ── Portofolio mini card ── */
.dk-porto-dark {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(99,148,255,0.1);
  border-radius: 12px;
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
}
.dk-porto-dark:hover {
  background: rgba(59,130,246,0.07);
  border-color: rgba(96,165,250,0.28);
  box-shadow: 0 0 20px rgba(59,130,246,0.12);
}
.dk-porto-light {
  background: rgba(255,255,255,0.72);
  border: 1px solid rgba(59,130,246,0.12);
  border-radius: 12px;
  box-shadow: 0 1px 6px rgba(59,130,246,0.07);
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
}
.dk-porto-light:hover {
  background: rgba(255,255,255,1);
  border-color: rgba(59,130,246,0.28);
  box-shadow: 0 4px 18px rgba(59,130,246,0.11);
}

/* ── Porto label & value ── */
.dk-porto-label-dark  { font-size:10px; font-weight:700; letter-spacing:0.1em; color:rgba(99,148,255,0.55); }
.dk-porto-label-light { font-size:10px; font-weight:700; letter-spacing:0.1em; color:rgba(37,99,235,0.45); }
.dk-porto-val-dark    { font-size:14px; font-weight:600; color:#93c5fd; font-family:'DM Mono',monospace; }
.dk-porto-val-light   { font-size:14px; font-weight:600; color:#1d4ed8; font-family:'DM Mono',monospace; }

/* ── Total highlight pill ── */
.dk-total-pill-dark  { background:rgba(37,99,235,0.14); border:1px solid rgba(59,130,246,0.22); border-radius:14px; }
.dk-total-pill-light { background:rgba(219,234,254,0.7); border:1px solid rgba(59,130,246,0.18); border-radius:14px; }
.dk-total-pill-label-dark  { font-size:12px; color:rgba(148,163,220,0.7); }
.dk-total-pill-label-light { font-size:12px; color:#4b6ea8; }
.dk-total-pill-val-dark  { font-size:20px; font-weight:700; color:#60a5fa; font-family:'DM Mono',monospace; }
.dk-total-pill-val-light { font-size:20px; font-weight:700; color:#1d4ed8; font-family:'DM Mono',monospace; }

/* ── Chart tooltip ── */
.dk-tooltip-dark  { background:rgba(7,11,24,0.95)!important; border:1px solid rgba(99,148,255,0.2)!important; border-radius:10px!important; color:#e2e8f5!important; font-family:'DM Sans',sans-serif!important; font-size:12px!important; }
.dk-tooltip-light { background:rgba(248,251,255,0.98)!important; border:1px solid rgba(59,130,246,0.15)!important; border-radius:10px!important; color:#1e3a5f!important; font-family:'DM Sans',sans-serif!important; font-size:12px!important; }

/* ── Error banner ── */
.dk-error-dark  { background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.25); border-radius:14px; color:#fca5a5; }
.dk-error-light { background:rgba(254,226,226,0.8); border:1px solid rgba(252,165,165,0.5); border-radius:14px; color:#b91c1c; }

/* ── Skeleton shimmer ── */
@keyframes dkShimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
.dk-skel-dark {
  background: linear-gradient(90deg, rgba(30,40,80,0.6) 25%, rgba(50,65,120,0.4) 50%, rgba(30,40,80,0.6) 75%);
  background-size: 800px 100%;
  animation: dkShimmer 1.6s infinite linear;
  border-radius: 8px;
}
.dk-skel-light {
  background: linear-gradient(90deg, rgba(219,234,254,0.6) 25%, rgba(191,219,254,0.4) 50%, rgba(219,234,254,0.6) 75%);
  background-size: 800px 100%;
  animation: dkShimmer 1.6s infinite linear;
  border-radius: 8px;
}

/* ── Page fade-in ── */
@keyframes dkPageIn {
  from { opacity:0; transform: translateY(16px); }
  to   { opacity:1; transform: translateY(0); }
}
.dk-page-in { animation: dkPageIn 0.6s cubic-bezier(0.22,1,0.36,1) forwards; }

@keyframes dkCardIn {
  from { opacity:0; transform: translateY(20px) scale(0.98); }
  to   { opacity:1; transform: translateY(0) scale(1); }
}
.dk-card-in-1 { animation: dkCardIn 0.55s 0.05s cubic-bezier(0.22,1,0.36,1) both; }
.dk-card-in-2 { animation: dkCardIn 0.55s 0.12s cubic-bezier(0.22,1,0.36,1) both; }
.dk-card-in-3 { animation: dkCardIn 0.55s 0.19s cubic-bezier(0.22,1,0.36,1) both; }
.dk-card-in-4 { animation: dkCardIn 0.55s 0.26s cubic-bezier(0.22,1,0.36,1) both; }
.dk-card-in-5 { animation: dkCardIn 0.55s 0.33s cubic-bezier(0.22,1,0.36,1) both; }
.dk-card-in-6 { animation: dkCardIn 0.55s 0.40s cubic-bezier(0.22,1,0.36,1) both; }

/* ── Accent bar (same as Header) ── */
@keyframes accentFlow { 0%{background-position:0 0} 100%{background-position:200% 0} }
.dk-accent-dark {
  height: 2px;
  background: linear-gradient(90deg,transparent 0%,#1d4ed8 15%,#60a5fa 40%,#a78bfa 60%,#3b82f6 80%,transparent 100%);
  background-size: 200% 100%;
  animation: accentFlow 4s linear infinite;
  border-radius: 0 0 2px 2px;
}
.dk-accent-light {
  height: 2px;
  background: linear-gradient(90deg,transparent 0%,#3b82f6 15%,#93c5fd 40%,#6366f1 60%,#3b82f6 80%,transparent 100%);
  background-size: 200% 100%;
  animation: accentFlow 4s linear infinite;
  border-radius: 0 0 2px 2px;
}

/* ── Refresh button ── */
.dk-refresh-dark  { background:rgba(255,255,255,0.04); border:1px solid rgba(99,148,255,0.18); border-radius:10px; color:rgba(148,163,220,0.75); transition:all 0.2s; }
.dk-refresh-dark:hover  { background:rgba(59,130,246,0.1); border-color:rgba(96,165,250,0.35); color:#93c5fd; box-shadow:0 0 16px rgba(59,130,246,0.15); }
.dk-refresh-light { background:rgba(255,255,255,0.75); border:1px solid rgba(59,130,246,0.18); border-radius:10px; color:#4b6ea8; transition:all 0.2s; box-shadow:0 1px 4px rgba(59,130,246,0.08); }
.dk-refresh-light:hover { background:rgba(59,130,246,0.08); border-color:rgba(59,130,246,0.35); color:#2563eb; box-shadow:0 0 14px rgba(59,130,246,0.12); }

@keyframes spin { to { transform: rotate(360deg); } }
.dk-spinning { animation: spin 0.8s linear infinite; }

/* ── Section heading text ── */
.dk-section-title-dark  { font-size:15px; font-weight:600; color:#e2e8f5; }
.dk-section-title-light { font-size:15px; font-weight:600; color:#1e3a5f; }
.dk-section-sub-dark    { font-size:11.5px; color:rgba(99,148,255,0.5); margin-top:2px; }
.dk-section-sub-light   { font-size:11.5px; color:rgba(37,99,235,0.45); margin-top:2px; }

/* ── Status row separator ── */
.dk-status-row + .dk-status-row { border-top: 1px solid; }
.dk-status-row-sep-dark  { border-color: rgba(99,148,255,0.07); }
.dk-status-row-sep-light { border-color: rgba(59,130,246,0.07); }
`;

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const capitalizeFirstLetter = (str) =>
  str.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");

const getLast12Months = () => {
  const months = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  const now = new Date();
  const month = now.getMonth();
  const year  = now.getFullYear();
  const result = [];
  for (let i = 0; i < 12; i++) {
    const m = (month - i + 12) % 12;
    const y = m > month ? year - 1 : year;
    result.unshift(`${months[m]} ${y}`);
  }
  return result;
};

const formatCurrencyShort = (value) => {
  if (value >= 1_000_000_000_000) return `${(value/1_000_000_000_000).toFixed(1)} T`;
  if (value >= 1_000_000_000)     return `${(value/1_000_000_000).toFixed(1)} M`;
  if (value >= 1_000_000)         return `${(value/1_000_000).toFixed(1)} Jt`;
  if (value >= 1_000)             return `${(value/1_000).toFixed(1)} Rb`;
  return new Intl.NumberFormat("id-ID", { style:"currency", currency:"IDR", maximumFractionDigits:0 }).format(value);
};

const formatCurrencyFull = (value) =>
  new Intl.NumberFormat("id-ID", { style:"currency", currency:"IDR", maximumFractionDigits:0 }).format(value);

/* ─────────────────────────────────────────────
   STATUS CONFIG
───────────────────────────────────────────── */
const STATUS_CONFIG = {
  "New Order":              { dark:"dk-badge-gray-dark",   light:"dk-badge-gray-light"   },
  "Entry":                  { dark:"dk-badge-green-dark",  light:"dk-badge-green-light"  },
  "Diproses - Lapangan":    { dark:"dk-badge-blue-dark",   light:"dk-badge-blue-light"   },
  "Diproses - Sertifikat":  { dark:"dk-badge-purple-dark", light:"dk-badge-purple-light" },
  "Penerbitan Proforma":    { dark:"dk-badge-amber-dark",  light:"dk-badge-amber-light",
                              /* fallback */
                              _dark:"dk-badge-yellow-dark", _light:"dk-badge-yellow-light" },
  "Invoice":                { dark:"dk-badge-yellow-dark", light:"dk-badge-yellow-light" },
  "Closed Order":           { dark:"dk-badge-orange-dark", light:"dk-badge-orange-light" },
  "Selesai":                { dark:"dk-badge-teal-dark",   light:"dk-badge-teal-light"   },
};

const getBadgeClass = (status, isDark) => {
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return `dk-badge ${isDark ? "dk-badge-red-dark" : "dk-badge-red-light"}`;
  return `dk-badge ${isDark ? (cfg.dark || cfg._dark) : (cfg.light || cfg._light)}`;
};

/* ─────────────────────────────────────────────
   SKELETON COMPONENTS
───────────────────────────────────────────── */
const SkeletonBlock = ({ h, w, isDark }) => (
  <div className={isDark ? "dk-skel-dark" : "dk-skel-light"} style={{ height: h, width: w || "100%" }} />
);

const StatCardSkeleton = ({ isDark }) => (
  <div className={`dk-card-${isDark?"dark":"light"} p-5`}>
    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
      <SkeletonBlock h={16} w="55%" isDark={isDark} />
      <SkeletonBlock h={36} w={36} isDark={isDark} />
    </div>
    <SkeletonBlock h={40} w="45%" isDark={isDark} />
    <div style={{ marginTop:8 }}><SkeletonBlock h={12} w="30%" isDark={isDark} /></div>
  </div>
);

const ChartSkeleton = ({ isDark }) => (
  <div style={{ height:380, display:"flex", alignItems:"flex-end", gap:10, padding:"0 8px" }}>
    {[60,80,55,90,70,45,85,65,75,50,88,72].map((h,i) => (
      <div key={i} className={isDark ? "dk-skel-dark" : "dk-skel-light"}
           style={{ flex:1, height:`${h}%`, borderRadius:"6px 6px 0 0" }} />
    ))}
  </div>
);

/* ─────────────────────────────────────────────
   CUSTOM TOOLTIP FOR CHART
───────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label, isDark }) => {
  if (!active || !payload?.length) return null;
  const d = isDark;
  return (
    <div className={d ? "dk-tooltip-dark" : "dk-tooltip-light"} style={{ padding:"10px 14px" }}>
      <p style={{ fontWeight:600, marginBottom:4, color: d ? "#93c5fd" : "#1d4ed8" }}>{label}</p>
      <p style={{ color: d ? "#e2e8f5" : "#334e7a" }}>
        Jumlah Order: <strong>{payload[0].value}</strong>
      </p>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const DashboardKoordinator = () => {
const navigate = useNavigate();
  const { isDark } = useTheme();
  const d = isDark;

  const [summary, setSummary] = useState({
    totalOrders: 0, totalInvoice: 0, totalProforma: 0,
    statusCounts: {}, orderTrends: [], revenueByPortofolio: {},
  });
  const [isLoading,  setIsLoading]  = useState(true);
  const [isRefresh,  setIsRefresh]  = useState(false);
  const [error,      setError]      = useState(null);
  const [mounted,    setMounted]    = useState(false);
  const { activeUser } = useUser();
  const userData = activeUser || {};
  const userPeran = userData.peran || "";

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!userPeran || userPeran !== "koordinator") {
      navigate("/");
      return;
    }
    fetchOrderSummary();
  }, [userPeran]);

  const fetchOrderSummary = async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefresh(true);
    else setIsLoading(true);
    setError(null);

    try {
      const snapshot = await getDocs(query(collection(db, "orders")));

      let totalOrders = 0, totalInvoice = 0, totalProforma = 0;
      const statusCounts = {
        "New Order":0, "Entry":0, "Diproses - Lapangan":0,
        "Diproses - Sertifikat":0, "Closed Order":0,
        "Penerbitan Proforma":0, "Invoice":0, "Selesai":0,
      };
      const orderTrends = {};
      const revenueByPortofolio = {
        Batubara:0, Ksp:0, Pik:0, Industri:0, Hmpm:0, Aebt:0,
        Mineral:0, Halal:0, Laboratorium:0, Serco:0, Lsi:0,
      };
      const months = getLast12Months();

      snapshot.forEach((doc) => {
        const data = doc.data();
        totalOrders++;
        totalInvoice  += Number(data.nilaiInvoice)  || 0;
        totalProforma += Number(data.nilaiProforma)  || 0;

        if (data.statusOrder && Object.hasOwn(statusCounts, data.statusOrder))
          statusCounts[data.statusOrder]++;

        if (data.tanggalOrder?.seconds) {
          const d = new Date(data.tanggalOrder.seconds * 1000);
          const key = d.toLocaleDateString("id-ID", { month:"short", year:"numeric" });
          if (months.includes(key)) orderTrends[key] = (orderTrends[key] || 0) + 1;
        }

        if (data.portofolio) {
          const fp = capitalizeFirstLetter(data.portofolio.trim());
          if (Object.hasOwn(revenueByPortofolio, fp))
            revenueByPortofolio[fp] += Number(data.nilaiInvoice) || 0;
        }
      });

      setSummary({
        totalOrders, totalInvoice, totalProforma, statusCounts,
        orderTrends: months.map((m) => ({ bulan:m, jumlah: orderTrends[m] || 0 })),
        revenueByPortofolio,
      });
    } catch (err) {
      console.error("Gagal fetch:", err);
      setError("Tidak dapat memuat data. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
      setIsRefresh(false);
    }
  };

  const statusList    = ["New Order","Entry","Diproses - Lapangan","Diproses - Sertifikat","Closed Order","Penerbitan Proforma","Invoice","Selesai"];
  const portofolioList = ["Batubara","Ksp","Pik","Industri","Hmpm","Aebt","Mineral","Halal","Laboratorium","Serco","Lsi"];

  const totalPortofolio = Object.values(summary.revenueByPortofolio).reduce((s,v) => s+v, 0);
  const axisColor = d ? "rgba(99,148,255,0.4)" : "rgba(37,99,235,0.35)";
  const gridColor = d ? "rgba(99,148,255,0.07)" : "rgba(37,99,235,0.07)";

  /* ── STAT CARDS CONFIG ── */
  const statCards = [
    {
      label: "Total Order",
      value: summary.totalOrders,
      display: summary.totalOrders.toLocaleString("id-ID"),
      icon: <ClipboardDocumentListIcon style={{ width:20, height:20, color: d ? "#60a5fa" : "#2563eb" }} />,
      numClass: "dk-num-blue",
      glow: "dk-stat-glow-blue",
      animClass: "dk-card-in-1",
    },
    {
      label: "Total Nilai Invoice (Fee)",
      value: summary.totalInvoice,
      display: formatCurrencyShort(summary.totalInvoice),
      sub: formatCurrencyFull(summary.totalInvoice),
      icon: <CurrencyDollarIcon style={{ width:20, height:20, color: d ? "#34d399" : "#059669" }} />,
      numClass: "dk-num-green",
      glow: "dk-stat-glow-green",
      animClass: "dk-card-in-2",
    },
    {
      label: "Total Nilai Proforma (PAD)",
      value: summary.totalProforma,
      display: formatCurrencyShort(summary.totalProforma),
      sub: formatCurrencyFull(summary.totalProforma),
      icon: <CurrencyDollarIcon style={{ width:20, height:20, color: d ? "#a78bfa" : "#7c3aed" }} />,
      numClass: "dk-num-purple",
      glow: "dk-stat-glow-purple",
      animClass: "dk-card-in-3",
    },
  ];

  return (
    <>
      <style>{STYLES}</style>
      <div className={`dk-root dk-bg-${d?"dark":"light"} ${mounted ? "dk-page-in" : "opacity-0"}`}
           style={{ padding: "28px 20px", transition:"background 0.4s ease" }}>

        <div style={{ maxWidth:1280, margin:"0 auto" }}>

          {/* ══════ PAGE HEADER ══════ */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28 }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div className={`dk-icon-${d?"dark":"light"}`}
                     style={{ width:38, height:38, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <TableCellsIcon style={{ width:20, height:20, color: d ? "#60a5fa" : "#2563eb" }} />
                </div>
                <div>
                  <h2 className={`dk-title-${d?"dark":"light"}`}
                      style={{ fontSize:22, fontWeight:700, lineHeight:1.2, letterSpacing:"-0.01em" }}>
                    Dashboard Koordinator
                  </h2>
                  <p className={`dk-subtitle-${d?"dark":"light"}`} style={{ fontSize:12, marginTop:2 }}>
                    SIMDOR — Ringkasan Order &amp; Keuangan
                  </p>
                </div>
              </div>
            </div>

            {/* Refresh button */}
            <button
              onClick={() => fetchOrderSummary(true)}
              disabled={isRefresh}
              className={`dk-refresh-${d?"dark":"light"}`}
              style={{ width:38, height:38, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}
              title="Refresh data"
            >
              <ArrowPathIcon style={{ width:17, height:17 }} className={isRefresh ? "dk-spinning" : ""} />
            </button>
          </div>

          {/* ══════ ERROR BANNER ══════ */}
          {error && (
            <div className={`dk-error-${d?"dark":"light"}`}
                 style={{ padding:"14px 18px", marginBottom:24, display:"flex", alignItems:"center", gap:12 }}>
              <ExclamationTriangleIcon style={{ width:20, height:20, flexShrink:0 }} />
              <div>
                <p style={{ fontWeight:600, fontSize:13 }}>Gagal Memuat Data</p>
                <p style={{ fontSize:12, marginTop:2, opacity:0.8 }}>{error}</p>
              </div>
            </div>
          )}

          {/* ══════ STAT CARDS ══════ */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:16, marginBottom:20 }}>
            {isLoading
              ? [1,2,3].map((i) => <StatCardSkeleton key={i} isDark={d} />)
              : statCards.map((card) => (
                  <div key={card.label}
                       className={`dk-card-${d?"dark":"light"} ${card.animClass} ${card.glow}`}
                       style={{ padding:"20px 22px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                      <span className={`dk-label-${d?"dark":"light"}`}>{card.label}</span>
                      <div className={`dk-icon-${d?"dark":"light"}`}
                           style={{ width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        {card.icon}
                      </div>
                    </div>
                    <p className={card.numClass} style={{ fontSize:34, fontWeight:700, lineHeight:1, fontFamily:"'DM Mono', monospace" }}>
                      {card.display}
                    </p>
                    {card.sub && (
                      <p style={{ fontSize:10.5, marginTop:6, fontFamily:"'DM Mono', monospace",
                                  color: d ? "rgba(99,148,255,0.45)" : "rgba(37,99,235,0.4)" }}>
                        {card.sub}
                      </p>
                    )}
                  </div>
                ))
            }
          </div>

          {/* ══════ STATUS ORDER CARD ══════ */}
          <div className={`dk-card-${d?"dark":"light"} dk-card-in-4`} style={{ marginBottom:20 }}>
            {/* Header */}
            <div className={`dk-card-divider-${d?"dark":"light"}`}
                 style={{ padding:"16px 22px", display:"flex", alignItems:"center", gap:10 }}>
              <div className={`dk-icon-${d?"dark":"light"}`}
                   style={{ width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <TableCellsIcon style={{ width:16, height:16, color: d ? "#a78bfa" : "#7c3aed" }} />
              </div>
              <p className={`dk-section-title-${d?"dark":"light"}`}>Status Order</p>
            </div>

            {/* Body */}
            <div style={{ padding:"14px 22px 18px" }}>
              {isLoading
                ? <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {statusList.map((_,i) => <SkeletonBlock key={i} h={32} isDark={d} />)}
                  </div>
                : <div>
                    {statusList.map((status, idx) => (
                      <div key={status}
                           className={`dk-status-row ${idx > 0 ? `dk-status-row-sep-${d?"dark":"light"}` : ""}`}
                           style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 0" }}>
                        <span className={getBadgeClass(status, d)}>{status}</span>
                        <span style={{ fontFamily:"'DM Mono',monospace", fontSize:14, fontWeight:600,
                                       color: d ? "#e2e8f5" : "#1e3a5f" }}>
                          {summary.statusCounts[status] || 0}
                        </span>
                      </div>
                    ))}
                  </div>
              }
            </div>
          </div>

          {/* ══════ PORTOFOLIO REVENUE CARD ══════ */}
          <div className={`dk-card-${d?"dark":"light"} dk-card-in-5`} style={{ marginBottom:20 }}>
            {/* Header */}
            <div className={`dk-card-divider-${d?"dark":"light"}`}
                 style={{ padding:"16px 22px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div className={`dk-icon-${d?"dark":"light"}`}
                     style={{ width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <BuildingLibraryIcon style={{ width:16, height:16, color: d ? "#34d399" : "#059669" }} />
                </div>
                <div>
                  <p className={`dk-section-title-${d?"dark":"light"}`}>Pendapatan per Portofolio</p>
                  <p className={`dk-section-sub-${d?"dark":"light"}`}>Berdasarkan nilai invoice (fee)</p>
                </div>
              </div>

              {/* Total pill */}
              {!isLoading && (
                <div className={`dk-total-pill-${d?"dark":"light"}`} style={{ padding:"8px 16px" }}>
                  <p className={`dk-total-pill-label-${d?"dark":"light"}`}>Total Semua Portofolio</p>
                  <p className={`dk-total-pill-val-${d?"dark":"light"}`}>{formatCurrencyFull(totalPortofolio)}</p>
                </div>
              )}
            </div>

            {/* Body */}
            <div style={{ padding:"18px 22px" }}>
              {isLoading
                ? <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:10 }}>
                    {Array(6).fill(0).map((_,i) => <SkeletonBlock key={i} h={72} isDark={d} />)}
                  </div>
                : <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:10 }}>
                    {portofolioList.map((porto) => (
                      <div key={porto} className={`dk-porto-${d?"dark":"light"}`} style={{ padding:"14px 16px" }}>
                        <p className={`dk-porto-label-${d?"dark":"light"}`}>{porto.toUpperCase()}</p>
                        <p className={`dk-porto-val-${d?"dark":"light"}`} style={{ marginTop:6 }}>
                          {formatCurrencyShort(summary.revenueByPortofolio[porto] || 0)}
                        </p>
                        <p style={{ fontSize:9.5, marginTop:3, fontFamily:"'DM Mono',monospace",
                                    color: d ? "rgba(99,148,255,0.35)" : "rgba(37,99,235,0.35)" }}>
                          {formatCurrencyFull(summary.revenueByPortofolio[porto] || 0)}
                        </p>
                      </div>
                    ))}
                  </div>
              }
            </div>
          </div>

          {/* ══════ MONTHLY TREND CHART ══════ */}
          <div className={`dk-card-${d?"dark":"light"} dk-card-in-6`}>
            {/* Header */}
            <div className={`dk-card-divider-${d?"dark":"light"}`}
                 style={{ padding:"16px 22px", display:"flex", alignItems:"center", gap:10 }}>
              <div className={`dk-icon-${d?"dark":"light"}`}
                   style={{ width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <ChartBarIcon style={{ width:16, height:16, color: d ? "#60a5fa" : "#2563eb" }} />
              </div>
              <div>
                <p className={`dk-section-title-${d?"dark":"light"}`}>Tren Order per Bulan</p>
                <p className={`dk-section-sub-${d?"dark":"light"}`}>12 bulan terakhir berdasarkan tanggal order</p>
              </div>
            </div>

            {/* Chart */}
            <div style={{ padding:"20px 22px 24px" }}>
              {isLoading
                ? <ChartSkeleton isDark={d} />
                : summary.orderTrends.length > 0
                  ? (
                    <ResponsiveContainer width="100%" height={380}>
                      <BarChart data={summary.orderTrends} margin={{ top:8, right:8, left:-16, bottom:4 }}>
                        <defs>
                          <linearGradient id="barGradDark" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%"   stopColor="#3b82f6" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0.4} />
                          </linearGradient>
                          <linearGradient id="barGradLight" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%"   stopColor="#2563eb" stopOpacity={0.85} />
                            <stop offset="100%" stopColor="#93c5fd" stopOpacity={0.45} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                        <XAxis
                          dataKey="bulan"
                          fontSize={11}
                          tick={{ fill: axisColor, fontFamily:"'DM Sans',sans-serif" }}
                          axisLine={{ stroke: gridColor }}
                          tickLine={false}
                        />
                        <YAxis
                          fontSize={11}
                          domain={["auto","auto"]}
                          tick={{ fill: axisColor, fontFamily:"'DM Mono',monospace" }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v) => v.toLocaleString()}
                        />
                        <Tooltip
                          content={<CustomTooltip isDark={d} />}
                          cursor={{ fill: d ? "rgba(99,148,255,0.05)" : "rgba(37,99,235,0.05)", radius:6 }}
                        />
                        <Legend
                          wrapperStyle={{ fontSize:12, fontFamily:"'DM Sans',sans-serif",
                                          color: d ? "rgba(148,163,220,0.7)" : "#4b6ea8" }}
                        />
                        <Bar
                          dataKey="jumlah"
                          name="Jumlah Order"
                          fill={d ? "url(#barGradDark)" : "url(#barGradLight)"}
                          radius={[6,6,0,0]}
                          barSize={22}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )
                  : (
                    <div style={{ height:300, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <p style={{ color: d ? "rgba(99,148,255,0.4)" : "rgba(37,99,235,0.4)", fontSize:13 }}>
                        Tidak ada data tren untuk ditampilkan.
                      </p>
                    </div>
                  )
              }
            </div>
          </div>

        </div>{/* end max-width */}
      </div>{/* end bg */}
    </>
  );
};

export default DashboardKoordinator;