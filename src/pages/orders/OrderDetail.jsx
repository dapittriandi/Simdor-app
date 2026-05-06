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
  BarChart2, Wallet, Send, Award, Info, ChevronRight, Loader2
} from "lucide-react";

/* ─────────────────────────────────────────────
   STYLES — Premium Redesign
───────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; }

.od-root {
  font-family: 'Plus Jakarta Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* ── Page backgrounds ── */
.od-page-dark {
  background: #080c18;
  background-image:
    radial-gradient(ellipse 80% 50% at 20% -10%, rgba(37,99,235,0.12) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 80% 110%, rgba(99,60,255,0.08) 0%, transparent 50%);
  min-height: 100vh;
}
.od-page-light {
  background: #f4f7fe;
  background-image:
    radial-gradient(ellipse 80% 50% at 20% -10%, rgba(37,99,235,0.07) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 80% 110%, rgba(99,60,255,0.05) 0%, transparent 50%);
  min-height: 100vh;
}

/* ── Animated accent line ── */
@keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
.od-accent {
  height: 1px;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(59,130,246,0.6) 20%,
    rgba(139,92,246,0.8) 50%,
    rgba(59,130,246,0.6) 80%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: shimmer 3s ease-in-out infinite;
}

/* ── Main card ── */
.od-card-dark {
  background: rgba(10,14,28,0.85);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 20px;
  overflow: hidden;
  box-shadow:
    0 1px 0 rgba(255,255,255,0.04) inset,
    0 20px 60px rgba(0,0,0,0.5),
    0 0 0 1px rgba(0,0,0,0.3);
}
.od-card-light {
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(40px) saturate(200%);
  -webkit-backdrop-filter: blur(40px) saturate(200%);
  border: 1px solid rgba(59,130,246,0.12);
  border-radius: 20px;
  overflow: hidden;
  box-shadow:
    0 1px 0 rgba(255,255,255,0.9) inset,
    0 12px 40px rgba(59,130,246,0.08),
    0 0 0 1px rgba(59,130,246,0.06);
}

/* ── Section cards ── */
.od-section-dark {
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
  overflow: hidden;
  transition: border-color .2s ease, box-shadow .2s ease;
}
.od-section-dark:hover {
  border-color: rgba(59,130,246,0.2);
  box-shadow: 0 0 0 1px rgba(59,130,246,0.08), 0 8px 24px rgba(0,0,0,0.2);
}
.od-section-light {
  background: #fff;
  border: 1px solid rgba(59,130,246,0.1);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(59,130,246,0.06);
  transition: border-color .2s ease, box-shadow .2s ease;
}
.od-section-light:hover {
  border-color: rgba(59,130,246,0.2);
  box-shadow: 0 4px 16px rgba(59,130,246,0.1);
}

/* ── Section header ── */
.od-sec-head-dark {
  background: linear-gradient(90deg, rgba(37,99,235,0.1) 0%, rgba(37,99,235,0.03) 100%);
  border-bottom: 1px solid rgba(255,255,255,0.05);
  padding: 14px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.od-sec-head-light {
  background: linear-gradient(90deg, rgba(37,99,235,0.06) 0%, rgba(37,99,235,0.01) 100%);
  border-bottom: 1px solid rgba(59,130,246,0.08);
  padding: 14px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.od-sec-icon-wrap-dark {
  width: 28px; height: 28px;
  background: rgba(37,99,235,0.15);
  border: 1px solid rgba(59,130,246,0.2);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
}
.od-sec-icon-wrap-light {
  width: 28px; height: 28px;
  background: rgba(37,99,235,0.08);
  border: 1px solid rgba(59,130,246,0.15);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
}
.od-sec-title-dark  { font-size: 12.5px; font-weight: 700; color: rgba(147,197,253,0.9); letter-spacing: .06em; text-transform: uppercase; }
.od-sec-title-light { font-size: 12.5px; font-weight: 700; color: #1d4ed8; letter-spacing: .06em; text-transform: uppercase; }

/* ── Field label / value ── */
.od-label-dark  { font-size: 10.5px; font-weight: 600; color: rgba(99,148,255,0.45); letter-spacing: .08em; text-transform: uppercase; margin-bottom: 5px; }
.od-label-light { font-size: 10.5px; font-weight: 600; color: rgba(37,99,235,0.4); letter-spacing: .08em; text-transform: uppercase; margin-bottom: 5px; }
.od-value-dark  { font-size: 13.5px; font-weight: 500; color: #dce6f8; line-height: 1.4; }
.od-value-light { font-size: 13.5px; font-weight: 500; color: #1e3a5f; line-height: 1.4; }
.od-value-mono  { font-family: 'JetBrains Mono', monospace; font-size: 12.5px; }
.od-value-empty-dark  { color: rgba(99,148,255,0.25) !important; font-style: italic; }
.od-value-empty-light { color: rgba(37,99,235,0.25) !important; font-style: italic; }

/* ── Field item container ── */
.od-field-dark {
  padding: 12px 14px;
  border-radius: 10px;
  background: rgba(255,255,255,0.015);
  border: 1px solid rgba(255,255,255,0.04);
  transition: background .15s ease, border-color .15s ease;
}
.od-field-dark:hover { background: rgba(37,99,235,0.06); border-color: rgba(59,130,246,0.12); }
.od-field-light {
  padding: 12px 14px;
  border-radius: 10px;
  background: rgba(248,250,255,0.8);
  border: 1px solid rgba(59,130,246,0.07);
  transition: background .15s ease, border-color .15s ease;
}
.od-field-light:hover { background: rgba(219,234,254,0.5); border-color: rgba(59,130,246,0.15); }

/* ── Header text ── */
.od-h1-dark {
  font-size: 24px;
  font-weight: 800;
  background: linear-gradient(135deg, #93c5fd 0%, #ffffff 50%, #818cf8 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  letter-spacing: -.02em;
}
.od-h1-light {
  font-size: 24px;
  font-weight: 800;
  background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  letter-spacing: -.02em;
}
.od-sub-dark  { font-size: 12px; color: rgba(99,148,255,0.4); margin-top: 3px; font-weight: 400; }
.od-sub-light { font-size: 12px; color: rgba(37,99,235,0.4); margin-top: 3px; font-weight: 400; }

/* ── Back button ── */
.od-back-dark {
  display: flex; align-items: center; gap: 7px;
  padding: 8px 16px; border-radius: 10px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  color: rgba(148,163,220,0.7);
  font-size: 13px; font-weight: 500;
  cursor: pointer;
  transition: all .2s ease;
  font-family: inherit;
}
.od-back-dark:hover {
  background: rgba(37,99,235,0.12);
  border-color: rgba(59,130,246,0.3);
  color: #93c5fd;
  transform: translateX(-3px);
}
.od-back-light {
  display: flex; align-items: center; gap: 7px;
  padding: 8px 16px; border-radius: 10px;
  background: #fff;
  border: 1px solid rgba(59,130,246,0.15);
  color: #4b6ea8;
  font-size: 13px; font-weight: 500;
  cursor: pointer;
  transition: all .2s ease;
  box-shadow: 0 1px 4px rgba(59,130,246,0.08);
  font-family: inherit;
}
.od-back-light:hover {
  background: #eff6ff;
  border-color: rgba(37,99,235,0.3);
  color: #1d4ed8;
  transform: translateX(-3px);
}

/* ── Customer info area ── */
.od-cust-dark  { font-size: 20px; font-weight: 800; color: #f1f5fd; letter-spacing: -.02em; }
.od-cust-light { font-size: 20px; font-weight: 800; color: #0f1f3d; letter-spacing: -.02em; }
.od-ordno-dark  { font-size: 12px; color: rgba(99,148,255,0.5); margin-top: 4px; font-family: 'JetBrains Mono', monospace; }
.od-ordno-light { font-size: 12px; color: rgba(37,99,235,0.45); margin-top: 4px; font-family: 'JetBrains Mono', monospace; }

/* ── Status badges ── */
.od-badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 14px; border-radius: 999px;
  font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase;
}
.od-badge::before { content: ''; width: 5px; height: 5px; border-radius: 50%; background: currentColor; opacity: .7; }
.badge-new-order    { background: rgba(148,163,184,0.1);  border: 1px solid rgba(148,163,184,0.2);  color: #94a3b8; }
.badge-entry        { background: rgba(34,197,94,0.1);    border: 1px solid rgba(34,197,94,0.25);   color: #22c55e; }
.badge-lapangan     { background: rgba(59,130,246,0.12);  border: 1px solid rgba(59,130,246,0.3);   color: #60a5fa; }
.badge-sertifikat   { background: rgba(139,92,246,0.1);   border: 1px solid rgba(139,92,246,0.25);  color: #a78bfa; }
.badge-closed       { background: rgba(249,115,22,0.1);   border: 1px solid rgba(249,115,22,0.25);  color: #fb923c; }
.badge-proforma     { background: rgba(234,179,8,0.1);    border: 1px solid rgba(234,179,8,0.25);   color: #facc15; }
.badge-invoice      { background: rgba(20,184,166,0.1);   border: 1px solid rgba(20,184,166,0.25);  color: #2dd4bf; }
.badge-selesai      { background: rgba(34,197,94,0.12);   border: 1px solid rgba(34,197,94,0.3);    color: #4ade80; }
.badge-default      { background: rgba(239,68,68,0.1);    border: 1px solid rgba(239,68,68,0.25);   color: #f87171; }

/* Light overrides */
.od-light .badge-new-order    { background: rgba(100,116,139,0.08); border-color: rgba(100,116,139,0.2); color: #475569; }
.od-light .badge-entry        { background: rgba(22,163,74,0.08);   border-color: rgba(22,163,74,0.2);   color: #16a34a; }
.od-light .badge-lapangan     { background: rgba(37,99,235,0.08);   border-color: rgba(37,99,235,0.2);   color: #2563eb; }
.od-light .badge-sertifikat   { background: rgba(109,40,217,0.08);  border-color: rgba(109,40,217,0.2);  color: #7c3aed; }
.od-light .badge-closed       { background: rgba(194,65,12,0.08);   border-color: rgba(194,65,12,0.2);   color: #c2410c; }
.od-light .badge-proforma     { background: rgba(161,98,7,0.08);    border-color: rgba(161,98,7,0.2);    color: #92400e; }
.od-light .badge-invoice      { background: rgba(15,118,110,0.08);  border-color: rgba(15,118,110,0.2);  color: #0f766e; }
.od-light .badge-selesai      { background: rgba(21,128,61,0.08);   border-color: rgba(21,128,61,0.2);   color: #15803d; }
.od-light .badge-default      { background: rgba(185,28,28,0.08);   border-color: rgba(185,28,28,0.2);   color: #b91c1c; }

/* ── Dividers ── */
.od-div-dark  { border-bottom: 1px solid rgba(255,255,255,0.06); }
.od-div-light { border-bottom: 1px solid rgba(59,130,246,0.08); }

/* ── Status current pill ── */
.od-status-pill-dark  { background: rgba(37,99,235,0.12); border: 1px solid rgba(59,130,246,0.2); border-radius: 999px; padding: 8px 18px; display: inline-flex; align-items: center; gap: 8px; }
.od-status-pill-light { background: rgba(219,234,254,0.8); border: 1px solid rgba(59,130,246,0.2); border-radius: 999px; padding: 8px 18px; display: inline-flex; align-items: center; gap: 8px; }
.od-status-dot { width: 7px; height: 7px; border-radius: 50%; background: #3b82f6; box-shadow: 0 0 8px rgba(59,130,246,0.7); }
@keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(1.4)} }
.od-status-dot { animation: pulseDot 2s ease-in-out infinite; }

/* ── Tracking step circles ── */
@keyframes stepPop { from{transform:scale(0.7);opacity:0} to{transform:scale(1);opacity:1} }
.od-step-circle {
  width: 38px; height: 38px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  transition: all .3s cubic-bezier(0.34,1.56,0.64,1);
  flex-shrink: 0;
}
.od-step-done-dark   { background: rgba(37,99,235,0.2);  border: 2px solid rgba(59,130,246,0.4);  color: #60a5fa; }
.od-step-active-dark { background: linear-gradient(135deg,#1d4ed8,#6366f1); border: 2px solid rgba(99,102,241,0.5); color: #fff; box-shadow: 0 0 20px rgba(59,130,246,0.5), 0 0 40px rgba(99,102,241,0.2); }
.od-step-idle-dark   { background: rgba(255,255,255,0.02); border: 2px solid rgba(255,255,255,0.07); color: rgba(148,163,184,0.3); }
.od-step-done-light   { background: rgba(219,234,254,0.9); border: 2px solid rgba(59,130,246,0.35); color: #2563eb; }
.od-step-active-light { background: linear-gradient(135deg,#2563eb,#4f46e5); border: 2px solid transparent; color: #fff; box-shadow: 0 0 18px rgba(37,99,235,0.4), 0 4px 12px rgba(79,70,229,0.3); }
.od-step-idle-light   { background: rgba(241,245,249,0.8); border: 2px solid rgba(59,130,246,0.1); color: rgba(148,163,184,0.5); }

/* ── Progress rail ── */
.od-track-rail-dark  { height: 2px; background: rgba(255,255,255,0.05); border-radius: 99px; }
.od-track-rail-light { height: 2px; background: rgba(59,130,246,0.1);  border-radius: 99px; }
.od-track-fill {
  height: 2px;
  background: linear-gradient(90deg, #1d4ed8, #6366f1, #60a5fa);
  border-radius: 99px;
  transition: width .8s cubic-bezier(0.22,1,0.36,1);
  box-shadow: 0 0 8px rgba(99,102,241,0.4);
}

/* ── Track labels ── */
.od-track-label-dark  { font-size: 9.5px; color: rgba(147,197,253,0.65); font-weight: 600; margin-top: 8px; text-align: center; letter-spacing: .02em; line-height: 1.3; }
.od-track-label-light { font-size: 9.5px; color: #3b82f6; font-weight: 600; margin-top: 8px; text-align: center; letter-spacing: .02em; line-height: 1.3; }
.od-track-desc-dark  { font-size: 8.5px; color: rgba(99,148,255,0.35); text-align: center; margin-top: 2px; line-height: 1.3; }
.od-track-desc-light { font-size: 8.5px; color: rgba(37,99,235,0.35); text-align: center; margin-top: 2px; line-height: 1.3; }
.od-track-title-dark  { font-size: 14px; font-weight: 700; color: #93c5fd; letter-spacing: -.01em; }
.od-track-title-light { font-size: 14px; font-weight: 700; color: #2563eb; letter-spacing: -.01em; }

/* ── Action buttons ── */
.od-btn-base {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 11px 22px; border-radius: 12px;
  font-size: 13px; font-weight: 600;
  cursor: pointer; transition: all .2s cubic-bezier(0.22,1,0.36,1);
  font-family: inherit; border: none; white-space: nowrap;
}
.od-btn-back-dark  { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08) !important; color: rgba(148,163,220,0.8); }
.od-btn-back-dark:hover  { background: rgba(37,99,235,0.12); border-color: rgba(59,130,246,0.25) !important; color: #bfdbfe; }
.od-btn-back-light { background: #fff; border: 1px solid rgba(59,130,246,0.18) !important; color: #4b6ea8; box-shadow: 0 1px 4px rgba(59,130,246,0.08); }
.od-btn-back-light:hover { background: #eff6ff; border-color: rgba(37,99,235,0.3) !important; color: #1d4ed8; }

.od-btn-edit {
  background: linear-gradient(135deg, #d97706, #f59e0b);
  color: #fff;
  box-shadow: 0 4px 16px rgba(245,158,11,0.3);
}
.od-btn-edit:hover { background: linear-gradient(135deg,#b45309,#d97706); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(245,158,11,0.4); }

.od-btn-lengkapi {
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  color: #fff;
  box-shadow: 0 4px 16px rgba(37,99,235,0.3);
}
.od-btn-lengkapi:hover { background: linear-gradient(135deg,#1d4ed8,#4338ca); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(37,99,235,0.4); }

.od-btn-delete {
  background: rgba(239,68,68,0.08);
  border: 1px solid rgba(239,68,68,0.2) !important;
  color: #f87171;
}
.od-btn-delete:hover {
  background: rgba(239,68,68,0.15);
  border-color: rgba(239,68,68,0.35) !important;
  color: #fca5a5;
  transform: translateY(-2px);
}

/* ── Loading ── */
@keyframes spinFade { 0%{transform:rotate(0deg);opacity:.7} 50%{opacity:1} 100%{transform:rotate(360deg);opacity:.7} }
.od-spin { animation: spinFade 1.2s linear infinite; }

/* ── Mount animations ── */
@keyframes odFadeUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
.od-mount { animation: odFadeUp .5s cubic-bezier(0.22,1,0.36,1) both; }
.od-stagger-1 { animation-delay: .04s; }
.od-stagger-2 { animation-delay: .09s; }
.od-stagger-3 { animation-delay: .14s; }
.od-stagger-4 { animation-delay: .19s; }
.od-stagger-5 { animation-delay: .24s; }
.od-stagger-6 { animation-delay: .29s; }
.od-stagger-7 { animation-delay: .34s; }

/* ── Error card ── */
.od-error-dark  { background: rgba(239,68,68,0.07); border: 1px solid rgba(239,68,68,0.18); border-radius: 16px; padding: 24px; }
.od-error-light { background: #fff8f8; border: 1px solid rgba(239,68,68,0.18); border-radius: 16px; padding: 24px; }

/* ── Currency badge ── */
.od-currency-dark  { font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 600; color: #4ade80; }
.od-currency-light { font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 600; color: #16a34a; }

/* ── Breadcrumb ── */
.od-breadcrumb-dark  { font-size: 11.5px; color: rgba(99,148,255,0.45); display: flex; align-items: center; gap: 5px; }
.od-breadcrumb-light { font-size: 11.5px; color: rgba(37,99,235,0.4);  display: flex; align-items: center; gap: 5px; }

/* ── Summary strip ── */
.od-summary-dark  { background: rgba(37,99,235,0.07); border: 1px solid rgba(59,130,246,0.12); border-radius: 12px; padding: 14px 18px; display: flex; flex-wrap: wrap; gap: 20px; }
.od-summary-light { background: rgba(239,246,255,0.9); border: 1px solid rgba(59,130,246,0.12); border-radius: 12px; padding: 14px 18px; display: flex; flex-wrap: wrap; gap: 20px; }
.od-summary-item { display: flex; flex-direction: column; gap: 3px; }
.od-summary-key-dark  { font-size: 10px; font-weight: 600; color: rgba(99,148,255,0.45); letter-spacing: .08em; text-transform: uppercase; }
.od-summary-key-light { font-size: 10px; font-weight: 600; color: rgba(37,99,235,0.4);  letter-spacing: .08em; text-transform: uppercase; }
.od-summary-val-dark  { font-size: 13px; font-weight: 600; color: #c7d7f8; }
.od-summary-val-light { font-size: 13px; font-weight: 600; color: #1e3a5f; }

/* ── Scrollbar ── */
.od-root ::-webkit-scrollbar { width: 4px; height: 4px; }
.od-root ::-webkit-scrollbar-track { background: transparent; }
.od-root ::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.2); border-radius: 10px; }
.od-root ::-webkit-scrollbar-thumb:hover { background: rgba(59,130,246,0.35); }
`;

/* ─────────────────────────────────────────────
   TRACKING STATUS COMPONENT
───────────────────────────────────────────── */
const TrackingStatus = ({ currentStatus, tanggalStatusOrder, formatDate, isDark }) => {
  const stepRefs = useRef([]);
  const [lineWidth, setLineWidth] = useState(0);
  const d = isDark;

  const steps = [
    { id: 0, label: "New Order",              desc: "Data pelanggan",               icon: <FileText size={14} /> },
    { id: 1, label: "Entry",                  desc: "Pembukaan oleh CS",            icon: <ClipboardEdit size={14} /> },
    { id: 2, label: "Diproses - Lapangan",    desc: "Pekerjaan lapangan",           icon: <HardHat size={14} /> },
    { id: 3, label: "Diproses - Sertifikat",  desc: "Upload sertifikat",            icon: <FileCheck size={14} /> },
    { id: 4, label: "Closed Order",           desc: "Menunggu proforma",            icon: <ClipboardCheck size={14} /> },
    { id: 5, label: "Penerbitan Proforma",    desc: "Menunggu pembayaran",          icon: <Receipt size={14} /> },
    { id: 6, label: "Invoice",                desc: "Siap distribusi",              icon: <Wallet size={14} /> },
    { id: 7, label: "Selesai",                desc: "Sertifikat terkirim",          icon: <PackageCheck size={14} /> },
  ];

  const currentStep = steps.findIndex(s => s.label === currentStatus);

  useEffect(() => {
    if (!stepRefs.current.length || currentStep < 0) return;
    const first   = stepRefs.current[0];
    const current = stepRefs.current[currentStep];
    const last    = stepRefs.current[steps.length - 1];
    if (!first || !current || !last) return;

    const firstRect   = first.getBoundingClientRect();
    const currentRect = current.getBoundingClientRect();
    const lastRect    = last.getBoundingClientRect();

    const firstCenter   = firstRect.left + first.offsetWidth / 2;
    const currentCenter = currentRect.left + current.offsetWidth / 2;

    if (currentStep === steps.length - 1) {
      setLineWidth((lastRect.left + last.offsetWidth / 2) - firstCenter);
    } else {
      setLineWidth(currentCenter - firstCenter + current.offsetWidth / 2);
    }
  }, [currentStep]);

  const stepCls = (index) => {
    if (index < currentStep)  return d ? "od-step-done-dark"   : "od-step-done-light";
    if (index === currentStep) return d ? "od-step-active-dark" : "od-step-active-light";
    return d ? "od-step-idle-dark" : "od-step-idle-light";
  };

  const completedCount = currentStep >= 0 ? currentStep : 0;
  const progressPct = Math.round((completedCount / (steps.length - 1)) * 100);

  return (
    <div style={{ marginBottom: 28 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32,
            background: d ? "rgba(37,99,235,0.15)" : "rgba(37,99,235,0.1)",
            border: `1px solid ${d ? "rgba(59,130,246,0.25)" : "rgba(59,130,246,0.18)"}`,
            borderRadius: 9,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <BarChart2 size={15} color={d ? "#60a5fa" : "#2563eb"} />
          </div>
          <p className={d ? "od-track-title-dark" : "od-track-title-light"}>Tracking Progress</p>
        </div>
        {/* Progress badge */}
        <div style={{
          padding: "4px 12px",
          background: d ? "rgba(37,99,235,0.12)" : "rgba(219,234,254,0.9)",
          border: `1px solid ${d ? "rgba(59,130,246,0.2)" : "rgba(59,130,246,0.18)"}`,
          borderRadius: 999,
          display: "flex", alignItems: "center", gap: 6
        }}>
          <div style={{
            width: 32, height: 4,
            background: d ? "rgba(255,255,255,0.05)" : "rgba(59,130,246,0.1)",
            borderRadius: 99, overflow: "hidden"
          }}>
            <div style={{
              height: "100%",
              width: `${progressPct}%`,
              background: "linear-gradient(90deg,#2563eb,#818cf8)",
              borderRadius: 99,
              transition: "width .8s ease"
            }} />
          </div>
          <span style={{
            fontSize: 11, fontWeight: 700,
            color: d ? "#93c5fd" : "#2563eb",
            letterSpacing: ".02em"
          }}>{progressPct}%</span>
        </div>
      </div>

      {/* Rail + Steps */}
      <div style={{ position: "relative", paddingBottom: 8 }}>
        <div className={d ? "od-track-rail-dark" : "od-track-rail-light"}
          style={{ position: "absolute", top: 19, left: 0, right: 0 }} />
        <div className="od-track-fill"
          style={{ position: "absolute", top: 19, left: 0, width: `${lineWidth}px` }} />

        <div style={{ position: "relative", zIndex: 10, display: "flex", justifyContent: "space-between" }}>
          {steps.map((step, index) => (
            <div
              key={step.id}
              ref={el => stepRefs.current[index] = el}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", width: `${100/steps.length}%`, maxWidth: 110 }}
            >
              <div className={`od-step-circle ${stepCls(index)}`}>
                {index === currentStep
                  ? <Clock size={14} />
                  : index < currentStep
                    ? <Check size={13} />
                    : step.icon
                }
              </div>
              <p className={d ? "od-track-label-dark" : "od-track-label-light"}>
                {step.label}
              </p>
              <p className={`${d ? "od-track-desc-dark" : "od-track-desc-light"} hidden lg:block`}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Current status pill */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
        <div className={d ? "od-status-pill-dark" : "od-status-pill-light"}>
          <div className="od-status-dot" />
          <span style={{
            fontSize: 12.5, fontWeight: 600,
            color: d ? "rgba(147,197,253,0.9)" : "#1d4ed8"
          }}>
            Status:{" "}
            <span style={{ fontWeight: 800 }}>{currentStatus || "Belum ada status"}</span>
          </span>
          {tanggalStatusOrder && (
            <span style={{
              fontSize: 11.5,
              color: d ? "rgba(99,148,255,0.5)" : "rgba(37,99,235,0.5)",
              fontWeight: 500, marginLeft: 4
            }}>
              · {formatDate(tanggalStatusOrder)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   FIELD ITEM
───────────────────────────────────────────── */
const FieldItem = ({ label, value, isDark, isCurrency, isMono }) => {
  const empty = !value || value === "—";
  const d = isDark;
  return (
    <div className={d ? "od-field-dark" : "od-field-light"}>
      <p className={d ? "od-label-dark" : "od-label-light"}>{label}</p>
      <p className={
        isCurrency
          ? (d ? "od-currency-dark" : "od-currency-light")
          : `${d ? "od-value-dark" : "od-value-light"} ${isMono ? "od-value-mono" : ""} ${empty ? (d ? "od-value-empty-dark" : "od-value-empty-light") : ""}`
      }>
        {value || "—"}
      </p>
    </div>
  );
};

/* ─────────────────────────────────────────────
   SECTION CARD
───────────────────────────────────────────── */
const SectionCard = ({ title, icon, children, isDark, staggerClass }) => {
  const d = isDark;
  return (
    <div className={`od-mount ${staggerClass} ${d ? "od-section-dark" : "od-section-light"}`}
      style={{ marginBottom: 12 }}>
      <div className={d ? "od-sec-head-dark" : "od-sec-head-light"}>
        <div className={d ? "od-sec-icon-wrap-dark" : "od-sec-icon-wrap-light"}>
          {icon}
        </div>
        <p className={d ? "od-sec-title-dark" : "od-sec-title-light"}>{title}</p>
      </div>
      <div style={{ padding: "18px 20px" }}>
        {children}
      </div>
    </div>
  );
};

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

  const userData   = JSON.parse(localStorage.getItem("user"));
  const userPeran  = userData?.peran  || "";
  const userBidang = userData?.bidang || "";

  const d = isDark;
  const T = (dark, light) => d ? dark : light;

  useEffect(() => {
    if (!userPeran) { alert("Anda tidak memiliki akses!"); navigate("/"); return; }
    if (userPeran === "admin portofolio" && userBidang !== portofolio) {
      alert("Anda tidak memiliki akses!"); navigate("/"); return;
    }
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
      const opts = {
        day: "2-digit", month: "short", year: "numeric",
        ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {})
      };
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
      case "new order":              return "od-badge badge-new-order";
      case "entry":                  return "od-badge badge-entry";
      case "diproses - lapangan":    return "od-badge badge-lapangan";
      case "diproses - sertifikat":  return "od-badge badge-sertifikat";
      case "closed order":           return "od-badge badge-closed";
      case "penerbitan proforma":    return "od-badge badge-proforma";
      case "invoice":                return "od-badge badge-invoice";
      case "selesai":                return "od-badge badge-selesai";
      default:                       return "od-badge badge-default";
    }
  };

  const renderFieldValue = (field, order) => {
    if (!order) return "—";
    if (field.special === "status" && order.tanggalStatusOrder)
      return `${order[field.key]} · ${formatDate(order.tanggalStatusOrder)}`;
    if (field.special === "currency" && order[field.key])
      return `Rp ${Number(order[field.key]).toLocaleString("id-ID")}`;
    if (field.isDate) return formatDate(order[field.key], field.includeTime);
    return order[field.key] || "—";
  };

  const iconColor = d ? "#60a5fa" : "#2563eb";

  /* ── Loading ── */
  if (loading && !mounted) {
    return (
      <div className={`od-root ${T("od-page-dark","od-page-light")}`}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <style>{STYLES}</style>
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <Loader2 size={36} color={d ? "#3b82f6" : "#2563eb"} className="od-spin" />
          </div>
          <p style={{ fontSize: 13.5, color: d ? "rgba(147,197,253,0.6)" : "rgba(37,99,235,0.5)", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 500 }}>
            Memuat data order…
          </p>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className={`od-root ${T("od-page-dark","od-page-light")}`} style={{ padding: "40px 24px" }}>
        <style>{STYLES}</style>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div className={T("od-error-dark","od-error-light")}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 36, height: 36,
                background: d ? "rgba(239,68,68,0.1)" : "rgba(254,242,242,.9)",
                border: `1px solid ${d ? "rgba(239,68,68,0.2)" : "rgba(239,68,68,0.2)"}`,
                borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0
              }}>
                <AlertTriangle size={16} color={d ? "#f87171" : "#dc2626"} />
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: d ? "#fca5a5" : "#b91c1c" }}>{error}</p>
            </div>
            <button
              onClick={() => navigate(`/orders/${portofolio}`)}
              className={`od-btn-base ${T("od-btn-back-dark","od-btn-back-light")}`}
              style={{ border: "1px solid" }}
            >
              <ArrowLeft size={14} /> Kembali ke Daftar Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  const canEdit = order && isEditableByRole(order, userPeran);

  return (
    <div
      className={`od-root ${d ? "od-page-dark" : "od-page-light od-light"}`}
      style={{ padding: "28px 20px 60px", transition: "background .4s ease" }}
    >
      <style>{STYLES}</style>

      <div style={{ maxWidth: 980, margin: "0 auto" }}>

        {/* ── Breadcrumb + Header ── */}
        <div className="od-mount od-stagger-1" style={{ marginBottom: 22 }}>
          {/* Breadcrumb */}
          <div className={T("od-breadcrumb-dark","od-breadcrumb-light")} style={{ marginBottom: 14 }}>
            <span style={{ cursor: "pointer", opacity: .7 }} onClick={() => navigate("/")}>Beranda</span>
            <ChevronRight size={11} />
            <span style={{ cursor: "pointer", opacity: .7 }} onClick={() => navigate(`/orders/${portofolio}`)}>
              Order {portofolio}
            </span>
            <ChevronRight size={11} />
            <span style={{ fontWeight: 600, color: d ? "rgba(147,197,253,0.7)" : "#2563eb" }}>
              Detail
            </span>
          </div>

          {/* Header row */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button
              onClick={() => navigate(`/orders/${portofolio}`)}
              className={T("od-back-dark","od-back-light")}
            >
              <ArrowLeft size={14} />
              Kembali
            </button>
            <div>
              <p className={T("od-h1-dark","od-h1-light")}>Detail Order</p>
              <div className="od-accent" style={{ width: 64, marginTop: 5 }} />
            </div>
          </div>
        </div>

        {/* ── Main Card ── */}
        <div className={`od-mount od-stagger-1 ${T("od-card-dark","od-card-light")}`} style={{ marginBottom: 16 }}>
          <div className="od-accent" />

          <div style={{ padding: "24px 26px" }}>
            {/* Order info header */}
            {order && (
              <div className={T("od-div-dark","od-div-light")}
                style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 14, paddingBottom: 20, marginBottom: 22 }}>
                <div>
                  <p className={T("od-cust-dark","od-cust-light")}>{order.pelanggan || "—"}</p>
                  <p className={T("od-ordno-dark","od-ordno-light")}>
                    #{order.nomorOrder || "—"}
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                  <span className={getStatusBadgeCls(order.statusOrder)}>
                    {order.statusOrder || "—"}
                  </span>
                  {order.tanggalOrder && (
                    <span style={{
                      fontSize: 11, color: d ? "rgba(99,148,255,0.45)" : "rgba(37,99,235,0.4)",
                      fontWeight: 500
                    }}>
                      {formatDate(order.tanggalOrder)}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Quick summary strip */}
            {order && (order.jenisPekerjaan || order.lokasiPekerjaan || order.nilaiProforma || order.nomorOrder) && (
              <div className={T("od-summary-dark","od-summary-light")} style={{ marginBottom: 22 }}>
                {order.jenisPekerjaan && (
                  <div className="od-summary-item">
                    <span className={T("od-summary-key-dark","od-summary-key-light")}>Jenis Pekerjaan</span>
                    <span className={T("od-summary-val-dark","od-summary-val-light")}>{order.jenisPekerjaan}</span>
                  </div>
                )}
                {order.lokasiPekerjaan && (
                  <div className="od-summary-item">
                    <span className={T("od-summary-key-dark","od-summary-key-light")}>Lokasi</span>
                    <span className={T("od-summary-val-dark","od-summary-val-light")}>{order.lokasiPekerjaan}</span>
                  </div>
                )}
                {order.nilaiProforma && (
                  <div className="od-summary-item">
                    <span className={T("od-summary-key-dark","od-summary-key-light")}>Nilai Proforma</span>
                    <span style={{
                      fontSize: 13, fontWeight: 700,
                      color: d ? "#4ade80" : "#15803d",
                      fontFamily: "'JetBrains Mono',monospace"
                    }}>
                      Rp {Number(order.nilaiProforma).toLocaleString("id-ID")}
                    </span>
                  </div>
                )}
                {order.estimasiTonase && (
                  <div className="od-summary-item">
                    <span className={T("od-summary-key-dark","od-summary-key-light")}>Est. Tonase</span>
                    <span className={T("od-summary-val-dark","od-summary-val-light")}>{order.estimasiTonase}</span>
                  </div>
                )}
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
        {order && (
          <>
            {/* Informasi Umum */}
            <SectionCard
              title="Informasi Umum" staggerClass="od-stagger-2" isDark={d}
              icon={<FileText size={13} color={iconColor} />}
            >
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10 }}>
                {[
                  { key:"pelanggan",             label:"Nama Pelanggan" },
                  { key:"statusOrder",           label:"Status Order",               special:"status" },
                  { key:"nomorOrder",            label:"Nomor Order",                isMono: true },
                  { key:"tanggalOrder",          label:"Tanggal Order",              isDate:true },
                  { key:"tanggalSerahOrderKeCs", label:"Tgl. Penyerahan ke CS",     isDate:true },
                ].map(f => (
                  <FieldItem
                    key={f.key} label={f.label}
                    value={renderFieldValue(f, order)}
                    isDark={d} isMono={f.isMono}
                  />
                ))}
              </div>
            </SectionCard>

            {/* Detail Pekerjaan */}
            <SectionCard
              title="Detail Pekerjaan" staggerClass="od-stagger-3" isDark={d}
              icon={<HardHat size={13} color={iconColor} />}
            >
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10 }}>
                {[
                  { key:"noSiSpk",          label:"Nomor SI/SPK",       isMono: true },
                  { key:"jenisPekerjaan",   label:"Jenis Pekerjaan" },
                  { key:"lokasiPekerjaan",  label:"Lokasi Pekerjaan" },
                  { key:"tanggalPekerjaan", label:"Tanggal Pekerjaan",   isDate:true },
                  { key:"namaTongkang",     label:"Nama Tongkang" },
                  { key:"estimasiTonase",   label:"Estimasi Kuantitas" },
                  { key:"tonaseDS",         label:"Tonase DS" },
                ].map(f => (
                  <FieldItem
                    key={f.key} label={f.label}
                    value={renderFieldValue(f, order)}
                    isDark={d} isMono={f.isMono}
                  />
                ))}
              </div>
            </SectionCard>

            {/* Proforma & Sertifikat */}
            <SectionCard
              title="Proforma & Sertifikat" staggerClass="od-stagger-4" isDark={d}
              icon={<Award size={13} color={iconColor} />}
            >
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10 }}>
                {[
                  { key:"nilaiProforma",             label:"Nilai Proforma (PAD)",    special:"currency" },
                  { key:"proformaSerahKeOps",        label:"Proforma → Operasional",  isDate:true },
                  { key:"proformaSerahKeDukbis",     label:"Proforma → Dukbis",       isDate:true },
                  { key:"proformaBySistem",          label:"Proforma by Sistem",      isDate:true },
                  { key:"keteranganSertifikatPM06",  label:"Ket. Sertifikat PM06" },
                  { key:"jenisSertifikat",           label:"Jenis Sertifikat" },
                  { key:"noSertifikatPM06",          label:"No. Sertifikat PM06",     isMono: true },
                  { key:"noSertifikat",              label:"No. Sertifikat",          isMono: true },
                ].map(f => (
                  <FieldItem
                    key={f.key} label={f.label}
                    value={renderFieldValue(f, order)}
                    isDark={d}
                    isCurrency={f.special === "currency"}
                    isMono={f.isMono}
                  />
                ))}
              </div>
            </SectionCard>

            {/* Informasi Keuangan */}
            <SectionCard
              title="Informasi Keuangan" staggerClass="od-stagger-5" isDark={d}
              icon={<Wallet size={13} color={iconColor} />}
            >
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10 }}>
                {[
                  { key:"nilaiInvoice",              label:"Nilai Invoice (Fee)",    special:"currency" },
                  { key:"nomorInvoice",              label:"Nomor Invoice",           isMono: true },
                  { key:"fakturPajak",               label:"No. Seri Faktur Pajak",  isMono: true },
                  { key:"tanggalPengirimanInvoice",  label:"Tgl. Kirim Invoice",     isDate:true },
                  { key:"tanggalPengirimanFaktur",   label:"Tgl. Kirim Faktur",      isDate:true },
                ].map(f => (
                  <FieldItem
                    key={f.key} label={f.label}
                    value={renderFieldValue(f, order)}
                    isDark={d}
                    isCurrency={f.special === "currency"}
                    isMono={f.isMono}
                  />
                ))}
              </div>
            </SectionCard>

            {/* Distribusi Sertifikat */}
            <SectionCard
              title="Distribusi Sertifikat" staggerClass="od-stagger-6" isDark={d}
              icon={<Send size={13} color={iconColor} />}
            >
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10 }}>
                {[
                  { key:"distribusiSertifikatPengirim",        label:"Pengirim Sertifikat" },
                  { key:"distribusiSertifikatPengirimTanggal", label:"Tgl. Pengiriman",     isDate:true },
                  { key:"distribusiSertifikatPenerima",        label:"Penerima Sertifikat" },
                  { key:"distribusiSertifikatPenerimaTanggal", label:"Tgl. Diterima",       isDate:true },
                ].map(f => (
                  <FieldItem
                    key={f.key} label={f.label}
                    value={renderFieldValue(f, order)}
                    isDark={d}
                  />
                ))}
              </div>
            </SectionCard>

            {/* Meta Informasi */}
            <SectionCard
              title="Meta Informasi" staggerClass="od-stagger-7" isDark={d}
              icon={<Info size={13} color={iconColor} />}
            >
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10 }}>
                {[
                  { key:"createdBy",     label:"Dibuat Oleh" },
                  { key:"lastUpdatedBy", label:"Terakhir Diperbarui Oleh" },
                  { key:"createdAt",     label:"Dibuat Pada",         isDate:true, includeTime:true },
                  { key:"updatedAt",     label:"Diperbarui Pada",     isDate:true, includeTime:true },
                ].map(f => (
                  <FieldItem
                    key={f.key} label={f.label}
                    value={renderFieldValue(f, order)}
                    isDark={d}
                  />
                ))}
              </div>
            </SectionCard>
          </>
        )}

        {/* ── Action Buttons ── */}
        {order && userPeran !== "koordinator" && (
          <div
            className="od-mount od-stagger-7"
            style={{
              display: "flex", flexWrap: "wrap",
              justifyContent: "space-between", alignItems: "center",
              gap: 12, marginTop: 16,
              padding: "18px 20px",
              background: d ? "rgba(255,255,255,0.015)" : "rgba(255,255,255,0.8)",
              border: `1px solid ${d ? "rgba(255,255,255,0.06)" : "rgba(59,130,246,0.1)"}`,
              borderRadius: 16,
              backdropFilter: "blur(20px)"
            }}
          >
            <button
              onClick={() => navigate(`/orders/${portofolio}`)}
              className={`od-btn-base ${T("od-btn-back-dark","od-btn-back-light")}`}
              style={{ border: "1px solid" }}
            >
              <ArrowLeft size={14} /> Kembali
            </button>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {canEdit ? (
                <button
                  onClick={() => navigate(`/orders/${portofolio}/detail/edit/${id}`)}
                  className="od-btn-base od-btn-edit"
                >
                  <Edit size={14} /> Edit Order
                </button>
              ) : (
                showLengkapiButton() && (
                  <button
                    onClick={() => navigate(`/orders/${portofolio}/detail/lengkapi/${id}`)}
                    className="od-btn-base od-btn-lengkapi"
                  >
                    <Edit size={14} /> Lengkapi Data
                  </button>
                )
              )}
              {userPeran === "admin portofolio" && userBidang === portofolio && (
                <button
                  onClick={handleDelete}
                  className={`od-btn-base od-btn-delete`}
                  style={{ border: "1px solid" }}
                >
                  <Trash2 size={14} /> Hapus Order
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