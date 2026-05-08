import { useRef, useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById, deleteOrder } from "../../services/orderServices";
import NavigationInstruction from "../../utils/NavigationInstruction";
import { Timestamp } from "firebase/firestore";
import { useTheme } from "../../components/layout/ThemeContext";
import {
  Edit, Trash2, ArrowLeft, FileText, AlertTriangle, Check, Clock,
  RefreshCw, CheckCircle, Circle, ClipboardEdit, HardHat,
  FileCheck, ClipboardCheck, Receipt, PackageCheck,
  BarChart2, Wallet, Send, Award, Info, ChevronRight, Loader2,
  Copy, CheckCheck, Printer, Download, AlertCircle, TrendingUp,
  MapPin, Ship, Calendar, User, Shield, Hash, ChevronDown,
  Activity, Zap, ExternalLink, MoreHorizontal
} from "lucide-react";

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Outfit:wght@400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.od-root {
  font-family: 'Outfit', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ── Page ── */
.od-page-dark {
  background: #060a14;
  background-image:
    radial-gradient(ellipse 900px 600px at 10% 0%, rgba(29,78,216,0.10) 0%, transparent 70%),
    radial-gradient(ellipse 700px 500px at 90% 100%, rgba(88,28,135,0.08) 0%, transparent 70%),
    radial-gradient(ellipse 500px 400px at 50% 50%, rgba(15,23,42,0.6) 0%, transparent 100%);
  min-height: 100vh;
}
.od-page-light {
  background: #eef2fb;
  background-image:
    radial-gradient(ellipse 900px 600px at 10% 0%, rgba(59,130,246,0.08) 0%, transparent 70%),
    radial-gradient(ellipse 700px 500px at 90% 100%, rgba(139,92,246,0.05) 0%, transparent 70%);
  min-height: 100vh;
}

/* ── Animated shimmer ── */
@keyframes shimmer { 0%{background-position:-400% 0} 100%{background-position:400% 0} }
.od-accent {
  height: 2px;
  background: linear-gradient(90deg,
    transparent 0%, rgba(59,130,246,0.0) 10%,
    rgba(99,102,241,0.9) 35%, rgba(139,92,246,1) 50%,
    rgba(99,102,241,0.9) 65%, rgba(59,130,246,0.0) 90%, transparent 100%
  );
  background-size: 400% 100%;
  animation: shimmer 4s ease-in-out infinite;
}
.od-accent-thin {
  height: 1px;
  background: linear-gradient(90deg,
    transparent 0%, rgba(59,130,246,0.3) 30%,
    rgba(139,92,246,0.5) 50%, rgba(59,130,246,0.3) 70%, transparent 100%
  );
  background-size: 300% 100%;
  animation: shimmer 5s ease-in-out infinite;
}

/* ── Main card ── */
.od-card-dark {
  background: rgba(8,13,26,0.92);
  backdrop-filter: blur(48px) saturate(180%);
  -webkit-backdrop-filter: blur(48px) saturate(180%);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 22px;
  overflow: hidden;
  box-shadow:
    0 1px 0 rgba(255,255,255,0.05) inset,
    0 32px 80px rgba(0,0,0,0.55),
    0 0 0 1px rgba(0,0,0,0.4);
}
.od-card-light {
  background: rgba(255,255,255,0.96);
  backdrop-filter: blur(48px) saturate(200%);
  border: 1px solid rgba(59,130,246,0.13);
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 1px 0 rgba(255,255,255,1) inset, 0 16px 48px rgba(37,99,235,0.09), 0 0 0 1px rgba(59,130,246,0.07);
}

/* ── Section cards ── */
.od-section-dark {
  background: rgba(255,255,255,0.022);
  border: 1px solid rgba(255,255,255,0.065);
  border-radius: 18px;
  overflow: hidden;
  transition: border-color .25s, box-shadow .25s;
}
.od-section-dark:hover {
  border-color: rgba(99,102,241,0.22);
  box-shadow: 0 0 0 1px rgba(99,102,241,0.06), 0 12px 32px rgba(0,0,0,0.18);
}
.od-section-light {
  background: #fff;
  border: 1px solid rgba(59,130,246,0.09);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(37,99,235,0.06);
  transition: border-color .25s, box-shadow .25s;
}
.od-section-light:hover {
  border-color: rgba(59,130,246,0.2);
  box-shadow: 0 6px 24px rgba(37,99,235,0.1);
}

/* ── Section header ── */
.od-sec-head-dark {
  background: linear-gradient(90deg, rgba(29,78,216,0.12) 0%, rgba(29,78,216,0.02) 100%);
  border-bottom: 1px solid rgba(255,255,255,0.055);
  padding: 14px 20px;
  display: flex; align-items: center; justify-content: space-between;
}
.od-sec-head-light {
  background: linear-gradient(90deg, rgba(37,99,235,0.06) 0%, rgba(37,99,235,0.01) 100%);
  border-bottom: 1px solid rgba(59,130,246,0.08);
  padding: 14px 20px;
  display: flex; align-items: center; justify-content: space-between;
}
.od-sec-head-left { display: flex; align-items: center; gap: 10px; }
.od-sec-icon-wrap-dark {
  width: 30px; height: 30px;
  background: rgba(29,78,216,0.14); border: 1px solid rgba(99,102,241,0.22);
  border-radius: 9px; display: flex; align-items: center; justify-content: center;
}
.od-sec-icon-wrap-light {
  width: 30px; height: 30px;
  background: rgba(37,99,235,0.08); border: 1px solid rgba(59,130,246,0.16);
  border-radius: 9px; display: flex; align-items: center; justify-content: center;
}
.od-sec-title-dark  { font-family: 'Sora', sans-serif; font-size: 11.5px; font-weight: 700; color: rgba(165,180,252,0.85); letter-spacing: .07em; text-transform: uppercase; }
.od-sec-title-light { font-family: 'Sora', sans-serif; font-size: 11.5px; font-weight: 700; color: #1d4ed8; letter-spacing: .07em; text-transform: uppercase; }

/* ── Completeness badge inside sec header ── */
.od-completeness-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 9px; border-radius: 999px;
  font-size: 10px; font-weight: 700; letter-spacing: .04em;
}
.od-completeness-full-dark  { background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.22); color: #4ade80; }
.od-completeness-full-light { background: rgba(21,128,61,0.08); border: 1px solid rgba(21,128,61,0.2); color: #15803d; }
.od-completeness-part-dark  { background: rgba(234,179,8,0.08); border: 1px solid rgba(234,179,8,0.2); color: #fbbf24; }
.od-completeness-part-light { background: rgba(161,98,7,0.07); border: 1px solid rgba(161,98,7,0.18); color: #b45309; }
.od-completeness-empty-dark  { background: rgba(239,68,68,0.07); border: 1px solid rgba(239,68,68,0.18); color: #f87171; }
.od-completeness-empty-light { background: rgba(185,28,28,0.06); border: 1px solid rgba(185,28,28,0.15); color: #dc2626; }

/* ── Field label / value ── */
.od-label-dark  { font-size: 10px; font-weight: 700; color: rgba(99,148,255,0.42); letter-spacing: .09em; text-transform: uppercase; margin-bottom: 5px; display: flex; align-items: center; gap: 5px; }
.od-label-light { font-size: 10px; font-weight: 700; color: rgba(37,99,235,0.38); letter-spacing: .09em; text-transform: uppercase; margin-bottom: 5px; display: flex; align-items: center; gap: 5px; }
.od-value-dark  { font-size: 13.5px; font-weight: 500; color: #dce6f8; line-height: 1.45; word-break: break-word; }
.od-value-light { font-size: 13.5px; font-weight: 500; color: #1e3a5f; line-height: 1.45; word-break: break-word; }
.od-value-mono  { font-family: 'JetBrains Mono', monospace; font-size: 12px; letter-spacing: .02em; }
.od-value-empty-dark  { color: rgba(99,148,255,0.22) !important; font-style: italic; font-size: 12.5px !important; }
.od-value-empty-light { color: rgba(37,99,235,0.22) !important; font-style: italic; font-size: 12.5px !important; }

/* ── Field item container ── */
.od-field-dark {
  padding: 13px 15px; border-radius: 12px;
  background: rgba(255,255,255,0.015); border: 1px solid rgba(255,255,255,0.04);
  transition: background .15s, border-color .15s; position: relative;
}
.od-field-dark:hover { background: rgba(29,78,216,0.07); border-color: rgba(99,102,241,0.15); }
.od-field-light {
  padding: 13px 15px; border-radius: 12px;
  background: rgba(248,250,255,0.85); border: 1px solid rgba(59,130,246,0.07);
  transition: background .15s, border-color .15s; position: relative;
}
.od-field-light:hover { background: rgba(219,234,254,0.5); border-color: rgba(59,130,246,0.18); }

/* ── Copy button ── */
.od-copy-btn {
  position: absolute; top: 8px; right: 8px;
  width: 22px; height: 22px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  border: none; cursor: pointer; opacity: 0;
  transition: opacity .15s, background .15s;
}
.od-field-dark:hover  .od-copy-btn { opacity: 1; background: rgba(99,102,241,0.15); }
.od-field-light:hover .od-copy-btn { opacity: 1; background: rgba(37,99,235,0.08); }

/* ── Header text ── */
.od-h1-dark {
  font-family: 'Sora', sans-serif; font-size: 26px; font-weight: 800;
  background: linear-gradient(135deg, #a5b4fc 0%, #e2e8ff 45%, #818cf8 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  letter-spacing: -.03em; line-height: 1.1;
}
.od-h1-light {
  font-family: 'Sora', sans-serif; font-size: 26px; font-weight: 800;
  background: linear-gradient(135deg, #1d4ed8 0%, #4f46e5 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  letter-spacing: -.03em; line-height: 1.1;
}
.od-sub-dark  { font-size: 12px; color: rgba(99,148,255,0.38); margin-top: 4px; font-weight: 400; }
.od-sub-light { font-size: 12px; color: rgba(37,99,235,0.38); margin-top: 4px; font-weight: 400; }

/* ── Back button ── */
.od-back-dark {
  display: flex; align-items: center; gap: 7px; padding: 8px 15px; border-radius: 10px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
  color: rgba(148,163,220,0.7); font-size: 12.5px; font-weight: 500;
  cursor: pointer; transition: all .2s; font-family: inherit;
}
.od-back-dark:hover { background: rgba(29,78,216,0.14); border-color: rgba(99,102,241,0.3); color: #a5b4fc; transform: translateX(-3px); }
.od-back-light {
  display: flex; align-items: center; gap: 7px; padding: 8px 15px; border-radius: 10px;
  background: #fff; border: 1px solid rgba(59,130,246,0.16);
  color: #4b6ea8; font-size: 12.5px; font-weight: 500;
  cursor: pointer; transition: all .2s; box-shadow: 0 1px 5px rgba(59,130,246,0.08); font-family: inherit;
}
.od-back-light:hover { background: #eff6ff; border-color: rgba(37,99,235,0.3); color: #1d4ed8; transform: translateX(-3px); }

/* ── Customer info area ── */
.od-cust-dark  { font-family: 'Sora', sans-serif; font-size: 22px; font-weight: 800; color: #f1f5fd; letter-spacing: -.03em; line-height: 1.2; }
.od-cust-light { font-family: 'Sora', sans-serif; font-size: 22px; font-weight: 800; color: #0f1f3d; letter-spacing: -.03em; line-height: 1.2; }
.od-ordno-dark  { font-size: 12px; color: rgba(99,148,255,0.48); margin-top: 5px; font-family: 'JetBrains Mono', monospace; letter-spacing: .04em; }
.od-ordno-light { font-size: 12px; color: rgba(37,99,235,0.42); margin-top: 5px; font-family: 'JetBrains Mono', monospace; letter-spacing: .04em; }

/* ── Status badges ── */
.od-badge {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 5px 14px; border-radius: 999px;
  font-size: 10.5px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase;
  font-family: 'Sora', sans-serif;
}
.od-badge::before { content: ''; width: 5px; height: 5px; border-radius: 50%; background: currentColor; opacity: .8; flex-shrink: 0; }
.badge-new-order    { background: rgba(148,163,184,0.1);  border: 1px solid rgba(148,163,184,0.22);  color: #94a3b8; }
.badge-entry        { background: rgba(34,197,94,0.1);    border: 1px solid rgba(34,197,94,0.25);    color: #22c55e; }
.badge-lapangan     { background: rgba(59,130,246,0.12);  border: 1px solid rgba(59,130,246,0.3);    color: #60a5fa; }
.badge-sertifikat   { background: rgba(139,92,246,0.1);   border: 1px solid rgba(139,92,246,0.28);   color: #a78bfa; }
.badge-closed       { background: rgba(249,115,22,0.1);   border: 1px solid rgba(249,115,22,0.28);   color: #fb923c; }
.badge-proforma     { background: rgba(234,179,8,0.1);    border: 1px solid rgba(234,179,8,0.28);    color: #facc15; }
.badge-invoice      { background: rgba(20,184,166,0.1);   border: 1px solid rgba(20,184,166,0.28);   color: #2dd4bf; }
.badge-selesai      { background: rgba(34,197,94,0.12);   border: 1px solid rgba(34,197,94,0.3);     color: #4ade80; }
.badge-default      { background: rgba(239,68,68,0.1);    border: 1px solid rgba(239,68,68,0.25);    color: #f87171; }

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
.od-div-dark  { border-bottom: 1px solid rgba(255,255,255,0.055); }
.od-div-light { border-bottom: 1px solid rgba(59,130,246,0.08); }

/* ── Status current pill ── */
.od-status-pill-dark  { background: rgba(29,78,216,0.12); border: 1px solid rgba(99,102,241,0.22); border-radius: 999px; padding: 8px 18px; display: inline-flex; align-items: center; gap: 8px; }
.od-status-pill-light { background: rgba(219,234,254,0.9); border: 1px solid rgba(59,130,246,0.22); border-radius: 999px; padding: 8px 18px; display: inline-flex; align-items: center; gap: 8px; }
@keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.5)} }
.od-status-dot { width: 7px; height: 7px; border-radius: 50%; background: #6366f1; box-shadow: 0 0 10px rgba(99,102,241,0.8); animation: pulseDot 2.2s ease-in-out infinite; flex-shrink: 0; }

/* ── Tracking steps ── */
@keyframes stepPop { from{transform:scale(0.6);opacity:0} to{transform:scale(1);opacity:1} }
.od-step-circle {
  width: 40px; height: 40px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  transition: all .35s cubic-bezier(0.34,1.56,0.64,1); flex-shrink: 0;
}
.od-step-done-dark   { background: rgba(29,78,216,0.18); border: 2px solid rgba(99,102,241,0.35); color: #818cf8; }
.od-step-active-dark { background: linear-gradient(135deg,#1d4ed8,#4f46e5); border: 2px solid rgba(99,102,241,0.5); color: #fff; box-shadow: 0 0 24px rgba(99,102,241,0.55), 0 0 48px rgba(99,102,241,0.2); }
.od-step-idle-dark   { background: rgba(255,255,255,0.02); border: 2px solid rgba(255,255,255,0.06); color: rgba(148,163,184,0.28); }
.od-step-done-light   { background: rgba(219,234,254,0.9); border: 2px solid rgba(59,130,246,0.32); color: #2563eb; }
.od-step-active-light { background: linear-gradient(135deg,#2563eb,#4f46e5); border: 2px solid transparent; color: #fff; box-shadow: 0 0 20px rgba(37,99,235,0.4), 0 5px 15px rgba(79,70,229,0.3); }
.od-step-idle-light   { background: rgba(241,245,249,0.9); border: 2px solid rgba(59,130,246,0.1); color: rgba(148,163,184,0.45); }

/* ── Progress rail ── */
.od-track-rail-dark  { height: 2px; background: rgba(255,255,255,0.045); border-radius: 99px; }
.od-track-rail-light { height: 2px; background: rgba(59,130,246,0.09); border-radius: 99px; }
.od-track-fill {
  height: 2px;
  background: linear-gradient(90deg, #1d4ed8, #4f46e5, #818cf8);
  border-radius: 99px; transition: width 1s cubic-bezier(0.22,1,0.36,1);
  box-shadow: 0 0 10px rgba(99,102,241,0.45);
}

/* ── Track labels ── */
.od-track-label-dark  { font-size: 9px; color: rgba(165,180,252,0.65); font-weight: 700; margin-top: 8px; text-align: center; letter-spacing: .03em; line-height: 1.3; font-family: 'Sora', sans-serif; }
.od-track-label-light { font-size: 9px; color: #3b82f6; font-weight: 700; margin-top: 8px; text-align: center; letter-spacing: .03em; line-height: 1.3; font-family: 'Sora', sans-serif; }
.od-track-desc-dark  { font-size: 8px; color: rgba(99,148,255,0.3); text-align: center; margin-top: 2px; line-height: 1.3; }
.od-track-desc-light { font-size: 8px; color: rgba(37,99,235,0.32); text-align: center; margin-top: 2px; line-height: 1.3; }
.od-track-title-dark  { font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 700; color: #a5b4fc; letter-spacing: -.01em; }
.od-track-title-light { font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 700; color: #2563eb; letter-spacing: -.01em; }

/* ── Action buttons ── */
.od-btn-base {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 20px; border-radius: 12px; font-size: 13px; font-weight: 600;
  cursor: pointer; transition: all .2s cubic-bezier(0.22,1,0.36,1);
  font-family: 'Outfit', inherit; border: none; white-space: nowrap;
}
.od-btn-back-dark  { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08) !important; color: rgba(148,163,220,0.8); }
.od-btn-back-dark:hover  { background: rgba(29,78,216,0.14); border-color: rgba(99,102,241,0.28) !important; color: #c7d2fe; }
.od-btn-back-light { background: #fff; border: 1px solid rgba(59,130,246,0.18) !important; color: #4b6ea8; box-shadow: 0 1px 4px rgba(59,130,246,0.08); }
.od-btn-back-light:hover { background: #eff6ff; border-color: rgba(37,99,235,0.3) !important; color: #1d4ed8; }
.od-btn-edit { background: linear-gradient(135deg, #d97706, #f59e0b); color: #fff; box-shadow: 0 4px 16px rgba(245,158,11,0.3); }
.od-btn-edit:hover { background: linear-gradient(135deg,#b45309,#d97706); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(245,158,11,0.4); }
.od-btn-lengkapi { background: linear-gradient(135deg, #2563eb, #4f46e5); color: #fff; box-shadow: 0 4px 16px rgba(37,99,235,0.3); }
.od-btn-lengkapi:hover { background: linear-gradient(135deg,#1d4ed8,#4338ca); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(37,99,235,0.4); }
.od-btn-delete { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.22) !important; color: #f87171; }
.od-btn-delete:hover { background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.4) !important; color: #fca5a5; transform: translateY(-2px); }
.od-btn-print-dark  { background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.18) !important; color: #a5b4fc; }
.od-btn-print-dark:hover  { background: rgba(99,102,241,0.14); transform: translateY(-2px); }
.od-btn-print-light { background: rgba(37,99,235,0.06); border: 1px solid rgba(37,99,235,0.15) !important; color: #2563eb; }
.od-btn-print-light:hover { background: rgba(37,99,235,0.12); transform: translateY(-2px); }

/* ── Loading ── */
@keyframes spinFade { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
.od-spin { animation: spinFade 1.1s linear infinite; }
@keyframes skeletonPulse { 0%,100%{opacity:.4} 50%{opacity:.7} }
.od-skeleton { border-radius: 8px; animation: skeletonPulse 1.8s ease-in-out infinite; }
.od-skeleton-dark  { background: rgba(99,102,241,0.07); }
.od-skeleton-light { background: rgba(37,99,235,0.06); }

/* ── Mount animations ── */
@keyframes odFadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
.od-mount { animation: odFadeUp .5s cubic-bezier(0.22,1,0.36,1) both; }
.od-stagger-1 { animation-delay: .03s; }
.od-stagger-2 { animation-delay: .08s; }
.od-stagger-3 { animation-delay: .13s; }
.od-stagger-4 { animation-delay: .18s; }
.od-stagger-5 { animation-delay: .23s; }
.od-stagger-6 { animation-delay: .28s; }
.od-stagger-7 { animation-delay: .33s; }
.od-stagger-8 { animation-delay: .38s; }

/* ── Error card ── */
.od-error-dark  { background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.18); border-radius: 18px; padding: 28px; }
.od-error-light { background: #fff8f8; border: 1px solid rgba(239,68,68,0.16); border-radius: 18px; padding: 28px; }

/* ── Currency ── */
.od-currency-dark  { font-family: 'JetBrains Mono', monospace; font-size: 14.5px; font-weight: 600; color: #4ade80; }
.od-currency-light { font-family: 'JetBrains Mono', monospace; font-size: 14.5px; font-weight: 600; color: #16a34a; }

/* ── Breadcrumb ── */
.od-breadcrumb-dark  { font-size: 11px; color: rgba(99,148,255,0.42); display: flex; align-items: center; gap: 5px; }
.od-breadcrumb-light { font-size: 11px; color: rgba(37,99,235,0.38); display: flex; align-items: center; gap: 5px; }
.od-breadcrumb-dark  span:hover, .od-breadcrumb-light span:hover { opacity: 1 !important; }

/* ── Summary strip ── */
.od-summary-dark  { background: rgba(29,78,216,0.07); border: 1px solid rgba(99,102,241,0.12); border-radius: 14px; padding: 14px 18px; display: flex; flex-wrap: wrap; gap: 0; }
.od-summary-light { background: rgba(239,246,255,0.95); border: 1px solid rgba(59,130,246,0.11); border-radius: 14px; padding: 14px 18px; display: flex; flex-wrap: wrap; gap: 0; }
.od-summary-item { display: flex; flex-direction: column; gap: 4px; padding: 8px 20px; border-right: 1px solid; flex: 1; min-width: 130px; }
.od-summary-item-dark  { border-right-color: rgba(255,255,255,0.05); }
.od-summary-item-light { border-right-color: rgba(59,130,246,0.08); }
.od-summary-item:last-child { border-right: none; }
.od-summary-key-dark  { font-size: 9.5px; font-weight: 700; color: rgba(99,148,255,0.42); letter-spacing: .09em; text-transform: uppercase; font-family: 'Sora', sans-serif; }
.od-summary-key-light { font-size: 9.5px; font-weight: 700; color: rgba(37,99,235,0.38); letter-spacing: .09em; text-transform: uppercase; font-family: 'Sora', sans-serif; }
.od-summary-val-dark  { font-size: 13.5px; font-weight: 600; color: #c7d7f8; }
.od-summary-val-light { font-size: 13.5px; font-weight: 600; color: #1e3a5f; }

/* ── Overall progress bar ── */
.od-overall-dark  { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.055); border-radius: 14px; padding: 14px 18px; }
.od-overall-light { background: rgba(239,246,255,0.9); border: 1px solid rgba(59,130,246,0.1); border-radius: 14px; padding: 14px 18px; }
.od-progress-rail { height: 5px; border-radius: 99px; overflow: hidden; }
.od-progress-rail-dark  { background: rgba(255,255,255,0.04); }
.od-progress-rail-light { background: rgba(59,130,246,0.09); }
.od-progress-fill {
  height: 100%; border-radius: 99px;
  background: linear-gradient(90deg, #1d4ed8, #4f46e5, #818cf8);
  transition: width 1.2s cubic-bezier(0.22,1,0.36,1);
  box-shadow: 0 0 10px rgba(99,102,241,0.4);
}

/* ── Tooltip ── */
.od-tooltip-wrap { position: relative; display: inline-flex; align-items: center; }
.od-tooltip {
  position: absolute; bottom: calc(100% + 6px); left: 50%; transform: translateX(-50%);
  background: #0f172a; border: 1px solid rgba(99,102,241,0.3); border-radius: 8px;
  padding: 6px 10px; font-size: 11px; color: #c7d2fe; white-space: nowrap;
  pointer-events: none; opacity: 0; transition: opacity .15s;
  z-index: 100; font-family: 'Outfit', sans-serif; font-weight: 500;
}
.od-tooltip::after {
  content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%);
  border: 5px solid transparent; border-top-color: rgba(99,102,241,0.3);
}
.od-tooltip-wrap:hover .od-tooltip { opacity: 1; }

/* ── Info alert ── */
.od-info-dark  { background: rgba(29,78,216,0.07); border: 1px solid rgba(99,102,241,0.15); border-radius: 12px; padding: 12px 16px; display: flex; align-items: flex-start; gap: 10px; }
.od-info-light { background: rgba(239,246,255,0.95); border: 1px solid rgba(59,130,246,0.15); border-radius: 12px; padding: 12px 16px; display: flex; align-items: flex-start; gap: 10px; }

/* ── Scrollbar ── */
.od-root ::-webkit-scrollbar { width: 4px; height: 4px; }
.od-root ::-webkit-scrollbar-track { background: transparent; }
.od-root ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.2); border-radius: 10px; }
.od-root ::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.35); }

/* ── Print ── */
@media print {
  .od-page-dark, .od-page-light { background: #fff !important; background-image: none !important; }
  .od-card-dark, .od-card-light { box-shadow: none !important; border: 1px solid #e2e8f0 !important; border-radius: 8px !important; }
  .od-section-dark, .od-section-light { box-shadow: none !important; border: 1px solid #e2e8f0 !important; break-inside: avoid; }
  .od-btn-base, .od-back-dark, .od-back-light { display: none !important; }
  .od-h1-dark, .od-h1-light { -webkit-text-fill-color: #1d4ed8 !important; }
  .od-cust-dark, .od-cust-light { color: #0f1f3d !important; }
  .od-value-dark, .od-value-light { color: #1e3a5f !important; }
  .od-label-dark, .od-label-light { color: rgba(37,99,235,0.5) !important; }
  .od-accent { display: none; }
  .od-copy-btn { display: none !important; }
}
`;

/* ─────────────────────────────────────────────
   COPY BUTTON
───────────────────────────────────────────── */
const CopyBtn = ({ value, isDark }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e) => {
    e.stopPropagation();
    if (!value || value === "—") return;
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  if (!value || value === "—") return null;
  return (
    <button
      className="od-copy-btn"
      onClick={handleCopy}
      title="Salin nilai"
      style={{ color: isDark ? "rgba(165,180,252,0.7)" : "rgba(37,99,235,0.6)" }}
    >
      {copied
        ? <CheckCheck size={12} color={isDark ? "#4ade80" : "#16a34a"} />
        : <Copy size={12} />
      }
    </button>
  );
};

/* ─────────────────────────────────────────────
   FIELD ITEM
───────────────────────────────────────────── */
const FieldItem = ({ label, value, isDark, isMono, isCurrency, labelIcon }) => {
  const d = isDark;
  const empty = !value || value === "—";
  const displayValue = value || "—";
  return (
    <div className={d ? "od-field-dark" : "od-field-light"}>
      <p className={d ? "od-label-dark" : "od-label-light"}>
        {labelIcon && <span style={{ opacity: .65, display: "inline-flex" }}>{labelIcon}</span>}
        {label}
      </p>
      <p className={
        isCurrency
          ? (d ? "od-currency-dark" : "od-currency-light")
          : `${d ? "od-value-dark" : "od-value-light"} ${isMono ? "od-value-mono" : ""} ${empty ? (d ? "od-value-empty-dark" : "od-value-empty-light") : ""}`
      }>
        {displayValue}
      </p>
      {!isCurrency && <CopyBtn value={empty ? null : displayValue} isDark={d} />}
    </div>
  );
};

/* ─────────────────────────────────────────────
   COMPLETENESS BADGE
───────────────────────────────────────────── */
const CompletenessBadge = ({ fields, order, isDark }) => {
  const d = isDark;
  const filled = fields.filter(f => {
    const v = order?.[f.key];
    return v !== null && v !== undefined && v !== "";
  }).length;
  const pct = fields.length > 0 ? Math.round((filled / fields.length) * 100) : 0;
  let cls, label;
  if (pct === 100) { cls = d ? "od-completeness-full-dark" : "od-completeness-full-light"; label = "Lengkap"; }
  else if (pct >= 50) { cls = d ? "od-completeness-part-dark" : "od-completeness-part-light"; label = `${pct}%`; }
  else { cls = d ? "od-completeness-empty-dark" : "od-completeness-empty-light"; label = `${pct}%`; }
  return (
    <span className={`od-completeness-badge ${cls}`}>
      {pct === 100 ? <Check size={9} /> : <Activity size={9} />}
      {label}
    </span>
  );
};

/* ─────────────────────────────────────────────
   SECTION CARD
───────────────────────────────────────────── */
const SectionCard = ({ title, icon, children, isDark, staggerClass, fields, order }) => {
  const d = isDark;
  return (
    <div className={`od-mount ${staggerClass} ${d ? "od-section-dark" : "od-section-light"}`}
      style={{ marginBottom: 12 }}>
      <div className={d ? "od-sec-head-dark" : "od-sec-head-light"}>
        <div className="od-sec-head-left">
          <div className={d ? "od-sec-icon-wrap-dark" : "od-sec-icon-wrap-light"}>{icon}</div>
          <p className={d ? "od-sec-title-dark" : "od-sec-title-light"}>{title}</p>
        </div>
        {fields && order && <CompletenessBadge fields={fields} order={order} isDark={d} />}
      </div>
      <div style={{ padding: "18px 20px" }}>{children}</div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   TRACKING STATUS
───────────────────────────────────────────── */
const TrackingStatus = ({ currentStatus, tanggalStatusOrder, formatDate, isDark }) => {
  const stepRefs = useRef([]);
  const [lineWidth, setLineWidth] = useState(0);
  const d = isDark;

  const steps = [
    { id: 0, label: "New Order",             desc: "Data pelanggan",       icon: <FileText size={14} /> },
    { id: 1, label: "Entry",                 desc: "Pembukaan CS",         icon: <ClipboardEdit size={14} /> },
    { id: 2, label: "Diproses - Lapangan",   desc: "Kerja lapangan",       icon: <HardHat size={14} /> },
    { id: 3, label: "Diproses - Sertifikat", desc: "Upload sertifikat",    icon: <FileCheck size={14} /> },
    { id: 4, label: "Closed Order",          desc: "Tunggu proforma",      icon: <ClipboardCheck size={14} /> },
    { id: 5, label: "Penerbitan Proforma",   desc: "Tunggu pembayaran",    icon: <Receipt size={14} /> },
    { id: 6, label: "Invoice",               desc: "Siap distribusi",      icon: <Wallet size={14} /> },
    { id: 7, label: "Selesai",               desc: "Sertifikat terkirim",  icon: <PackageCheck size={14} /> },
  ];

  const currentStep = steps.findIndex(s => s.label === currentStatus);

  useEffect(() => {
    const update = () => {
      if (!stepRefs.current.length || currentStep < 0) return;
      const first   = stepRefs.current[0];
      const current = stepRefs.current[currentStep];
      const last    = stepRefs.current[steps.length - 1];
      if (!first || !current || !last) return;
      const firstRect   = first.getBoundingClientRect();
      const currentRect = current.getBoundingClientRect();
      const lastRect    = last.getBoundingClientRect();
      const firstCenter = firstRect.left + first.offsetWidth / 2;
      const currentCenter = currentRect.left + current.offsetWidth / 2;
      if (currentStep === steps.length - 1) {
        setLineWidth((lastRect.left + last.offsetWidth / 2) - firstCenter);
      } else {
        setLineWidth(currentCenter - firstCenter + current.offsetWidth / 2);
      }
    };
    const t = setTimeout(update, 80);
    window.addEventListener("resize", update);
    return () => { clearTimeout(t); window.removeEventListener("resize", update); };
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32,
            background: d ? "rgba(29,78,216,0.14)" : "rgba(37,99,235,0.08)",
            border: `1px solid ${d ? "rgba(99,102,241,0.24)" : "rgba(59,130,246,0.18)"}`,
            borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Activity size={14} color={d ? "#818cf8" : "#2563eb"} />
          </div>
          <p className={d ? "od-track-title-dark" : "od-track-title-light"}>Status Perjalanan Order</p>
        </div>
        {/* Progress pill */}
        <div style={{
          padding: "5px 13px",
          background: d ? "rgba(29,78,216,0.12)" : "rgba(219,234,254,0.95)",
          border: `1px solid ${d ? "rgba(99,102,241,0.2)" : "rgba(59,130,246,0.18)"}`,
          borderRadius: 999, display: "flex", alignItems: "center", gap: 8
        }}>
          <div style={{ width: 36, height: 4, background: d ? "rgba(255,255,255,0.05)" : "rgba(59,130,246,0.1)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progressPct}%`, background: "linear-gradient(90deg,#2563eb,#818cf8)", borderRadius: 99, transition: "width 1s ease" }} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: d ? "#a5b4fc" : "#2563eb", letterSpacing: ".02em" }}>
            {progressPct}% selesai
          </span>
        </div>
      </div>

      {/* Steps rail */}
      <div style={{ position: "relative", paddingBottom: 8, overflowX: "auto" }}>
        <div style={{ minWidth: 540 }}>
          <div className={d ? "od-track-rail-dark" : "od-track-rail-light"}
            style={{ position: "absolute", top: 19, left: 0, right: 0 }} />
          <div className="od-track-fill"
            style={{ position: "absolute", top: 19, left: 0, width: `${lineWidth}px` }} />
          <div style={{ position: "relative", zIndex: 10, display: "flex", justifyContent: "space-between" }}>
            {steps.map((step, index) => (
              <div
                key={step.id}
                ref={el => stepRefs.current[index] = el}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", width: `${100 / steps.length}%`, maxWidth: 110 }}
              >
                <div className={`od-step-circle ${stepCls(index)}`}>
                  {index === currentStep
                    ? <Zap size={14} />
                    : index < currentStep
                      ? <Check size={13} />
                      : step.icon
                  }
                </div>
                <p className={d ? "od-track-label-dark" : "od-track-label-light"}>{step.label}</p>
                <p className={d ? "od-track-desc-dark" : "od-track-desc-light"}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status pill */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 22 }}>
        <div className={d ? "od-status-pill-dark" : "od-status-pill-light"}>
          <div className="od-status-dot" />
          <span style={{ fontSize: 12.5, fontWeight: 600, color: d ? "rgba(165,180,252,0.9)" : "#1d4ed8", letterSpacing: ".01em" }}>
            Status Aktif:
          </span>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: d ? "#e0e7ff" : "#0f172a" }}>
            {currentStatus || "—"}
          </span>
          {tanggalStatusOrder && (
            <>
              <span style={{ fontSize: 11, color: d ? "rgba(99,148,255,0.4)" : "rgba(37,99,235,0.35)", margin: "0 2px" }}>·</span>
              <span style={{ fontSize: 11, color: d ? "rgba(99,148,255,0.45)" : "rgba(37,99,235,0.42)", fontFamily: "'JetBrains Mono',monospace" }}>
                {formatDate(tanggalStatusOrder)}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   SKELETON LOADER
───────────────────────────────────────────── */
const SkeletonLoader = ({ isDark }) => {
  const d = isDark;
  const cls = `od-skeleton ${d ? "od-skeleton-dark" : "od-skeleton-light"}`;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10 }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} className={d ? "od-field-dark" : "od-field-light"}>
          <div className={cls} style={{ height: 10, width: "60%", marginBottom: 10 }} />
          <div className={cls} style={{ height: 14, width: "90%" }} />
        </div>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────
   OVERALL DATA COMPLETENESS
───────────────────────────────────────────── */
const OverallCompleteness = ({ order, isDark }) => {
  const d = isDark;
  const allFields = [
    "pelanggan","statusOrder","nomorOrder","tanggalOrder","tanggalSerahOrderKeCs",
    "noSiSpk","jenisPekerjaan","lokasiPekerjaan","tanggalPekerjaan","namaTongkang","estimasiTonase","tonaseDS",
    "nilaiProforma","proformaSerahKeOps","proformaSerahKeDukbis","proformaBySistem","jenisSertifikat","noSertifikat",
    "nilaiInvoice","nomorInvoice","fakturPajak","tanggalPengirimanInvoice","tanggalPengirimanFaktur",
    "distribusiSertifikatPengirim","distribusiSertifikatPenerima",
  ];
  const filled = allFields.filter(k => {
    const v = order?.[k];
    return v !== null && v !== undefined && v !== "";
  }).length;
  const pct = Math.round((filled / allFields.length) * 100);
  const color = pct === 100 ? "#4ade80" : pct >= 70 ? "#a78bfa" : pct >= 40 ? "#fbbf24" : "#f87171";

  return (
    <div className={d ? "od-overall-dark" : "od-overall-light"} style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <TrendingUp size={13} color={color} />
          <span style={{ fontSize: 11.5, fontWeight: 700, color: d ? "rgba(165,180,252,0.75)" : "#2563eb", letterSpacing: ".05em", textTransform: "uppercase", fontFamily: "'Sora',sans-serif" }}>
            Kelengkapan Data
          </span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color, fontFamily: "'JetBrains Mono',monospace" }}>
          {filled}/{allFields.length} field · {pct}%
        </span>
      </div>
      <div className={`od-progress-rail ${d ? "od-progress-rail-dark" : "od-progress-rail-light"}`}>
        <div className="od-progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color === "#4ade80" ? "#1d4ed8,#4ade80" : color === "#a78bfa" ? "#1d4ed8,#a78bfa" : color === "#fbbf24" ? "#d97706,#fbbf24" : "#dc2626,#f87171"})` }} />
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

  const userData   = JSON.parse(localStorage.getItem("user") || "{}");
  const userPeran  = userData?.peran  || "";
  const userBidang = userData?.bidang || "";

  const d = isDark;
  const T = (dark, light) => d ? dark : light;
  const iconColor = d ? "#818cf8" : "#2563eb";

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
        console.error(err); setError("Terjadi kesalahan saat mengambil data order.");
      }
      setLoading(false);
    };
    fetchOrder();
    return () => setMounted(false);
  }, [portofolio, userPeran, userBidang, id]);

  const formatDate = useCallback((value, includeTime = false) => {
    if (!value) return "—";
    if (value instanceof Timestamp) {
      const opts = {
        day: "2-digit", month: "short", year: "numeric",
        ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {})
      };
      return value.toDate().toLocaleDateString("id-ID", opts);
    }
    return value;
  }, []);

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
    if (!window.confirm("Apakah Anda yakin ingin menghapus order ini? Tindakan ini tidak dapat dibatalkan.")) return;
    try {
      await deleteOrder(id);
      alert("Order berhasil dihapus.");
      navigate(`/orders/${portofolio}`);
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus order. Silakan coba lagi.");
    }
  };

  const handlePrint = () => window.print();

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

  /* Field definitions for sections */
  const SECTION_FIELDS = {
    umum: [
      { key:"pelanggan",             label:"Nama Pelanggan",        labelIcon: <User size={9} /> },
      { key:"statusOrder",           label:"Status Order",          special:"status" },
      { key:"nomorOrder",            label:"Nomor Order",           isMono: true, labelIcon: <Hash size={9} /> },
      { key:"tanggalOrder",          label:"Tanggal Order",         isDate: true, labelIcon: <Calendar size={9} /> },
      { key:"tanggalSerahOrderKeCs", label:"Tgl. Penyerahan ke CS", isDate: true, labelIcon: <Calendar size={9} /> },
    ],
    pekerjaan: [
      { key:"noSiSpk",          label:"Nomor SI / SPK",       isMono: true, labelIcon: <Hash size={9} /> },
      { key:"jenisPekerjaan",   label:"Jenis Pekerjaan" },
      { key:"lokasiPekerjaan",  label:"Lokasi Pekerjaan",     labelIcon: <MapPin size={9} /> },
      { key:"tanggalPekerjaan", label:"Tanggal Pekerjaan",    isDate: true, labelIcon: <Calendar size={9} /> },
      { key:"namaTongkang",     label:"Nama Tongkang",        labelIcon: <Ship size={9} /> },
      { key:"estimasiTonase",   label:"Estimasi Kuantitas" },
      { key:"tonaseDS",         label:"Tonase DS" },
    ],
    proforma: [
      { key:"nilaiProforma",            label:"Nilai Proforma (PAD)", special:"currency" },
      { key:"proformaSerahKeOps",       label:"Proforma → Operasional", isDate: true, labelIcon: <Calendar size={9} /> },
      { key:"proformaSerahKeDukbis",    label:"Proforma → Dukbis",      isDate: true, labelIcon: <Calendar size={9} /> },
      { key:"proformaBySistem",         label:"Proforma by Sistem",      isDate: true, labelIcon: <Calendar size={9} /> },
      { key:"keteranganSertifikatPM06", label:"Ket. Sertifikat PM06" },
      { key:"jenisSertifikat",          label:"Jenis Sertifikat",        labelIcon: <Shield size={9} /> },
      { key:"noSertifikatPM06",         label:"No. Sertifikat PM06",     isMono: true, labelIcon: <Hash size={9} /> },
      { key:"noSertifikat",             label:"No. Sertifikat",          isMono: true, labelIcon: <Hash size={9} /> },
    ],
    keuangan: [
      { key:"nilaiInvoice",             label:"Nilai Invoice (Fee)",     special:"currency" },
      { key:"nomorInvoice",             label:"Nomor Invoice",           isMono: true, labelIcon: <Hash size={9} /> },
      { key:"fakturPajak",              label:"No. Seri Faktur Pajak",   isMono: true, labelIcon: <Hash size={9} /> },
      { key:"tanggalPengirimanInvoice", label:"Tgl. Kirim Invoice",      isDate: true, labelIcon: <Calendar size={9} /> },
      { key:"tanggalPengirimanFaktur",  label:"Tgl. Kirim Faktur",       isDate: true, labelIcon: <Calendar size={9} /> },
    ],
    distribusi: [
      { key:"distribusiSertifikatPengirim",        label:"Pengirim Sertifikat",   labelIcon: <User size={9} /> },
      { key:"distribusiSertifikatPengirimTanggal", label:"Tgl. Pengiriman",        isDate: true, labelIcon: <Calendar size={9} /> },
      { key:"distribusiSertifikatPenerima",        label:"Penerima Sertifikat",    labelIcon: <User size={9} /> },
      { key:"distribusiSertifikatPenerimaTanggal", label:"Tgl. Diterima",          isDate: true, labelIcon: <Calendar size={9} /> },
    ],
    meta: [
      { key:"createdBy",     label:"Dibuat Oleh",               labelIcon: <User size={9} /> },
      { key:"lastUpdatedBy", label:"Terakhir Diperbarui Oleh",  labelIcon: <User size={9} /> },
      { key:"createdAt",     label:"Dibuat Pada",     isDate: true, includeTime: true, labelIcon: <Calendar size={9} /> },
      { key:"updatedAt",     label:"Diperbarui Pada", isDate: true, includeTime: true, labelIcon: <Calendar size={9} /> },
    ],
  };

  const canEdit = order && isEditableByRole(order, userPeran);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className={`od-root ${T("od-page-dark","od-page-light")}`}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <style>{STYLES}</style>
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: d ? "rgba(29,78,216,0.12)" : "rgba(37,99,235,0.07)",
              border: `1px solid ${d ? "rgba(99,102,241,0.22)" : "rgba(59,130,246,0.18)"}`,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Loader2 size={24} color={d ? "#818cf8" : "#2563eb"} className="od-spin" />
            </div>
          </div>
          <p style={{ fontSize: 14, color: d ? "rgba(165,180,252,0.6)" : "rgba(37,99,235,0.5)", fontFamily: "'Outfit',sans-serif", fontWeight: 500 }}>
            Memuat detail order…
          </p>
          <p style={{ fontSize: 11.5, color: d ? "rgba(99,148,255,0.3)" : "rgba(37,99,235,0.3)", marginTop: 5, fontFamily: "'Outfit',sans-serif" }}>
            Mohon tunggu sebentar
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
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 18 }}>
              <div style={{
                width: 40, height: 40, flexShrink: 0,
                background: d ? "rgba(239,68,68,0.1)" : "#fef2f2",
                border: `1px solid ${d ? "rgba(239,68,68,0.22)" : "rgba(239,68,68,0.2)"}`,
                borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <AlertCircle size={18} color={d ? "#f87171" : "#dc2626"} />
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: d ? "#fca5a5" : "#b91c1c", marginBottom: 5, fontFamily: "'Sora',sans-serif" }}>
                  Gagal Memuat Order
                </p>
                <p style={{ fontSize: 13, color: d ? "rgba(252,165,165,0.7)" : "#dc2626" }}>{error}</p>
              </div>
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

  /* ── Main Render ── */
  return (
    <div
      className={`od-root ${d ? "od-page-dark" : "od-page-light od-light"}`}
      style={{ padding: "28px 20px 72px", transition: "background .4s ease" }}
    >
      <style>{STYLES}</style>

      <div style={{ maxWidth: 1000, margin: "0 auto" }}>

        {/* ── Breadcrumb + Header ── */}
        <div className="od-mount od-stagger-1" style={{ marginBottom: 22 }}>
          <div className={T("od-breadcrumb-dark","od-breadcrumb-light")} style={{ marginBottom: 14 }}>
            <span style={{ cursor: "pointer", transition: "opacity .15s" }} onClick={() => navigate("/")}>Beranda</span>
            <ChevronRight size={10} />
            <span style={{ cursor: "pointer", transition: "opacity .15s", textTransform: "capitalize" }} onClick={() => navigate(`/orders/${portofolio}`)}>
              Order {portofolio}
            </span>
            <ChevronRight size={10} />
            <span style={{ fontWeight: 700, color: d ? "rgba(165,180,252,0.75)" : "#2563eb" }}>
              Detail Order
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <button onClick={() => navigate(`/orders/${portofolio}`)} className={T("od-back-dark","od-back-light")}>
                <ArrowLeft size={14} />
                Kembali
              </button>
              <div>
                <p className={T("od-h1-dark","od-h1-light")}>Detail Order</p>
                <div className="od-accent" style={{ width: 72, marginTop: 6 }} />
              </div>
            </div>
            {/* Utility buttons */}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={handlePrint}
                className={`od-btn-base ${T("od-btn-print-dark","od-btn-print-light")}`}
                style={{ border: "1px solid", padding: "8px 14px", fontSize: 12 }}
                title="Cetak halaman ini"
              >
                <Printer size={13} /> Cetak
              </button>
            </div>
          </div>
        </div>

        {/* ── Main Card ── */}
        <div className={`od-mount od-stagger-1 ${T("od-card-dark","od-card-light")}`} style={{ marginBottom: 14 }}>
          <div className="od-accent" />
          <div style={{ padding: "24px 26px" }}>
            {/* Order info header */}
            {order && (
              <div className={T("od-div-dark","od-div-light")}
                style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 14, paddingBottom: 20, marginBottom: 20 }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <p className={T("od-cust-dark","od-cust-light")}>{order.pelanggan || "—"}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
                    <p className={T("od-ordno-dark","od-ordno-light")}>
                      # {order.nomorOrder || "—"}
                    </p>
                    {order.noSiSpk && (
                      <>
                        <span style={{ color: d ? "rgba(99,148,255,0.3)" : "rgba(37,99,235,0.3)", fontSize: 10 }}>·</span>
                        <p style={{ fontSize: 11, color: d ? "rgba(99,148,255,0.45)" : "rgba(37,99,235,0.4)", fontFamily: "'JetBrains Mono',monospace" }}>
                          SI/SPK: {order.noSiSpk}
                        </p>
                      </>
                    )}
                  </div>
                  {order.lokasiPekerjaan && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 6 }}>
                      <MapPin size={10} color={d ? "rgba(99,148,255,0.4)" : "rgba(37,99,235,0.4)"} />
                      <p style={{ fontSize: 12, color: d ? "rgba(99,148,255,0.45)" : "rgba(37,99,235,0.4)", fontWeight: 500 }}>
                        {order.lokasiPekerjaan}
                      </p>
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                  <span className={getStatusBadgeCls(order.statusOrder)}>
                    {order.statusOrder || "—"}
                  </span>
                  {order.tanggalOrder && (
                    <span style={{ fontSize: 11, color: d ? "rgba(99,148,255,0.42)" : "rgba(37,99,235,0.38)", fontWeight: 500, fontFamily: "'JetBrains Mono',monospace" }}>
                      {formatDate(order.tanggalOrder)}
                    </span>
                  )}
                  {order.jenisPekerjaan && (
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 6,
                      background: d ? "rgba(99,102,241,0.08)" : "rgba(37,99,235,0.06)",
                      border: `1px solid ${d ? "rgba(99,102,241,0.15)" : "rgba(37,99,235,0.12)"}`,
                      color: d ? "rgba(165,180,252,0.75)" : "#3b5bdb"
                    }}>
                      {order.jenisPekerjaan}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Overall completeness */}
            {order && <OverallCompleteness order={order} isDark={d} />}

            {/* Quick summary strip */}
            {order && (order.jenisPekerjaan || order.lokasiPekerjaan || order.nilaiProforma || order.estimasiTonase || order.nilaiInvoice) && (
              <div className={T("od-summary-dark","od-summary-light")} style={{ marginBottom: 22 }}>
                {order.nilaiProforma && (
                  <div className={`od-summary-item ${T("od-summary-item-dark","od-summary-item-light")}`}>
                    <span className={T("od-summary-key-dark","od-summary-key-light")}>Nilai Proforma</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: d ? "#4ade80" : "#15803d", fontFamily: "'JetBrains Mono',monospace" }}>
                      Rp {Number(order.nilaiProforma).toLocaleString("id-ID")}
                    </span>
                  </div>
                )}
                {order.nilaiInvoice && (
                  <div className={`od-summary-item ${T("od-summary-item-dark","od-summary-item-light")}`}>
                    <span className={T("od-summary-key-dark","od-summary-key-light")}>Nilai Invoice</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: d ? "#2dd4bf" : "#0f766e", fontFamily: "'JetBrains Mono',monospace" }}>
                      Rp {Number(order.nilaiInvoice).toLocaleString("id-ID")}
                    </span>
                  </div>
                )}
                {order.estimasiTonase && (
                  <div className={`od-summary-item ${T("od-summary-item-dark","od-summary-item-light")}`}>
                    <span className={T("od-summary-key-dark","od-summary-key-light")}>Est. Kuantitas</span>
                    <span className={T("od-summary-val-dark","od-summary-val-light")}>{order.estimasiTonase}</span>
                  </div>
                )}
                {order.tonaseDS && (
                  <div className={`od-summary-item ${T("od-summary-item-dark","od-summary-item-light")}`}>
                    <span className={T("od-summary-key-dark","od-summary-key-light")}>Tonase DS</span>
                    <span className={T("od-summary-val-dark","od-summary-val-light")}>{order.tonaseDS}</span>
                  </div>
                )}
                {order.namaTongkang && (
                  <div className={`od-summary-item ${T("od-summary-item-dark","od-summary-item-light")}`}>
                    <span className={T("od-summary-key-dark","od-summary-key-light")}>Tongkang</span>
                    <span className={T("od-summary-val-dark","od-summary-val-light")}>{order.namaTongkang}</span>
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
            {order && <NavigationInstruction currentStatus={order.statusOrder} userPeran={userPeran} />}
          </div>
        </div>

        {/* ── Field Groups ── */}
        {order ? (
          <>
            <SectionCard title="Informasi Umum" staggerClass="od-stagger-2" isDark={d}
              icon={<FileText size={13} color={iconColor} />}
              fields={SECTION_FIELDS.umum} order={order}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10 }}>
                {SECTION_FIELDS.umum.map(f => (
                  <FieldItem key={f.key} label={f.label} value={renderFieldValue(f, order)}
                    isDark={d} isMono={f.isMono} labelIcon={f.labelIcon} />
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Detail Pekerjaan" staggerClass="od-stagger-3" isDark={d}
              icon={<HardHat size={13} color={iconColor} />}
              fields={SECTION_FIELDS.pekerjaan} order={order}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10 }}>
                {SECTION_FIELDS.pekerjaan.map(f => (
                  <FieldItem key={f.key} label={f.label} value={renderFieldValue(f, order)}
                    isDark={d} isMono={f.isMono} labelIcon={f.labelIcon} />
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Proforma & Sertifikat" staggerClass="od-stagger-4" isDark={d}
              icon={<Award size={13} color={iconColor} />}
              fields={SECTION_FIELDS.proforma} order={order}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10 }}>
                {SECTION_FIELDS.proforma.map(f => (
                  <FieldItem key={f.key} label={f.label} value={renderFieldValue(f, order)}
                    isDark={d} isCurrency={f.special === "currency"} isMono={f.isMono} labelIcon={f.labelIcon} />
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Informasi Keuangan" staggerClass="od-stagger-5" isDark={d}
              icon={<Wallet size={13} color={iconColor} />}
              fields={SECTION_FIELDS.keuangan} order={order}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10 }}>
                {SECTION_FIELDS.keuangan.map(f => (
                  <FieldItem key={f.key} label={f.label} value={renderFieldValue(f, order)}
                    isDark={d} isCurrency={f.special === "currency"} isMono={f.isMono} labelIcon={f.labelIcon} />
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Distribusi Sertifikat" staggerClass="od-stagger-6" isDark={d}
              icon={<Send size={13} color={iconColor} />}
              fields={SECTION_FIELDS.distribusi} order={order}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10 }}>
                {SECTION_FIELDS.distribusi.map(f => (
                  <FieldItem key={f.key} label={f.label} value={renderFieldValue(f, order)}
                    isDark={d} labelIcon={f.labelIcon} />
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Meta Informasi" staggerClass="od-stagger-7" isDark={d}
              icon={<Info size={13} color={iconColor} />}
              fields={SECTION_FIELDS.meta} order={order}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10 }}>
                {SECTION_FIELDS.meta.map(f => (
                  <FieldItem key={f.key} label={f.label} value={renderFieldValue(f, order)}
                    isDark={d} labelIcon={f.labelIcon} />
                ))}
              </div>
            </SectionCard>
          </>
        ) : (
          /* Skeleton saat data belum ada tapi tidak error */
          !loading && (
            <div className={`od-mount od-stagger-2 ${T("od-section-dark","od-section-light")}`} style={{ marginBottom: 12 }}>
              <div className={T("od-sec-head-dark","od-sec-head-light")}>
                <div className={`od-skeleton ${T("od-skeleton-dark","od-skeleton-light")}`} style={{ width: 80, height: 12 }} />
              </div>
              <div style={{ padding: "18px 20px" }}>
                <SkeletonLoader isDark={d} />
              </div>
            </div>
          )
        )}

        {/* ── Action Bar ── */}
        {order && userPeran !== "koordinator" && (
          <div
            className="od-mount od-stagger-8"
            style={{
              display: "flex", flexWrap: "wrap",
              justifyContent: "space-between", alignItems: "center",
              gap: 12, marginTop: 16, padding: "18px 22px",
              background: d ? "rgba(255,255,255,0.018)" : "rgba(255,255,255,0.88)",
              border: `1px solid ${d ? "rgba(255,255,255,0.065)" : "rgba(59,130,246,0.1)"}`,
              borderRadius: 18, backdropFilter: "blur(20px)",
              boxShadow: d ? "0 8px 32px rgba(0,0,0,0.2)" : "0 4px 16px rgba(37,99,235,0.07)"
            }}
          >
            <button
              onClick={() => navigate(`/orders/${portofolio}`)}
              className={`od-btn-base ${T("od-btn-back-dark","od-btn-back-light")}`}
              style={{ border: "1px solid" }}
            >
              <ArrowLeft size={14} /> Kembali ke Daftar
            </button>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
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
                    <ClipboardEdit size={14} /> Lengkapi Data
                  </button>
                )
              )}
              {userPeran === "admin portofolio" && userBidang === portofolio && (
                <button
                  onClick={handleDelete}
                  className="od-btn-base od-btn-delete"
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