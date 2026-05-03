import { useState, useEffect } from "react";
import { db } from "../../services/firebase";
import { collection, query, getDocs } from "firebase/firestore";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
  LineChart, Line, Area, AreaChart,
} from "recharts";
import {
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  BuildingLibraryIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../components/layout/ThemeContext"; // sesuaikan path
/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&display=swap');

.dkeu-root { font-family: 'DM Sans', sans-serif; }

/* ── Page background ── */
.dkeu-bg-dark  { background: #070b18; min-height: 100vh; }
.dkeu-bg-light { background: #f0f6ff; min-height: 100vh; }

/* ── Page title ── */
.dkeu-title-dark   { color: #e2e8f5; }
.dkeu-title-light  { color: #1e3a5f; }
.dkeu-sub-dark     { color: rgba(99,148,255,0.5); }
.dkeu-sub-light    { color: rgba(37,99,235,0.45); }

/* ── Glass card ── */
.dkeu-card-dark {
  background: rgba(12,18,40,0.75);
  backdrop-filter: blur(24px) saturate(160%);
  -webkit-backdrop-filter: blur(24px) saturate(160%);
  border: 1px solid rgba(99,148,255,0.13);
  box-shadow: 0 4px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.03);
  border-radius: 18px;
  transition: border-color 0.25s, box-shadow 0.25s;
}
.dkeu-card-dark:hover {
  border-color: rgba(96,165,250,0.28);
  box-shadow: 0 8px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(96,165,250,0.08);
}
.dkeu-card-light {
  background: rgba(240,246,255,0.82);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(59,130,246,0.14);
  box-shadow: 0 4px 24px rgba(59,130,246,0.08), inset 0 1px 0 rgba(255,255,255,0.7);
  border-radius: 18px;
  transition: border-color 0.25s, box-shadow 0.25s;
}
.dkeu-card-light:hover {
  border-color: rgba(59,130,246,0.28);
  box-shadow: 0 8px 36px rgba(59,130,246,0.13);
}

/* ── Card header divider ── */
.dkeu-divider-dark  { border-bottom: 1px solid rgba(99,148,255,0.1); }
.dkeu-divider-light { border-bottom: 1px solid rgba(59,130,246,0.1); }

/* ── Icon wrapper ── */
.dkeu-icon-dark  { background: rgba(255,255,255,0.05); border: 1px solid rgba(99,148,255,0.15); border-radius: 12px; }
.dkeu-icon-light { background: rgba(255,255,255,0.82); border: 1px solid rgba(59,130,246,0.16); border-radius: 12px; box-shadow: 0 1px 4px rgba(59,130,246,0.08); }

/* ── Stat label ── */
.dkeu-label-dark  { color: rgba(148,163,220,0.7); font-size: 12.5px; font-weight: 500; line-height: 1.4; }
.dkeu-label-light { color: #4b6ea8; font-size: 12.5px; font-weight: 500; line-height: 1.4; }

/* ── Gradient numbers ── */
.dkeu-num-blue    { background: linear-gradient(135deg,#3b82f6,#93c5fd); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
.dkeu-num-orange  { background: linear-gradient(135deg,#f97316,#fdba74); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
.dkeu-num-green   { background: linear-gradient(135deg,#10b981,#6ee7b7); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
.dkeu-num-emerald { background: linear-gradient(135deg,#059669,#34d399); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
.dkeu-num-teal    { background: linear-gradient(135deg,#0d9488,#5eead4); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }

/* ── Per-card glow ── */
.dkeu-glow-blue    { box-shadow: 0 0 28px rgba(59,130,246,0.17); }
.dkeu-glow-orange  { box-shadow: 0 0 28px rgba(249,115,22,0.15); }
.dkeu-glow-green   { box-shadow: 0 0 28px rgba(16,185,129,0.15); }
.dkeu-glow-emerald { box-shadow: 0 0 28px rgba(5,150,105,0.15);  }
.dkeu-glow-teal    { box-shadow: 0 0 28px rgba(13,148,136,0.15); }

/* ── Section titles ── */
.dkeu-sec-title-dark  { font-size: 15px; font-weight: 600; color: #e2e8f5; }
.dkeu-sec-title-light { font-size: 15px; font-weight: 600; color: #1e3a5f; }
.dkeu-sec-sub-dark    { font-size: 11.5px; color: rgba(99,148,255,0.5); margin-top: 2px; }
.dkeu-sec-sub-light   { font-size: 11.5px; color: rgba(37,99,235,0.45); margin-top: 2px; }

/* ── Total pill ── */
.dkeu-total-dark  { background: rgba(37,99,235,0.14); border: 1px solid rgba(59,130,246,0.22); border-radius: 14px; }
.dkeu-total-light { background: rgba(219,234,254,0.7); border: 1px solid rgba(59,130,246,0.18); border-radius: 14px; }
.dkeu-total-label-dark  { font-size: 11.5px; color: rgba(148,163,220,0.65); }
.dkeu-total-label-light { font-size: 11.5px; color: #4b6ea8; }
.dkeu-total-val-dark    { font-size: 19px; font-weight: 700; color: #60a5fa; font-family:'DM Mono',monospace; }
.dkeu-total-val-light   { font-size: 19px; font-weight: 700; color: #1d4ed8; font-family:'DM Mono',monospace; }

/* ── Porto mini card ── */
.dkeu-porto-dark {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(99,148,255,0.1);
  border-radius: 12px;
  transition: all 0.2s;
}
.dkeu-porto-dark:hover  { background:rgba(59,130,246,0.07); border-color:rgba(96,165,250,0.28); box-shadow:0 0 20px rgba(59,130,246,0.12); }
.dkeu-porto-light {
  background: rgba(255,255,255,0.72);
  border: 1px solid rgba(59,130,246,0.12);
  border-radius: 12px;
  box-shadow: 0 1px 6px rgba(59,130,246,0.06);
  transition: all 0.2s;
}
.dkeu-porto-light:hover { background:rgba(255,255,255,1); border-color:rgba(59,130,246,0.28); box-shadow:0 4px 18px rgba(59,130,246,0.11); }

.dkeu-porto-lbl-dark  { font-size:10px; font-weight:700; letter-spacing:0.1em; color:rgba(99,148,255,0.5); }
.dkeu-porto-lbl-light { font-size:10px; font-weight:700; letter-spacing:0.1em; color:rgba(37,99,235,0.42); }
.dkeu-porto-val-dark  { font-size:13px; font-weight:600; color:#93c5fd; font-family:'DM Mono',monospace; }
.dkeu-porto-val-light { font-size:13px; font-weight:600; color:#1d4ed8; font-family:'DM Mono',monospace; }
.dkeu-porto-sub-dark  { font-size:9px; color:rgba(99,148,255,0.32); font-family:'DM Mono',monospace; margin-top:2px; }
.dkeu-porto-sub-light { font-size:9px; color:rgba(37,99,235,0.32); font-family:'DM Mono',monospace; margin-top:2px; }

/* ── Porto bar track (mini sparkline) ── */
.dkeu-pbar-track-dark  { background: rgba(99,148,255,0.09); border-radius: 99px; height: 3px; margin-top: 8px; overflow: hidden; }
.dkeu-pbar-track-light { background: rgba(59,130,246,0.09); border-radius: 99px; height: 3px; margin-top: 8px; overflow: hidden; }
.dkeu-pbar-fill { height: 100%; border-radius: 99px; background: linear-gradient(90deg,#1d4ed8,#60a5fa); }

/* ── Chart tooltip ── */
.dkeu-tip-dark  { background:rgba(7,11,24,0.95)!important; border:1px solid rgba(99,148,255,0.2)!important; border-radius:10px!important; color:#e2e8f5!important; font-family:'DM Sans',sans-serif!important; font-size:12px!important; }
.dkeu-tip-light { background:rgba(248,251,255,0.98)!important; border:1px solid rgba(59,130,246,0.15)!important; border-radius:10px!important; color:#1e3a5f!important; font-family:'DM Sans',sans-serif!important; font-size:12px!important; }

/* ── Error banner ── */
.dkeu-error-dark  { background:rgba(239,68,68,0.1);   border:1px solid rgba(239,68,68,0.25);  border-radius:14px; color:#fca5a5; }
.dkeu-error-light { background:rgba(254,226,226,0.8); border:1px solid rgba(252,165,165,0.5); border-radius:14px; color:#b91c1c; }

/* ── Skeleton shimmer ── */
@keyframes dkeuShimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
.dkeu-skel-dark {
  background: linear-gradient(90deg,rgba(30,40,80,0.6) 25%,rgba(50,65,120,0.4) 50%,rgba(30,40,80,0.6) 75%);
  background-size:800px 100%; animation:dkeuShimmer 1.6s infinite linear; border-radius:8px;
}
.dkeu-skel-light {
  background: linear-gradient(90deg,rgba(219,234,254,0.6) 25%,rgba(191,219,254,0.4) 50%,rgba(219,234,254,0.6) 75%);
  background-size:800px 100%; animation:dkeuShimmer 1.6s infinite linear; border-radius:8px;
}

/* ── Animations ── */
@keyframes dkeuPageIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
.dkeu-page-in { animation: dkeuPageIn 0.6s cubic-bezier(0.22,1,0.36,1) forwards; }
@keyframes dkeuCardIn { from{opacity:0;transform:translateY(20px) scale(0.98)} to{opacity:1;transform:translateY(0) scale(1)} }
.dkeu-c1 { animation: dkeuCardIn 0.55s 0.05s cubic-bezier(0.22,1,0.36,1) both; }
.dkeu-c2 { animation: dkeuCardIn 0.55s 0.12s cubic-bezier(0.22,1,0.36,1) both; }
.dkeu-c3 { animation: dkeuCardIn 0.55s 0.19s cubic-bezier(0.22,1,0.36,1) both; }
.dkeu-c4 { animation: dkeuCardIn 0.55s 0.26s cubic-bezier(0.22,1,0.36,1) both; }
.dkeu-c5 { animation: dkeuCardIn 0.55s 0.33s cubic-bezier(0.22,1,0.36,1) both; }
.dkeu-c6 { animation: dkeuCardIn 0.55s 0.40s cubic-bezier(0.22,1,0.36,1) both; }
.dkeu-c7 { animation: dkeuCardIn 0.55s 0.47s cubic-bezier(0.22,1,0.36,1) both; }

/* ── Accent bar (same as Header) ── */
@keyframes accentFlow { 0%{background-position:0 0} 100%{background-position:200% 0} }
.dkeu-accent-dark  { height:2px; background:linear-gradient(90deg,transparent 0%,#1d4ed8 15%,#60a5fa 40%,#a78bfa 60%,#3b82f6 80%,transparent 100%); background-size:200% 100%; animation:accentFlow 4s linear infinite; }
.dkeu-accent-light { height:2px; background:linear-gradient(90deg,transparent 0%,#3b82f6 15%,#93c5fd 40%,#6366f1 60%,#3b82f6 80%,transparent 100%); background-size:200% 100%; animation:accentFlow 4s linear infinite; }

/* ── Refresh button ── */
.dkeu-refresh-dark  { background:rgba(255,255,255,0.04); border:1px solid rgba(99,148,255,0.18); border-radius:10px; color:rgba(148,163,220,0.75); transition:all 0.2s; }
.dkeu-refresh-dark:hover  { background:rgba(59,130,246,0.1); border-color:rgba(96,165,250,0.35); color:#93c5fd; box-shadow:0 0 16px rgba(59,130,246,0.15); }
.dkeu-refresh-light { background:rgba(255,255,255,0.75); border:1px solid rgba(59,130,246,0.18); border-radius:10px; color:#4b6ea8; transition:all 0.2s; box-shadow:0 1px 4px rgba(59,130,246,0.08); }
.dkeu-refresh-light:hover { background:rgba(59,130,246,0.08); border-color:rgba(59,130,246,0.35); color:#2563eb; }
@keyframes spin { to{transform:rotate(360deg)} }
.dkeu-spin { animation: spin 0.8s linear infinite; }

/* ── Finance ratio bar ── */
.dkeu-ratio-track-dark  { background:rgba(99,148,255,0.08); border-radius:99px; overflow:hidden; height:8px; }
.dkeu-ratio-track-light { background:rgba(59,130,246,0.08); border-radius:99px; overflow:hidden; height:8px; }
@keyframes dkeuRatioFill { from{width:0%} }
.dkeu-ratio-invoice  { height:100%; border-radius:99px; background:linear-gradient(90deg,#1d4ed8,#60a5fa); box-shadow:0 0 10px rgba(59,130,246,0.4); animation:dkeuRatioFill 1s cubic-bezier(0.22,1,0.36,1) forwards; }
.dkeu-ratio-proforma { height:100%; border-radius:99px; background:linear-gradient(90deg,#0d9488,#5eead4); box-shadow:0 0 10px rgba(13,148,136,0.4); animation:dkeuRatioFill 1s 0.15s cubic-bezier(0.22,1,0.36,1) forwards; }

/* ── Finance summary row sep ── */
.dkeu-sep-dark  { border-top:1px solid rgba(99,148,255,0.07); }
.dkeu-sep-light { border-top:1px solid rgba(59,130,246,0.07); }
`;

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const getLast12Months = () => {
  const names = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  const now = new Date();
  const month = now.getMonth(), year = now.getFullYear();
  const result = [];
  for (let i = 0; i < 12; i++) {
    const m = (month - i + 12) % 12;
    result.unshift(`${names[m]} ${m > month ? year - 1 : year}`);
  }
  return result;
};

const fmtShort = (v) => {
  if (v >= 1e12) return `${(v/1e12).toFixed(1)} T`;
  if (v >= 1e9)  return `${(v/1e9).toFixed(1)} M`;
  if (v >= 1e6)  return `${(v/1e6).toFixed(1)} Jt`;
  if (v >= 1e3)  return `${(v/1e3).toFixed(1)} Rb`;
  return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(v);
};
const fmtFull = (v) =>
  new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(v);

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────── */
const Skel = ({ h, w, isDark }) => (
  <div className={isDark?"dkeu-skel-dark":"dkeu-skel-light"} style={{ height:h, width:w||"100%" }} />
);

const StatCardSkeleton = ({ isDark }) => (
  <div className={`dkeu-card-${isDark?"dark":"light"}`} style={{ padding:"20px 22px" }}>
    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
      <Skel h={14} w="58%" isDark={isDark} />
      <Skel h={36} w={36} isDark={isDark} />
    </div>
    <Skel h={40} w="44%" isDark={isDark} />
    <div style={{ marginTop:8 }}><Skel h={11} w="30%" isDark={isDark} /></div>
  </div>
);

const ChartSkeleton = ({ isDark }) => (
  <div style={{ height:380, display:"flex", alignItems:"flex-end", gap:10, padding:"0 8px" }}>
    {[55,75,60,88,65,42,80,62,72,48,85,70].map((h,i) => (
      <div key={i} className={isDark?"dkeu-skel-dark":"dkeu-skel-light"}
           style={{ flex:1, height:`${h}%`, borderRadius:"6px 6px 0 0" }} />
    ))}
  </div>
);

const CustomTooltip = ({ active, payload, label, isDark: d }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={d?"dkeu-tip-dark":"dkeu-tip-light"} style={{ padding:"10px 14px" }}>
      <p style={{ fontWeight:600, marginBottom:4, color:d?"#93c5fd":"#1d4ed8" }}>{label}</p>
      <p style={{ color:d?"#e2e8f5":"#334e7a" }}>Jumlah Order: <strong>{payload[0].value}</strong></p>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const DashboardKeuangan = () => {
  const navigate   = useNavigate();
  const { isDark } = useTheme();
  const d          = isDark;

  const [summary, setSummary] = useState({
    totalOrders:0, inProcessOrders:0, completedOrders:0,
    totalInvoice:0, totalProforma:0,
    revenueByPortofolio:{}, orderTrends:[],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefresh, setIsRefresh] = useState(false);
  const [error,     setError]     = useState(null);
  const [mounted,   setMounted]   = useState(false);

  const userData  = JSON.parse(localStorage.getItem("user")) || {};
  const userPeran = userData.peran || "";

  useEffect(() => {
    setMounted(true);
    if (!userPeran || userPeran !== "admin keuangan") {
      alert("Anda tidak memiliki akses!");
      navigate("/");
    }
  }, []);

  useEffect(() => {
    if (userPeran === "admin keuangan") fetchOrderSummary();
  }, [userPeran]);

  const fetchOrderSummary = async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefresh(true);
    else setIsLoading(true);
    setError(null);
    try {
      const snapshot = await getDocs(query(collection(db, "orders")));
      let totalOrders = snapshot.size;
      let totalInvoice = 0, totalProforma = 0, inProcessOrders = 0, completedOrders = 0;
      const revenueByPortofolio = {
        BATUBARA:0, KSP:0, PIK:0, INDUSTRI:0, HMPM:0, AEBT:0,
        MINERAL:0, HALAL:0, LABORATORIUM:0, SERCO:0, LSI:0,
      };
      const orderTrendsMap = {};
      const months = getLast12Months();

      snapshot.forEach((doc) => {
        const data = doc.data();
        totalInvoice  += isNaN(Number(data.nilaiInvoice))  ? 0 : Number(data.nilaiInvoice);
        totalProforma += isNaN(Number(data.nilaiProforma)) ? 0 : Number(data.nilaiProforma);
        if (data.statusOrder === "Penerbitan Proforma") inProcessOrders++;
        if (data.statusOrder === "Selesai") completedOrders++;
        if (data.tanggalOrder?.seconds) {
          const key = new Date(data.tanggalOrder.seconds * 1000)
            .toLocaleDateString("id-ID",{month:"short",year:"numeric"});
          if (months.includes(key)) orderTrendsMap[key] = (orderTrendsMap[key]||0)+1;
        }
        if (data.portofolio) {
          const fp = data.portofolio.trim().toUpperCase();
          if (Object.hasOwn(revenueByPortofolio, fp))
            revenueByPortofolio[fp] += isNaN(Number(data.nilaiInvoice)) ? 0 : Number(data.nilaiInvoice);
        }
      });

      setSummary({
        totalOrders, totalInvoice, totalProforma, inProcessOrders, completedOrders,
        revenueByPortofolio,
        orderTrends: months.map((m) => ({ bulan:m, jumlah: orderTrendsMap[m]||0 })),
      });
    } catch (err) {
      console.error(err);
      setError("Tidak dapat memuat data ringkasan. Silakan coba lagi nanti.");
    } finally {
      setIsLoading(false);
      setIsRefresh(false);
    }
  };

  const portofolioList  = ["BATUBARA","KSP","PIK","INDUSTRI","HMPM","AEBT","MINERAL","HALAL","LABORATORIUM","SERCO","LSI"];
  const totalPortofolio = Object.values(summary.revenueByPortofolio).reduce((s,v) => s+v, 0);
  const axisColor       = d ? "rgba(99,148,255,0.4)"  : "rgba(37,99,235,0.35)";
  const gridColor       = d ? "rgba(99,148,255,0.07)" : "rgba(37,99,235,0.07)";

  /* Stat cards */
  const statCards = [
    {
      label:"Total Order",
      display: summary.totalOrders.toLocaleString("id-ID"),
      numClass:"dkeu-num-blue", glow:"dkeu-glow-blue", anim:"dkeu-c1",
      icon: <ClipboardDocumentListIcon style={{ width:20,height:20,color:d?"#60a5fa":"#2563eb" }} />,
    },
    {
      label:"Proses Invoice",
      display: summary.inProcessOrders.toLocaleString("id-ID"),
      sub:"Status: Penerbitan Proforma",
      numClass:"dkeu-num-orange", glow:"dkeu-glow-orange", anim:"dkeu-c2",
      icon: <ClockIcon style={{ width:20,height:20,color:d?"#fb923c":"#ea580c" }} />,
    },
    {
      label:"Order Selesai",
      display: summary.completedOrders.toLocaleString("id-ID"),
      sub:"Status: Selesai",
      numClass:"dkeu-num-green", glow:"dkeu-glow-green", anim:"dkeu-c3",
      icon: <CheckCircleIcon style={{ width:20,height:20,color:d?"#34d399":"#059669" }} />,
    },
    {
      label:"Total Proforma (PAD)",
      display: fmtShort(summary.totalProforma),
      sub: fmtFull(summary.totalProforma),
      numClass:"dkeu-num-teal", glow:"dkeu-glow-teal", anim:"dkeu-c4",
      icon: <BanknotesIcon style={{ width:20,height:20,color:d?"#5eead4":"#0d9488" }} />,
    },
    {
      label:"Total Invoice (Fee)",
      display: fmtShort(summary.totalInvoice),
      sub: fmtFull(summary.totalInvoice),
      numClass:"dkeu-num-emerald", glow:"dkeu-glow-emerald", anim:"dkeu-c5",
      icon: <CurrencyDollarIcon style={{ width:20,height:20,color:d?"#34d399":"#059669" }} />,
    },
  ];

  /* Finance ratio */
  const totalFinance    = summary.totalInvoice + summary.totalProforma;
  const invoicePct      = totalFinance > 0 ? (summary.totalInvoice  / totalFinance * 100) : 0;
  const proformaPct     = totalFinance > 0 ? (summary.totalProforma / totalFinance * 100) : 0;

  return (
    <>
      <style>{STYLES}</style>
      <div className={`dkeu-root dkeu-bg-${d?"dark":"light"} ${mounted?"dkeu-page-in":"opacity-0"}`}
           style={{ padding:"28px 20px", transition:"background 0.4s ease" }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>

          {/* ══════ PAGE HEADER ══════ */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28, flexWrap:"wrap", gap:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div className={`dkeu-icon-${d?"dark":"light"}`}
                   style={{ width:42,height:42,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                <BuildingLibraryIcon style={{ width:22,height:22,color:d?"#60a5fa":"#2563eb" }} />
              </div>
              <div>
                <h2 className={`dkeu-title-${d?"dark":"light"}`}
                    style={{ fontSize:22,fontWeight:700,lineHeight:1.2,letterSpacing:"-0.01em" }}>
                  Dashboard Keuangan
                </h2>
                <p className={`dkeu-sub-${d?"dark":"light"}`} style={{ fontSize:12,marginTop:3 }}>
                  SIMDOR — Ringkasan Invoice, Proforma &amp; Tren Order
                </p>
              </div>
            </div>
            <button
              onClick={() => fetchOrderSummary(true)}
              disabled={isRefresh}
              className={`dkeu-refresh-${d?"dark":"light"}`}
              style={{ width:38,height:38,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}
              title="Refresh data"
            >
              <ArrowPathIcon style={{ width:17,height:17 }} className={isRefresh?"dkeu-spin":""} />
            </button>
          </div>

          {/* ══════ ERROR BANNER ══════ */}
          {error && (
            <div className={`dkeu-error-${d?"dark":"light"}`}
                 style={{ padding:"14px 18px",marginBottom:24,display:"flex",alignItems:"center",gap:12 }}>
              <ExclamationTriangleIcon style={{ width:20,height:20,flexShrink:0 }} />
              <div>
                <p style={{ fontWeight:600,fontSize:13 }}>Gagal Memuat Data</p>
                <p style={{ fontSize:12,marginTop:2,opacity:0.8 }}>{error}</p>
              </div>
            </div>
          )}

          {/* ══════ STAT CARDS ══════ */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:16, marginBottom:20 }}>
            {isLoading
              ? [1,2,3,4,5].map((i) => <StatCardSkeleton key={i} isDark={d} />)
              : statCards.map((card) => (
                  <div key={card.label}
                       className={`dkeu-card-${d?"dark":"light"} ${card.anim} ${card.glow}`}
                       style={{ padding:"20px 22px" }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12 }}>
                      <span className={`dkeu-label-${d?"dark":"light"}`} style={{ maxWidth:"calc(100% - 48px)" }}>
                        {card.label}
                      </span>
                      <div className={`dkeu-icon-${d?"dark":"light"}`}
                           style={{ width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                        {card.icon}
                      </div>
                    </div>
                    <p className={card.numClass}
                       style={{ fontSize:32,fontWeight:700,lineHeight:1,fontFamily:"'DM Mono',monospace" }}>
                      {card.display}
                    </p>
                    {card.sub && (
                      <p style={{ fontSize:10.5,marginTop:6,fontFamily:"'DM Mono',monospace",
                                  color:d?"rgba(99,148,255,0.4)":"rgba(37,99,235,0.38)" }}>
                        {card.sub}
                      </p>
                    )}
                  </div>
                ))
            }
          </div>

          {/* ══════ FINANCE RATIO CARD ══════ */}
          <div className={`dkeu-card-${d?"dark":"light"} dkeu-c6`} style={{ marginBottom:20 }}>
            <div className={`dkeu-divider-${d?"dark":"light"}`}
                 style={{ padding:"16px 22px",display:"flex",alignItems:"center",gap:10 }}>
              <div className={`dkeu-icon-${d?"dark":"light"}`}
                   style={{ width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center" }}>
                <ArrowTrendingUpIcon style={{ width:16,height:16,color:d?"#60a5fa":"#2563eb" }} />
              </div>
              <div>
                <p className={`dkeu-sec-title-${d?"dark":"light"}`}>Ringkasan Keuangan</p>
                <p className={`dkeu-sec-sub-${d?"dark":"light"}`}>Perbandingan nilai Invoice (Fee) dan Proforma (PAD)</p>
              </div>
            </div>
            <div style={{ padding:"20px 22px 24px" }}>
              {isLoading
                ? (
                  <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
                    <Skel h={16} w="40%" isDark={d} />
                    <Skel h={8}  isDark={d} />
                    <Skel h={16} w="40%" isDark={d} />
                    <Skel h={8}  isDark={d} />
                  </div>
                )
                : (
                  <div style={{ display:"flex",gap:28,flexWrap:"wrap" }}>
                    {/* Left — bars */}
                    <div style={{ flex:"1 1 260px" }}>
                      {/* Invoice */}
                      <div style={{ marginBottom:18 }}>
                        <div style={{ display:"flex",justifyContent:"space-between",marginBottom:8,alignItems:"flex-end" }}>
                          <div>
                            <p className={`dkeu-label-${d?"dark":"light"}`} style={{ fontSize:12 }}>Invoice (Fee)</p>
                            <p style={{ fontFamily:"'DM Mono',monospace",fontSize:18,fontWeight:700,
                                        background:"linear-gradient(135deg,#3b82f6,#93c5fd)",
                                        WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text" }}>
                              {fmtShort(summary.totalInvoice)}
                            </p>
                          </div>
                          <span style={{ fontFamily:"'DM Mono',monospace",fontSize:12,fontWeight:600,
                                         color:d?"#60a5fa":"#2563eb" }}>
                            {invoicePct.toFixed(1)}%
                          </span>
                        </div>
                        <div className={`dkeu-ratio-track-${d?"dark":"light"}`}>
                          <div className="dkeu-ratio-invoice" style={{ width:`${invoicePct}%` }} />
                        </div>
                      </div>
                      {/* Proforma */}
                      <div>
                        <div style={{ display:"flex",justifyContent:"space-between",marginBottom:8,alignItems:"flex-end" }}>
                          <div>
                            <p className={`dkeu-label-${d?"dark":"light"}`} style={{ fontSize:12 }}>Proforma (PAD)</p>
                            <p style={{ fontFamily:"'DM Mono',monospace",fontSize:18,fontWeight:700,
                                        background:"linear-gradient(135deg,#0d9488,#5eead4)",
                                        WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text" }}>
                              {fmtShort(summary.totalProforma)}
                            </p>
                          </div>
                          <span style={{ fontFamily:"'DM Mono',monospace",fontSize:12,fontWeight:600,
                                         color:d?"#5eead4":"#0d9488" }}>
                            {proformaPct.toFixed(1)}%
                          </span>
                        </div>
                        <div className={`dkeu-ratio-track-${d?"dark":"light"}`}>
                          <div className="dkeu-ratio-proforma" style={{ width:`${proformaPct}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* Right — summary rows */}
                    <div style={{ flex:"1 1 200px", display:"flex",flexDirection:"column",gap:0 }}>
                      {[
                        { label:"Total Invoice + Proforma", val: fmtFull(totalFinance),
                          color:d?"#e2e8f5":"#1e3a5f" },
                        { label:"Selisih (Invoice − Proforma)", val: fmtShort(Math.abs(summary.totalInvoice - summary.totalProforma)),
                          color:d?"#93c5fd":"#2563eb" },
                        { label:"Penerbitan Proforma (menunggu invoice)", val: summary.inProcessOrders,
                          color:d?"#fdba74":"#ea580c" },
                        { label:"Order Selesai", val: summary.completedOrders,
                          color:d?"#6ee7b7":"#059669" },
                      ].map((row, idx) => (
                        <div key={row.label}
                             className={idx > 0 ? `dkeu-sep-${d?"dark":"light"}` : ""}
                             style={{ display:"flex",justifyContent:"space-between",
                                      alignItems:"center",padding:"10px 0" }}>
                          <span className={`dkeu-label-${d?"dark":"light"}`} style={{ fontSize:12 }}>{row.label}</span>
                          <span style={{ fontFamily:"'DM Mono',monospace",fontSize:13,fontWeight:700,
                                         color:row.color,marginLeft:12,whiteSpace:"nowrap" }}>
                            {row.val}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              }
            </div>
          </div>

          {/* ══════ PORTFOLIO REVENUE ══════ */}
          <div className={`dkeu-card-${d?"dark":"light"} dkeu-c6`} style={{ marginBottom:20 }}>
            <div className={`dkeu-divider-${d?"dark":"light"}`}
                 style={{ padding:"16px 22px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12 }}>
              <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                <div className={`dkeu-icon-${d?"dark":"light"}`}
                     style={{ width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center" }}>
                  <CurrencyDollarIcon style={{ width:16,height:16,color:d?"#34d399":"#059669" }} />
                </div>
                <div>
                  <p className={`dkeu-sec-title-${d?"dark":"light"}`}>Pendapatan per Portofolio</p>
                  <p className={`dkeu-sec-sub-${d?"dark":"light"}`}>Nilai invoice (fee) per divisi portofolio</p>
                </div>
              </div>
              {!isLoading && (
                <div className={`dkeu-total-${d?"dark":"light"}`} style={{ padding:"8px 16px" }}>
                  <p className={`dkeu-total-label-${d?"dark":"light"}`}>Total Semua Portofolio</p>
                  <p className={`dkeu-total-val-${d?"dark":"light"}`}>{fmtFull(totalPortofolio)}</p>
                </div>
              )}
            </div>
            <div style={{ padding:"18px 22px" }}>
              {isLoading
                ? <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10 }}>
                    {Array(6).fill(0).map((_,i) => <Skel key={i} h={80} isDark={d} />)}
                  </div>
                : (
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10 }}>
                    {portofolioList.map((porto) => {
                      const val  = summary.revenueByPortofolio[porto] || 0;
                      const pct  = totalPortofolio > 0 ? (val / totalPortofolio * 100) : 0;
                      return (
                        <div key={porto} className={`dkeu-porto-${d?"dark":"light"}`} style={{ padding:"14px 16px" }}>
                          <p className={`dkeu-porto-lbl-${d?"dark":"light"}`}>{porto}</p>
                          <p className={`dkeu-porto-val-${d?"dark":"light"}`} style={{ marginTop:6 }}>
                            {fmtShort(val)}
                          </p>
                          <p className={`dkeu-porto-sub-${d?"dark":"light"}`}>{fmtFull(val)}</p>
                          {/* mini progress */}
                          <div className={`dkeu-pbar-track-${d?"dark":"light"}`}>
                            <div className="dkeu-pbar-fill" style={{ width:`${pct}%` }} />
                          </div>
                          <p style={{ fontSize:9,marginTop:4,fontFamily:"'DM Mono',monospace",
                                      color:d?"rgba(99,148,255,0.38)":"rgba(37,99,235,0.35)" }}>
                            {pct.toFixed(1)}% dari total
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )
              }
            </div>
          </div>

          {/* ══════ TREND CHART ══════ */}
          <div className={`dkeu-card-${d?"dark":"light"} dkeu-c7`}>
            <div className={`dkeu-divider-${d?"dark":"light"}`}
                 style={{ padding:"16px 22px",display:"flex",alignItems:"center",gap:10 }}>
              <div className={`dkeu-icon-${d?"dark":"light"}`}
                   style={{ width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center" }}>
                <ChartBarIcon style={{ width:16,height:16,color:d?"#60a5fa":"#2563eb" }} />
              </div>
              <div>
                <p className={`dkeu-sec-title-${d?"dark":"light"}`}>Tren Order per Bulan</p>
                <p className={`dkeu-sec-sub-${d?"dark":"light"}`}>12 bulan terakhir berdasarkan tanggal order</p>
              </div>
            </div>
            <div style={{ padding:"20px 22px 24px" }}>
              {isLoading
                ? <ChartSkeleton isDark={d} />
                : summary.orderTrends.length > 0
                  ? (
                    <ResponsiveContainer width="100%" height={380}>
                      <BarChart data={summary.orderTrends} margin={{ top:8,right:8,left:-16,bottom:4 }}>
                        <defs>
                          <linearGradient id="dkeuBarDark" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%"   stopColor="#3b82f6" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0.4} />
                          </linearGradient>
                          <linearGradient id="dkeuBarLight" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%"   stopColor="#2563eb" stopOpacity={0.85} />
                            <stop offset="100%" stopColor="#93c5fd" stopOpacity={0.45} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                        <XAxis dataKey="bulan" fontSize={11}
                               tick={{ fill:axisColor,fontFamily:"'DM Sans',sans-serif" }}
                               axisLine={{ stroke:gridColor }} tickLine={false} />
                        <YAxis fontSize={11} domain={["auto","auto"]}
                               tick={{ fill:axisColor,fontFamily:"'DM Mono',monospace" }}
                               axisLine={false} tickLine={false}
                               tickFormatter={(v) => v.toLocaleString()} />
                        <Tooltip content={<CustomTooltip isDark={d} />}
                                 cursor={{ fill:d?"rgba(99,148,255,0.05)":"rgba(37,99,235,0.05)",radius:6 }} />
                        <Legend wrapperStyle={{ fontSize:12,fontFamily:"'DM Sans',sans-serif",
                                                color:d?"rgba(148,163,220,0.7)":"#4b6ea8" }} />
                        <Bar dataKey="jumlah" name="Jumlah Order"
                             fill={d?"url(#dkeuBarDark)":"url(#dkeuBarLight)"}
                             radius={[6,6,0,0]} barSize={22} />
                      </BarChart>
                    </ResponsiveContainer>
                  )
                  : (
                    <div style={{ height:300,display:"flex",flexDirection:"column",
                                  alignItems:"center",justifyContent:"center",gap:10 }}>
                      <ExclamationTriangleIcon style={{ width:36,height:36,
                                                        color:d?"rgba(99,148,255,0.3)":"rgba(37,99,235,0.3)" }} />
                      <p style={{ fontSize:13,color:d?"rgba(99,148,255,0.4)":"rgba(37,99,235,0.4)" }}>
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

export default DashboardKeuangan;