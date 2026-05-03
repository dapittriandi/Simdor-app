import { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById, deleteOrder } from "../../services/orderServices";
import NavigationInstruction from "../../utils/NavigationInstruction";
import { Timestamp } from "firebase/firestore";
import { useTheme } from "../../components/layout/ThemeContext";
import {
  Edit, Trash2, ArrowLeft, FileText, AlertTriangle, Check, Clock,
  RefreshCw, CheckCircle, Circle, ClipboardEdit, HardHat,
  FileCheck, ClipboardCheck, Receipt, PackageCheck,
  BarChart2, Wallet, Send, Award, Info
} from "lucide-react";

/* ─────────────────────────────────────────────
   STYLES — mirroring Sidebar's glass system
───────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

.od-root { font-family: 'DM Sans', sans-serif; }

/* ── Page backgrounds ── */
.od-page-dark  { background: #060a16; min-height: 100vh; }
.od-page-light { background: #f0f5ff; min-height: 100vh; }

/* ── Accent flow ── */
@keyframes accentFlow { 0%{background-position:0 0}100%{background-position:200% 0} }
.od-accent-dark  { height:2px; background:linear-gradient(90deg,transparent,#1d4ed8 25%,#60a5fa 50%,#1d4ed8 75%,transparent); background-size:200% 100%; animation:accentFlow 4s linear infinite; }
.od-accent-light { height:2px; background:linear-gradient(90deg,transparent,#3b82f6 25%,#93c5fd 50%,#3b82f6 75%,transparent); background-size:200% 100%; animation:accentFlow 4s linear infinite; }

/* ── Glass cards ── */
.od-card-dark {
  background: rgba(6,10,22,0.82);
  backdrop-filter: blur(28px) saturate(160%);
  -webkit-backdrop-filter: blur(28px) saturate(160%);
  border: 1px solid rgba(99,148,255,0.12);
  box-shadow: 0 8px 48px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.03) inset;
  border-radius: 16px;
  overflow: hidden;
}
.od-card-light {
  background: rgba(255,255,255,0.88);
  backdrop-filter: blur(28px) saturate(180%);
  -webkit-backdrop-filter: blur(28px) saturate(180%);
  border: 1px solid rgba(59,130,246,0.14);
  box-shadow: 0 8px 32px rgba(59,130,246,0.09), 0 1px 0 rgba(255,255,255,0.9) inset;
  border-radius: 16px;
  overflow: hidden;
}

/* ── Section card (inner group) ── */
.od-section-dark {
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(99,148,255,0.1);
  border-radius: 13px;
  overflow: hidden;
}
.od-section-light {
  background: rgba(255,255,255,0.9);
  border: 1px solid rgba(59,130,246,0.12);
  border-radius: 13px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(59,130,246,0.05);
}

/* ── Section header ── */
.od-sec-head-dark  { background: rgba(59,130,246,0.07); border-bottom: 1px solid rgba(99,148,255,0.09); padding: 14px 20px; display:flex; align-items:center; gap:10px; }
.od-sec-head-light { background: rgba(59,130,246,0.05); border-bottom: 1px solid rgba(59,130,246,0.1);  padding: 14px 20px; display:flex; align-items:center; gap:10px; }
.od-sec-title-dark  { font-size:13px; font-weight:600; color:rgba(147,197,253,0.9); letter-spacing:.03em; }
.od-sec-title-light { font-size:13px; font-weight:600; color:#1d4ed8; letter-spacing:.03em; }

/* ── Field label / value ── */
.od-label-dark  { font-size:11px; font-weight:500; color:rgba(99,148,255,0.5); letter-spacing:.06em; text-transform:uppercase; margin-bottom:4px; }
.od-label-light { font-size:11px; font-weight:500; color:rgba(37,99,235,0.45); letter-spacing:.06em; text-transform:uppercase; margin-bottom:4px; }
.od-value-dark  { font-size:13.5px; font-weight:500; color:#cbd5f0; }
.od-value-light { font-size:13.5px; font-weight:500; color:#1e3a5f; }

/* ── Header text ── */
.od-h1-dark  { font-size:22px; font-weight:700; background:linear-gradient(135deg,#93c5fd,#fff 55%,#60a5fa); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
.od-h1-light { font-size:22px; font-weight:700; background:linear-gradient(135deg,#1d4ed8,#2563eb 55%,#3b82f6); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
.od-sub-dark  { font-size:12px; color:rgba(99,148,255,0.45); margin-top:2px; }
.od-sub-light { font-size:12px; color:rgba(37,99,235,0.45); margin-top:2px; }

/* ── Back button ── */
.od-back-dark  { display:flex; align-items:center; gap:7px; padding:8px 14px; border-radius:10px; background:rgba(255,255,255,0.04); border:1px solid rgba(99,148,255,0.14); color:rgba(148,163,220,0.8); font-size:13px; font-weight:500; cursor:pointer; transition:all .2s ease; }
.od-back-dark:hover  { background:rgba(59,130,246,0.1); border-color:rgba(99,148,255,0.28); color:#93c5fd; transform:translateX(-2px); }
.od-back-light { display:flex; align-items:center; gap:7px; padding:8px 14px; border-radius:10px; background:rgba(255,255,255,0.8); border:1px solid rgba(59,130,246,0.18); color:#4b6ea8; font-size:13px; font-weight:500; cursor:pointer; transition:all .2s ease; }
.od-back-light:hover { background:rgba(219,234,254,0.9); border-color:rgba(59,130,246,0.3); color:#1d4ed8; transform:translateX(-2px); }

/* ── Customer name / order number ── */
.od-cust-dark  { font-size:18px; font-weight:700; color:#e2e8f8; }
.od-cust-light { font-size:18px; font-weight:700; color:#1e3a5f; }
.od-ordno-dark  { font-size:12px; color:rgba(99,148,255,0.5); margin-top:3px; }
.od-ordno-light { font-size:12px; color:rgba(37,99,235,0.45); margin-top:3px; }

/* ── Status badges ── */
.od-badge { display:inline-flex; align-items:center; padding:5px 13px; border-radius:999px; font-size:11.5px; font-weight:600; letter-spacing:.04em; }
.badge-new-order    { background:rgba(148,163,184,0.12); border:1px solid rgba(148,163,184,0.25); color:#94a3b8; }
.badge-entry        { background:rgba(34,197,94,0.1);  border:1px solid rgba(34,197,94,0.25);  color:#4ade80; }
.badge-lapangan     { background:rgba(59,130,246,0.12); border:1px solid rgba(59,130,246,0.28); color:#60a5fa; }
.badge-sertifikat   { background:rgba(168,85,247,0.1);  border:1px solid rgba(168,85,247,0.25); color:#c084fc; }
.badge-closed       { background:rgba(249,115,22,0.1);  border:1px solid rgba(249,115,22,0.25); color:#fb923c; }
.badge-proforma     { background:rgba(234,179,8,0.1);   border:1px solid rgba(234,179,8,0.25);  color:#facc15; }
.badge-invoice      { background:rgba(20,184,166,0.1);  border:1px solid rgba(20,184,166,0.25); color:#2dd4bf; }
.badge-selesai      { background:rgba(34,197,94,0.14);  border:1px solid rgba(34,197,94,0.3);   color:#4ade80; }
.badge-default      { background:rgba(239,68,68,0.1);   border:1px solid rgba(239,68,68,0.25);  color:#f87171; }

/* Light mode badge overrides */
.od-light .badge-new-order    { background:rgba(100,116,139,0.08); border-color:rgba(100,116,139,0.2); color:#64748b; }
.od-light .badge-entry        { background:rgba(22,163,74,0.08);   border-color:rgba(22,163,74,0.2);   color:#16a34a; }
.od-light .badge-lapangan     { background:rgba(37,99,235,0.08);   border-color:rgba(37,99,235,0.2);   color:#1d4ed8; }
.od-light .badge-sertifikat   { background:rgba(147,51,234,0.08);  border-color:rgba(147,51,234,0.2);  color:#7c3aed; }
.od-light .badge-closed       { background:rgba(234,88,12,0.08);   border-color:rgba(234,88,12,0.2);   color:#c2410c; }
.od-light .badge-proforma     { background:rgba(161,98,7,0.08);    border-color:rgba(161,98,7,0.2);    color:#a16207; }
.od-light .badge-invoice      { background:rgba(15,118,110,0.08);  border-color:rgba(15,118,110,0.2);  color:#0f766e; }
.od-light .badge-selesai      { background:rgba(21,128,61,0.08);   border-color:rgba(21,128,61,0.2);   color:#15803d; }
.od-light .badge-default      { background:rgba(185,28,28,0.08);   border-color:rgba(185,28,28,0.2);   color:#b91c1c; }

/* ── Dividers ── */
.od-div-dark  { border-bottom: 1px solid rgba(99,148,255,0.07); }
.od-div-light { border-bottom: 1px solid rgba(59,130,246,0.1); }

/* ── Current status bar ── */
.od-status-bar-dark  { background:rgba(37,99,235,0.1); border:1px solid rgba(59,130,246,0.2); border-radius:10px; padding:10px 16px; }
.od-status-bar-light { background:rgba(219,234,254,0.7); border:1px solid rgba(59,130,246,0.2); border-radius:10px; padding:10px 16px; }
.od-status-txt-dark  { font-size:13px; color:rgba(147,197,253,0.9); }
.od-status-txt-light { font-size:13px; color:#1d4ed8; }

/* ── Tracking ── */
.od-track-label-dark  { font-size:11px; color:rgba(147,197,253,0.7); font-weight:500; margin-top:7px; text-align:center; }
.od-track-label-light { font-size:11px; color:#2563eb; font-weight:500; margin-top:7px; text-align:center; }
.od-track-desc-dark   { font-size:10px; color:rgba(99,148,255,0.4); text-align:center; margin-top:2px; }
.od-track-desc-light  { font-size:10px; color:rgba(37,99,235,0.4); text-align:center; margin-top:2px; }
.od-track-title-dark  { font-size:15px; font-weight:700; color:#93c5fd; }
.od-track-title-light { font-size:15px; font-weight:700; color:#1d4ed8; }

/* ── Action buttons ── */
.od-btn-back-dark  { display:inline-flex; align-items:center; gap:7px; padding:10px 20px; border-radius:11px; background:rgba(255,255,255,0.04); border:1px solid rgba(99,148,255,0.15); color:rgba(148,163,220,0.85); font-size:13px; font-weight:500; cursor:pointer; transition:all .22s ease; }
.od-btn-back-dark:hover  { background:rgba(255,255,255,0.07); color:#bfdbfe; }
.od-btn-back-light { display:inline-flex; align-items:center; gap:7px; padding:10px 20px; border-radius:11px; background:rgba(255,255,255,0.8); border:1px solid rgba(59,130,246,0.2); color:#4b6ea8; font-size:13px; font-weight:500; cursor:pointer; transition:all .22s ease; }
.od-btn-back-light:hover { background:#eff6ff; color:#1d4ed8; }

.od-btn-edit { display:inline-flex; align-items:center; gap:7px; padding:10px 22px; border-radius:11px; background:linear-gradient(135deg,#d97706,#f59e0b); border:none; color:white; font-size:13px; font-weight:600; cursor:pointer; box-shadow:0 4px 18px rgba(245,158,11,0.28); transition:all .22s ease; }
.od-btn-edit:hover { background:linear-gradient(135deg,#b45309,#d97706); transform:translateY(-1px); box-shadow:0 6px 22px rgba(245,158,11,0.38); }

.od-btn-lengkapi { display:inline-flex; align-items:center; gap:7px; padding:10px 22px; border-radius:11px; background:linear-gradient(135deg,#1d4ed8,#3b82f6); border:none; color:white; font-size:13px; font-weight:600; cursor:pointer; box-shadow:0 4px 18px rgba(59,130,246,0.3); transition:all .22s ease; }
.od-btn-lengkapi:hover { background:linear-gradient(135deg,#1e40af,#2563eb); transform:translateY(-1px); box-shadow:0 6px 22px rgba(59,130,246,0.42); }

.od-btn-delete { display:inline-flex; align-items:center; gap:7px; padding:10px 22px; border-radius:11px; background:linear-gradient(135deg,#dc2626,#ef4444); border:none; color:white; font-size:13px; font-weight:600; cursor:pointer; box-shadow:0 4px 18px rgba(239,68,68,0.28); transition:all .22s ease; }
.od-btn-delete:hover { background:linear-gradient(135deg,#b91c1c,#dc2626); transform:translateY(-1px); box-shadow:0 6px 22px rgba(239,68,68,0.38); }

/* ── Loading spinner ── */
@keyframes spinGlow {
  0%   { transform:rotate(0deg); box-shadow:0 0 0 rgba(59,130,246,0); }
  50%  { box-shadow:0 0 18px rgba(59,130,246,0.4); }
  100% { transform:rotate(360deg); box-shadow:0 0 0 rgba(59,130,246,0); }
}
.od-spinner { width:48px; height:48px; border-radius:50%; border:3px solid rgba(59,130,246,0.15); border-top:3px solid #3b82f6; animation:spinGlow 1s ease-in-out infinite; }

/* ── Mount animation ── */
@keyframes odFadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
.od-mount { animation: odFadeUp .45s cubic-bezier(0.22,1,0.36,1) both; }
.od-stagger-1 { animation-delay:.05s; }
.od-stagger-2 { animation-delay:.1s; }
.od-stagger-3 { animation-delay:.15s; }
.od-stagger-4 { animation-delay:.2s; }
.od-stagger-5 { animation-delay:.25s; }
.od-stagger-6 { animation-delay:.3s; }
.od-stagger-7 { animation-delay:.35s; }

/* ── Tracking progress line ── */
.od-track-rail-dark  { height:3px; background:rgba(99,148,255,0.12); border-radius:99px; }
.od-track-rail-light { height:3px; background:rgba(59,130,246,0.12); border-radius:99px; }
.od-track-fill { height:3px; background:linear-gradient(90deg,#1d4ed8,#60a5fa); border-radius:99px; transition:width .6s cubic-bezier(0.22,1,0.36,1); }

/* ── Step circle ── */
.od-step-done-dark    { background:rgba(37,99,235,0.25); border:2px solid rgba(59,130,246,0.55); color:#60a5fa; }
.od-step-active-dark  { background:linear-gradient(135deg,#1d4ed8,#3b82f6); border:2px solid rgba(96,165,250,0.6); color:white; box-shadow:0 0 16px rgba(59,130,246,0.5); }
.od-step-idle-dark    { background:rgba(255,255,255,0.03); border:2px solid rgba(99,148,255,0.15); color:rgba(99,148,255,0.3); }
.od-step-done-light   { background:rgba(219,234,254,0.8); border:2px solid rgba(59,130,246,0.4); color:#2563eb; }
.od-step-active-light { background:linear-gradient(135deg,#2563eb,#3b82f6); border:2px solid rgba(37,99,235,0.5); color:white; box-shadow:0 0 14px rgba(59,130,246,0.35); }
.od-step-idle-light   { background:rgba(241,245,249,0.8); border:2px solid rgba(59,130,246,0.12); color:rgba(59,130,246,0.25); }

/* ── Error card ── */
.od-error-dark  { background:rgba(239,68,68,0.07); border:1px solid rgba(239,68,68,0.2); border-radius:14px; padding:20px 24px; }
.od-error-light { background:rgba(254,242,242,0.9); border:1px solid rgba(239,68,68,0.22); border-radius:14px; padding:20px 24px; }

/* ── Scrollbar ── */
.od-root ::-webkit-scrollbar { width:4px; height:4px; }
.od-root ::-webkit-scrollbar-thumb { background:rgba(59,130,246,0.2); border-radius:10px; }
`;

/* ─────────────────────────────────────────────
   TRACKING STATUS COMPONENT
───────────────────────────────────────────── */
const TrackingStatus = ({ currentStatus, tanggalStatusOrder, formatDate, isDark }) => {
  const stepRefs = useRef([]);
  const [lineWidth, setLineWidth] = useState(0);
  const d = isDark;

  const steps = [
    { id: 0, label: "New Order",            desc: "Pengisian data pelanggan",           icon: <FileText className="w-4 h-4" /> },
    { id: 1, label: "Entry",                desc: "Pembukaan order oleh CS",             icon: <ClipboardEdit className="w-4 h-4" /> },
    { id: 2, label: "Diproses - Lapangan",  desc: "Pekerjaan di lapangan",              icon: <HardHat className="w-4 h-4" /> },
    { id: 3, label: "Diproses - Sertifikat",desc: "Upload sertifikat",                  icon: <FileCheck className="w-4 h-4" /> },
    { id: 4, label: "Closed Order",         desc: "Menunggu terbit proforma",           icon: <ClipboardCheck className="w-4 h-4" /> },
    { id: 5, label: "Penerbitan Proforma",  desc: "Menunggu pembayaran",                icon: <Receipt className="w-4 h-4" /> },
    { id: 6, label: "Invoice",              desc: "Invoice siap didistribusikan",       icon: <Wallet className="w-4 h-4" /> },
    { id: 7, label: "Selesai",              desc: "Sertifikat telah didistribusikan",   icon: <PackageCheck className="w-4 h-4" /> },
  ];

  const currentStep = steps.findIndex(s => s.label === currentStatus);
  const isFinished = currentStatus === "Selesai";

  useEffect(() => {
    if (!stepRefs.current.length || currentStep < 0) return;
    const first   = stepRefs.current[0];
    const current = stepRefs.current[currentStep];
    const last    = stepRefs.current[steps.length - 1];
    if (!first || !current) return;

    const firstCenter   = first.getBoundingClientRect().left   + first.offsetWidth / 2;
    const currentCenter = current.getBoundingClientRect().left + current.offsetWidth / 2;
    const lastCenter    = last.getBoundingClientRect().left    + last.offsetWidth  / 2;

    if (currentStep === steps.length - 1) {
      setLineWidth((lastCenter + last.offsetWidth / 2) - firstCenter);
    } else {
      setLineWidth(currentCenter - firstCenter + current.offsetWidth / 2);
    }
  }, [currentStep]);

  const stepCls = (index) => {
    if (index < currentStep)  return d ? "od-step-done-dark"   : "od-step-done-light";
    if (index === currentStep) return d ? "od-step-active-dark" : "od-step-active-light";
    return d ? "od-step-idle-dark" : "od-step-idle-light";
  };

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Title */}
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:20 }}>
        <p className={d ? "od-track-title-dark" : "od-track-title-light"}>Tracking Status Order</p>
        <div className={d ? "od-accent-dark" : "od-accent-light"} style={{ width:48, marginTop:6 }} />
      </div>

      {/* Rail */}
      <div style={{ position:"relative", marginBottom:8 }}>
        <div className={d ? "od-track-rail-dark" : "od-track-rail-light"} style={{ position:"absolute", top:19, left:0, right:0 }} />
        <div className="od-track-fill" style={{ position:"absolute", top:19, left:0, width:`${lineWidth}px` }} />

        {/* Steps */}
        <div style={{ position:"relative", zIndex:10, display:"flex", justifyContent:"space-between" }}>
          {steps.map((step, index) => (
            <div
              key={step.id}
              ref={el => stepRefs.current[index] = el}
              style={{ display:"flex", flexDirection:"column", alignItems:"center", width:`${100/steps.length}%`, maxWidth:120 }}
            >
              <div
                className={stepCls(index)}
                style={{ width:40, height:40, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", transition:"all .3s ease" }}
              >
                {index === currentStep ? <Clock className="w-4 h-4" /> : step.icon}
              </div>
              <p className={d ? "od-track-label-dark" : "od-track-label-light"} style={{ fontSize:10, marginTop:6, textAlign:"center", lineHeight:1.3 }}>
                {step.label}
              </p>
              <p className={`${d ? "od-track-desc-dark" : "od-track-desc-light"} hidden lg:block`} style={{ fontSize:9, marginTop:2, textAlign:"center", lineHeight:1.3, maxWidth:90 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Current status pill */}
      <div style={{ display:"flex", justifyContent:"center", marginTop:16 }}>
        <div className={d ? "od-status-bar-dark" : "od-status-bar-light"}>
          <p className={d ? "od-status-txt-dark" : "od-status-txt-light"} style={{ fontSize:12.5, textAlign:"center" }}>
            Status saat ini:{" "}
            <span style={{ fontWeight:700 }}>{currentStatus || "Belum ada status"}</span>
            {tanggalStatusOrder && (
              <span style={{ opacity:.7 }}> · {formatDate(tanggalStatusOrder)}</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   FIELD ITEM
───────────────────────────────────────────── */
const FieldItem = ({ label, value, isDark }) => (
  <div style={{ padding:"2px 0" }}>
    <p className={isDark ? "od-label-dark" : "od-label-light"}>{label}</p>
    <p className={isDark ? "od-value-dark" : "od-value-light"}>{value || "—"}</p>
  </div>
);

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const OrderDetail = () => {
  const { portofolio, id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);

  const userData  = JSON.parse(localStorage.getItem("user"));
  const userPeran = userData?.peran || "";
  const userBidang = userData?.bidang || "";

  const d = isDark;
  const T = (dark, light) => d ? dark : light;

  useEffect(() => {
    if (!userPeran) { alert("Anda tidak memiliki akses!"); navigate("/"); return; }
    if (userPeran === "admin portofolio" && userBidang !== portofolio) { alert("Anda tidak memiliki akses!"); navigate("/"); return; }
    setMounted(true);

    const fetchOrder = async () => {
      setLoading(true); setError(null);
      try {
        const data = await getOrderById(id);
        data ? setOrder(data) : setError("Order tidak ditemukan.");
      } catch (err) {
        console.error(err); setError("Terjadi kesalahan saat mengambil data.");
      }
      setLoading(false);
    };
    fetchOrder();
    return () => setMounted(false);
  }, [portofolio, userPeran, userBidang, id]);

  const formatDate = (value, includeTime = false) => {
    if (!value) return "—";
    if (value instanceof Timestamp) {
      const opts = { day:"2-digit", month:"long", year:"numeric", ...(includeTime ? { hour:"2-digit", minute:"2-digit" } : {}) };
      return value.toDate().toLocaleDateString("id-ID", opts);
    }
    return value;
  };

  const isEditableByRole = (order, role) => {
    const rf = {
      "admin portofolio": ["pelanggan","statusOrder","tanggalStatusOrder","tanggalSerahOrderKeCs","tanggalPekerjaan","proformaSerahKeOps","proformaSerahKeDukbis","proformaBySistem","jenisSertifikat","keteranganSertifikatPM06","noSiSpk","jenisPekerjaan","namaTongkang","lokasiPekerjaan","estimasiTonase","tonaseDS","nilaiProforma"],
      "koordinator": [],
      "customer service": ["nomorOrder","tanggalOrder"],
      "admin keuangan": ["tanggalStatusOrder","tanggalPengirimanInvoice","tanggalPengirimanFaktur","nomorInvoice","fakturPajak","nilaiInvoice"],
      all: ["distribusiSertifikatPengirim","distribusiSertifikatPengirimTanggal","distribusiSertifikatPenerima","distribusiSertifikatPenerimaTanggal"],
    };
    return [...(rf[role] || []), ...rf.all].every(f => order[f] !== "" && order[f] !== null);
  };

  const handleDelete = async () => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus order ini?")) return;
    try { await deleteOrder(id); alert("Order berhasil dihapus!"); navigate(`/orders/${portofolio}`); }
    catch (err) { console.error(err); alert("Gagal menghapus order."); }
  };

  const showLengkapiButton = () => {
    if (!order) return false;
    if (order.statusOrder === "New Order" && userPeran === "customer service") return true;
    if (["Entry","Diproses - Lapangan","Diproses - Sertifikat","Closed Order"].includes(order.statusOrder) && userPeran === "admin portofolio") return true;
    if (order.statusOrder === "Penerbitan Proforma" && userPeran === "admin keuangan") return true;
    if (order.statusOrder === "Invoice" && ["admin portofolio","admin keuangan"].includes(userPeran)) return true;
    return false;
  };

  const getStatusBadgeCls = (status) => {
    if (!status) return "od-badge badge-default";
    switch (status.toLowerCase()) {
      case "new order":           return "od-badge badge-new-order";
      case "entry":               return "od-badge badge-entry";
      case "diproses - lapangan": return "od-badge badge-lapangan";
      case "diproses - sertifikat": return "od-badge badge-sertifikat";
      case "closed order":        return "od-badge badge-closed";
      case "penerbitan proforma": return "od-badge badge-proforma";
      case "invoice":             return "od-badge badge-invoice";
      case "selesai":             return "od-badge badge-selesai";
      default:                    return "od-badge badge-default";
    }
  };

  const fieldGroups = [
    {
      title: "Informasi Umum", stagger: "od-stagger-2",
      icon: <FileText style={{ width:15, height:15, color: d ? "#60a5fa" : "#2563eb" }} />,
      fields: [
        { key:"pelanggan",              label:"Nama Pelanggan" },
        { key:"statusOrder",            label:"Status Order",                special:"status" },
        { key:"nomorOrder",             label:"Nomor Order" },
        { key:"tanggalOrder",           label:"Tanggal Order",               isDate:true },
        { key:"tanggalSerahOrderKeCs",  label:"Tanggal Penyerahan ke CS",    isDate:true },
      ]
    },
    {
      title: "Detail Pekerjaan", stagger: "od-stagger-3",
      icon: <HardHat style={{ width:15, height:15, color: d ? "#60a5fa" : "#2563eb" }} />,
      fields: [
        { key:"noSiSpk",          label:"Nomor SI/SPK" },
        { key:"jenisPekerjaan",   label:"Jenis Pekerjaan" },
        { key:"lokasiPekerjaan",  label:"Lokasi Pekerjaan" },
        { key:"tanggalPekerjaan", label:"Tanggal Pekerjaan", isDate:true },
        { key:"namaTongkang",     label:"Nama Tongkang" },
        { key:"estimasiTonase",   label:"Estimasi Kuantitas" },
        { key:"tonaseDS",         label:"Tonase DS" },
      ]
    },
    {
      title: "Proforma & Sertifikat", stagger: "od-stagger-4",
      icon: <Award style={{ width:15, height:15, color: d ? "#60a5fa" : "#2563eb" }} />,
      fields: [
        { key:"nilaiProforma",              label:"Nilai Proforma (PAD)",               special:"currency" },
        { key:"proformaSerahKeOps",         label:"Proforma → Operasional",            isDate:true },
        { key:"proformaSerahKeDukbis",      label:"Proforma → Dukbis",                 isDate:true },
        { key:"proformaBySistem",           label:"Proforma by Sistem",                isDate:true },
        { key:"keteranganSertifikatPM06",   label:"Keterangan Sertifikat PM06" },
        { key:"jenisSertifikat",            label:"Jenis Sertifikat" },
        { key:"noSertifikatPM06",           label:"No. Sertifikat PM06" },
        { key:"noSertifikat",               label:"No. Sertifikat" },
      ]
    },
    {
      title: "Informasi Keuangan", stagger: "od-stagger-5",
      icon: <Wallet style={{ width:15, height:15, color: d ? "#60a5fa" : "#2563eb" }} />,
      fields: [
        { key:"nilaiInvoice",               label:"Nilai Invoice (Fee)",    special:"currency" },
        { key:"nomorInvoice",               label:"Nomor Invoice" },
        { key:"fakturPajak",                label:"No. Seri Faktur Pajak" },
        { key:"tanggalPengirimanInvoice",   label:"Tgl. Kirim Invoice",    isDate:true },
        { key:"tanggalPengirimanFaktur",    label:"Tgl. Kirim Faktur",     isDate:true },
      ]
    },
    {
      title: "Distribusi Sertifikat", stagger: "od-stagger-6",
      icon: <Send style={{ width:15, height:15, color: d ? "#60a5fa" : "#2563eb" }} />,
      fields: [
        { key:"distribusiSertifikatPengirim",         label:"Pengirim Sertifikat" },
        { key:"distribusiSertifikatPengirimTanggal",  label:"Tgl. Pengiriman",      isDate:true },
        { key:"distribusiSertifikatPenerima",         label:"Penerima Sertifikat" },
        { key:"distribusiSertifikatPenerimaTanggal",  label:"Tgl. Diterima",        isDate:true },
      ]
    },
    {
      title: "Meta Informasi", stagger: "od-stagger-7",
      icon: <Info style={{ width:15, height:15, color: d ? "#60a5fa" : "#2563eb" }} />,
      fields: [
        { key:"createdBy",    label:"Dibuat Oleh" },
        { key:"lastUpdatedBy",label:"Terakhir Diperbarui Oleh" },
        { key:"createdAt",    label:"Dibuat Pada",         isDate:true, includeTime:true },
        { key:"updatedAt",    label:"Diperbarui Pada",     isDate:true, includeTime:true },
      ]
    },
  ];

  const renderFieldValue = (field, order) => {
    if (!order) return "—";
    if (field.special === "status" && order.tanggalStatusOrder)
      return `${order[field.key]} · ${formatDate(order.tanggalStatusOrder)}`;
    if (field.special === "currency" && order[field.key])
      return `Rp ${Number(order[field.key]).toLocaleString("id-ID")}`;
    if (field.isDate)
      return formatDate(order[field.key], field.includeTime);
    return order[field.key] || "—";
  };

  /* ── Loading ── */
  if (loading && !mounted) {
    return (
      <div className={`od-root ${T("od-page-dark","od-page-light")}`}
        style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh" }}>
        <style>{STYLES}</style>
        <div style={{ textAlign:"center" }}>
          <div className="od-spinner" style={{ margin:"0 auto 16px" }} />
          <p style={{ fontSize:13, color: d ? "rgba(99,148,255,0.5)" : "rgba(37,99,235,0.5)", fontFamily:"DM Sans,sans-serif" }}>
            Memuat data order…
          </p>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className={`od-root ${T("od-page-dark","od-page-light")}`} style={{ padding:"40px 24px" }}>
        <style>{STYLES}</style>
        <div style={{ maxWidth:560, margin:"0 auto" }}>
          <div className={T("od-error-dark","od-error-light")}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
              <AlertTriangle style={{ width:20, height:20, color: d ? "#f87171" : "#dc2626", flexShrink:0 }} />
              <p style={{ fontSize:14, fontWeight:600, color: d ? "#fca5a5" : "#b91c1c" }}>{error}</p>
            </div>
            <button onClick={() => navigate(`/orders/${portofolio}`)} className={T("od-back-dark","od-back-light")}>
              <ArrowLeft style={{ width:14, height:14 }} /> Kembali ke Daftar Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  const canEdit = order && isEditableByRole(order, userPeran);

  return (
    <div className={`od-root ${d ? "od-page-dark" : "od-page-light od-light"}`}
      style={{ padding:"28px 20px 48px", transition:"background .4s ease" }}>
      <style>{STYLES}</style>

      <div style={{ maxWidth:960, margin:"0 auto" }}>

        {/* ── Header ── */}
        <div className="od-mount od-stagger-1" style={{ display:"flex", alignItems:"center", gap:14, marginBottom:24 }}>
          <button
            onClick={() => navigate(`/orders/${portofolio}`)}
            className={T("od-back-dark","od-back-light")}
          >
            <ArrowLeft style={{ width:14, height:14 }} />
            Kembali
          </button>
          <div>
            <p className={T("od-h1-dark","od-h1-light")}>Detail Order</p>
            <div className={T("od-accent-dark","od-accent-light")} style={{ width:60, marginTop:4 }} />
          </div>
        </div>

        {/* ── Main Card ── */}
        <div className={`od-mount od-stagger-1 ${T("od-card-dark","od-card-light")}`} style={{ marginBottom:20 }}>
          <div className={T("od-accent-dark","od-accent-light")} />

          <div style={{ padding:"22px 24px" }}>
            {/* Order info header */}
            {order && (
              <div className={T("od-div-dark","od-div-light")}
                style={{ display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"space-between", gap:12, paddingBottom:18, marginBottom:20 }}>
                <div>
                  <p className={T("od-cust-dark","od-cust-light")}>{order.pelanggan || "—"}</p>
                  <p className={T("od-ordno-dark","od-ordno-light")}>{order.nomorOrder || "—"}</p>
                </div>
                <span className={getStatusBadgeCls(order.statusOrder)}>
                  {order.statusOrder || "—"}
                </span>
              </div>
            )}

            {/* Tracking */}
            {order && (
              <TrackingStatus
                currentStatus={order.statusOrder}
                tanggalStatusOrder={order.tanggalStatusOrder}
                formatDate={formatDate}
                isDark={d}
              />
            )}

            {/* Navigation instruction */}
            {order && (
              <NavigationInstruction currentStatus={order.statusOrder} userPeran={userPeran} />
            )}
          </div>
        </div>

        {/* ── Field Groups ── */}
        {order && fieldGroups.map((group, gi) => (
          <div
            key={gi}
            className={`od-mount ${group.stagger} ${T("od-section-dark","od-section-light")}`}
            style={{ marginBottom:14 }}
          >
            <div className={T("od-sec-head-dark","od-sec-head-light")}>
              {group.icon}
              <p className={T("od-sec-title-dark","od-sec-title-light")}>{group.title}</p>
            </div>
            <div style={{ padding:"18px 20px" }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:"16px 24px" }}>
                {group.fields.map(field => (
                  <FieldItem
                    key={field.key}
                    label={field.label}
                    value={renderFieldValue(field, order)}
                    isDark={d}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* ── Action Buttons ── */}
        {order && userPeran !== "koordinator" && (
          <div className="od-mount od-stagger-7"
            style={{ display:"flex", flexWrap:"wrap", justifyContent:"space-between", alignItems:"center", gap:12, marginTop:8 }}>
            <button onClick={() => navigate(`/orders/${portofolio}`)} className={T("od-btn-back-dark","od-btn-back-light")}>
              <ArrowLeft style={{ width:14, height:14 }} /> Kembali
            </button>
            <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
              {canEdit ? (
                <button onClick={() => navigate(`/orders/${portofolio}/detail/edit/${id}`)} className="od-btn-edit">
                  <Edit style={{ width:14, height:14 }} /> Edit
                </button>
              ) : (
                showLengkapiButton() && (
                  <button onClick={() => navigate(`/orders/${portofolio}/detail/lengkapi/${id}`)} className="od-btn-lengkapi">
                    <Edit style={{ width:14, height:14 }} /> Lengkapi Data
                  </button>
                )
              )}
              {userPeran === "admin portofolio" && userBidang === portofolio && (
                <button onClick={handleDelete} className="od-btn-delete">
                  <Trash2 style={{ width:14, height:14 }} /> Hapus Order
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default OrderDetail;