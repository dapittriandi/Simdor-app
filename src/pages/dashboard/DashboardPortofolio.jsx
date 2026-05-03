import { useState, useEffect } from "react";
import { db } from "../../services/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import {
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../components/layout/ThemeContext"; // sesuaikan path jika perlu

/* ─────────────────────────────────────────────
   STYLES — selaras penuh dengan Header.jsx & DashboardKoordinator
───────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&display=swap');

.dp-root { font-family: 'DM Sans', sans-serif; }

/* ── Page background ── */
.dp-bg-dark  { background: #070b18; min-height: 100vh; }
.dp-bg-light { background: #f0f6ff; min-height: 100vh; }

/* ── Section title ── */
.dp-title-dark   { color: #e2e8f5; }
.dp-title-light  { color: #1e3a5f; }
.dp-sub-dark     { color: rgba(99,148,255,0.5); }
.dp-sub-light    { color: rgba(37,99,235,0.45); }

/* ── Bidang badge / chip ── */
.dp-chip-dark  { background: linear-gradient(135deg,#1d4ed8,#3b82f6); box-shadow: 0 0 18px rgba(59,130,246,0.45); border-radius: 10px; }
.dp-chip-light { background: linear-gradient(135deg,#2563eb,#60a5fa); box-shadow: 0 0 14px rgba(59,130,246,0.22); border-radius: 10px; }

/* ── Glass card ── */
.dp-card-dark {
  background: rgba(12,18,40,0.75);
  backdrop-filter: blur(24px) saturate(160%);
  -webkit-backdrop-filter: blur(24px) saturate(160%);
  border: 1px solid rgba(99,148,255,0.13);
  box-shadow: 0 4px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.03);
  border-radius: 18px;
  transition: border-color 0.25s, box-shadow 0.25s;
}
.dp-card-dark:hover {
  border-color: rgba(96,165,250,0.28);
  box-shadow: 0 8px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(96,165,250,0.08);
}
.dp-card-light {
  background: rgba(240,246,255,0.82);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(59,130,246,0.14);
  box-shadow: 0 4px 24px rgba(59,130,246,0.08), inset 0 1px 0 rgba(255,255,255,0.7);
  border-radius: 18px;
  transition: border-color 0.25s, box-shadow 0.25s;
}
.dp-card-light:hover {
  border-color: rgba(59,130,246,0.28);
  box-shadow: 0 8px 36px rgba(59,130,246,0.13);
}

/* ── Card header divider ── */
.dp-divider-dark  { border-bottom: 1px solid rgba(99,148,255,0.1); }
.dp-divider-light { border-bottom: 1px solid rgba(59,130,246,0.1); }

/* ── Icon wrapper ── */
.dp-icon-dark  { background: rgba(255,255,255,0.05); border: 1px solid rgba(99,148,255,0.15); border-radius: 12px; }
.dp-icon-light { background: rgba(255,255,255,0.8);  border: 1px solid rgba(59,130,246,0.16); border-radius: 12px; box-shadow: 0 1px 4px rgba(59,130,246,0.08); }

/* ── Stat label ── */
.dp-label-dark  { color: rgba(148,163,220,0.7); font-size: 12.5px; font-weight: 500; }
.dp-label-light { color: #4b6ea8; font-size: 12.5px; font-weight: 500; }

/* ── Gradient numbers ── */
.dp-num-blue   { background: linear-gradient(135deg,#3b82f6,#93c5fd); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
.dp-num-green  { background: linear-gradient(135deg,#10b981,#6ee7b7); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
.dp-num-orange { background: linear-gradient(135deg,#f97316,#fdba74); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
.dp-num-emerald{ background: linear-gradient(135deg,#059669,#34d399); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
.dp-num-purple { background: linear-gradient(135deg,#8b5cf6,#c4b5fd); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }

/* ── Glow per card ── */
.dp-glow-blue    { box-shadow: 0 0 28px rgba(59,130,246,0.18); }
.dp-glow-green   { box-shadow: 0 0 28px rgba(16,185,129,0.16); }
.dp-glow-orange  { box-shadow: 0 0 28px rgba(249,115,22,0.16); }
.dp-glow-emerald { box-shadow: 0 0 28px rgba(5,150,105,0.16);  }
.dp-glow-purple  { box-shadow: 0 0 28px rgba(139,92,246,0.16); }

/* ── Progress bar track ── */
.dp-track-dark  { background: rgba(99,148,255,0.1);  border-radius: 99px; overflow: hidden; height: 10px; }
.dp-track-light { background: rgba(59,130,246,0.1);  border-radius: 99px; overflow: hidden; height: 10px; }

/* ── Progress bar fill ── */
@keyframes dpFill { from { width: 0%; } }
.dp-fill {
  height: 100%;
  border-radius: 99px;
  background: linear-gradient(90deg, #1d4ed8 0%, #3b82f6 50%, #60a5fa 100%);
  box-shadow: 0 0 14px rgba(59,130,246,0.45);
  animation: dpFill 1s cubic-bezier(0.22,1,0.36,1) forwards;
  transition: width 0.6s cubic-bezier(0.22,1,0.36,1);
}

/* ── Progress milestones ── */
.dp-milestone-dark  { background: rgba(99,148,255,0.12); border: 1px solid rgba(99,148,255,0.2); border-radius: 12px; }
.dp-milestone-light { background: rgba(219,234,254,0.6); border: 1px solid rgba(59,130,246,0.16); border-radius: 12px; }
.dp-milestone-val-dark   { color: #60a5fa; font-family:'DM Mono',monospace; font-size:22px; font-weight:700; }
.dp-milestone-val-light  { color: #1d4ed8; font-family:'DM Mono',monospace; font-size:22px; font-weight:700; }
.dp-milestone-label-dark  { color: rgba(99,148,255,0.55); font-size:11px; }
.dp-milestone-label-light { color: rgba(37,99,235,0.5);   font-size:11px; }

/* ── Status pill (all done / in process) ── */
.dp-status-pill-done-dark   { background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.28); border-radius: 14px; color: #6ee7b7; }
.dp-status-pill-done-light  { background: rgba(220,252,231,0.8);  border: 1px solid rgba(134,239,172,0.7); border-radius: 14px; color: #15803d; }
.dp-status-pill-wip-dark    { background: rgba(249,115,22,0.1);   border: 1px solid rgba(249,115,22,0.25); border-radius: 14px; color: #fdba74; }
.dp-status-pill-wip-light   { background: rgba(255,237,213,0.8);  border: 1px solid rgba(253,186,116,0.6); border-radius: 14px; color: #c2410c; }
.dp-status-pill-empty-dark  { background: rgba(99,148,255,0.08);  border: 1px solid rgba(99,148,255,0.18); border-radius: 14px; color: rgba(148,163,220,0.7); }
.dp-status-pill-empty-light { background: rgba(241,245,249,1);    border: 1px solid rgba(203,213,225,1);   border-radius: 14px; color: #64748b; }

/* ── Section title ── */
.dp-section-title-dark  { font-size: 15px; font-weight: 600; color: #e2e8f5; }
.dp-section-title-light { font-size: 15px; font-weight: 600; color: #1e3a5f; }
.dp-section-sub-dark    { font-size: 11.5px; color: rgba(99,148,255,0.5); margin-top: 2px; }
.dp-section-sub-light   { font-size: 11.5px; color: rgba(37,99,235,0.45); margin-top: 2px; }

/* ── Error banner ── */
.dp-error-dark  { background: rgba(239,68,68,0.1);   border: 1px solid rgba(239,68,68,0.25);  border-radius: 14px; color: #fca5a5; }
.dp-error-light { background: rgba(254,226,226,0.8); border: 1px solid rgba(252,165,165,0.5); border-radius: 14px; color: #b91c1c; }

/* ── Tooltip ── */
.dp-tooltip-dark  { background:rgba(7,11,24,0.95)!important; border:1px solid rgba(99,148,255,0.2)!important; border-radius:10px!important; color:#e2e8f5!important; font-family:'DM Sans',sans-serif!important; font-size:12px!important; }
.dp-tooltip-light { background:rgba(248,251,255,0.98)!important; border:1px solid rgba(59,130,246,0.15)!important; border-radius:10px!important; color:#1e3a5f!important; font-family:'DM Sans',sans-serif!important; font-size:12px!important; }

/* ── Skeleton shimmer ── */
@keyframes dpShimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
.dp-skel-dark {
  background: linear-gradient(90deg,rgba(30,40,80,0.6) 25%,rgba(50,65,120,0.4) 50%,rgba(30,40,80,0.6) 75%);
  background-size: 800px 100%; animation: dpShimmer 1.6s infinite linear; border-radius: 8px;
}
.dp-skel-light {
  background: linear-gradient(90deg,rgba(219,234,254,0.6) 25%,rgba(191,219,254,0.4) 50%,rgba(219,234,254,0.6) 75%);
  background-size: 800px 100%; animation: dpShimmer 1.6s infinite linear; border-radius: 8px;
}

/* ── Animations ── */
@keyframes dpPageIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
.dp-page-in { animation: dpPageIn 0.6s cubic-bezier(0.22,1,0.36,1) forwards; }

@keyframes dpCardIn { from{opacity:0;transform:translateY(20px) scale(0.98)} to{opacity:1;transform:translateY(0) scale(1)} }
.dp-c1 { animation: dpCardIn 0.55s 0.05s cubic-bezier(0.22,1,0.36,1) both; }
.dp-c2 { animation: dpCardIn 0.55s 0.12s cubic-bezier(0.22,1,0.36,1) both; }
.dp-c3 { animation: dpCardIn 0.55s 0.19s cubic-bezier(0.22,1,0.36,1) both; }
.dp-c4 { animation: dpCardIn 0.55s 0.26s cubic-bezier(0.22,1,0.36,1) both; }
.dp-c5 { animation: dpCardIn 0.55s 0.33s cubic-bezier(0.22,1,0.36,1) both; }
.dp-c6 { animation: dpCardIn 0.55s 0.40s cubic-bezier(0.22,1,0.36,1) both; }
.dp-c7 { animation: dpCardIn 0.55s 0.47s cubic-bezier(0.22,1,0.36,1) both; }

/* ── Accent bar (same as Header) ── */
@keyframes accentFlow{0%{background-position:0 0}100%{background-position:200% 0}}
.dp-accent-dark  { height:2px; background:linear-gradient(90deg,transparent 0%,#1d4ed8 15%,#60a5fa 40%,#a78bfa 60%,#3b82f6 80%,transparent 100%); background-size:200% 100%; animation:accentFlow 4s linear infinite; }
.dp-accent-light { height:2px; background:linear-gradient(90deg,transparent 0%,#3b82f6 15%,#93c5fd 40%,#6366f1 60%,#3b82f6 80%,transparent 100%); background-size:200% 100%; animation:accentFlow 4s linear infinite; }

/* ── Refresh button ── */
.dp-refresh-dark  { background:rgba(255,255,255,0.04); border:1px solid rgba(99,148,255,0.18); border-radius:10px; color:rgba(148,163,220,0.75); transition:all 0.2s; }
.dp-refresh-dark:hover  { background:rgba(59,130,246,0.1); border-color:rgba(96,165,250,0.35); color:#93c5fd; box-shadow:0 0 16px rgba(59,130,246,0.15); }
.dp-refresh-light { background:rgba(255,255,255,0.75); border:1px solid rgba(59,130,246,0.18); border-radius:10px; color:#4b6ea8; transition:all 0.2s; box-shadow:0 1px 4px rgba(59,130,246,0.08); }
.dp-refresh-light:hover { background:rgba(59,130,246,0.08); border-color:rgba(59,130,246,0.35); color:#2563eb; }

@keyframes spin { to{transform:rotate(360deg)} }
.dp-spin { animation: spin 0.8s linear infinite; }

/* ── Completion ring ── */
.dp-ring-track-dark  { stroke: rgba(99,148,255,0.12); }
.dp-ring-track-light { stroke: rgba(59,130,246,0.1);  }
.dp-ring-fill { stroke: url(#ringGrad); stroke-linecap: round; transition: stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1); }
`;

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const getLast12Months = () => {
  const names = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  const now = new Date();
  const month = now.getMonth();
  const year  = now.getFullYear();
  const result = [];
  for (let i = 0; i < 12; i++) {
    const m = (month - i + 12) % 12;
    const y = m > month ? year - 1 : year;
    result.unshift(`${names[m]} ${y}`);
  }
  return result;
};

const formatCurrencyShort = (v) => {
  if (v >= 1_000_000_000_000) return `${(v/1_000_000_000_000).toFixed(1)} T`;
  if (v >= 1_000_000_000)     return `${(v/1_000_000_000).toFixed(1)} M`;
  if (v >= 1_000_000)         return `${(v/1_000_000).toFixed(1)} Jt`;
  if (v >= 1_000)             return `${(v/1_000).toFixed(1)} Rb`;
  return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(v);
};

const formatCurrencyFull = (v) =>
  new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(v);

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────── */
const Skel = ({ h, w, isDark }) => (
  <div className={isDark?"dp-skel-dark":"dp-skel-light"} style={{ height:h, width:w||"100%" }} />
);

const StatCardSkeleton = ({ isDark }) => (
  <div className={`dp-card-${isDark?"dark":"light"}`} style={{ padding:"20px 22px" }}>
    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
      <Skel h={14} w="55%" isDark={isDark} />
      <Skel h={36} w={36} isDark={isDark} />
    </div>
    <Skel h={40} w="45%" isDark={isDark} />
    <div style={{ marginTop:8 }}><Skel h={11} w="32%" isDark={isDark} /></div>
  </div>
);

const ChartSkeleton = ({ isDark }) => (
  <div style={{ height:380, display:"flex", alignItems:"flex-end", gap:10, padding:"0 8px" }}>
    {[60,80,55,90,70,45,85,65,75,50,88,72].map((h,i) => (
      <div key={i} className={isDark?"dp-skel-dark":"dp-skel-light"}
           style={{ flex:1, height:`${h}%`, borderRadius:"6px 6px 0 0" }} />
    ))}
  </div>
);

/* Donut / ring chart untuk completion rate */
const CompletionRing = ({ pct, isDark }) => {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={130} height={130} viewBox="0 0 130 130">
      <defs>
        <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
      </defs>
      <circle cx={65} cy={65} r={r} fill="none" strokeWidth={10}
              className={isDark?"dp-ring-track-dark":"dp-ring-track-light"} />
      <circle cx={65} cy={65} r={r} fill="none" strokeWidth={10}
              className="dp-ring-fill"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              transform="rotate(-90 65 65)" />
      <text x={65} y={60} textAnchor="middle"
            style={{ fontFamily:"'DM Mono',monospace", fontSize:20, fontWeight:700,
                     fill: isDark ? "#60a5fa" : "#1d4ed8" }}>
        {pct}%
      </text>
      <text x={65} y={76} textAnchor="middle"
            style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10,
                     fill: isDark ? "rgba(99,148,255,0.5)" : "rgba(37,99,235,0.45)" }}>
        selesai
      </text>
    </svg>
  );
};

const CustomTooltip = ({ active, payload, label, isDark }) => {
  if (!active || !payload?.length) return null;
  const d = isDark;
  return (
    <div className={d?"dp-tooltip-dark":"dp-tooltip-light"} style={{ padding:"10px 14px" }}>
      <p style={{ fontWeight:600, marginBottom:4, color: d?"#93c5fd":"#1d4ed8" }}>{label}</p>
      <p style={{ color: d?"#e2e8f5":"#334e7a" }}>Jumlah Order: <strong>{payload[0].value}</strong></p>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const DashboardPortofolio = () => {
  const navigate    = useNavigate();
  const { isDark }  = useTheme();
  const d           = isDark;

  const [userData,            setUserData]            = useState(null);
  const [totalOrders,         setTotalOrders]         = useState(0);
  const [completedOrders,     setCompletedOrders]     = useState(0);
  const [pendingOrders,       setPendingOrders]       = useState(0);
  const [totalRevenue,        setTotalRevenue]        = useState(0);
  const [totalRevenueProforma,setTotalRevenueProforma]= useState(0);
  const [orderTrends,         setOrderTrends]         = useState([]);
  const [isLoading,           setIsLoading]           = useState(true);
  const [isRefresh,           setIsRefresh]           = useState(false);
  const [error,               setError]               = useState(null);
  const [mounted,             setMounted]             = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = JSON.parse(localStorage.getItem("user"));
    if (!stored || stored.peran !== "admin portofolio") {
      alert("Anda tidak memiliki akses!");
      navigate("/");
      return;
    }
    setUserData(stored);
  }, []);

  useEffect(() => {
    if (userData?.bidang) fetchOrderSummary(userData.bidang);
  }, [userData]);

  const fetchOrderSummary = async (userBidang, isManualRefresh = false) => {
    if (isManualRefresh) setIsRefresh(true);
    else setIsLoading(true);
    setError(null);

    try {
      const ordersRef   = collection(db, "orders");
      const totalSnap   = await getDocs(query(ordersRef, where("portofolio","==",userBidang)));
      const closedSnap  = await getDocs(query(ordersRef,
        where("portofolio","==",userBidang),
        where("statusOrder","in",["Selesai"])
      ));

      const total     = totalSnap.size;
      const completed = closedSnap.size;
      setTotalOrders(total);
      setCompletedOrders(completed);
      setPendingOrders(total - completed);

      let revenue = 0, revenueProforma = 0;
      const trends = {};
      const months = getLast12Months();

      totalSnap.forEach((doc) => {
        const data = doc.data();
        revenue         += Number(data.nilaiInvoice)  || 0;
        revenueProforma += Number(data.nilaiProforma) || 0;
        if (data.tanggalOrder?.seconds) {
          const key = new Date(data.tanggalOrder.seconds * 1000)
            .toLocaleDateString("id-ID",{month:"short",year:"numeric"});
          trends[key] = (trends[key] || 0) + 1;
        }
      });

      setTotalRevenue(revenue);
      setTotalRevenueProforma(revenueProforma);
      setOrderTrends(months.map((m) => ({ bulan:m, jumlah: trends[m] || 0 })));
    } catch (err) {
      console.error("Error:", err);
      setError("Tidak dapat memuat data. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
      setIsRefresh(false);
    }
  };

  const pct         = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;
  const bidangLabel = userData?.bidang?.toUpperCase() || "—";
  const axisColor   = d ? "rgba(99,148,255,0.4)"  : "rgba(37,99,235,0.35)";
  const gridColor   = d ? "rgba(99,148,255,0.07)" : "rgba(37,99,235,0.07)";

  const statusPillClass = () => {
    if (totalOrders === 0) return `dp-status-pill-empty-${d?"dark":"light"}`;
    if (completedOrders === totalOrders) return `dp-status-pill-done-${d?"dark":"light"}`;
    return `dp-status-pill-wip-${d?"dark":"light"}`;
  };
  const statusPillText = () => {
    if (totalOrders === 0) return "Belum ada order";
    if (completedOrders === totalOrders) return "✓ Semua order selesai!";
    return `${pendingOrders} order masih dalam proses`;
  };

  /* stat cards */
  const statCards = [
    {
      label: `Total Order — ${bidangLabel}`,
      display: totalOrders.toLocaleString("id-ID"),
      numClass: "dp-num-blue",
      glow: "dp-glow-blue",
      anim: "dp-c1",
      icon: <ClipboardDocumentListIcon style={{ width:20, height:20, color: d?"#60a5fa":"#2563eb" }} />,
    },
    {
      label: "Order Selesai",
      display: completedOrders.toLocaleString("id-ID"),
      sub: "Status: Selesai",
      numClass: "dp-num-green",
      glow: "dp-glow-green",
      anim: "dp-c2",
      icon: <CheckCircleIcon style={{ width:20, height:20, color: d?"#34d399":"#059669" }} />,
    },
    {
      label: "Order Dalam Proses",
      display: pendingOrders.toLocaleString("id-ID"),
      sub: "Sedang dalam proses",
      numClass: "dp-num-orange",
      glow: "dp-glow-orange",
      anim: "dp-c3",
      icon: <ClockIcon style={{ width:20, height:20, color: d?"#fb923c":"#ea580c" }} />,
    },
    {
      label: `Nilai Invoice (Fee) — ${bidangLabel}`,
      display: formatCurrencyShort(totalRevenue),
      sub: formatCurrencyFull(totalRevenue),
      numClass: "dp-num-emerald",
      glow: "dp-glow-emerald",
      anim: "dp-c4",
      icon: <CurrencyDollarIcon style={{ width:20, height:20, color: d?"#34d399":"#059669" }} />,
    },
    {
      label: `Nilai Proforma (PAD) — ${bidangLabel}`,
      display: formatCurrencyShort(totalRevenueProforma),
      sub: formatCurrencyFull(totalRevenueProforma),
      numClass: "dp-num-purple",
      glow: "dp-glow-purple",
      anim: "dp-c5",
      icon: <CurrencyDollarIcon style={{ width:20, height:20, color: d?"#a78bfa":"#7c3aed" }} />,
    },
  ];

  return (
    <>
      <style>{STYLES}</style>
      <div className={`dp-root dp-bg-${d?"dark":"light"} ${mounted?"dp-page-in":"opacity-0"}`}
           style={{ padding:"28px 20px", transition:"background 0.4s ease" }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>

          {/* ══════ PAGE HEADER ══════ */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28, flexWrap:"wrap", gap:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              {/* Icon */}
              <div className={`dp-icon-${d?"dark":"light"}`}
                   style={{ width:42, height:42, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <ChartBarIcon style={{ width:22, height:22, color: d?"#60a5fa":"#2563eb" }} />
              </div>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                  <h2 className={`dp-title-${d?"dark":"light"}`}
                      style={{ fontSize:22, fontWeight:700, lineHeight:1.2, letterSpacing:"-0.01em" }}>
                    Dashboard Portofolio
                  </h2>
                  {/* Bidang chip */}
                  <div className={`dp-chip-${d?"dark":"light"}`}
                       style={{ padding:"3px 12px", display:"inline-flex", alignItems:"center" }}>
                    <span style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", color:"white" }}>
                      {bidangLabel}
                    </span>
                  </div>
                </div>
                <p className={`dp-sub-${d?"dark":"light"}`} style={{ fontSize:12, marginTop:3 }}>
                  SIMDOR — Ringkasan Order &amp; Keuangan Portofolio
                </p>
              </div>
            </div>

            {/* Refresh */}
            <button
              onClick={() => userData?.bidang && fetchOrderSummary(userData.bidang, true)}
              disabled={isRefresh}
              className={`dp-refresh-${d?"dark":"light"}`}
              style={{ width:38, height:38, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}
              title="Refresh data"
            >
              <ArrowPathIcon style={{ width:17, height:17 }} className={isRefresh?"dp-spin":""} />
            </button>
          </div>

          {/* ══════ ERROR BANNER ══════ */}
          {error && (
            <div className={`dp-error-${d?"dark":"light"}`}
                 style={{ padding:"14px 18px", marginBottom:24, display:"flex", alignItems:"center", gap:12 }}>
              <ExclamationTriangleIcon style={{ width:20, height:20, flexShrink:0 }} />
              <div>
                <p style={{ fontWeight:600, fontSize:13 }}>Gagal Memuat Data</p>
                <p style={{ fontSize:12, marginTop:2, opacity:0.8 }}>{error}</p>
              </div>
            </div>
          )}

          {/* ══════ STAT CARDS ══════ */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:16, marginBottom:20 }}>
            {isLoading
              ? [1,2,3,4,5].map((i) => <StatCardSkeleton key={i} isDark={d} />)
              : statCards.map((card) => (
                  <div key={card.label}
                       className={`dp-card-${d?"dark":"light"} ${card.anim} ${card.glow}`}
                       style={{ padding:"20px 22px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                      <span className={`dp-label-${d?"dark":"light"}`} style={{ lineHeight:1.4, maxWidth:"calc(100% - 48px)" }}>
                        {card.label}
                      </span>
                      <div className={`dp-icon-${d?"dark":"light"}`}
                           style={{ width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        {card.icon}
                      </div>
                    </div>
                    <p className={card.numClass}
                       style={{ fontSize:32, fontWeight:700, lineHeight:1, fontFamily:"'DM Mono',monospace" }}>
                      {card.display}
                    </p>
                    {card.sub && (
                      <p style={{ fontSize:10.5, marginTop:6, fontFamily:"'DM Mono',monospace",
                                  color: d?"rgba(99,148,255,0.4)":"rgba(37,99,235,0.38)" }}>
                        {card.sub}
                      </p>
                    )}
                  </div>
                ))
            }
          </div>

          {/* ══════ PROGRESS CARD ══════ */}
          <div className={`dp-card-${d?"dark":"light"} dp-c6`} style={{ marginBottom:20 }}>
            {/* Header */}
            <div className={`dp-divider-${d?"dark":"light"}`}
                 style={{ padding:"16px 22px", display:"flex", alignItems:"center", gap:10 }}>
              <div className={`dp-icon-${d?"dark":"light"}`}
                   style={{ width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <CheckCircleIcon style={{ width:16, height:16, color: d?"#34d399":"#059669" }} />
              </div>
              <div>
                <p className={`dp-section-title-${d?"dark":"light"}`}>Progress Penyelesaian Order</p>
                <p className={`dp-section-sub-${d?"dark":"light"}`}>Rasio selesai vs total order portofolio</p>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding:"20px 22px 24px" }}>
              {isLoading
                ? (
                  <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                    <Skel h={14} w="40%" isDark={d} />
                    <Skel h={10} isDark={d} />
                    <div style={{ display:"flex", gap:16, marginTop:8 }}>
                      <Skel h={80} isDark={d} />
                      <Skel h={80} isDark={d} />
                      <Skel h={80} isDark={d} />
                    </div>
                  </div>
                )
                : (
                  <div style={{ display:"flex", alignItems:"center", gap:28, flexWrap:"wrap" }}>
                    {/* Ring */}
                    {!isLoading && <CompletionRing pct={pct} isDark={d} />}

                    {/* Right side */}
                    <div style={{ flex:1, minWidth:200 }}>
                      {/* Bar */}
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                        <span style={{ fontSize:12, color: d?"rgba(148,163,220,0.7)":"#4b6ea8" }}>
                          {completedOrders} dari {totalOrders} order selesai
                        </span>
                        <span style={{ fontSize:12, fontWeight:700, fontFamily:"'DM Mono',monospace",
                                       color: d?"#60a5fa":"#1d4ed8" }}>
                          {pct}%
                        </span>
                      </div>
                      <div className={`dp-track-${d?"dark":"light"}`} style={{ marginBottom:18 }}>
                        <div className="dp-fill" style={{ width:`${pct}%` }} />
                      </div>

                      {/* Milestone chips */}
                      <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:16 }}>
                        {[
                          { label:"Total Order",   val: totalOrders,     color: d?"#60a5fa":"#2563eb" },
                          { label:"Selesai",        val: completedOrders, color: d?"#34d399":"#059669" },
                          { label:"Dalam Proses",   val: pendingOrders,   color: d?"#fb923c":"#ea580c" },
                        ].map((m) => (
                          <div key={m.label} className={`dp-milestone-${d?"dark":"light"}`}
                               style={{ padding:"10px 16px", flex:"1 1 80px", textAlign:"center", minWidth:80 }}>
                            <p style={{ fontFamily:"'DM Mono',monospace", fontSize:20, fontWeight:700, color:m.color, lineHeight:1 }}>
                              {m.val}
                            </p>
                            <p className={`dp-milestone-label-${d?"dark":"light"}`} style={{ marginTop:4 }}>
                              {m.label}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Status pill */}
                      <div className={statusPillClass()}
                           style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"7px 14px", fontSize:12, fontWeight:500 }}>
                        {totalOrders > 0 && completedOrders === totalOrders
                          ? <CheckCircleIcon style={{ width:14, height:14 }} />
                          : totalOrders === 0
                            ? <ExclamationTriangleIcon style={{ width:14, height:14 }} />
                            : <ClockIcon style={{ width:14, height:14 }} />
                        }
                        {statusPillText()}
                      </div>
                    </div>
                  </div>
                )
              }
            </div>
          </div>

          {/* ══════ TREND CHART ══════ */}
          <div className={`dp-card-${d?"dark":"light"} dp-c7`}>
            {/* Header */}
            <div className={`dp-divider-${d?"dark":"light"}`}
                 style={{ padding:"16px 22px", display:"flex", alignItems:"center", gap:10 }}>
              <div className={`dp-icon-${d?"dark":"light"}`}
                   style={{ width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <ChartBarIcon style={{ width:16, height:16, color: d?"#60a5fa":"#2563eb" }} />
              </div>
              <div>
                <p className={`dp-section-title-${d?"dark":"light"}`}>Tren Order per Bulan</p>
                <p className={`dp-section-sub-${d?"dark":"light"}`}>12 bulan terakhir berdasarkan tanggal order</p>
              </div>
            </div>

            {/* Chart */}
            <div style={{ padding:"20px 22px 24px" }}>
              {isLoading
                ? <ChartSkeleton isDark={d} />
                : orderTrends.length > 0
                  ? (
                    <ResponsiveContainer width="100%" height={380}>
                      <BarChart data={orderTrends} margin={{ top:8, right:8, left:-16, bottom:4 }}>
                        <defs>
                          <linearGradient id="dpBarDark" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%"   stopColor="#3b82f6" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0.4} />
                          </linearGradient>
                          <linearGradient id="dpBarLight" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%"   stopColor="#2563eb" stopOpacity={0.85} />
                            <stop offset="100%" stopColor="#93c5fd" stopOpacity={0.45} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                        <XAxis
                          dataKey="bulan"
                          fontSize={11}
                          tick={{ fill:axisColor, fontFamily:"'DM Sans',sans-serif" }}
                          axisLine={{ stroke:gridColor }}
                          tickLine={false}
                        />
                        <YAxis
                          fontSize={11}
                          domain={["auto","auto"]}
                          tick={{ fill:axisColor, fontFamily:"'DM Mono',monospace" }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v) => v.toLocaleString()}
                        />
                        <Tooltip
                          content={<CustomTooltip isDark={d} />}
                          cursor={{ fill: d?"rgba(99,148,255,0.05)":"rgba(37,99,235,0.05)", radius:6 }}
                        />
                        <Legend wrapperStyle={{ fontSize:12, fontFamily:"'DM Sans',sans-serif",
                                                color: d?"rgba(148,163,220,0.7)":"#4b6ea8" }} />
                        <Bar
                          dataKey="jumlah"
                          name="Jumlah Order"
                          fill={d?"url(#dpBarDark)":"url(#dpBarLight)"}
                          radius={[6,6,0,0]}
                          barSize={22}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )
                  : (
                    <div style={{ height:300, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10 }}>
                      <ExclamationTriangleIcon style={{ width:36, height:36, color: d?"rgba(99,148,255,0.3)":"rgba(37,99,235,0.3)" }} />
                      <p style={{ fontSize:13, color: d?"rgba(99,148,255,0.4)":"rgba(37,99,235,0.4)" }}>
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

export default DashboardPortofolio;