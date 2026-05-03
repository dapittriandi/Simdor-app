import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../services/firebase";
import { collection, query, where, orderBy, limit, startAfter, getDocs } from "firebase/firestore";
import debounce from "lodash.debounce";
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
} from "@heroicons/react/24/outline";
import { useNavigate as useNav } from "react-router-dom";
import { useTheme } from "../../components/layout/ThemeContext";

/* ─────────────────────────────────────────────
   STYLES  (same design language as Header.jsx & DashboardCS.jsx)
───────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&display=swap');

.op-root { font-family: 'DM Sans', sans-serif; }

.op-bg-dark  { background: #070b18; min-height: 100vh; }
.op-bg-light { background: #f0f4ff; min-height: 100vh; }

.op-title-dark  { color: rgba(219,234,254,0.92); }
.op-title-light { color: #1e3a6e; }

.op-muted-dark  { color: rgba(148,163,220,0.55); }
.op-muted-light { color: #7b95c4; }

/* Panel */
.op-panel-dark {
  background: rgba(13,20,45,0.7);
  border: 1px solid rgba(99,148,255,0.1);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 4px 24px rgba(0,0,0,0.35);
  border-radius: 18px;
  overflow: hidden;
}
.op-panel-light {
  background: rgba(255,255,255,0.9);
  border: 1px solid rgba(59,130,246,0.1);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 2px 20px rgba(59,130,246,0.06);
  border-radius: 18px;
  overflow: hidden;
}

/* Panel header */
.op-panel-hdr-dark  { border-bottom: 1px solid rgba(99,148,255,0.1); }
.op-panel-hdr-light { border-bottom: 1px solid rgba(59,130,246,0.08); }

/* Search / filter inputs */
.op-input-dark {
  background: rgba(7,11,24,0.6);
  border: 1px solid rgba(99,148,255,0.15);
  border-radius: 10px;
  color: rgba(219,234,254,0.88);
  font-family: 'DM Sans', sans-serif;
  font-size: 13.5px;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
  width: 100%;
  padding: 9px 12px 9px 38px;
}
.op-input-dark::placeholder { color: rgba(148,163,220,0.4); }
.op-input-dark:focus {
  border-color: rgba(96,165,250,0.45);
  box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
}
.op-input-light {
  background: rgba(255,255,255,0.75);
  border: 1px solid rgba(59,130,246,0.15);
  border-radius: 10px;
  color: #1e3a6e;
  font-family: 'DM Sans', sans-serif;
  font-size: 13.5px;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
  width: 100%;
  padding: 9px 12px 9px 38px;
}
.op-input-light::placeholder { color: #a0b4d0; }
.op-input-light:focus {
  border-color: rgba(59,130,246,0.4);
  box-shadow: 0 0 0 3px rgba(59,130,246,0.08);
}

/* Select appearance reset */
.op-select { appearance: none; -webkit-appearance: none; }

/* Table */
.op-thead-dark  { background: rgba(7,11,24,0.6); }
.op-thead-light { background: rgba(240,246,255,0.7); }
.op-th-dark  { color: rgba(148,163,220,0.65); font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; padding: 12px 16px; white-space: nowrap; }
.op-th-light { color: #6885b5; font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; padding: 12px 16px; white-space: nowrap; }
.op-td-dark  { color: rgba(179,193,240,0.85); font-size: 13px; padding: 12px 16px; border-bottom: 1px solid rgba(99,148,255,0.06); }
.op-td-light { color: #334e7a; font-size: 13px; padding: 12px 16px; border-bottom: 1px solid rgba(59,130,246,0.06); }
.op-td-name-dark  { color: rgba(219,234,254,0.9); font-weight: 500; }
.op-td-name-light { color: #1e3a6e; font-weight: 500; }
.op-tr-dark:hover  { background: rgba(59,130,246,0.05); }
.op-tr-light:hover { background: rgba(59,130,246,0.04); }

/* Skeleton */
@keyframes opShimmer {
  0%,100% { opacity: 0.4; } 50% { opacity: 0.8; }
}
.op-sk-dark  { background: rgba(99,148,255,0.1); border-radius: 6px; animation: opShimmer 1.6s ease-in-out infinite; }
.op-sk-light { background: rgba(59,130,246,0.08); border-radius: 6px; animation: opShimmer 1.6s ease-in-out infinite; }

/* Entry animation */
@keyframes opIn {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.op-animate { animation: opIn 0.5s cubic-bezier(0.22,1,0.36,1) both; }

/* Add Order button */
.op-btn-primary-dark {
  background: linear-gradient(135deg, #1d4ed8, #3b82f6);
  color: white; border: none;
  padding: 9px 18px; border-radius: 10px;
  font-size: 13.5px; font-weight: 500;
  display: inline-flex; align-items: center; gap: 7px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(37,99,235,0.35);
  transition: all 0.22s;
  font-family: 'DM Sans', sans-serif;
}
.op-btn-primary-dark:hover {
  background: linear-gradient(135deg, #2563eb, #60a5fa);
  box-shadow: 0 6px 20px rgba(37,99,235,0.5);
  transform: translateY(-1px);
}
.op-btn-primary-light {
  background: linear-gradient(135deg, #1d4ed8, #3b82f6);
  color: white; border: none;
  padding: 9px 18px; border-radius: 10px;
  font-size: 13.5px; font-weight: 500;
  display: inline-flex; align-items: center; gap: 7px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(37,99,235,0.25);
  transition: all 0.22s;
  font-family: 'DM Sans', sans-serif;
}
.op-btn-primary-light:hover {
  background: linear-gradient(135deg, #2563eb, #60a5fa);
  box-shadow: 0 6px 18px rgba(37,99,235,0.38);
  transform: translateY(-1px);
}

/* Reset button */
.op-btn-ghost-dark {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(99,148,255,0.15);
  border-radius: 10px; color: rgba(148,163,220,0.75);
  padding: 9px 14px; font-size: 13.5px; font-weight: 500;
  display: inline-flex; align-items: center; gap: 6px;
  cursor: pointer; transition: all 0.2s;
  font-family: 'DM Sans', sans-serif;
  white-space: nowrap;
}
.op-btn-ghost-dark:hover {
  background: rgba(59,130,246,0.1);
  border-color: rgba(96,165,250,0.3);
  color: #93c5fd;
}
.op-btn-ghost-light {
  background: rgba(255,255,255,0.75);
  border: 1px solid rgba(59,130,246,0.15);
  border-radius: 10px; color: #5878a8;
  padding: 9px 14px; font-size: 13.5px; font-weight: 500;
  display: inline-flex; align-items: center; gap: 6px;
  cursor: pointer; transition: all 0.2s;
  font-family: 'DM Sans', sans-serif;
  white-space: nowrap;
}
.op-btn-ghost-light:hover {
  background: rgba(59,130,246,0.06);
  border-color: rgba(59,130,246,0.3);
  color: #1d4ed8;
}

/* Detail button */
.op-btn-detail-dark {
  background: rgba(59,130,246,0.14);
  border: 1px solid rgba(96,165,250,0.25);
  border-radius: 8px; color: #93c5fd;
  padding: 6px 14px; font-size: 12.5px; font-weight: 500;
  cursor: pointer; transition: all 0.18s;
  font-family: 'DM Sans', sans-serif;
}
.op-btn-detail-dark:hover {
  background: rgba(59,130,246,0.25);
  border-color: rgba(96,165,250,0.45);
  box-shadow: 0 0 12px rgba(59,130,246,0.2);
}
.op-btn-detail-light {
  background: rgba(59,130,246,0.08);
  border: 1px solid rgba(59,130,246,0.2);
  border-radius: 8px; color: #2563eb;
  padding: 6px 14px; font-size: 12.5px; font-weight: 500;
  cursor: pointer; transition: all 0.18s;
  font-family: 'DM Sans', sans-serif;
}
.op-btn-detail-light:hover {
  background: rgba(59,130,246,0.15);
  border-color: rgba(59,130,246,0.38);
}

/* Pagination button */
.op-page-btn-dark {
  display: flex; align-items: center; gap: 5px;
  padding: 8px 14px; border-radius: 10px;
  border: 1px solid rgba(99,148,255,0.15);
  background: rgba(255,255,255,0.04);
  color: rgba(148,163,220,0.75); font-size: 13px;
  cursor: pointer; transition: all 0.2s;
  font-family: 'DM Sans', sans-serif;
}
.op-page-btn-dark:hover:not(:disabled) {
  background: rgba(59,130,246,0.1);
  border-color: rgba(96,165,250,0.3);
  color: #93c5fd;
}
.op-page-btn-dark:disabled { opacity: 0.35; cursor: not-allowed; }
.op-page-btn-light {
  display: flex; align-items: center; gap: 5px;
  padding: 8px 14px; border-radius: 10px;
  border: 1px solid rgba(59,130,246,0.15);
  background: rgba(255,255,255,0.75);
  color: #5878a8; font-size: 13px;
  cursor: pointer; transition: all 0.2s;
  font-family: 'DM Sans', sans-serif;
}
.op-page-btn-light:hover:not(:disabled) {
  background: rgba(59,130,246,0.06);
  border-color: rgba(59,130,246,0.3);
  color: #1d4ed8;
}
.op-page-btn-light:disabled { opacity: 0.35; cursor: not-allowed; }

/* Icon position helper */
.op-input-wrap { position: relative; }
.op-input-icon {
  position: absolute; left: 11px; top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  width: 16px; height: 16px;
}
`;

/* ─────────────────────────────────────────────
   STATUS BADGE
───────────────────────────────────────────── */
const STATUS_CONFIG = {
  "Entry":                  { bg: "rgba(16,185,129,0.15)",  border: "rgba(16,185,129,0.3)",  color: "#34d399" },
  "Diproses - Lapangan":    { bg: "rgba(59,130,246,0.15)",  border: "rgba(59,130,246,0.3)",  color: "#60a5fa" },
  "Invoice":                { bg: "rgba(245,158,11,0.15)",  border: "rgba(245,158,11,0.3)",  color: "#fbbf24" },
  "New Order":              { bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.25)",color: "#94a3b8" },
  "Selesai":                { bg: "rgba(20,184,166,0.15)",  border: "rgba(20,184,166,0.3)",  color: "#2dd4bf" },
  "Diproses - Sertifikat":  { bg: "rgba(139,92,246,0.15)",  border: "rgba(139,92,246,0.3)",  color: "#a78bfa" },
  "Closed Order":           { bg: "rgba(249,115,22,0.15)",  border: "rgba(249,115,22,0.3)",  color: "#fb923c" },
  "Penerbitan Proforma":    { bg: "rgba(6,182,212,0.15)",   border: "rgba(6,182,212,0.3)",   color: "#22d3ee" },
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
      {status || "—"}
    </span>
  );
};

/* ─────────────────────────────────────────────
   KELENGKAPAN BADGE
───────────────────────────────────────────── */
const KelengkapanBadge = ({ isComplete }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 5,
    padding: "3px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 500,
    background: isComplete ? "rgba(20,184,166,0.15)" : "rgba(239,68,68,0.12)",
    border: `1px solid ${isComplete ? "rgba(20,184,166,0.3)" : "rgba(239,68,68,0.25)"}`,
    color: isComplete ? "#2dd4bf" : "#f87171",
    whiteSpace: "nowrap",
  }}>
    <span style={{
      width: 5, height: 5, borderRadius: "50%",
      background: isComplete ? "#2dd4bf" : "#f87171", flexShrink: 0,
    }} />
    {isComplete ? "Lengkap" : "Tidak Lengkap"}
  </span>
);

/* ─────────────────────────────────────────────
   SKELETON
───────────────────────────────────────────── */
const Sk = ({ w, h, d, style = {} }) => (
  <div className={`op-sk-${d ? "dark" : "light"}`} style={{ width: w, height: h, ...style }} />
);

const TableRowSkeleton = ({ d }) => (
  <tr>
    {[24, 120, 80, 80, 90, 70, 50].map((w, i) => (
      <td key={i} className={`op-td-${d ? "dark" : "light"}`}>
        <Sk w={w} h={i === 2 || i === 5 ? 20 : 13} d={d} style={i === 2 || i === 5 ? { borderRadius: 20 } : {}} />
      </td>
    ))}
  </tr>
);

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const OrdersPage = () => {
  const { portofolio } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const d = isDark;

  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const perPage = 10;

  const userData = JSON.parse(localStorage.getItem("user")) || {};
  const userPeran = userData.peran || "";
  const userBidang = userData.bidang || "";

  useEffect(() => {
    if (!userPeran) { alert("Anda tidak memiliki akses!"); navigate("/"); return; }
    if (userPeran === "admin portofolio" && userBidang !== portofolio) {
      alert("Anda tidak memiliki akses!"); navigate("/"); return;
    }
    fetchOrders();
  }, [portofolio, userPeran, userBidang, currentPage, filterStatus]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let constraints = [
        where("portofolio", "==", portofolio),
        orderBy("createdAt", "desc"),
        limit(perPage),
      ];
      if (filterStatus) constraints.push(where("statusOrder", "==", filterStatus));
      if (currentPage > 1 && lastDoc) constraints.push(startAfter(lastDoc));

      const snap = await getDocs(query(collection(db, "orders"), ...constraints));
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setOrders(data);
      setAllOrders(data);
      setLastDoc(snap.docs[snap.docs.length - 1] || null);
      setHasNextPage(snap.docs.length === perPage);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
    setLoading(false);
  };

  const debouncedSearch = useCallback(
    debounce((value) => {
      if (!value) { setOrders(allOrders); return; }
      const q = value.toLowerCase();
      setOrders(allOrders.filter(
        (o) => o.pelanggan?.toLowerCase().includes(q) || o.nomorOrder?.toLowerCase().includes(q)
      ));
    }, 500),
    [allOrders]
  );

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    debouncedSearch(e.target.value);
  };

  useEffect(() => {
    if (!filterStatus) setOrders(allOrders);
    else setOrders(allOrders.filter((o) => o.statusOrder === filterStatus));
  }, [filterStatus, allOrders]);

  const handleReset = () => {
    setSearchQuery("");
    setFilterStatus("");
    setOrders(allOrders);
  };

  const checkKelengkapan = (order, peran) => {
    const requiredFields = {
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
      "koordinator": ["pelanggan","statusOrder","tanggalStatusOrder","tanggalSerahOrderKeCs",
        "tanggalPekerjaan","proformaSerahKeOps","proformaSerahKeDukbis","jenisSertifikat",
        "noSiSpk","jenisPekerjaan","namaTongkang","lokasiPekerjaan","estimasiTonase",
        "tonaseDS","nilaiProforma","distribusiSertifikatPengirim","distribusiSertifikatPengirimTanggal",
        "distribusiSertifikatPenerima","distribusiSertifikatPenerimaTanggal",
      ],
    };
    const fields = requiredFields[peran] || [];
    const isComplete = fields.every((f) => order[f]);
    return { isComplete, text: isComplete ? "Lengkap" : "Tidak Lengkap" };
  };

  const formatDate = (ts) => {
    if (!ts?.seconds) return "—";
    try {
      return new Date(ts.seconds * 1000).toLocaleDateString("id-ID", {
        day: "2-digit", month: "long", year: "numeric",
      });
    } catch { return "—"; }
  };

  const inputIconColor = d ? "rgba(148,163,220,0.5)" : "#a0b4d0";

  return (
    <>
      <style>{STYLES}</style>
      <div
        className={`op-root op-bg-${d ? "dark" : "light"}`}
        style={{ padding: "28px 24px 48px", transition: "background 0.4s" }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>

          {/* ── Page Header ── */}
          <div
            className="op-animate"
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, gap: 16, flexWrap: "wrap" }}
          >
            <div>
              <h2
                className={`op-title-${d ? "dark" : "light"}`}
                style={{ fontSize: 26, fontWeight: 600, margin: 0, display: "flex", alignItems: "center", gap: 10 }}
              >
                <ClipboardDocumentListIcon style={{ width: 26, height: 26, color: "#3b82f6", flexShrink: 0 }} />
                Daftar Order {portofolio?.toUpperCase()}
              </h2>
              <p
                className={`op-muted-${d ? "dark" : "light"}`}
                style={{ fontSize: 13, margin: "4px 0 0 36px" }}
              >
                {portofolio} · menampilkan {perPage} order per halaman
              </p>
            </div>

            {userPeran === "admin portofolio" && (
              <button
                className={`op-btn-primary-${d ? "dark" : "light"}`}
                onClick={() => navigate(`/orders/${portofolio}/create`)}
              >
                <PlusIcon style={{ width: 16, height: 16 }} />
                Tambah Order
              </button>
            )}
          </div>

          {/* ── Main Panel ── */}
          <div
            className={`op-panel-${d ? "dark" : "light"} op-animate`}
            style={{ animationDelay: "80ms" }}
          >
            {/* Panel Header — Search & Filter */}
            <div
              className={`op-panel-hdr-${d ? "dark" : "light"}`}
              style={{ padding: "16px 20px", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}
            >
              {/* Search */}
              <div className="op-input-wrap" style={{ flex: "1 1 220px" }}>
                <MagnifyingGlassIcon
                  className="op-input-icon"
                  style={{ color: inputIconColor }}
                />
                <input
                  type="text"
                  placeholder="Cari pelanggan / nomor order…"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className={`op-input-${d ? "dark" : "light"}`}
                />
              </div>

              {/* Filter Status */}
              <div className="op-input-wrap" style={{ flex: "0 1 210px" }}>
                <FunnelIcon
                  className="op-input-icon"
                  style={{ color: inputIconColor }}
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`op-input-${d ? "dark" : "light"} op-select`}
                  style={{ paddingRight: 32 }}
                >
                  <option value="">Semua Status</option>
                  <option value="New Order">New Order</option>
                  <option value="Entry">Entry</option>
                  <option value="Diproses - Lapangan">Diproses - Lapangan</option>
                  <option value="Diproses - Sertifikat">Diproses - Sertifikat</option>
                  <option value="Penerbitan Proforma">Penerbitan Proforma</option>
                  <option value="Invoice">Invoice</option>
                  <option value="Closed Order">Closed Order</option>
                  <option value="Selesai">Selesai</option>
                </select>
                <ChevronUpDownIcon style={{
                  position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                  width: 14, height: 14, color: inputIconColor, pointerEvents: "none",
                }} />
              </div>

              {/* Reset */}
              <button
                className={`op-btn-ghost-${d ? "dark" : "light"}`}
                onClick={handleReset}
                style={{ flex: "0 0 auto" }}
              >
                <ArrowPathIcon style={{ width: 14, height: 14 }} />
                Reset
              </button>
            </div>

            {/* ── Table ── */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                <thead className={`op-thead-${d ? "dark" : "light"}`}>
                  <tr>
                    {["#", "Nama Pelanggan", "Status Order", "Nomor Order", "Tanggal Order", "Kelengkapan", "Aksi"].map((h) => (
                      <th key={h} className={`op-th-${d ? "dark" : "light"}`} style={{ textAlign: "left" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(5)].map((_, i) => <TableRowSkeleton key={i} d={d} />)
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <div style={{ textAlign: "center", padding: "52px 16px" }}>
                          <div style={{
                            width: 56, height: 56, borderRadius: "50%", margin: "0 auto 14px",
                            background: d ? "rgba(99,148,255,0.08)" : "rgba(59,130,246,0.06)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <DocumentTextIcon style={{ width: 26, height: 26, color: d ? "rgba(148,163,220,0.4)" : "#a0b4d0" }} />
                          </div>
                          <p
                            className={`op-title-${d ? "dark" : "light"}`}
                            style={{ fontSize: 15, fontWeight: 500, margin: "0 0 4px" }}
                          >
                            Tidak ada data order
                          </p>
                          <p className={`op-muted-${d ? "dark" : "light"}`} style={{ fontSize: 13, margin: 0 }}>
                            Coba ubah filter atau kata kunci pencarian
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    orders.map((order, idx) => {
                      const kelengkapan = checkKelengkapan(order, userPeran);
                      return (
                        <tr
                          key={order.id}
                          className={`op-tr-${d ? "dark" : "light"}`}
                          style={{ transition: "background 0.15s" }}
                        >
                          <td className={`op-td-${d ? "dark" : "light"}`} style={{ paddingLeft: 20, width: 48 }}>
                            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, opacity: 0.45 }}>
                              {String((currentPage - 1) * perPage + idx + 1).padStart(2, "0")}
                            </span>
                          </td>
                          <td className={`op-td-${d ? "dark" : "light"} op-td-name-${d ? "dark" : "light"}`} style={{ whiteSpace: "nowrap" }}>
                            {order.pelanggan || "—"}
                          </td>
                          <td className={`op-td-${d ? "dark" : "light"}`}>
                            <StatusBadge status={order.statusOrder} />
                          </td>
                          <td className={`op-td-${d ? "dark" : "light"}`} style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, whiteSpace: "nowrap" }}>
                            {order.nomorOrder || "—"}
                          </td>
                          <td className={`op-td-${d ? "dark" : "light"}`} style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, whiteSpace: "nowrap" }}>
                            {formatDate(order.tanggalOrder)}
                          </td>
                          <td className={`op-td-${d ? "dark" : "light"}`}>
                            <KelengkapanBadge isComplete={kelengkapan.isComplete} />
                          </td>
                          <td className={`op-td-${d ? "dark" : "light"}`} style={{ whiteSpace: "nowrap" }}>
                            <button
                              className={`op-btn-detail-${d ? "dark" : "light"}`}
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

            {/* ── Pagination ── */}
            {!loading && orders.length > 0 && (
              <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderTop: `1px solid ${d ? "rgba(99,148,255,0.08)" : "rgba(59,130,246,0.07)"}` }}>
                <button
                  className={`op-page-btn-${d ? "dark" : "light"}`}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeftIcon style={{ width: 15, height: 15 }} />
                  Sebelumnya
                </button>

                <span
                  className={`op-muted-${d ? "dark" : "light"}`}
                  style={{ fontSize: 13 }}
                >
                  Halaman{" "}
                  <span style={{ fontWeight: 600, color: d ? "#93c5fd" : "#2563eb", fontFamily: "'DM Mono', monospace" }}>
                    {currentPage}
                  </span>
                </span>

                <button
                  className={`op-page-btn-${d ? "dark" : "light"}`}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={!hasNextPage}
                >
                  Selanjutnya
                  <ChevronRightIcon style={{ width: 15, height: 15 }} />
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default OrdersPage;