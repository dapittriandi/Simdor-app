import { useState, useEffect } from "react";
import { getOrders } from "../../services/orderServices";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../components/layout/ThemeContext";
import {
  FileText, Search, RefreshCw, ChevronLeft, ChevronRight,
  ExternalLink, Folder, AlertTriangle, Loader2
} from "lucide-react";

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

.do-root { font-family: 'DM Sans', sans-serif; }

.do-page-dark  { background: #060a16; min-height: 100vh; }
.do-page-light { background: #f0f5ff; min-height: 100vh; }

/* ── Accent flow ── */
@keyframes accentFlow { 0%{background-position:0 0}100%{background-position:200% 0} }
.do-accent-dark  { height:2px; background:linear-gradient(90deg,transparent,#1d4ed8 25%,#60a5fa 50%,#1d4ed8 75%,transparent); background-size:200% 100%; animation:accentFlow 4s linear infinite; }
.do-accent-light { height:2px; background:linear-gradient(90deg,transparent,#3b82f6 25%,#93c5fd 50%,#3b82f6 75%,transparent); background-size:200% 100%; animation:accentFlow 4s linear infinite; }

/* ── Glass main card ── */
.do-card-dark {
  background: rgba(6,10,22,0.82);
  backdrop-filter: blur(28px) saturate(160%);
  -webkit-backdrop-filter: blur(28px) saturate(160%);
  border: 1px solid rgba(99,148,255,0.12);
  box-shadow: 0 8px 48px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.03) inset;
  border-radius: 16px;
  overflow: hidden;
}
.do-card-light {
  background: rgba(255,255,255,0.88);
  backdrop-filter: blur(28px) saturate(180%);
  -webkit-backdrop-filter: blur(28px) saturate(180%);
  border: 1px solid rgba(59,130,246,0.14);
  box-shadow: 0 8px 32px rgba(59,130,246,0.09), 0 1px 0 rgba(255,255,255,0.9) inset;
  border-radius: 16px;
  overflow: hidden;
}

/* ── Page title ── */
.do-h1-dark  { font-size:20px; font-weight:700; background:linear-gradient(135deg,#93c5fd,#fff 55%,#60a5fa); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
.do-h1-light { font-size:20px; font-weight:700; background:linear-gradient(135deg,#1d4ed8,#2563eb 55%,#3b82f6); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }

/* ── Search input ── */
.do-search-dark {
  width:100%; padding:10px 14px 10px 40px; border-radius:10px; font-size:13.5px;
  font-family:'DM Sans',sans-serif; background:rgba(255,255,255,0.04);
  border:1px solid rgba(99,148,255,0.15); color:#cbd5f0; outline:none; transition:all .2s;
  box-sizing:border-box;
}
.do-search-dark::placeholder { color:rgba(99,148,255,0.28); }
.do-search-dark:focus { border-color:rgba(59,130,246,0.5); background:rgba(59,130,246,0.06); box-shadow:0 0 0 3px rgba(59,130,246,0.1); }

.do-search-light {
  width:100%; padding:10px 14px 10px 40px; border-radius:10px; font-size:13.5px;
  font-family:'DM Sans',sans-serif; background:rgba(241,245,249,0.8);
  border:1px solid rgba(59,130,246,0.14); color:#1e3a5f; outline:none; transition:all .2s;
  box-sizing:border-box;
}
.do-search-light::placeholder { color:rgba(37,99,235,0.3); }
.do-search-light:focus { border-color:rgba(37,99,235,0.45); background:white; box-shadow:0 0 0 3px rgba(59,130,246,0.08); }

/* ── Search buttons ── */
.do-btn-search { display:inline-flex; align-items:center; gap:6px; padding:10px 18px; border-radius:10px; background:linear-gradient(135deg,#1d4ed8,#3b82f6); border:none; color:white; font-size:13px; font-weight:600; cursor:pointer; font-family:'DM Sans',sans-serif; box-shadow:0 4px 14px rgba(59,130,246,0.28); transition:all .2s; white-space:nowrap; }
.do-btn-search:hover { background:linear-gradient(135deg,#1e40af,#2563eb); transform:translateY(-1px); box-shadow:0 6px 18px rgba(59,130,246,0.38); }

.do-btn-reset-dark  { display:inline-flex; align-items:center; gap:6px; padding:10px 18px; border-radius:10px; background:rgba(255,255,255,0.04); border:1px solid rgba(99,148,255,0.15); color:rgba(148,163,220,0.8); font-size:13px; font-weight:500; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all .2s; white-space:nowrap; }
.do-btn-reset-dark:hover  { background:rgba(255,255,255,0.08); color:#bfdbfe; }
.do-btn-reset-light { display:inline-flex; align-items:center; gap:6px; padding:10px 18px; border-radius:10px; background:rgba(255,255,255,0.8); border:1px solid rgba(59,130,246,0.18); color:#4b6ea8; font-size:13px; font-weight:500; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all .2s; white-space:nowrap; }
.do-btn-reset-light:hover { background:#eff6ff; color:#1d4ed8; }

/* ── Table wrapper ── */
.do-table-wrap { overflow-x:auto; border-radius:12px; border:1px solid; }
.do-table-wrap-dark  { border-color:rgba(99,148,255,0.1); }
.do-table-wrap-light { border-color:rgba(59,130,246,0.12); }

/* ── Table ── */
.do-table { width:100%; border-collapse:collapse; min-width:560px; }

/* ── TH ── */
.do-th-dark  { padding:11px 20px; font-size:10px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:rgba(99,148,255,0.5); background:rgba(255,255,255,0.025); border-bottom:1px solid rgba(99,148,255,0.1); text-align:left; white-space:nowrap; }
.do-th-light { padding:11px 20px; font-size:10px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:rgba(37,99,235,0.5); background:rgba(59,130,246,0.04); border-bottom:1px solid rgba(59,130,246,0.1); text-align:left; white-space:nowrap; }
.do-th-center { text-align:center; }

/* ── TD ── */
.do-td { padding:14px 20px; vertical-align:middle; }
.do-td-dark  { border-bottom:1px solid rgba(99,148,255,0.06); }
.do-td-light { border-bottom:1px solid rgba(59,130,246,0.07); }

/* ── Row hover ── */
.do-tr-dark:hover  td { background:rgba(59,130,246,0.04); }
.do-tr-light:hover td { background:rgba(219,234,254,0.35); }
.do-tr-last td { border-bottom:none!important; }

/* ── Cell text ── */
.do-cell-main-dark  { font-size:13.5px; font-weight:500; color:#cbd5f0; }
.do-cell-main-light { font-size:13.5px; font-weight:500; color:#1e3a5f; }
.do-cell-sub-dark   { font-size:12px; color:rgba(99,148,255,0.5); margin-top:2px; }
.do-cell-sub-light  { font-size:12px; color:rgba(37,99,235,0.4); margin-top:2px; }

/* ── Doc link ── */
.do-doc-link { display:inline-flex; align-items:center; gap:5px; padding:5px 13px; border-radius:99px; font-size:11.5px; font-weight:600; text-decoration:none; transition:all .2s; }
.do-doc-link-dark  { background:rgba(37,99,235,0.15); border:1px solid rgba(59,130,246,0.3); color:#93c5fd; }
.do-doc-link-dark:hover  { background:rgba(37,99,235,0.25); border-color:rgba(96,165,250,0.5); color:#bfdbfe; }
.do-doc-link-light { background:rgba(219,234,254,0.8); border:1px solid rgba(59,130,246,0.28); color:#1d4ed8; }
.do-doc-link-light:hover { background:rgba(191,219,254,0.9); border-color:rgba(37,99,235,0.4); color:#1e40af; }

/* ── No doc badge ── */
.do-nodoc-dark  { display:inline-flex; align-items:center; padding:4px 11px; border-radius:99px; font-size:11px; background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.18); color:rgba(248,113,113,0.8); }
.do-nodoc-light { display:inline-flex; align-items:center; padding:4px 11px; border-radius:99px; font-size:11px; background:rgba(254,242,242,0.8); border:1px solid rgba(239,68,68,0.2); color:#dc2626; }

/* ── Empty state ── */
.do-empty-dark  { padding:48px 24px; text-align:center; }
.do-empty-light { padding:48px 24px; text-align:center; }
.do-empty-icon-dark  { width:52px; height:52px; border-radius:14px; background:rgba(99,148,255,0.08); border:1px solid rgba(99,148,255,0.12); display:flex; align-items:center; justify-content:center; margin:0 auto 14px; }
.do-empty-icon-light { width:52px; height:52px; border-radius:14px; background:rgba(219,234,254,0.6); border:1px solid rgba(59,130,246,0.14); display:flex; align-items:center; justify-content:center; margin:0 auto 14px; }
.do-empty-title-dark  { font-size:14px; font-weight:600; color:rgba(147,197,253,0.7); margin-bottom:4px; }
.do-empty-title-light { font-size:14px; font-weight:600; color:#1d4ed8; margin-bottom:4px; }
.do-empty-sub-dark  { font-size:12px; color:rgba(99,148,255,0.38); }
.do-empty-sub-light { font-size:12px; color:rgba(37,99,235,0.4); }

/* ── Pagination ── */
.do-pagination-dark  { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px; padding:14px 20px; border-top:1px solid rgba(99,148,255,0.07); }
.do-pagination-light { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px; padding:14px 20px; border-top:1px solid rgba(59,130,246,0.1); }
.do-page-info-dark  { font-size:12.5px; color:rgba(99,148,255,0.5); display:flex; align-items:center; gap:7px; }
.do-page-info-light { font-size:12.5px; color:rgba(37,99,235,0.5); display:flex; align-items:center; gap:7px; }
.do-page-info-num-dark  { font-weight:600; color:#93c5fd; }
.do-page-info-num-light { font-weight:600; color:#1d4ed8; }
.do-page-label-dark  { padding:6px 16px; border-radius:8px; background:rgba(37,99,235,0.12); border:1px solid rgba(59,130,246,0.25); font-size:12px; font-weight:600; color:#93c5fd; }
.do-page-label-light { padding:6px 16px; border-radius:8px; background:rgba(219,234,254,0.8); border:1px solid rgba(59,130,246,0.25); font-size:12px; font-weight:600; color:#1d4ed8; }

.do-page-btn-dark  { display:flex; align-items:center; justify-content:center; width:34px; height:34px; border-radius:9px; background:rgba(255,255,255,0.04); border:1px solid rgba(99,148,255,0.14); color:rgba(148,163,220,0.8); cursor:pointer; transition:all .18s; }
.do-page-btn-dark:hover:not(:disabled)  { background:rgba(59,130,246,0.12); border-color:rgba(99,148,255,0.3); color:#93c5fd; }
.do-page-btn-dark:disabled  { opacity:.3; cursor:not-allowed; }
.do-page-btn-light { display:flex; align-items:center; justify-content:center; width:34px; height:34px; border-radius:9px; background:rgba(255,255,255,0.8); border:1px solid rgba(59,130,246,0.18); color:#4b6ea8; cursor:pointer; transition:all .18s; }
.do-page-btn-light:hover:not(:disabled) { background:#eff6ff; border-color:rgba(37,99,235,0.3); color:#1d4ed8; }
.do-page-btn-light:disabled { opacity:.3; cursor:not-allowed; }

/* ── Loading spinner ── */
@keyframes spinGlow { 0%{transform:rotate(0deg)}100%{transform:rotate(360deg)} }
.do-spinner { width:40px; height:40px; border-radius:50%; border:3px solid rgba(59,130,246,0.15); border-top:3px solid #3b82f6; animation:spinGlow 1s linear infinite; }

/* ── Mount animation ── */
@keyframes doFadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
.do-mount { animation:doFadeUp .42s cubic-bezier(0.22,1,0.36,1) both; }

/* Section label */
.do-section-dark  { font-size:9px; font-weight:600; letter-spacing:.16em; text-transform:uppercase; color:rgba(99,148,255,0.38); display:flex; align-items:center; gap:8px; margin-bottom:14px; }
.do-section-dark::after  { content:''; flex:1; height:1px; background:linear-gradient(90deg,rgba(99,148,255,0.15),transparent); }
.do-section-light { font-size:9px; font-weight:600; letter-spacing:.16em; text-transform:uppercase; color:rgba(37,99,235,0.4); display:flex; align-items:center; gap:8px; margin-bottom:14px; }
.do-section-light::after { content:''; flex:1; height:1px; background:linear-gradient(90deg,rgba(37,99,235,0.12),transparent); }
`;

/* ─────────────────────────────────────────────
   HELPER — Doc Cell
───────────────────────────────────────────── */
const DocCell = ({ fileUrl, isDark }) => {
  if (fileUrl) {
    return (
      <a href={fileUrl} target="_blank" rel="noopener noreferrer"
        className={isDark ? "do-doc-link do-doc-link-dark" : "do-doc-link do-doc-link-light"}>
        <ExternalLink style={{ width:11, height:11 }} />
        Lihat Dokumen
      </a>
    );
  }
  return <span className={isDark ? "do-nodoc-dark" : "do-nodoc-light"}>Tidak Ada</span>;
};

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const DokumenOrder = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [orders, setOrders]               = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [user, setUser]                   = useState(null);
  const [searchQuery, setSearchQuery]     = useState("");
  const [isSearching, setIsSearching]     = useState(false);
  const [mounted, setMounted]             = useState(false);
  const [currentPage, setCurrentPage]     = useState(1);
  const itemsPerPage = 10;

  const userData       = JSON.parse(localStorage.getItem("user")) || {};
  const userPortofolio = userData?.bidang || "";
  const userPeran      = userData?.peran  || "";

  const d = isDark;
  const T = (dark, light) => d ? dark : light;

  useEffect(() => {
    if (!userPeran || !["admin portofolio","admin keuangan"].includes(userPeran)) {
      alert("Anda tidak memiliki akses!"); navigate("/"); return;
    }
    setMounted(true);
    setUser(JSON.parse(localStorage.getItem("user")) || null);
    return () => setMounted(false);
  }, [userPeran]);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try { const data = await getOrders(); setOrders(data); }
      catch (e) { console.error("Gagal mengambil data orders:", e); }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const transformOrders = (list) => {
    if (userPeran === "admin portofolio")
      return list.filter(o => o.portofolio === userPortofolio);
    return list.map(o => ({
      pelanggan:  o.pelanggan,
      nomorOrder: o.nomorOrder,
      fakturPajak: o.documents?.fakturPajak || { fileUrl: null },
      invoice:     o.documents?.invoice     || { fileUrl: null },
    }));
  };

  useEffect(() => {
    setFilteredOrders(transformOrders(orders));
  }, [orders, userPeran, userPortofolio]);

  const handleSearch = () => {
    if (!searchQuery.trim()) { handleReset(); return; }
    const q = searchQuery.toLowerCase();
    const base = userPeran === "admin portofolio"
      ? orders.filter(o => o.portofolio === userPortofolio)
      : orders;
    const results = base.filter(o =>
      o.pelanggan?.toLowerCase().includes(q) ||
      o.nomorOrder?.toLowerCase().includes(q)
    );
    setFilteredOrders(transformOrders(results));
    setIsSearching(true);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearchQuery(""); setIsSearching(false); setCurrentPage(1);
    setFilteredOrders(transformOrders(orders));
  };

  const totalPages     = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex     = (currentPage - 1) * itemsPerPage;
  const paginated      = filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  const isPortofolio   = userPeran === "admin portofolio";
  const colSpan        = isPortofolio ? 5 : 4;

  /* ── Loading ── */
  if (loading) {
    return (
      <div className={`do-root ${T("do-page-dark","do-page-light")}`}
        style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh" }}>
        <style>{STYLES}</style>
        <div style={{ textAlign:"center" }}>
          <div className="do-spinner" style={{ margin:"0 auto 14px" }} />
          <p style={{ fontSize:13, color: d ? "rgba(99,148,255,0.5)" : "rgba(37,99,235,0.5)", fontFamily:"DM Sans,sans-serif" }}>
            Memuat data dokumen…
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`do-root ${T("do-page-dark","do-page-light")}`}
        style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh" }}>
        <style>{STYLES}</style>
        <p style={{ fontSize:13, color: d ? "rgba(99,148,255,0.5)" : "rgba(37,99,235,0.5)", fontFamily:"DM Sans,sans-serif" }}>
          Memuat data pengguna…
        </p>
      </div>
    );
  }

  return (
    <div className={`do-root ${T("do-page-dark","do-page-light")}`}
      style={{ padding:"28px 20px 56px", transition:"background .4s ease" }}>
      <style>{STYLES}</style>

      <div style={{ maxWidth:1040, margin:"0 auto", opacity: mounted ? 1 : 0, transition:"opacity .4s" }}>

        {/* ── Main Card ── */}
        <div className={`do-mount ${T("do-card-dark","do-card-light")}`}>
          <div className={T("do-accent-dark","do-accent-light")} />

          <div style={{ padding:"22px 24px 0" }}>
            {/* Header */}
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
              <div style={{
                width:36, height:36, borderRadius:10, flexShrink:0,
                background:"linear-gradient(135deg,#1e3a8a,#3b82f6)",
                boxShadow:"0 0 16px rgba(59,130,246,0.3)",
                display:"flex", alignItems:"center", justifyContent:"center"
              }}>
                <Folder style={{ width:16, height:16, color:"white" }} />
              </div>
              <div>
                <p className={T("do-h1-dark","do-h1-light")}>Daftar Dokumen Order</p>
                <div className={T("do-accent-dark","do-accent-light")} style={{ width:48, marginTop:4 }} />
              </div>
            </div>

            {/* Section label */}
            <div className={T("do-section-dark","do-section-light")}>Pencarian</div>

            {/* Search bar */}
            <div style={{ display:"flex", gap:8, marginBottom:22, flexWrap:"wrap" }}>
              <div style={{ position:"relative", flex:1, minWidth:220 }}>
                <div style={{ position:"absolute", top:"50%", left:12, transform:"translateY(-50%)", pointerEvents:"none" }}>
                  <Search style={{ width:15, height:15, color: d ? "rgba(99,148,255,0.4)" : "rgba(37,99,235,0.4)" }} />
                </div>
                <input
                  type="text"
                  placeholder="Cari nomor order atau nama pelanggan…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                  className={T("do-search-dark","do-search-light")}
                />
              </div>
              <button onClick={handleSearch} className="do-btn-search">
                <Search style={{ width:14, height:14 }} />
                <span>Cari</span>
              </button>
              <button onClick={handleReset} className={T("do-btn-reset-dark","do-btn-reset-light")}>
                <RefreshCw style={{ width:14, height:14 }} />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Section label — table */}
          <div style={{ padding:"0 24px" }}>
            <div className={T("do-section-dark","do-section-light")}>
              {isSearching ? "Hasil Pencarian" : "Semua Dokumen"}
            </div>
          </div>

          {/* ── Table ── */}
          <div style={{ padding:"0 24px 0" }}>
            <div className={`do-table-wrap ${T("do-table-wrap-dark","do-table-wrap-light")}`}
              style={{ marginBottom:0 }}>
              <table className="do-table">
                <thead>
                  <tr>
                    <th className={T("do-th-dark","do-th-light")}>Nama Pelanggan</th>
                    <th className={T("do-th-dark","do-th-light")}>Nomor Order</th>
                    {isPortofolio && <>
                      <th className={`${T("do-th-dark","do-th-light")} do-th-center`}>SI/SPK</th>
                      <th className={`${T("do-th-dark","do-th-light")} do-th-center`}>Sertifikat</th>
                      <th className={`${T("do-th-dark","do-th-light")} do-th-center`}>Sertifikat PM06</th>
                    </>}
                    {!isPortofolio && <>
                      <th className={`${T("do-th-dark","do-th-light")} do-th-center`}>Faktur Pajak</th>
                      <th className={`${T("do-th-dark","do-th-light")} do-th-center`}>Invoice</th>
                    </>}
                  </tr>
                </thead>
                <tbody>
                  {paginated.length > 0 ? paginated.map((order, idx) => {
                    const isLast = idx === paginated.length - 1;
                    return (
                      <tr key={order.nomorOrder || idx}
                        className={`${T("do-tr-dark","do-tr-light")} ${isLast ? "do-tr-last" : ""}`}
                        style={{ transition:"background .15s" }}>
                        {/* Pelanggan */}
                        <td className={`do-td ${T("do-td-dark","do-td-light")}`}>
                          <p className={T("do-cell-main-dark","do-cell-main-light")}>{order.pelanggan || "—"}</p>
                        </td>
                        {/* Nomor Order */}
                        <td className={`do-td ${T("do-td-dark","do-td-light")}`}>
                          <p className={T("do-cell-sub-dark","do-cell-sub-light")}>{order.nomorOrder || "—"}</p>
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
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={colSpan}>
                        <div className={T("do-empty-dark","do-empty-light")}>
                          <div className={T("do-empty-icon-dark","do-empty-icon-light")}>
                            <FileText style={{ width:22, height:22, color: d ? "rgba(99,148,255,0.5)" : "rgba(37,99,235,0.5)" }} />
                          </div>
                          <p className={T("do-empty-title-dark","do-empty-title-light")}>
                            {isSearching ? "Tidak ada hasil pencarian" : "Belum ada dokumen"}
                          </p>
                          <p className={T("do-empty-sub-dark","do-empty-sub-light")}>
                            {isSearching ? "Coba ubah kata kunci atau reset filter." : "Dokumen akan tampil di sini ketika tersedia."}
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
            <div className={T("do-pagination-dark","do-pagination-light")} style={{ marginTop:16 }}>
              <p className={T("do-page-info-dark","do-page-info-light")}>
                <FileText style={{ width:13, height:13 }} />
                Menampilkan{" "}
                <span className={T("do-page-info-num-dark","do-page-info-num-light")}>
                  {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredOrders.length)}
                </span>{" "}
                dari{" "}
                <span className={T("do-page-info-num-dark","do-page-info-num-light")}>
                  {filteredOrders.length}
                </span>{" "}
                dokumen
              </p>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className={T("do-page-btn-dark","do-page-btn-light")}
                >
                  <ChevronLeft style={{ width:15, height:15 }} />
                </button>
                <span className={T("do-page-label-dark","do-page-label-light")}>
                  {currentPage} / {Math.max(1, totalPages)}
                </span>
                <button
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className={T("do-page-btn-dark","do-page-btn-light")}
                >
                  <ChevronRight style={{ width:15, height:15 }} />
                </button>
              </div>
            </div>
          )}

          {/* bottom padding */}
          <div style={{ height:24 }} />
        </div>
      </div>
    </div>
  );
};

export default DokumenOrder;