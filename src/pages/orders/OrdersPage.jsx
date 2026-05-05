import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../services/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import {
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  DocumentTextIcon,
  ChevronUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";
import { useTheme } from "../../components/layout/ThemeContext";

/* ═══════════════════════════════════════════════════════════════
   STYLES
════════════════════════════════════════════════════════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&display=swap');

.op-root { font-family: 'DM Sans', sans-serif; }

/* ── Background ── */
.op-bg-dark  { background: #070b18; min-height: 100vh; }
.op-bg-light { background: linear-gradient(135deg,#f0f6ff 0%,#e8f0fe 50%,#f5f7ff 100%); min-height: 100vh; }

/* ── Typography ── */
.op-title-dark  { color: rgba(219,234,254,0.92); }
.op-title-light { color: #1e3a6e; }
.op-muted-dark  { color: rgba(148,163,220,0.55); }
.op-muted-light { color: #7b95c4; }

/* ── Stat cards ── */
.op-stat-dark {
  background: rgba(10,16,34,0.75);
  border: 1px solid rgba(99,148,255,0.1);
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  border-radius: 14px; padding: 16px 20px;
  transition: border-color .2s, box-shadow .2s;
}
.op-stat-dark:hover { border-color: rgba(99,148,255,0.22); box-shadow: 0 8px 28px rgba(0,0,0,0.3); }
.op-stat-light {
  background: rgba(255,255,255,0.88);
  border: 1px solid rgba(59,130,246,0.1);
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  border-radius: 14px; padding: 16px 20px;
  box-shadow: 0 2px 16px rgba(59,130,246,0.06);
  transition: border-color .2s, box-shadow .2s;
}
.op-stat-light:hover { border-color: rgba(59,130,246,0.22); box-shadow: 0 8px 24px rgba(59,130,246,0.1); }

/* ── Panel ── */
.op-panel-dark {
  background: rgba(10,16,34,0.8);
  border: 1px solid rgba(99,148,255,0.1);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  border-radius: 18px; overflow: hidden;
}
.op-panel-light {
  background: rgba(255,255,255,0.9);
  border: 1px solid rgba(59,130,246,0.1);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 4px 24px rgba(59,130,246,0.07);
  border-radius: 18px; overflow: hidden;
}
.op-panel-hdr-dark  { border-bottom: 1px solid rgba(99,148,255,0.1); }
.op-panel-hdr-light { border-bottom: 1px solid rgba(59,130,246,0.08); }

/* ── Inputs ── */
.op-input-wrap { position: relative; }
.op-input-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); pointer-events: none; width: 16px; height: 16px; }

.op-input-dark {
  background: rgba(7,11,24,0.6); border: 1px solid rgba(99,148,255,0.15); border-radius: 10px;
  color: rgba(219,234,254,0.88); font-family: 'DM Sans',sans-serif; font-size: 13.5px;
  transition: border-color .2s, box-shadow .2s; outline: none; width: 100%; padding: 9px 12px 9px 38px;
}
.op-input-dark::placeholder { color: rgba(148,163,220,0.4); }
.op-input-dark:focus { border-color: rgba(96,165,250,0.45); box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }

.op-input-light {
  background: rgba(255,255,255,0.8); border: 1px solid rgba(59,130,246,0.15); border-radius: 10px;
  color: #1e3a6e; font-family: 'DM Sans',sans-serif; font-size: 13.5px;
  transition: border-color .2s, box-shadow .2s; outline: none; width: 100%; padding: 9px 12px 9px 38px;
}
.op-input-light::placeholder { color: #a0b4d0; }
.op-input-light:focus { border-color: rgba(59,130,246,0.4); box-shadow: 0 0 0 3px rgba(59,130,246,0.08); }

.op-select-plain-dark {
  appearance: none; -webkit-appearance: none;
  background: rgba(7,11,24,0.6); border: 1px solid rgba(99,148,255,0.15); border-radius: 10px;
  color: rgba(219,234,254,0.88); font-family: 'DM Sans',sans-serif; font-size: 13.5px;
  padding: 9px 32px 9px 14px; outline: none; width: 100%;
  transition: border-color .2s, box-shadow .2s; cursor: pointer;
}
.op-select-plain-dark:focus { border-color: rgba(96,165,250,0.45); box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
.op-select-plain-dark option { background: #0d1a3a; }

.op-select-plain-light {
  appearance: none; -webkit-appearance: none;
  background: rgba(255,255,255,0.8); border: 1px solid rgba(59,130,246,0.15); border-radius: 10px;
  color: #1e3a6e; font-family: 'DM Sans',sans-serif; font-size: 13.5px;
  padding: 9px 32px 9px 14px; outline: none; width: 100%;
  transition: border-color .2s, box-shadow .2s; cursor: pointer;
}
.op-select-plain-light:focus { border-color: rgba(59,130,246,0.4); box-shadow: 0 0 0 3px rgba(59,130,246,0.08); }

/* ── Table ── */
.op-thead-dark  { background: rgba(7,11,24,0.7); }
.op-thead-light { background: rgba(235,244,255,0.8); }

.op-th-dark {
  color: rgba(148,163,220,0.65); font-size: 11px; font-weight: 600;
  letter-spacing: 0.08em; text-transform: uppercase; padding: 13px 16px;
  white-space: nowrap; user-select: none;
}
.op-th-light {
  color: #6885b5; font-size: 11px; font-weight: 600;
  letter-spacing: 0.08em; text-transform: uppercase; padding: 13px 16px;
  white-space: nowrap; user-select: none;
}
.op-th-sort-dark  { cursor: pointer; }
.op-th-sort-dark:hover  { color: #93c5fd; background: rgba(59,130,246,0.06); }
.op-th-sort-light { cursor: pointer; }
.op-th-sort-light:hover { color: #2563eb; background: rgba(59,130,246,0.06); }

.op-td-dark  { color: rgba(179,193,240,0.85); font-size: 13px; padding: 13px 16px; border-bottom: 1px solid rgba(99,148,255,0.06); }
.op-td-light { color: #334e7a; font-size: 13px; padding: 13px 16px; border-bottom: 1px solid rgba(59,130,246,0.06); }
.op-td-name-dark  { color: rgba(219,234,254,0.9); font-weight: 500; }
.op-td-name-light { color: #1e3a6e; font-weight: 500; }
.op-tr-dark  { transition: background .15s; }
.op-tr-dark:hover  { background: rgba(59,130,246,0.06); }
.op-tr-light { transition: background .15s; }
.op-tr-light:hover { background: rgba(59,130,246,0.04); }

/* ── Card view ── */
.op-card-item-dark {
  background: rgba(10,16,34,0.75); border: 1px solid rgba(99,148,255,0.1);
  border-radius: 14px; padding: 16px; transition: all .2s;
}
.op-card-item-dark:hover { border-color: rgba(99,148,255,0.25); box-shadow: 0 8px 24px rgba(0,0,0,0.3); transform: translateY(-1px); }
.op-card-item-light {
  background: rgba(255,255,255,0.92); border: 1px solid rgba(59,130,246,0.1);
  border-radius: 14px; padding: 16px; transition: all .2s;
  box-shadow: 0 2px 10px rgba(59,130,246,0.05);
}
.op-card-item-light:hover { border-color: rgba(59,130,246,0.25); box-shadow: 0 8px 24px rgba(59,130,246,0.1); transform: translateY(-1px); }

/* ── Skeleton ── */
@keyframes opShimmer { 0%,100%{opacity:.4} 50%{opacity:.85} }
.op-sk-dark  { background: rgba(99,148,255,0.1); border-radius: 6px; animation: opShimmer 1.6s ease-in-out infinite; }
.op-sk-light { background: rgba(59,130,246,0.08); border-radius: 6px; animation: opShimmer 1.6s ease-in-out infinite; }

/* ── Entry animation ── */
@keyframes opIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
.op-animate { animation: opIn .45s cubic-bezier(0.22,1,0.36,1) both; }

/* ── Buttons ── */
.op-btn-primary {
  background: linear-gradient(135deg,#1d4ed8,#3b82f6); color: white; border: none;
  padding: 9px 18px; border-radius: 10px; font-size: 13.5px; font-weight: 500;
  display: inline-flex; align-items: center; gap: 7px; cursor: pointer;
  box-shadow: 0 4px 14px rgba(37,99,235,0.35); transition: all .22s;
  font-family: 'DM Sans',sans-serif;
}
.op-btn-primary:hover { background: linear-gradient(135deg,#2563eb,#60a5fa); box-shadow: 0 6px 22px rgba(37,99,235,0.5); transform: translateY(-1px); }

.op-btn-ghost-dark {
  background: rgba(255,255,255,0.04); border: 1px solid rgba(99,148,255,0.15); border-radius: 10px;
  color: rgba(148,163,220,0.75); padding: 9px 14px; font-size: 13.5px; font-weight: 500;
  display: inline-flex; align-items: center; gap: 6px; cursor: pointer; transition: all .2s;
  font-family: 'DM Sans',sans-serif; white-space: nowrap;
}
.op-btn-ghost-dark:hover { background: rgba(59,130,246,0.1); border-color: rgba(96,165,250,0.3); color: #93c5fd; }

.op-btn-ghost-light {
  background: rgba(255,255,255,0.8); border: 1px solid rgba(59,130,246,0.15); border-radius: 10px;
  color: #5878a8; padding: 9px 14px; font-size: 13.5px; font-weight: 500;
  display: inline-flex; align-items: center; gap: 6px; cursor: pointer; transition: all .2s;
  font-family: 'DM Sans',sans-serif; white-space: nowrap;
}
.op-btn-ghost-light:hover { background: rgba(59,130,246,0.07); border-color: rgba(59,130,246,0.3); color: #1d4ed8; }

.op-btn-icon-dark {
  background: rgba(255,255,255,0.04); border: 1px solid rgba(99,148,255,0.15); border-radius: 10px;
  color: rgba(148,163,220,0.75); padding: 9px 11px;
  display: inline-flex; align-items: center; cursor: pointer; transition: all .2s;
}
.op-btn-icon-dark.active, .op-btn-icon-dark:hover { background: rgba(59,130,246,0.12); border-color: rgba(96,165,250,0.3); color: #93c5fd; }
.op-btn-icon-light {
  background: rgba(255,255,255,0.8); border: 1px solid rgba(59,130,246,0.15); border-radius: 10px;
  color: #7a97c4; padding: 9px 11px;
  display: inline-flex; align-items: center; cursor: pointer; transition: all .2s;
}
.op-btn-icon-light.active, .op-btn-icon-light:hover { background: rgba(59,130,246,0.1); border-color: rgba(59,130,246,0.3); color: #1d4ed8; }

.op-btn-detail-dark {
  background: rgba(59,130,246,0.14); border: 1px solid rgba(96,165,250,0.25);
  border-radius: 8px; color: #93c5fd; padding: 6px 14px; font-size: 12.5px; font-weight: 500;
  cursor: pointer; transition: all .18s; font-family: 'DM Sans',sans-serif;
}
.op-btn-detail-dark:hover { background: rgba(59,130,246,0.25); border-color: rgba(96,165,250,0.45); box-shadow: 0 0 12px rgba(59,130,246,0.2); }
.op-btn-detail-light {
  background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.2);
  border-radius: 8px; color: #2563eb; padding: 6px 14px; font-size: 12.5px; font-weight: 500;
  cursor: pointer; transition: all .18s; font-family: 'DM Sans',sans-serif;
}
.op-btn-detail-light:hover { background: rgba(59,130,246,0.15); border-color: rgba(59,130,246,0.38); }

/* ── Pagination ── */
.op-page-btn-dark {
  display: flex; align-items: center; gap: 5px; padding: 8px 14px; border-radius: 10px;
  border: 1px solid rgba(99,148,255,0.15); background: rgba(255,255,255,0.04);
  color: rgba(148,163,220,0.75); font-size: 13px; cursor: pointer; transition: all .2s;
  font-family: 'DM Sans',sans-serif;
}
.op-page-btn-dark:hover:not(:disabled) { background: rgba(59,130,246,0.1); border-color: rgba(96,165,250,0.3); color: #93c5fd; }
.op-page-btn-dark:disabled { opacity: .35; cursor: not-allowed; }

.op-page-btn-light {
  display: flex; align-items: center; gap: 5px; padding: 8px 14px; border-radius: 10px;
  border: 1px solid rgba(59,130,246,0.15); background: rgba(255,255,255,0.8);
  color: #5878a8; font-size: 13px; cursor: pointer; transition: all .2s;
  font-family: 'DM Sans',sans-serif;
}
.op-page-btn-light:hover:not(:disabled) { background: rgba(59,130,246,0.07); border-color: rgba(59,130,246,0.3); color: #1d4ed8; }
.op-page-btn-light:disabled { opacity: .35; cursor: not-allowed; }

.op-page-num-dark {
  min-width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
  font-size: 13px; border: 1px solid transparent; cursor: pointer; transition: all .18s;
  color: rgba(148,163,220,0.7); font-family: 'DM Mono',monospace;
}
.op-page-num-dark:hover   { background: rgba(59,130,246,0.1); color: #93c5fd; border-color: rgba(96,165,250,0.2); }
.op-page-num-dark.active  { background: linear-gradient(135deg,#1d4ed8,#3b82f6); color: white; border-color: transparent; font-weight: 600; }
.op-page-num-light {
  min-width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
  font-size: 13px; border: 1px solid transparent; cursor: pointer; transition: all .18s;
  color: #5878a8; font-family: 'DM Mono',monospace;
}
.op-page-num-light:hover  { background: rgba(59,130,246,0.08); color: #1d4ed8; border-color: rgba(59,130,246,0.18); }
.op-page-num-light.active { background: linear-gradient(135deg,#1d4ed8,#3b82f6); color: white; border-color: transparent; font-weight: 600; }

/* ── Accent bar ── */
@keyframes accentFlow { 0%{background-position:0 0} 100%{background-position:200% 0} }
.op-accent {
  height: 3px;
  background: linear-gradient(90deg,transparent 0%,#1d4ed8 15%,#60a5fa 40%,#a78bfa 60%,#3b82f6 80%,transparent 100%);
  background-size: 200% 100%;
  animation: accentFlow 4s linear infinite;
}

/* ── Active filter chip ── */
.op-filter-chip-dark { background: rgba(59,130,246,0.15); border: 1px solid rgba(96,165,250,0.3); color: #93c5fd; font-size: 11.5px; font-weight: 600; padding: 3px 10px; border-radius: 20px; display: inline-flex; align-items: center; gap: 5px; }
.op-filter-chip-light { background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.2); color: #1d4ed8; font-size: 11.5px; font-weight: 600; padding: 3px 10px; border-radius: 20px; display: inline-flex; align-items: center; gap: 5px; }
`;

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
════════════════════════════════════════════════════════════════ */
const STATUS_CONFIG = {
  "New Order":              { bg:"rgba(148,163,184,0.12)", border:"rgba(148,163,184,0.25)", color:"#94a3b8" },
  "Entry":                  { bg:"rgba(16,185,129,0.15)",  border:"rgba(16,185,129,0.3)",  color:"#34d399" },
  "Diproses - Lapangan":    { bg:"rgba(59,130,246,0.15)",  border:"rgba(59,130,246,0.3)",  color:"#60a5fa" },
  "Diproses - Sertifikat":  { bg:"rgba(139,92,246,0.15)",  border:"rgba(139,92,246,0.3)",  color:"#a78bfa" },
  "Penerbitan Proforma":    { bg:"rgba(6,182,212,0.15)",   border:"rgba(6,182,212,0.3)",   color:"#22d3ee" },
  "Closed Order":           { bg:"rgba(249,115,22,0.15)",  border:"rgba(249,115,22,0.3)",  color:"#fb923c" },
  "Invoice":                { bg:"rgba(245,158,11,0.15)",  border:"rgba(245,158,11,0.3)",  color:"#fbbf24" },
  "Selesai":                { bg:"rgba(20,184,166,0.15)",  border:"rgba(20,184,166,0.3)",  color:"#2dd4bf" },
};

const ALL_STATUSES = Object.keys(STATUS_CONFIG);
const PER_PAGE_OPTIONS = [10, 20, 50];

/* ═══════════════════════════════════════════════════════════════
   SUB COMPONENTS
════════════════════════════════════════════════════════════════ */
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { bg:"rgba(239,68,68,0.15)", border:"rgba(239,68,68,0.3)", color:"#f87171" };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:20,
      fontSize:11.5, fontWeight:500, background:cfg.bg, border:`1px solid ${cfg.border}`, color:cfg.color, whiteSpace:"nowrap" }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:cfg.color, flexShrink:0 }} />
      {status || "—"}
    </span>
  );
};

const KelengkapanBadge = ({ isComplete }) => (
  <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:20,
    fontSize:11.5, fontWeight:500, whiteSpace:"nowrap",
    background: isComplete ? "rgba(20,184,166,0.15)" : "rgba(239,68,68,0.12)",
    border: `1px solid ${isComplete ? "rgba(20,184,166,0.3)" : "rgba(239,68,68,0.25)"}`,
    color: isComplete ? "#2dd4bf" : "#f87171" }}>
    <span style={{ width:5, height:5, borderRadius:"50%", background: isComplete ? "#2dd4bf" : "#f87171", flexShrink:0 }} />
    {isComplete ? "Lengkap" : "Tidak Lengkap"}
  </span>
);

const Sk = ({ w, h, d, style = {} }) => (
  <div className={`op-sk-${d?"dark":"light"}`} style={{ width:w, height:h, ...style }} />
);

const TableRowSkeleton = ({ d }) => (
  <tr>
    {[24,130,90,90,100,80,60].map((w,i) => (
      <td key={i} className={`op-td-${d?"dark":"light"}`}>
        <Sk w={w} h={i===2||i===5?20:13} d={d} style={i===2||i===5?{borderRadius:20}:{}} />
      </td>
    ))}
  </tr>
);

/* Sort icon */
const SortIcon = ({ field, sortKey, sortDir, color }) => {
  if (sortKey !== field) return <ChevronUpDownIcon style={{ width:13, height:13, opacity:.4 }} />;
  return sortDir === "asc"
    ? <ChevronUpIcon   style={{ width:13, height:13, color }} />
    : <ChevronDownIcon style={{ width:13, height:13, color }} />;
};

/* Stat card */
const StatCard = ({ label, value, color, d }) => (
  <div className={`op-stat-${d?"dark":"light"}`}>
    <p style={{ fontSize:11, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase",
      color: d?"rgba(148,163,220,0.5)":"#8aabcd", marginBottom:6 }}>{label}</p>
    <p style={{ fontSize:26, fontWeight:700, color, margin:0, fontFamily:"'DM Mono',monospace", lineHeight:1 }}>{value}</p>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════ */
const OrdersPage = () => {
  const { portofolio } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const d = isDark;
  const t = d ? "dark" : "light";

  // ── Data state ──
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // ── Filter / Search / Sort ──
  const [searchQuery,   setSearchQuery]   = useState("");
  const [filterStatus,  setFilterStatus]  = useState("");
  const [filterLengkap, setFilterLengkap] = useState(""); // "lengkap" | "tidak" | ""
  const [sortKey,       setSortKey]       = useState("createdAt");
  const [sortDir,       setSortDir]       = useState("desc");

  // ── Pagination ──
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage,     setPerPage]     = useState(10);

  // ── View mode ──
  const [viewMode, setViewMode] = useState("table"); // "table" | "card"

  const userData  = JSON.parse(localStorage.getItem("user")) || {};
  const userPeran = userData.peran || "";
  const userBidang= userData.bidang || "";

  // ── Search debounce ref ──
  const searchTimer = useRef(null);
  const [searchDebounced, setSearchDebounced] = useState("");

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setSearchDebounced(val);
      setCurrentPage(1);
    }, 350);
  };

  // ── Access guard ──
  useEffect(() => {
    if (!userPeran) { alert("Anda tidak memiliki akses!"); navigate("/"); return; }
    if (userPeran === "admin portofolio" && userBidang !== portofolio) {
      alert("Anda tidak memiliki akses!"); navigate("/"); return;
    }
  }, [userPeran, userBidang, portofolio]);

  // ── Fetch ALL data once (client-side filter/sort/page is fast up to ~5k rows) ──
  useEffect(() => {
    fetchOrders();
  }, [portofolio]);

  const fetchOrders = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const snap = await getDocs(
        query(
          collection(db, "orders"),
          where("portofolio", "==", portofolio),
          orderBy("createdAt", "desc")
        )
      );
      setAllOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error fetching orders:", err);
      setFetchError("Gagal memuat data. Coba refresh halaman.");
    }
    setLoading(false);
  };

  // ── Required field map for kelengkapan check ──
  const REQUIRED_FIELDS = {
    "admin portofolio": [
      "pelanggan","statusOrder","tanggalStatusOrder","tanggalSerahOrderKeCs","tanggalPekerjaan",
      "proformaSerahKeOps","proformaSerahKeDukbis","jenisSertifikat","keteranganSertifikatPM06",
      "noSiSpk","jenisPekerjaan","namaTongkang","lokasiPekerjaan","estimasiTonase","tonaseDS",
      "nilaiProforma","tanggalPengirimanInvoice","tanggalPengirimanFaktur","nomorInvoice",
      "fakturPajak","nilaiInvoice","nomorOrder","tanggalOrder",
      "distribusiSertifikatPengirim","distribusiSertifikatPengirimTanggal",
      "distribusiSertifikatPenerima","distribusiSertifikatPenerimaTanggal",
    ],
    "customer service": ["nomorOrder","tanggalOrder"],
    "admin keuangan": [
      "tanggalPengirimanInvoice","tanggalPengirimanFaktur","nomorInvoice","fakturPajak",
      "nilaiInvoice","distribusiSertifikatPengirim","distribusiSertifikatPengirimTanggal",
      "distribusiSertifikatPenerima","distribusiSertifikatPenerimaTanggal",
    ],
    "koordinator": [
      "pelanggan","statusOrder","tanggalStatusOrder","tanggalSerahOrderKeCs","tanggalPekerjaan",
      "proformaSerahKeOps","proformaSerahKeDukbis","jenisSertifikat","noSiSpk","jenisPekerjaan",
      "namaTongkang","lokasiPekerjaan","estimasiTonase","tonaseDS","nilaiProforma",
      "distribusiSertifikatPengirim","distribusiSertifikatPengirimTanggal",
      "distribusiSertifikatPenerima","distribusiSertifikatPenerimaTanggal",
    ],
  };

  const isComplete = useCallback((order) => {
    const fields = REQUIRED_FIELDS[userPeran] || [];
    return fields.every(f => order[f] != null && order[f] !== "");
  }, [userPeran]);

  // ── Computed: filtered + sorted data ──
  const processedOrders = useMemo(() => {
    let list = [...allOrders];

    // 1. Search — pelanggan, nomorOrder, jenisPekerjaan
    if (searchDebounced.trim()) {
      const q = searchDebounced.toLowerCase();
      list = list.filter(o =>
        o.pelanggan?.toLowerCase().includes(q) ||
        o.nomorOrder?.toLowerCase().includes(q) ||
        o.jenisPekerjaan?.toLowerCase().includes(q)
      );
    }

    // 2. Status filter
    if (filterStatus) {
      list = list.filter(o => o.statusOrder === filterStatus);
    }

    // 3. Kelengkapan filter
    if (filterLengkap === "lengkap") list = list.filter(o => isComplete(o));
    if (filterLengkap === "tidak")   list = list.filter(o => !isComplete(o));

    // 4. Sort
    list.sort((a, b) => {
      let valA = a[sortKey], valB = b[sortKey];

      // Firestore Timestamp → number
      if (valA?.seconds != null) valA = valA.seconds;
      if (valB?.seconds != null) valB = valB.seconds;

      // String comparison
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA == null && valB == null) return 0;
      if (valA == null) return 1;
      if (valB == null) return -1;

      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ?  1 : -1;
      return 0;
    });

    return list;
  }, [allOrders, searchDebounced, filterStatus, filterLengkap, sortKey, sortDir, isComplete]);

  // ── Stats ──
  const stats = useMemo(() => {
    const total    = allOrders.length;
    const selesai  = allOrders.filter(o => o.statusOrder === "Selesai").length;
    const lengkap  = allOrders.filter(o => isComplete(o)).length;
    const berjalan = allOrders.filter(o => o.statusOrder && o.statusOrder !== "Selesai").length;
    return { total, selesai, lengkap, berjalan };
  }, [allOrders, isComplete]);

  // ── Pagination ──
  const totalPages   = Math.max(1, Math.ceil(processedOrders.length / perPage));
  const safePage     = Math.min(currentPage, totalPages);
  const pageOrders   = processedOrders.slice((safePage - 1) * perPage, safePage * perPage);
  const startNum     = (safePage - 1) * perPage + 1;

  // Reset to page 1 when filters change
  useEffect(() => { setCurrentPage(1); }, [searchDebounced, filterStatus, filterLengkap, sortKey, sortDir, perPage]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const handleReset = () => {
    setSearchQuery(""); setSearchDebounced("");
    setFilterStatus(""); setFilterLengkap("");
    setSortKey("createdAt"); setSortDir("desc");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchDebounced || filterStatus || filterLengkap;

  const formatDate = (ts) => {
    if (!ts?.seconds) return "—";
    try {
      return new Date(ts.seconds * 1000).toLocaleDateString("id-ID", { day:"2-digit", month:"short", year:"numeric" });
    } catch { return "—"; }
  };

  // ── Page number array for pagination UI ──
  const pageNumbers = useMemo(() => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push("…");
      for (let i = Math.max(2, safePage-1); i <= Math.min(totalPages-1, safePage+1); i++) pages.push(i);
      if (safePage < totalPages - 2) pages.push("…");
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, safePage]);

  const iconColor = d ? "rgba(148,163,220,0.5)" : "#a0b4d0";
  const sortIconColor = d ? "#93c5fd" : "#2563eb";

  // ── Sort-able columns ──
  const COLUMNS = [
    { key: null,          label: "#",              sortable: false },
    { key: "pelanggan",   label: "Nama Pelanggan",  sortable: true  },
    { key: "statusOrder", label: "Status Order",    sortable: true  },
    { key: "nomorOrder",  label: "Nomor Order",     sortable: true  },
    { key: "tanggalOrder",label: "Tanggal Order",   sortable: true  },
    { key: "kelengkapan", label: "Kelengkapan",     sortable: false },
    { key: null,          label: "Aksi",            sortable: false },
  ];

  /* ── RENDER ── */
  return (
    <>
      <style>{STYLES}</style>
      <div className={`op-root op-bg-${t}`} style={{ padding:"28px 24px 56px", transition:"background .4s" }}>
        <div style={{ maxWidth:1300, margin:"0 auto" }}>

          {/* ── Page Header ── */}
          <div className="op-animate" style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24, gap:16, flexWrap:"wrap" }}>
            <div>
              <h2 className={`op-title-${t}`} style={{ fontSize:26, fontWeight:700, margin:0, display:"flex", alignItems:"center", gap:10, letterSpacing:"-0.3px" }}>
                <ClipboardDocumentListIcon style={{ width:26, height:26, color:"#3b82f6", flexShrink:0 }} />
                Daftar Order — {portofolio?.toUpperCase()}
              </h2>
              <p className={`op-muted-${t}`} style={{ fontSize:13, margin:"5px 0 0 36px" }}>
                {loading ? "Memuat data…" : `${processedOrders.length} dari ${allOrders.length} order`}
                {hasActiveFilters && <span style={{ marginLeft:8 }}>· Filter aktif</span>}
              </p>
            </div>

            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              {/* View mode toggle */}
              <button className={`op-btn-icon-${t}${viewMode==="table"?" active":""}`} onClick={()=>setViewMode("table")} title="Tampilan Tabel">
                <ListBulletIcon style={{ width:17, height:17 }} />
              </button>
              <button className={`op-btn-icon-${t}${viewMode==="card"?" active":""}`} onClick={()=>setViewMode("card")} title="Tampilan Kartu">
                <Squares2X2Icon style={{ width:17, height:17 }} />
              </button>

              {/* Refresh */}
              <button className={`op-btn-ghost-${t}`} onClick={fetchOrders} title="Refresh data">
                <ArrowPathIcon style={{ width:15, height:15 }} />
                Refresh
              </button>

              {/* Add Order */}
              {userPeran === "admin portofolio" && (
                <button className="op-btn-primary" onClick={() => navigate(`/orders/${portofolio}/create`)}>
                  <PlusIcon style={{ width:16, height:16 }} /> Tambah Order
                </button>
              )}
            </div>
          </div>

          {/* ── Stat Cards ── */}
          {!loading && (
            <div className="op-animate" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:12, marginBottom:20, animationDelay:"60ms" }}>
              <StatCard label="Total Order"    value={stats.total}    color={d?"rgba(219,234,254,0.9)":"#1e3a6e"} d={d} />
              <StatCard label="Berjalan"       value={stats.berjalan} color="#60a5fa" d={d} />
              <StatCard label="Selesai"        value={stats.selesai}  color="#2dd4bf" d={d} />
              <StatCard label="Data Lengkap"   value={stats.lengkap}  color="#34d399" d={d} />
            </div>
          )}

          {/* ── Main Panel ── */}
          <div className={`op-panel-${t} op-animate`} style={{ animationDelay:"100ms" }}>

            {/* Accent bar */}
            <div className="op-accent" />

            {/* ── Toolbar ── */}
            <div className={`op-panel-hdr-${t}`} style={{ padding:"16px 20px" }}>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>

                {/* Search */}
                <div className="op-input-wrap" style={{ flex:"1 1 220px" }}>
                  <MagnifyingGlassIcon className="op-input-icon" style={{ color:iconColor }} />
                  <input
                    type="text"
                    placeholder="Cari pelanggan / nomor order / jenis pekerjaan…"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className={`op-input-${t}`}
                  />
                </div>

                {/* Filter: Status */}
                <div className="op-input-wrap" style={{ flex:"0 1 195px", position:"relative" }}>
                  <FunnelIcon className="op-input-icon" style={{ color:iconColor }} />
                  <select
                    value={filterStatus}
                    onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                    className={`op-select-plain-${t}`}
                    style={{ paddingLeft:36 }}
                  >
                    <option value="">Semua Status</option>
                    {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronUpDownIcon style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", width:14, height:14, color:iconColor, pointerEvents:"none" }} />
                </div>

                {/* Filter: Kelengkapan */}
                <div className="op-input-wrap" style={{ flex:"0 1 175px", position:"relative" }}>
                  <select
                    value={filterLengkap}
                    onChange={e => { setFilterLengkap(e.target.value); setCurrentPage(1); }}
                    className={`op-select-plain-${t}`}
                    style={{ paddingLeft:14 }}
                  >
                    <option value="">Semua Kelengkapan</option>
                    <option value="lengkap">Lengkap</option>
                    <option value="tidak">Tidak Lengkap</option>
                  </select>
                  <ChevronUpDownIcon style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", width:14, height:14, color:iconColor, pointerEvents:"none" }} />
                </div>

                {/* Per page */}
                <div className="op-input-wrap" style={{ flex:"0 0 auto", position:"relative" }}>
                  <select
                    value={perPage}
                    onChange={e => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    className={`op-select-plain-${t}`}
                    style={{ paddingLeft:14, width:90 }}
                  >
                    {PER_PAGE_OPTIONS.map(n => <option key={n} value={n}>{n} / hal</option>)}
                  </select>
                  <ChevronUpDownIcon style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", width:14, height:14, color:iconColor, pointerEvents:"none" }} />
                </div>

                {/* Reset */}
                {hasActiveFilters && (
                  <button className={`op-btn-ghost-${t}`} onClick={handleReset}>
                    <ArrowPathIcon style={{ width:14, height:14 }} /> Reset
                  </button>
                )}
              </div>

              {/* Active filter chips */}
              {hasActiveFilters && (
                <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:10 }}>
                  {searchDebounced && (
                    <span className={`op-filter-chip-${t}`}>
                      Cari: "{searchDebounced}"
                      <button onClick={()=>{setSearchQuery("");setSearchDebounced("");}} style={{background:"none",border:"none",cursor:"pointer",padding:0,color:"inherit",display:"flex",lineHeight:1}}>×</button>
                    </span>
                  )}
                  {filterStatus && (
                    <span className={`op-filter-chip-${t}`}>
                      Status: {filterStatus}
                      <button onClick={()=>setFilterStatus("")} style={{background:"none",border:"none",cursor:"pointer",padding:0,color:"inherit",display:"flex",lineHeight:1}}>×</button>
                    </span>
                  )}
                  {filterLengkap && (
                    <span className={`op-filter-chip-${t}`}>
                      {filterLengkap === "lengkap" ? "Lengkap" : "Tidak Lengkap"}
                      <button onClick={()=>setFilterLengkap("")} style={{background:"none",border:"none",cursor:"pointer",padding:0,color:"inherit",display:"flex",lineHeight:1}}>×</button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* ── Error banner ── */}
            {fetchError && (
              <div style={{ padding:"14px 20px", background:"rgba(239,68,68,0.1)", borderBottom:`1px solid rgba(239,68,68,0.2)`, color:"#f87171", fontSize:13 }}>
                ⚠️ {fetchError}
                <button onClick={fetchOrders} style={{ marginLeft:12, color:"#60a5fa", background:"none", border:"none", cursor:"pointer", textDecoration:"underline", fontSize:13 }}>Coba lagi</button>
              </div>
            )}

            {/* ════════════════════════
                TABLE VIEW
            ════════════════════════ */}
            {viewMode === "table" && (
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", minWidth:740 }}>
                  <thead className={`op-thead-${t}`}>
                    <tr>
                      {COLUMNS.map((col, ci) => (
                        <th
                          key={ci}
                          className={`op-th-${t}${col.sortable ? ` op-th-sort-${t}` : ""}`}
                          style={{ textAlign:"left" }}
                          onClick={col.sortable ? () => handleSort(col.key) : undefined}
                        >
                          <span style={{ display:"inline-flex", alignItems:"center", gap:5 }}>
                            {col.label}
                            {col.sortable && (
                              <SortIcon field={col.key} sortKey={sortKey} sortDir={sortDir} color={sortIconColor} />
                            )}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      [...Array(6)].map((_,i) => <TableRowSkeleton key={i} d={d} />)
                    ) : pageOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7}>
                          <div style={{ textAlign:"center", padding:"56px 16px" }}>
                            <div style={{ width:56, height:56, borderRadius:"50%", margin:"0 auto 14px",
                              background:d?"rgba(99,148,255,0.08)":"rgba(59,130,246,0.06)",
                              display:"flex", alignItems:"center", justifyContent:"center" }}>
                              <DocumentTextIcon style={{ width:26, height:26, color:d?"rgba(148,163,220,0.4)":"#a0b4d0" }} />
                            </div>
                            <p className={`op-title-${t}`} style={{ fontSize:15, fontWeight:500, margin:"0 0 4px" }}>
                              {hasActiveFilters ? "Tidak ada hasil yang cocok" : "Tidak ada data order"}
                            </p>
                            <p className={`op-muted-${t}`} style={{ fontSize:13, margin:0 }}>
                              {hasActiveFilters ? "Coba ubah atau hapus filter aktif" : "Belum ada order untuk portofolio ini"}
                            </p>
                            {hasActiveFilters && (
                              <button className={`op-btn-ghost-${t}`} onClick={handleReset} style={{ margin:"16px auto 0", display:"inline-flex" }}>
                                <ArrowPathIcon style={{ width:14, height:14 }} /> Reset Filter
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      pageOrders.map((order, idx) => {
                        const complete = isComplete(order);
                        return (
                          <tr key={order.id} className={`op-tr-${t}`}>
                            <td className={`op-td-${t}`} style={{ paddingLeft:20, width:48 }}>
                              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:12, opacity:.4 }}>
                                {String(startNum + idx).padStart(2,"0")}
                              </span>
                            </td>
                            <td className={`op-td-${t} op-td-name-${t}`} style={{ whiteSpace:"nowrap" }}>
                              {order.pelanggan || "—"}
                            </td>
                            <td className={`op-td-${t}`}>
                              <StatusBadge status={order.statusOrder} />
                            </td>
                            <td className={`op-td-${t}`} style={{ fontFamily:"'DM Mono',monospace", fontSize:12, whiteSpace:"nowrap" }}>
                              {order.nomorOrder || "—"}
                            </td>
                            <td className={`op-td-${t}`} style={{ fontFamily:"'DM Mono',monospace", fontSize:12, whiteSpace:"nowrap" }}>
                              {formatDate(order.tanggalOrder)}
                            </td>
                            <td className={`op-td-${t}`}>
                              <KelengkapanBadge isComplete={complete} />
                            </td>
                            <td className={`op-td-${t}`} style={{ whiteSpace:"nowrap" }}>
                              <button
                                className={`op-btn-detail-${t}`}
                                onClick={() => navigate(`/orders/${portofolio}/detail/${order.id}`)}
                              >
                                Detail
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* ════════════════════════
                CARD VIEW
            ════════════════════════ */}
            {viewMode === "card" && (
              <div style={{ padding:20 }}>
                {loading ? (
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:14 }}>
                    {[...Array(6)].map((_,i) => (
                      <div key={i} className={`op-card-item-${t}`}>
                        <Sk w="60%" h={14} d={d} style={{ marginBottom:10 }} />
                        <Sk w="40%" h={20} d={d} style={{ borderRadius:20, marginBottom:10 }} />
                        <Sk w="50%" h={12} d={d} />
                      </div>
                    ))}
                  </div>
                ) : pageOrders.length === 0 ? (
                  <div style={{ textAlign:"center", padding:"40px 16px" }}>
                    <p className={`op-muted-${t}`} style={{ fontSize:14 }}>Tidak ada data yang cocok.</p>
                    {hasActiveFilters && (
                      <button className={`op-btn-ghost-${t}`} onClick={handleReset} style={{ marginTop:12, display:"inline-flex" }}>
                        <ArrowPathIcon style={{ width:14, height:14 }} /> Reset Filter
                      </button>
                    )}
                  </div>
                ) : (
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:14 }}>
                    {pageOrders.map((order, idx) => {
                      const complete = isComplete(order);
                      return (
                        <div key={order.id} className={`op-card-item-${t}`}
                          onClick={() => navigate(`/orders/${portofolio}/detail/${order.id}`)}
                          style={{ cursor:"pointer" }}>
                          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, opacity:.4, color:d?"rgba(219,234,254,0.9)":"#1e3a6e" }}>
                              #{String(startNum + idx).padStart(3,"0")}
                            </span>
                            <KelengkapanBadge isComplete={complete} />
                          </div>
                          <p className={`op-td-name-${t}`} style={{ fontSize:14, fontWeight:600, margin:"0 0 6px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                            {order.pelanggan || "—"}
                          </p>
                          <div style={{ marginBottom:10 }}>
                            <StatusBadge status={order.statusOrder} />
                          </div>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                            <div>
                              <p className={`op-muted-${t}`} style={{ fontSize:11, margin:"0 0 2px" }}>Nomor Order</p>
                              <p style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:d?"rgba(179,193,240,0.85)":"#334e7a", margin:0 }}>
                                {order.nomorOrder || "—"}
                              </p>
                            </div>
                            <div style={{ textAlign:"right" }}>
                              <p className={`op-muted-${t}`} style={{ fontSize:11, margin:"0 0 2px" }}>Tanggal</p>
                              <p style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:d?"rgba(179,193,240,0.85)":"#334e7a", margin:0 }}>
                                {formatDate(order.tanggalOrder)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── Pagination ── */}
            {!loading && processedOrders.length > 0 && (
              <div style={{
                padding:"14px 20px",
                display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap",
                borderTop:`1px solid ${d?"rgba(99,148,255,0.08)":"rgba(59,130,246,0.07)"}`,
              }}>
                {/* Left: info */}
                <p className={`op-muted-${t}`} style={{ fontSize:12.5, margin:0 }}>
                  Menampilkan{" "}
                  <span style={{ fontWeight:600, color:d?"#93c5fd":"#2563eb" }}>
                    {startNum}–{Math.min(safePage * perPage, processedOrders.length)}
                  </span>{" "}
                  dari{" "}
                  <span style={{ fontWeight:600, color:d?"#93c5fd":"#2563eb" }}>{processedOrders.length}</span> order
                </p>

                {/* Center: page numbers */}
                <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                  <button className={`op-page-btn-${t}`} onClick={()=>setCurrentPage(p=>Math.max(1,p-1))} disabled={safePage===1}>
                    <ChevronLeftIcon style={{ width:15, height:15 }} />
                  </button>

                  {pageNumbers.map((p, i) =>
                    p === "…" ? (
                      <span key={`dots-${i}`} className={`op-muted-${t}`} style={{ padding:"0 4px", fontSize:13 }}>…</span>
                    ) : (
                      <button
                        key={p}
                        className={`op-page-num-${t}${safePage===p?" active":""}`}
                        onClick={()=>setCurrentPage(p)}
                      >{p}</button>
                    )
                  )}

                  <button className={`op-page-btn-${t}`} onClick={()=>setCurrentPage(p=>Math.min(totalPages,p+1))} disabled={safePage===totalPages}>
                    <ChevronRightIcon style={{ width:15, height:15 }} />
                  </button>
                </div>

                {/* Right: total pages */}
                <p className={`op-muted-${t}`} style={{ fontSize:12.5, margin:0 }}>
                  Halaman <span style={{ fontFamily:"'DM Mono',monospace", fontWeight:600, color:d?"#93c5fd":"#2563eb" }}>{safePage}/{totalPages}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OrdersPage;