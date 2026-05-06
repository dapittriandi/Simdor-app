/**
 * DokumenOrder.jsx — "Obsidian Chrome" Edition
 * Konsisten dengan Header.jsx: Outfit + JetBrains Mono, glass card, spectrum bar
 * Improvements: stats bar, status badge per row, clickable row → detail order,
 *               search active tag, useCallback transform, consistent tokens
 */

import { useState, useEffect, useCallback } from "react";
import { getOrders } from "../../services/orderServices";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../components/layout/ThemeContext";
import {
  FileText, Search, RefreshCw, ChevronLeft, ChevronRight,
  ExternalLink, FolderOpen, BarChart3, FileCheck, FileClock,
  ArrowRight, FileWarning, XCircle, CheckCircle2,
} from "lucide-react";

/* ═══════════════════════════════════════════
   STYLES
═══════════════════════════════════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

.do-root { font-family: 'Outfit', sans-serif; }
.do-page-dark  { background: #060812; min-height: 100vh; }
.do-page-light { background: #f0f5ff; min-height: 100vh; }

/* ── Mount ── */
@keyframes doFadeUp {
  from { opacity:0; transform:translateY(20px); }
  to   { opacity:1; transform:translateY(0); }
}
.do-mount { animation: doFadeUp 0.46s cubic-bezier(0.16,1,0.3,1) both; }

/* ── Spectrum bar (same as Header) ── */
.do-spectrum { height: 2px; position: relative; overflow: hidden; }
.do-spectrum::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(90deg, transparent 0%, #1d4ed8 8%, #38bdf8 30%, #818cf8 50%, #38bdf8 70%, #1d4ed8 88%, transparent 100%);
  background-size: 300% 100%;
  animation: spectrumFlow 5s linear infinite;
}
.do-spectrum-l::before {
  background: linear-gradient(90deg, transparent 0%, #0369a1 8%, #0ea5e9 30%, #6366f1 50%, #0ea5e9 70%, #0369a1 88%, transparent 100%);
  background-size: 300% 100%;
}
@keyframes spectrumFlow { from { background-position: 200% 0; } to { background-position: -100% 0; } }

/* ── Glass card ── */
.do-card-dark {
  background: rgba(6,8,18,0.88);
  backdrop-filter: blur(28px) saturate(180%);
  -webkit-backdrop-filter: blur(28px) saturate(180%);
  border: 1px solid rgba(56,189,248,0.1);
  box-shadow: 0 8px 48px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.025) inset;
  border-radius: 16px; overflow: hidden;
}
.do-card-light {
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(28px) saturate(200%);
  -webkit-backdrop-filter: blur(28px) saturate(200%);
  border: 1px solid rgba(14,165,233,0.13);
  box-shadow: 0 8px 40px rgba(14,165,233,0.09), 0 1px 0 rgba(255,255,255,0.95) inset;
  border-radius: 16px; overflow: hidden;
}

/* ── Page title ── */
.do-h1-dark {
  font-size: 18px; font-weight: 800; letter-spacing: -0.01em;
  background: linear-gradient(90deg, #38bdf8, #e2e8f5 55%, #818cf8);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.do-h1-light {
  font-size: 18px; font-weight: 800; letter-spacing: -0.01em;
  background: linear-gradient(90deg, #0369a1, #0f172a 55%, #6366f1);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.do-h1-sub { font-size: 11px; margin-top: 2px; font-family: 'JetBrains Mono', monospace; }
.do-h1-sub-dark  { color: rgba(56,189,248,0.38); }
.do-h1-sub-light { color: rgba(3,105,161,0.42); }

/* ── Logo icon box ── */
.do-logo-box {
  width: 38px; height: 38px; border-radius: 11px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; border: 1px solid;
}
.do-logo-box-dark  { background: rgba(56,189,248,0.08); border-color: rgba(56,189,248,0.2); box-shadow: 0 0 18px rgba(56,189,248,0.1); }
.do-logo-box-light { background: rgba(14,165,233,0.07); border-color: rgba(14,165,233,0.18); }

/* ── Divider ── */
.do-divider-dark  { height:1px; background: rgba(56,189,248,0.07); }
.do-divider-light { height:1px; background: rgba(14,165,233,0.08); }

/* ── Section label ── */
.do-section-label {
  font-size: 9px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase;
  display: flex; align-items: center; gap: 8px; margin-bottom: 12px;
  font-family: 'JetBrains Mono', monospace;
}
.do-section-label::after { content: ''; flex: 1; height: 1px; }
.do-section-label-dark  { color: rgba(56,189,248,0.32); }
.do-section-label-dark::after  { background: linear-gradient(90deg, rgba(56,189,248,0.14), transparent); }
.do-section-label-light { color: rgba(3,105,161,0.38); }
.do-section-label-light::after { background: linear-gradient(90deg, rgba(14,165,233,0.12), transparent); }

/* ── Stats bar ── */
.do-stats-bar { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
.do-stat-card {
  flex: 1; min-width: 90px; padding: 11px 14px; border-radius: 12px;
  border: 1px solid; display: flex; align-items: center; gap: 10px;
  transition: all 0.18s cubic-bezier(0.16,1,0.3,1);
}
.do-stat-card-dark  { background: rgba(255,255,255,0.025); border-color: rgba(56,189,248,0.1); }
.do-stat-card-dark:hover  { background: rgba(56,189,248,0.05); border-color: rgba(56,189,248,0.2); }
.do-stat-card-light { background: rgba(255,255,255,0.7); border-color: rgba(14,165,233,0.12); box-shadow: 0 1px 4px rgba(14,165,233,0.06); }
.do-stat-card-light:hover { background: rgba(14,165,233,0.05); border-color: rgba(14,165,233,0.22); }
.do-stat-icon {
  width: 30px; height: 30px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid;
}
.do-stat-num { font-size: 19px; font-weight: 800; line-height: 1; font-family: 'JetBrains Mono', monospace; }
.do-stat-label { font-size: 10.5px; margin-top: 1px; }
.do-stat-label-dark  { color: rgba(148,163,184,0.5); }
.do-stat-label-light { color: rgba(71,85,105,0.55); }

/* ── Search ── */
.do-search-wrap { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.do-search-input-dark {
  width: 100%; padding: 9px 14px 9px 38px; border-radius: 10px; font-size: 13px;
  font-family: 'Outfit', sans-serif; background: rgba(255,255,255,0.035);
  border: 1px solid rgba(56,189,248,0.12); color: #e2e8f5; outline: none;
  transition: all 0.2s; box-sizing: border-box;
}
.do-search-input-dark::placeholder { color: rgba(56,189,248,0.25); }
.do-search-input-dark:focus { border-color: rgba(56,189,248,0.4); background: rgba(56,189,248,0.05); box-shadow: 0 0 0 3px rgba(56,189,248,0.08); }
.do-search-input-light {
  width: 100%; padding: 9px 14px 9px 38px; border-radius: 10px; font-size: 13px;
  font-family: 'Outfit', sans-serif; background: rgba(241,245,249,0.8);
  border: 1px solid rgba(14,165,233,0.14); color: #0f172a; outline: none;
  transition: all 0.2s; box-sizing: border-box;
}
.do-search-input-light::placeholder { color: rgba(3,105,161,0.3); }
.do-search-input-light:focus { border-color: rgba(3,105,161,0.38); background: white; box-shadow: 0 0 0 3px rgba(14,165,233,0.07); }

/* ── Buttons ── */
.do-btn-primary {
  display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px;
  border-radius: 10px; border: none; color: white; font-size: 13px; font-weight: 600;
  cursor: pointer; font-family: 'Outfit', sans-serif; white-space: nowrap;
  background: linear-gradient(135deg, #1d4ed8, #38bdf8);
  box-shadow: 0 4px 14px rgba(56,189,248,0.22);
  transition: all 0.18s cubic-bezier(0.16,1,0.3,1);
}
.do-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(56,189,248,0.35); }
.do-btn-primary:active { transform: scale(0.96); }

.do-btn-ghost-dark {
  display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px;
  border-radius: 10px; background: rgba(255,255,255,0.035); border: 1px solid rgba(56,189,248,0.12);
  color: rgba(148,163,184,0.75); font-size: 13px; font-weight: 500; cursor: pointer;
  font-family: 'Outfit', sans-serif; transition: all 0.18s; white-space: nowrap;
}
.do-btn-ghost-dark:hover { background: rgba(56,189,248,0.07); border-color: rgba(56,189,248,0.25); color: #38bdf8; }

.do-btn-ghost-light {
  display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px;
  border-radius: 10px; background: rgba(255,255,255,0.8); border: 1px solid rgba(14,165,233,0.15);
  color: rgba(71,85,105,0.75); font-size: 13px; font-weight: 500; cursor: pointer;
  font-family: 'Outfit', sans-serif; transition: all 0.18s; white-space: nowrap;
  box-shadow: 0 1px 3px rgba(14,165,233,0.06);
}
.do-btn-ghost-light:hover { background: rgba(14,165,233,0.06); border-color: rgba(14,165,233,0.26); color: #0369a1; }

/* ── Search active tag ── */
.do-search-tag {
  display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px;
  border-radius: 99px; font-size: 11px; font-weight: 600; border: 1px solid;
  cursor: pointer; font-family: 'Outfit', sans-serif; transition: all 0.15s;
}
.do-search-tag-dark  { background: rgba(56,189,248,0.09); border-color: rgba(56,189,248,0.22); color: #38bdf8; }
.do-search-tag-dark:hover  { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.24); color: #fca5a5; }
.do-search-tag-light { background: rgba(14,165,233,0.08); border-color: rgba(14,165,233,0.2); color: #0369a1; }
.do-search-tag-light:hover { background: rgba(239,68,68,0.07); border-color: rgba(239,68,68,0.2); color: #dc2626; }

/* ── Table wrapper ── */
.do-table-wrap { overflow-x: auto; border-radius: 12px; border: 1px solid; }
.do-table-wrap-dark  { border-color: rgba(56,189,248,0.09); }
.do-table-wrap-light { border-color: rgba(14,165,233,0.11); }

/* ── Table ── */
.do-table { width: 100%; border-collapse: collapse; min-width: 600px; }

/* ── TH ── */
.do-th {
  padding: 11px 18px; font-size: 9.5px; font-weight: 700; letter-spacing: 0.12em;
  text-transform: uppercase; text-align: left; white-space: nowrap;
  font-family: 'JetBrains Mono', monospace;
}
.do-th-center { text-align: center; }
.do-th-dark  { color: rgba(56,189,248,0.4); background: rgba(255,255,255,0.02); border-bottom: 1px solid rgba(56,189,248,0.09); }
.do-th-light { color: rgba(3,105,161,0.45); background: rgba(14,165,233,0.035); border-bottom: 1px solid rgba(14,165,233,0.1); }

/* ── TD ── */
.do-td { padding: 13px 18px; vertical-align: middle; }
.do-td-dark  { border-bottom: 1px solid rgba(56,189,248,0.055); }
.do-td-light { border-bottom: 1px solid rgba(14,165,233,0.07); }

/* ── TR ── */
.do-tr { cursor: pointer; transition: background 0.15s; }
.do-tr-dark:hover  td { background: rgba(56,189,248,0.04); }
.do-tr-light:hover td { background: rgba(14,165,233,0.04); }
.do-tr-last td { border-bottom: none !important; }

/* ── Cell text ── */
.do-cell-main { font-size: 13px; font-weight: 600; line-height: 1.25; }
.do-cell-main-dark  { color: #e2e8f5; }
.do-cell-main-light { color: #0f172a; }
.do-cell-mono { font-size: 11.5px; font-family: 'JetBrains Mono', monospace; }
.do-cell-mono-dark  { color: rgba(56,189,248,0.38); }
.do-cell-mono-light { color: rgba(3,105,161,0.42); }

/* ── Row arrow hint (appears on hover) ── */
.do-row-arrow {
  opacity: 0; transition: opacity 0.15s, transform 0.15s;
  transform: translateX(-4px); flex-shrink: 0;
}
.do-tr:hover .do-row-arrow { opacity: 1; transform: translateX(0); }

/* ── Doc link pill ── */
.do-doc-link {
  display: inline-flex; align-items: center; gap: 5px; padding: 5px 11px;
  border-radius: 99px; font-size: 11.5px; font-weight: 600; text-decoration: none;
  transition: all 0.18s; border: 1px solid;
}
.do-doc-link-dark  { background: rgba(56,189,248,0.08); border-color: rgba(56,189,248,0.22); color: #7dd3fc; }
.do-doc-link-dark:hover  { background: rgba(56,189,248,0.16); border-color: rgba(56,189,248,0.4); color: #bae6fd; }
.do-doc-link-light { background: rgba(14,165,233,0.07); border-color: rgba(14,165,233,0.22); color: #0369a1; }
.do-doc-link-light:hover { background: rgba(14,165,233,0.14); border-color: rgba(3,105,161,0.38); color: #075985; }

/* ── No doc badge ── */
.do-nodoc {
  display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px;
  border-radius: 99px; font-size: 11px; font-weight: 500; border: 1px solid;
}
.do-nodoc-dark  { background: rgba(239,68,68,0.07); border-color: rgba(239,68,68,0.16); color: rgba(252,165,165,0.7); }
.do-nodoc-light { background: rgba(254,242,242,0.8); border-color: rgba(239,68,68,0.18); color: #dc2626; }

/* ── Row completeness status badge ── */
.do-row-status {
  display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px;
  border-radius: 7px; font-size: 10px; font-weight: 700; border: 1px solid;
  font-family: 'JetBrains Mono', monospace; letter-spacing: 0.04em;
}
.do-row-status-full-dark  { background: rgba(52,211,153,0.08); border-color: rgba(52,211,153,0.2); color: #34d399; }
.do-row-status-full-light { background: rgba(209,250,229,0.7); border-color: rgba(16,185,129,0.2); color: #047857; }
.do-row-status-part-dark  { background: rgba(251,191,36,0.08); border-color: rgba(251,191,36,0.2); color: #fbbf24; }
.do-row-status-part-light { background: rgba(254,243,199,0.8); border-color: rgba(251,191,36,0.2); color: #92400e; }
.do-row-status-none-dark  { background: rgba(239,68,68,0.07); border-color: rgba(239,68,68,0.16); color: rgba(252,165,165,0.75); }
.do-row-status-none-light { background: rgba(254,242,242,0.7); border-color: rgba(239,68,68,0.16); color: #dc2626; }

/* ── Empty state ── */
.do-empty { padding: 56px 24px; text-align: center; }
.do-empty-icon {
  width: 56px; height: 56px; border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px; border: 1px solid;
}
.do-empty-icon-dark  { background: rgba(56,189,248,0.07); border-color: rgba(56,189,248,0.13); }
.do-empty-icon-light { background: rgba(14,165,233,0.06); border-color: rgba(14,165,233,0.13); }
.do-empty-title { font-size: 14px; font-weight: 700; margin-bottom: 5px; }
.do-empty-title-dark  { color: rgba(147,197,253,0.75); }
.do-empty-title-light { color: #1d4ed8; }
.do-empty-sub { font-size: 12px; }
.do-empty-sub-dark  { color: rgba(56,189,248,0.32); }
.do-empty-sub-light { color: rgba(3,105,161,0.4); }

/* ── Pagination ── */
.do-pagination {
  display: flex; flex-wrap: wrap; align-items: center;
  justify-content: space-between; gap: 12px; padding: 13px 20px;
}
.do-pagination-dark  { border-top: 1px solid rgba(56,189,248,0.07); }
.do-pagination-light { border-top: 1px solid rgba(14,165,233,0.09); }
.do-page-info { font-size: 12px; display: flex; align-items: center; gap: 6px; font-family: 'JetBrains Mono', monospace; }
.do-page-info-dark  { color: rgba(56,189,248,0.38); }
.do-page-info-light { color: rgba(3,105,161,0.42); }
.do-page-info-num-dark  { color: #38bdf8; font-weight: 600; }
.do-page-info-num-light { color: #0369a1; font-weight: 600; }
.do-page-btn {
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; border-radius: 9px; border: 1px solid; cursor: pointer;
  transition: all 0.18s; flex-shrink: 0;
}
.do-page-btn-dark  { background: rgba(255,255,255,0.03); border-color: rgba(56,189,248,0.12); color: rgba(148,163,184,0.7); }
.do-page-btn-dark:hover:not(:disabled)  { background: rgba(56,189,248,0.09); border-color: rgba(56,189,248,0.28); color: #38bdf8; }
.do-page-btn-dark:disabled  { opacity: 0.28; cursor: not-allowed; }
.do-page-btn-light { background: rgba(255,255,255,0.8); border-color: rgba(14,165,233,0.15); color: rgba(71,85,105,0.65); }
.do-page-btn-light:hover:not(:disabled) { background: rgba(14,165,233,0.07); border-color: rgba(14,165,233,0.28); color: #0369a1; }
.do-page-btn-light:disabled { opacity: 0.28; cursor: not-allowed; }
.do-page-label {
  padding: 5px 14px; border-radius: 8px; border: 1px solid;
  font-size: 11.5px; font-weight: 600; font-family: 'JetBrains Mono', monospace;
}
.do-page-label-dark  { background: rgba(56,189,248,0.07); border-color: rgba(56,189,248,0.18); color: #7dd3fc; }
.do-page-label-light { background: rgba(14,165,233,0.06); border-color: rgba(14,165,233,0.18); color: #0369a1; }

/* ── Loading spinner ── */
@keyframes spinGlow { to { transform: rotate(360deg); } }
.do-spinner {
  width: 38px; height: 38px; border-radius: 50%;
  border: 2.5px solid rgba(56,189,248,0.12);
  border-top-color: #38bdf8;
  animation: spinGlow 0.9s linear infinite;
}
`;

/* ═══════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════ */

/** Hitung dokumen yang terisi dari satu order */
const countDocs = (order, isPortofolio) => {
  const slots = isPortofolio
    ? [order.documents?.siSpk?.fileUrl, order.documents?.sertifikat?.fileUrl, order.documents?.sertifikatPM06?.fileUrl]
    : [order.fakturPajak?.fileUrl, order.invoice?.fileUrl];
  return { filled: slots.filter(Boolean).length, total: slots.length };
};

/** Doc link atau badge kosong */
const DocCell = ({ fileUrl, isDark }) => {
  if (fileUrl) {
    return (
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`do-doc-link ${isDark ? "do-doc-link-dark" : "do-doc-link-light"}`}
        onClick={e => e.stopPropagation()}
      >
        <ExternalLink style={{ width: 10, height: 10 }} />
        Buka
      </a>
    );
  }
  return (
    <span className={`do-nodoc ${isDark ? "do-nodoc-dark" : "do-nodoc-light"}`}>
      <XCircle style={{ width: 10, height: 10 }} />
      —
    </span>
  );
};

/** Badge kelengkapan dokumen per row */
const StatusBadge = ({ filled, total, isDark: d }) => {
  if (filled === total) {
    return (
      <span className={`do-row-status ${d ? "do-row-status-full-dark" : "do-row-status-full-light"}`}>
        <CheckCircle2 style={{ width: 9, height: 9 }} />{filled}/{total}
      </span>
    );
  }
  if (filled > 0) {
    return (
      <span className={`do-row-status ${d ? "do-row-status-part-dark" : "do-row-status-part-light"}`}>
        <FileClock style={{ width: 9, height: 9 }} />{filled}/{total}
      </span>
    );
  }
  return (
    <span className={`do-row-status ${d ? "do-row-status-none-dark" : "do-row-status-none-light"}`}>
      <FileWarning style={{ width: 9, height: 9 }} />0/{total}
    </span>
  );
};

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
const DokumenOrder = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const d = isDark;
  const T = (dk, lt) => d ? dk : lt;

  const [orders,         setOrders]         = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [user,           setUser]           = useState(null);
  const [searchQuery,    setSearchQuery]    = useState("");
  const [isSearching,    setIsSearching]    = useState(false);
  const [mounted,        setMounted]        = useState(false);
  const [currentPage,    setCurrentPage]    = useState(1);
  const itemsPerPage = 10;

  const userData       = JSON.parse(localStorage.getItem("user")) || {};
  const userPortofolio = userData?.bidang || "";
  const userPeran      = userData?.peran  || "";
  const isPortofolio   = userPeran === "admin portofolio";

  /* ── Auth guard ── */
  useEffect(() => {
    if (!userPeran || !["admin portofolio", "admin keuangan"].includes(userPeran)) {
      alert("Anda tidak memiliki akses!"); navigate("/"); return;
    }
    setMounted(true);
    setUser(JSON.parse(localStorage.getItem("user")) || null);
    return () => setMounted(false);
  }, [userPeran]);

  /* ── Fetch orders ── */
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try { const data = await getOrders(); setOrders(data); }
      catch (e) { console.error("Gagal mengambil data orders:", e); }
      finally { setLoading(false); }
    };
    fetchOrders();
  }, []);

  /* ── Transform / filter ── */
  const transformOrders = useCallback((list) => {
    if (isPortofolio) return list.filter(o => o.portofolio === userPortofolio);
    return list.map(o => ({
      id:          o.id,
      pelanggan:   o.pelanggan,
      nomorOrder:  o.nomorOrder,
      portofolio:  o.portofolio,
      fakturPajak: o.documents?.fakturPajak || { fileUrl: null },
      invoice:     o.documents?.invoice     || { fileUrl: null },
    }));
  }, [isPortofolio, userPortofolio]);

  useEffect(() => {
    setFilteredOrders(transformOrders(orders));
  }, [orders, transformOrders]);

  /* ── Search ── */
  const handleSearch = () => {
    if (!searchQuery.trim()) { handleReset(); return; }
    const q = searchQuery.toLowerCase();
    const base = isPortofolio ? orders.filter(o => o.portofolio === userPortofolio) : orders;
    setFilteredOrders(transformOrders(base.filter(o =>
      o.pelanggan?.toLowerCase().includes(q) ||
      o.nomorOrder?.toLowerCase().includes(q)
    )));
    setIsSearching(true);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearchQuery(""); setIsSearching(false); setCurrentPage(1);
    setFilteredOrders(transformOrders(orders));
  };

  /* ── Navigate to detail ── */
  const goToDetail = (order) => {
    const porto = order.portofolio || userPortofolio || "umum";
    const id    = order.id || order.nomorOrder;
    if (id) navigate(`/orders/${porto}/detail/${id}`);
  };

  /* ── Pagination ── */
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated  = filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  const colSpan    = isPortofolio ? 6 : 5;

  /* ── Stats ── */
  const statTotal    = filteredOrders.length;
  const statComplete = filteredOrders.filter(o => { const { filled, total } = countDocs(o, isPortofolio); return filled === total; }).length;
  const statMissing  = filteredOrders.filter(o => countDocs(o, isPortofolio).filled === 0).length;
  const statPartial  = statTotal - statComplete - statMissing;

  /* ══ LOADING ══ */
  if (loading) {
    return (
      <div className={`do-root ${T("do-page-dark","do-page-light")}`}
        style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"60vh" }}>
        <style>{STYLES}</style>
        <div style={{ textAlign:"center" }}>
          <div className="do-spinner" style={{ margin:"0 auto 14px" }} />
          <p style={{ fontSize:12, fontFamily:"'JetBrains Mono',monospace", color: d ? "rgba(56,189,248,0.4)" : "rgba(3,105,161,0.45)" }}>
            memuat dokumen…
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`do-root ${T("do-page-dark","do-page-light")}`}
        style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"60vh" }}>
        <style>{STYLES}</style>
        <p style={{ fontSize:13, fontFamily:"'Outfit',sans-serif", color: d ? "rgba(56,189,248,0.4)" : "rgba(3,105,161,0.45)" }}>
          Memuat data pengguna…
        </p>
      </div>
    );
  }

  /* ══ RENDER ══ */
  return (
    <div
      className={`do-root ${T("do-page-dark","do-page-light")}`}
      style={{ padding:"28px 20px 56px", transition:"background 0.4s ease" }}
    >
      <style>{STYLES}</style>

      <div style={{ maxWidth:1080, margin:"0 auto", opacity: mounted ? 1 : 0, transition:"opacity 0.4s" }}>
        <div className={`do-mount ${T("do-card-dark","do-card-light")}`}>

          {/* Spectrum line (sama persis dengan Header) */}
          <div className={`do-spectrum${d ? "" : " do-spectrum-l"}`} />

          {/* ── Card Header ── */}
          <div style={{ padding:"22px 24px 20px" }}>

            {/* Title row */}
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16, flexWrap:"wrap", marginBottom:20 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div className={`do-logo-box ${T("do-logo-box-dark","do-logo-box-light")}`}>
                  <FolderOpen style={{ width:17, height:17, color: d ? "#38bdf8" : "#0369a1" }} />
                </div>
                <div>
                  <p className={T("do-h1-dark","do-h1-light")}>Dokumen Order</p>
                  <p className={`do-h1-sub ${T("do-h1-sub-dark","do-h1-sub-light")}`}>
                    {isPortofolio
                      ? `portofolio · ${userPortofolio.toUpperCase()}`
                      : "admin keuangan · semua portofolio"}
                  </p>
                </div>
              </div>

              {/* Active search tag */}
              {isSearching && (
                <button
                  className={`do-search-tag ${T("do-search-tag-dark","do-search-tag-light")}`}
                  onClick={handleReset}
                  title="Klik untuk reset pencarian"
                >
                  <Search style={{ width:10, height:10 }} />
                  &ldquo;{searchQuery}&rdquo;
                  <XCircle style={{ width:10, height:10 }} />
                </button>
              )}
            </div>

            {/* ── Stats bar ── */}
            <div className="do-stats-bar">
              {[
                { label:"Total Order",  num: statTotal,    numColor: d ? "#e2e8f5" : "#0f172a",             Icon: FileText,    iconBg: d ? "rgba(56,189,248,0.08)"  : "rgba(14,165,233,0.07)",  iconBd: d ? "rgba(56,189,248,0.18)"  : "rgba(14,165,233,0.16)",  iconColor: d ? "#38bdf8" : "#0369a1" },
                { label:"Lengkap",      num: statComplete, numColor: d ? "#34d399" : "#047857",             Icon: FileCheck,   iconBg: d ? "rgba(52,211,153,0.09)"  : "rgba(209,250,229,0.7)",  iconBd: d ? "rgba(52,211,153,0.2)"   : "rgba(16,185,129,0.18)",  iconColor: d ? "#34d399" : "#047857" },
                { label:"Sebagian",     num: statPartial,  numColor: d ? "#fbbf24" : "#92400e",             Icon: FileClock,   iconBg: d ? "rgba(251,191,36,0.09)"  : "rgba(254,243,199,0.8)",  iconBd: d ? "rgba(251,191,36,0.2)"   : "rgba(251,191,36,0.18)",  iconColor: d ? "#fbbf24" : "#92400e" },
                { label:"Belum Ada",    num: statMissing,  numColor: d ? "rgba(252,165,165,0.75)" : "#dc2626", Icon: FileWarning, iconBg: d ? "rgba(239,68,68,0.08)"   : "rgba(254,242,242,0.8)",  iconBd: d ? "rgba(239,68,68,0.18)"   : "rgba(239,68,68,0.16)",   iconColor: d ? "rgba(252,165,165,0.75)" : "#dc2626" },
              ].map(({ label, num, numColor, Icon, iconBg, iconBd, iconColor }) => (
                <div key={label} className={`do-stat-card ${T("do-stat-card-dark","do-stat-card-light")}`}>
                  <div className="do-stat-icon" style={{ background: iconBg, borderColor: iconBd }}>
                    <Icon style={{ width:13, height:13, color: iconColor }} />
                  </div>
                  <div>
                    <p className="do-stat-num" style={{ color: numColor }}>{num}</p>
                    <p className={`do-stat-label ${T("do-stat-label-dark","do-stat-label-light")}`}>{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Search ── */}
            <div className={`do-section-label ${T("do-section-label-dark","do-section-label-light")}`}>Pencarian</div>
            <div className="do-search-wrap">
              <div style={{ position:"relative", flex:1, minWidth:220 }}>
                <div style={{ position:"absolute", top:"50%", left:11, transform:"translateY(-50%)", pointerEvents:"none" }}>
                  <Search style={{ width:14, height:14, color: d ? "rgba(56,189,248,0.35)" : "rgba(3,105,161,0.35)" }} />
                </div>
                <input
                  type="text"
                  placeholder="Cari nomor order atau nama pelanggan…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                  className={T("do-search-input-dark","do-search-input-light")}
                />
              </div>
              <button onClick={handleSearch} className="do-btn-primary">
                <Search style={{ width:13, height:13 }} /> Cari
              </button>
              <button onClick={handleReset} className={T("do-btn-ghost-dark","do-btn-ghost-light")}>
                <RefreshCw style={{ width:13, height:13 }} /> Reset
              </button>
            </div>
          </div>

          <div className={T("do-divider-dark","do-divider-light")} />

          {/* ── Section label table ── */}
          <div style={{ padding:"16px 24px 12px" }}>
            <div className={`do-section-label ${T("do-section-label-dark","do-section-label-light")}`}>
              {isSearching
                ? `Hasil Pencarian — ${filteredOrders.length} ditemukan`
                : "Semua Dokumen"}
            </div>
          </div>

          {/* ── Table ── */}
          <div style={{ padding:"0 24px" }}>
            <div className={`do-table-wrap ${T("do-table-wrap-dark","do-table-wrap-light")}`}>
              <table className="do-table">
                <thead>
                  <tr>
                    <th className={`do-th ${T("do-th-dark","do-th-light")}`}>Nama Pelanggan</th>
                    <th className={`do-th ${T("do-th-dark","do-th-light")}`}>Nomor Order</th>
                    {isPortofolio && <>
                      <th className={`do-th do-th-center ${T("do-th-dark","do-th-light")}`}>SI / SPK</th>
                      <th className={`do-th do-th-center ${T("do-th-dark","do-th-light")}`}>Sertifikat</th>
                      <th className={`do-th do-th-center ${T("do-th-dark","do-th-light")}`}>Sertifikat PM06</th>
                    </>}
                    {!isPortofolio && <>
                      <th className={`do-th do-th-center ${T("do-th-dark","do-th-light")}`}>Faktur Pajak</th>
                      <th className={`do-th do-th-center ${T("do-th-dark","do-th-light")}`}>Invoice</th>
                    </>}
                    <th className={`do-th do-th-center ${T("do-th-dark","do-th-light")}`}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length > 0 ? paginated.map((order, idx) => {
                    const isLast = idx === paginated.length - 1;
                    const { filled, total } = countDocs(order, isPortofolio);
                    return (
                      <tr
                        key={order.nomorOrder || idx}
                        className={`do-tr ${T("do-tr-dark","do-tr-light")} ${isLast ? "do-tr-last" : ""}`}
                        onClick={() => goToDetail(order)}
                        title={`Lihat detail · ${order.nomorOrder}`}
                      >
                        {/* Pelanggan + arrow hint */}
                        <td className={`do-td ${T("do-td-dark","do-td-light")}`}>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <p className={`do-cell-main ${T("do-cell-main-dark","do-cell-main-light")}`}>
                              {order.pelanggan || "—"}
                            </p>
                            <ArrowRight
                              className="do-row-arrow"
                              style={{ width:13, height:13, color: d ? "rgba(56,189,248,0.5)" : "rgba(3,105,161,0.5)" }}
                            />
                          </div>
                        </td>

                        {/* Nomor Order */}
                        <td className={`do-td ${T("do-td-dark","do-td-light")}`}>
                          <p className={`do-cell-mono ${T("do-cell-mono-dark","do-cell-mono-light")}`}>
                            {order.nomorOrder || "—"}
                          </p>
                        </td>

                        {/* Admin Portofolio */}
                        {isPortofolio && <>
                          <td className={`do-td ${T("do-td-dark","do-td-light")}`} style={{ textAlign:"center" }}>
                            <DocCell fileUrl={order.documents?.siSpk?.fileUrl} isDark={d} />
                          </td>
                          <td className={`do-td ${T("do-td-dark","do-td-light")}`} style={{ textAlign:"center" }}>
                            <DocCell fileUrl={order.documents?.sertifikat?.fileUrl} isDark={d} />
                          </td>
                          <td className={`do-td ${T("do-td-dark","do-td-light")}`} style={{ textAlign:"center" }}>
                            <DocCell fileUrl={order.documents?.sertifikatPM06?.fileUrl} isDark={d} />
                          </td>
                        </>}

                        {/* Admin Keuangan */}
                        {!isPortofolio && <>
                          <td className={`do-td ${T("do-td-dark","do-td-light")}`} style={{ textAlign:"center" }}>
                            <DocCell fileUrl={order.fakturPajak?.fileUrl} isDark={d} />
                          </td>
                          <td className={`do-td ${T("do-td-dark","do-td-light")}`} style={{ textAlign:"center" }}>
                            <DocCell fileUrl={order.invoice?.fileUrl} isDark={d} />
                          </td>
                        </>}

                        {/* Status kelengkapan */}
                        <td className={`do-td ${T("do-td-dark","do-td-light")}`} style={{ textAlign:"center" }}>
                          <StatusBadge filled={filled} total={total} isDark={d} />
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={colSpan}>
                        <div className="do-empty">
                          <div className={`do-empty-icon ${T("do-empty-icon-dark","do-empty-icon-light")}`}>
                            <FolderOpen style={{ width:22, height:22, color: d ? "rgba(56,189,248,0.45)" : "rgba(3,105,161,0.45)" }} />
                          </div>
                          <p className={`do-empty-title ${T("do-empty-title-dark","do-empty-title-light")}`}>
                            {isSearching ? "Tidak ada hasil" : "Belum ada dokumen"}
                          </p>
                          <p className={`do-empty-sub ${T("do-empty-sub-dark","do-empty-sub-light")}`}>
                            {isSearching
                              ? "Coba ubah kata kunci atau klik Reset."
                              : "Dokumen akan muncul di sini ketika tersedia."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Pagination ── */}
          {filteredOrders.length > 0 && (
            <div className={`do-pagination ${T("do-pagination-dark","do-pagination-light")}`} style={{ marginTop:12 }}>
              <p className={`do-page-info ${T("do-page-info-dark","do-page-info-light")}`}>
                <BarChart3 style={{ width:12, height:12 }} />
                <span className={T("do-page-info-num-dark","do-page-info-num-light")}>
                  {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredOrders.length)}
                </span>
                {" / "}
                <span className={T("do-page-info-num-dark","do-page-info-num-light")}>{filteredOrders.length}</span>
                {" dokumen"}
              </p>
              <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className={`do-page-btn ${T("do-page-btn-dark","do-page-btn-light")}`}
                >
                  <ChevronLeft style={{ width:14, height:14 }} />
                </button>
                <span className={`do-page-label ${T("do-page-label-dark","do-page-label-light")}`}>
                  {currentPage} / {Math.max(1, totalPages)}
                </span>
                <button
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className={`do-page-btn ${T("do-page-btn-dark","do-page-btn-light")}`}
                >
                  <ChevronRight style={{ width:14, height:14 }} />
                </button>
              </div>
            </div>
          )}

          <div style={{ height:20 }} />
        </div>
      </div>
    </div>
  );
};

export default DokumenOrder;