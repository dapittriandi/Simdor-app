/**
 * DashboardKeuangan.jsx  ·  v2.0
 * ─────────────────────────────────────────────────────────────
 * Dashboard keuangan premium — single file, best practices:
 *
 *  § 1  STYLES        — scoped .dkeu2, dark/light, animasi
 *  § 2  HELPERS       — formatter, month builder
 *  § 3  useKeuanganData — custom hook + Firestore
 *  § 4  SUB-COMPONENTS — memoized atoms
 *  § 5  MAIN COMPONENT
 *
 * Fitur baru vs v1:
 *  ✦ Dual-metric AreaChart  — Invoice vs Proforma per bulan
 *  ✦ Donut komposisi        — Invoice vs Proforma visual
 *  ✦ Top-3 insight cards    — Porto revenue tertinggi
 *  ✦ Cashflow delta card    — Selisih & rasio langsung
 *  ✦ Animated progress bars — Invoice & Proforma ratio
 *  ✦ Porto % share          — Kontribusi tiap portofolio
 *  ✦ Avg / bulan badge      — Insight tambahan di chart
 * ─────────────────────────────────────────────────────────────
 */

import {
  useState, useEffect, useCallback, useRef, useMemo, memo,
} from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../services/firebase";
import { collection, query, getDocs } from "firebase/firestore";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine, Cell, PieChart, Pie,
} from "recharts";
import {
  ChartBarIcon, ArrowPathIcon, BuildingLibraryIcon,
  ClipboardDocumentListIcon, CurrencyDollarIcon,
  ExclamationTriangleIcon, BanknotesIcon,
  ArrowTrendingUpIcon, CheckCircleIcon, ClockIcon,
  ArrowsRightLeftIcon,
} from "@heroicons/react/24/outline";
import { useTheme } from "../../components/layout/ThemeContext";
import { useUser }  from "../../context/UserContext";

/* ══════════════════════════════════════════════════════════════
   § 1  STYLES
══════════════════════════════════════════════════════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');

.dkeu2*,.dkeu2*::before,.dkeu2*::after{box-sizing:border-box;margin:0;padding:0}
.dkeu2{font-family:'Syne',sans-serif}
.dkeu2.dark {background:#07090f;min-height:100vh}
.dkeu2.light{background:#eef4ff;min-height:100vh}
.dkeu2-inner{max-width:1280px;margin:0 auto;padding:28px 20px}

/* ── Accent bar ── */
@keyframes dkeu2Flow{0%{background-position:0 0}100%{background-position:200% 0}}
.dkeu2-accent{height:2px;background-size:200% 100%;animation:dkeu2Flow 5s linear infinite;margin-bottom:28px;border-radius:2px}
.dkeu2.dark  .dkeu2-accent{background:linear-gradient(90deg,transparent,#1d4ed8 15%,#10b981 38%,#60a5fa 60%,#a78bfa 80%,transparent)}
.dkeu2.light .dkeu2-accent{background:linear-gradient(90deg,transparent,#2563eb 15%,#059669 38%,#93c5fd 60%,#6366f1 80%,transparent)}

/* ── Header ── */
.dkeu2-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;flex-wrap:wrap;gap:12px}
.dkeu2-header-left{display:flex;align-items:center;gap:12px}
.dkeu2-header-ico{width:44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.dkeu2.dark  .dkeu2-header-ico{background:rgba(16,185,129,.12);border:1px solid rgba(16,185,129,.22)}
.dkeu2.light .dkeu2-header-ico{background:rgba(255,255,255,.9);border:1px solid rgba(5,150,105,.2);box-shadow:0 1px 6px rgba(5,150,105,.1)}
.dkeu2-page-title{font-size:23px;font-weight:800;letter-spacing:-.03em;line-height:1.1}
.dkeu2.dark  .dkeu2-page-title{color:#e8ecf8}
.dkeu2.light .dkeu2-page-title{color:#1e3a5f}
.dkeu2-page-title em{font-style:normal;background:linear-gradient(135deg,#10b981,#60a5fa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.dkeu2-page-sub{font-size:12px;margin-top:2px}
.dkeu2.dark  .dkeu2-page-sub{color:rgba(52,211,153,.5)}
.dkeu2.light .dkeu2-page-sub{color:rgba(5,150,105,.5)}
.dkeu2-header-right{display:flex;align-items:center;gap:10px}
.dkeu2-live-dot{width:6px;height:6px;border-radius:50%;background:#22d3a0;box-shadow:0 0 7px #22d3a0}
@keyframes dkeu2Pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.75)}}
.dkeu2-live-dot{animation:dkeu2Pulse 2s ease-in-out infinite}
.dkeu2-last-update{font-size:11px;display:flex;align-items:center;gap:5px}
.dkeu2.dark  .dkeu2-last-update{color:rgba(52,211,153,.55)}
.dkeu2.light .dkeu2-last-update{color:rgba(5,150,105,.5)}

.dkeu2-btn-refresh{width:38px;height:38px;display:flex;align-items:center;justify-content:center;border-radius:11px;cursor:pointer;border:none;transition:all .2s;flex-shrink:0}
.dkeu2.dark  .dkeu2-btn-refresh{background:rgba(255,255,255,.04);border:1px solid rgba(52,211,153,.18);color:rgba(148,163,220,.75)}
.dkeu2.light .dkeu2-btn-refresh{background:rgba(255,255,255,.75);border:1px solid rgba(5,150,105,.2);color:#4b6ea8;box-shadow:0 1px 4px rgba(5,150,105,.08)}
.dkeu2.dark  .dkeu2-btn-refresh:hover{background:rgba(16,185,129,.1);border-color:rgba(52,211,153,.35);color:#34d399}
.dkeu2.light .dkeu2-btn-refresh:hover{background:rgba(5,150,105,.08);border-color:rgba(5,150,105,.35);color:#059669}
.dkeu2-btn-refresh:disabled{opacity:.4;cursor:not-allowed}
@keyframes dkeu2Spin{to{transform:rotate(360deg)}}
.dkeu2-spin{animation:dkeu2Spin .8s linear infinite}

/* ── Grid layouts ── */
.dkeu2-kpi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:14px;margin-bottom:16px}
.dkeu2-row2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
@media(max-width:720px){.dkeu2-row2{grid-template-columns:1fr}}
.dkeu2-row3{display:grid;grid-template-columns:2fr 1fr;gap:16px;margin-bottom:16px}
@media(max-width:800px){.dkeu2-row3{grid-template-columns:1fr}}

/* ── Card ── */
.dkeu2-card{border-radius:18px;overflow:hidden;transition:border-color .25s,box-shadow .25s}
.dkeu2.dark  .dkeu2-card{background:rgba(10,14,28,.88);border:1px solid rgba(52,211,153,.09);backdrop-filter:blur(20px)}
.dkeu2.light .dkeu2-card{background:rgba(255,255,255,.9);border:1px solid rgba(5,150,105,.11);box-shadow:0 2px 18px rgba(5,150,105,.06);backdrop-filter:blur(16px)}
.dkeu2.dark  .dkeu2-card:hover{border-color:rgba(52,211,153,.18);box-shadow:0 8px 40px rgba(0,0,0,.5)}
.dkeu2.light .dkeu2-card:hover{border-color:rgba(5,150,105,.24);box-shadow:0 6px 28px rgba(5,150,105,.1)}
/* per-color glow */
.dkeu2-card.glow-blue   :is(:hover){box-shadow:0 0 36px rgba(59,130,246,.18)!important}
.dkeu2-card.glow-green  :is(:hover){box-shadow:0 0 36px rgba(16,185,129,.16)!important}
.dkeu2-card.glow-teal   :is(:hover){box-shadow:0 0 36px rgba(13,148,136,.16)!important}
.dkeu2-card.glow-orange :is(:hover){box-shadow:0 0 36px rgba(249,115,22,.16)!important}
.dkeu2-card.glow-emerald:is(:hover){box-shadow:0 0 36px rgba(5,150,105,.16)!important}
.dkeu2-card-glow-blue   {box-shadow:0 0 32px rgba(59,130,246,.18)}
.dkeu2-card-glow-green  {box-shadow:0 0 32px rgba(16,185,129,.16)}
.dkeu2-card-glow-teal   {box-shadow:0 0 32px rgba(13,148,136,.16)}
.dkeu2-card-glow-orange {box-shadow:0 0 32px rgba(249,115,22,.16)}
.dkeu2-card-glow-emerald{box-shadow:0 0 32px rgba(5,150,105,.16)}

.dkeu2-card-head{padding:14px 20px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
.dkeu2.dark  .dkeu2-card-head{border-bottom:1px solid rgba(52,211,153,.07)}
.dkeu2.light .dkeu2-card-head{border-bottom:1px solid rgba(5,150,105,.09)}
.dkeu2-card-head-l{display:flex;align-items:center;gap:10px}
.dkeu2-card-ico{width:30px;height:30px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.dkeu2.dark  .dkeu2-card-ico.ico-blue   {background:rgba(59,130,246,.12);color:#60a5fa}
.dkeu2.dark  .dkeu2-card-ico.ico-green  {background:rgba(16,185,129,.11);color:#34d399}
.dkeu2.dark  .dkeu2-card-ico.ico-teal   {background:rgba(13,148,136,.11);color:#2dd4bf}
.dkeu2.dark  .dkeu2-card-ico.ico-orange {background:rgba(249,115,22,.1);color:#fb923c}
.dkeu2.dark  .dkeu2-card-ico.ico-purple {background:rgba(139,92,246,.11);color:#a78bfa}
.dkeu2.dark  .dkeu2-card-ico.ico-emerald{background:rgba(5,150,105,.12);color:#34d399}
.dkeu2.light .dkeu2-card-ico.ico-blue   {background:rgba(37,99,235,.1);color:#2563eb}
.dkeu2.light .dkeu2-card-ico.ico-green  {background:rgba(5,150,105,.1);color:#059669}
.dkeu2.light .dkeu2-card-ico.ico-teal   {background:rgba(15,118,110,.1);color:#0f766e}
.dkeu2.light .dkeu2-card-ico.ico-orange {background:rgba(234,88,12,.08);color:#ea580c}
.dkeu2.light .dkeu2-card-ico.ico-purple {background:rgba(124,58,237,.1);color:#7c3aed}
.dkeu2.light .dkeu2-card-ico.ico-emerald{background:rgba(5,150,105,.1);color:#059669}
.dkeu2-card-title{font-size:13.5px;font-weight:700;letter-spacing:-.01em}
.dkeu2.dark  .dkeu2-card-title{color:#e8ecf8}
.dkeu2.light .dkeu2-card-title{color:#1e3a5f}
.dkeu2-card-sub{font-size:10.5px;margin-top:1px}
.dkeu2.dark  .dkeu2-card-sub{color:rgba(52,211,153,.45)}
.dkeu2.light .dkeu2-card-sub{color:rgba(5,150,105,.45)}
.dkeu2-card-body{padding:18px 20px}

/* ── KPI card ── */
.dkeu2-kpi-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px}
.dkeu2-kpi-label{font-size:11.5px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;max-width:170px;line-height:1.45}
.dkeu2.dark  .dkeu2-kpi-label{color:rgba(148,163,220,.65)}
.dkeu2.light .dkeu2-kpi-label{color:#4b6ea8}
.dkeu2-kpi-ico{width:38px;height:38px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
/* reuse card-ico colors */
.dkeu2-kpi-val{font-family:'JetBrains Mono',monospace;font-size:32px;font-weight:700;letter-spacing:-.02em;line-height:1}
.dkeu2-kpi-val.blue   {background:linear-gradient(135deg,#3b82f6,#93c5fd);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.dkeu2-kpi-val.orange {background:linear-gradient(135deg,#f97316,#fdba74);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.dkeu2-kpi-val.green  {background:linear-gradient(135deg,#10b981,#6ee7b7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.dkeu2-kpi-val.emerald{background:linear-gradient(135deg,#059669,#34d399);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.dkeu2-kpi-val.teal   {background:linear-gradient(135deg,#0d9488,#5eead4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.dkeu2-kpi-sub{font-size:10px;font-family:'JetBrains Mono',monospace;margin-top:5px}
.dkeu2.dark  .dkeu2-kpi-sub{color:rgba(52,211,153,.3)}
.dkeu2.light .dkeu2-kpi-sub{color:rgba(5,150,105,.35)}
.dkeu2-kpi-badge{display:inline-flex;align-items:center;gap:4px;font-size:10.5px;font-weight:600;margin-top:8px;padding:3px 8px;border-radius:7px}
.dkeu2-kpi-badge.up   {background:rgba(16,185,129,.1);color:#34d399}
.dkeu2.light .dkeu2-kpi-badge.up{background:rgba(5,150,105,.1);color:#059669}
.dkeu2-kpi-badge.warn {background:rgba(249,115,22,.1);color:#fb923c}
.dkeu2.light .dkeu2-kpi-badge.warn{background:rgba(234,88,12,.08);color:#ea580c}

/* ── Finance ratio bars ── */
.dkeu2-ratio-section{display:flex;gap:28px;flex-wrap:wrap}
.dkeu2-ratio-left{flex:1 1 260px}
.dkeu2-ratio-row{margin-bottom:20px}
.dkeu2-ratio-meta{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:9px}
.dkeu2-ratio-lbl{font-size:12px;font-weight:600}
.dkeu2.dark  .dkeu2-ratio-lbl{color:rgba(148,163,220,.7)}
.dkeu2.light .dkeu2-ratio-lbl{color:#4b6ea8}
.dkeu2-ratio-val{font-family:'JetBrains Mono',monospace;font-size:19px;font-weight:700;margin-top:2px}
.dkeu2-ratio-pct{font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700}
.dkeu2-ratio-track{border-radius:99px;overflow:hidden;height:9px}
.dkeu2.dark  .dkeu2-ratio-track{background:rgba(52,211,153,.08)}
.dkeu2.light .dkeu2-ratio-track{background:rgba(5,150,105,.08)}
@keyframes dkeu2RatioFill{from{width:0%}}
.dkeu2-bar-invoice {height:100%;border-radius:99px;background:linear-gradient(90deg,#1d4ed8,#60a5fa);box-shadow:0 0 10px rgba(59,130,246,.4);animation:dkeu2RatioFill 1.1s cubic-bezier(.22,1,.36,1) forwards}
.dkeu2-bar-proforma{height:100%;border-radius:99px;background:linear-gradient(90deg,#0d9488,#5eead4);box-shadow:0 0 10px rgba(13,148,136,.4);animation:dkeu2RatioFill 1.1s .15s cubic-bezier(.22,1,.36,1) forwards}

/* ── Cashflow summary rows ── */
.dkeu2-ratio-right{flex:1 1 200px;display:flex;flex-direction:column;gap:0}
.dkeu2-cf-row{display:flex;justify-content:space-between;align-items:center;padding:10px 0}
.dkeu2.dark  .dkeu2-cf-row+.dkeu2-cf-row{border-top:1px solid rgba(52,211,153,.07)}
.dkeu2.light .dkeu2-cf-row+.dkeu2-cf-row{border-top:1px solid rgba(5,150,105,.07)}
.dkeu2-cf-label{font-size:12px}
.dkeu2.dark  .dkeu2-cf-label{color:rgba(148,163,220,.7)}
.dkeu2.light .dkeu2-cf-label{color:#4b6ea8}
.dkeu2-cf-val{font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;margin-left:12px;white-space:nowrap}

/* ── Donut SVG ── */
.dkeu2-donut-wrap{display:flex;align-items:center;gap:20px;padding:18px 20px;flex-wrap:wrap}
.dkeu2-donut-legend{display:flex;flex-direction:column;gap:12px;flex:1;min-width:140px}
.dkeu2-donut-legend-row{display:flex;align-items:center;gap:8px;font-size:12px}
.dkeu2.dark  .dkeu2-donut-legend-row{color:#c8d0e8}
.dkeu2.light .dkeu2-donut-legend-row{color:#334e7a}
.dkeu2-donut-legend-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
.dkeu2-donut-legend-val{font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;margin-left:auto}
.dkeu2.dark  .dkeu2-donut-legend-val{color:#e8ecf8}
.dkeu2.light .dkeu2-donut-legend-val{color:#1e3a5f}

/* ── Portofolio grid ── */
.dkeu2-porto-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:10px}
.dkeu2-porto-card{border-radius:12px;padding:14px 15px;transition:all .2s;cursor:default}
.dkeu2.dark  .dkeu2-porto-card{background:rgba(255,255,255,.025);border:1px solid rgba(52,211,153,.09)}
.dkeu2.light .dkeu2-porto-card{background:rgba(255,255,255,.75);border:1px solid rgba(5,150,105,.1);box-shadow:0 1px 6px rgba(5,150,105,.05)}
.dkeu2.dark  .dkeu2-porto-card:hover{background:rgba(16,185,129,.07);border-color:rgba(52,211,153,.22)}
.dkeu2.light .dkeu2-porto-card:hover{background:rgba(255,255,255,1);border-color:rgba(5,150,105,.25);box-shadow:0 4px 16px rgba(5,150,105,.09)}
.dkeu2-porto-card.top1{border-color:rgba(251,191,36,.35)!important}
.dkeu2.dark  .dkeu2-porto-card.top1{background:rgba(251,191,36,.04)!important}
.dkeu2.light .dkeu2-porto-card.top1{background:rgba(255,251,235,.7)!important}
.dkeu2-porto-name{font-size:9.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;margin-bottom:7px}
.dkeu2.dark  .dkeu2-porto-name{color:rgba(52,211,153,.5)}
.dkeu2.light .dkeu2-porto-name{color:rgba(5,150,105,.45)}
.dkeu2-porto-val{font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:700}
.dkeu2.dark  .dkeu2-porto-val{color:#93c5fd}
.dkeu2.light .dkeu2-porto-val{color:#1d4ed8}
.dkeu2-porto-full{font-size:9px;font-family:'JetBrains Mono',monospace;margin-top:2px}
.dkeu2.dark  .dkeu2-porto-full{color:rgba(52,211,153,.28)}
.dkeu2.light .dkeu2-porto-full{color:rgba(5,150,105,.3)}
.dkeu2-porto-pct{font-size:9px;font-family:'JetBrains Mono',monospace;margin-top:4px}
.dkeu2.dark  .dkeu2-porto-pct{color:rgba(99,148,255,.4)}
.dkeu2.light .dkeu2-porto-pct{color:rgba(37,99,235,.38)}
.dkeu2-porto-track{height:3px;border-radius:99px;margin-top:8px;overflow:hidden}
.dkeu2.dark  .dkeu2-porto-track{background:rgba(52,211,153,.08)}
.dkeu2.light .dkeu2-porto-track{background:rgba(5,150,105,.08)}
.dkeu2-porto-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,#059669,#34d399);transition:width 1.1s cubic-bezier(.22,1,.36,1)}
.dkeu2-porto-card.top1 .dkeu2-porto-fill{background:linear-gradient(90deg,#d97706,#fbbf24)}

/* ── Total pill ── */
.dkeu2-total-pill{padding:9px 16px;border-radius:14px;text-align:right;flex-shrink:0}
.dkeu2.dark  .dkeu2-total-pill{background:rgba(16,185,129,.12);border:1px solid rgba(52,211,153,.2)}
.dkeu2.light .dkeu2-total-pill{background:rgba(209,250,229,.7);border:1px solid rgba(52,211,153,.25)}
.dkeu2-total-lbl{font-size:11px}
.dkeu2.dark  .dkeu2-total-lbl{color:rgba(148,163,220,.65)}
.dkeu2.light .dkeu2-total-lbl{color:#4b6ea8}
.dkeu2-total-val{font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:700;margin-top:2px}
.dkeu2.dark  .dkeu2-total-val{color:#34d399}
.dkeu2.light .dkeu2-total-val{color:#059669}

/* ── Chart tooltip ── */
.dkeu2-tip{padding:11px 14px;border-radius:11px}
.dkeu2-tip.dark {background:rgba(7,9,15,.97);border:1px solid rgba(52,211,153,.18)}
.dkeu2-tip.light{background:rgba(248,253,250,.98);border:1px solid rgba(5,150,105,.15)}
.dkeu2-tip-title{font-weight:700;font-size:12px;margin-bottom:5px}
.dkeu2-tip.dark  .dkeu2-tip-title{color:#5eead4}
.dkeu2-tip.light .dkeu2-tip-title{color:#0f766e}
.dkeu2-tip-row{font-size:11px;font-family:'JetBrains Mono',monospace;margin-top:2px;display:flex;align-items:center;gap:6px}
.dkeu2-tip.dark  .dkeu2-tip-row{color:#c8d0e8}
.dkeu2-tip.light .dkeu2-tip-row{color:#334e7a}
.dkeu2-tip-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}

/* ── Chart legend & footer ── */
.dkeu2-chart-legend{display:flex;gap:14px;align-items:center;flex-wrap:wrap}
.dkeu2-chart-legend span{display:flex;align-items:center;gap:5px;font-size:10.5px}
.dkeu2.dark  .dkeu2-chart-legend span{color:rgba(99,148,255,.7)}
.dkeu2.light .dkeu2-chart-legend span{color:rgba(37,99,235,.55)}
.dkeu2-legend-sq{width:10px;height:10px;border-radius:2px;display:inline-block}
.dkeu2-chart-footer{display:flex;justify-content:space-between;align-items:center;padding:11px 20px;flex-wrap:wrap;gap:8px;font-size:11px}
.dkeu2.dark  .dkeu2-chart-footer{border-top:1px solid rgba(52,211,153,.06);color:rgba(74,85,128,.8)}
.dkeu2.light .dkeu2-chart-footer{border-top:1px solid rgba(5,150,105,.08);color:rgba(37,99,235,.5)}
.dkeu2-chart-footer span{display:flex;align-items:center;gap:5px}

/* ── Error banner ── */
.dkeu2-error{display:flex;align-items:flex-start;gap:12px;padding:13px 16px;border-radius:14px;margin-bottom:20px}
.dkeu2.dark  .dkeu2-error{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.25);color:#fca5a5}
.dkeu2.light .dkeu2-error{background:rgba(254,226,226,.8);border:1px solid rgba(252,165,165,.5);color:#b91c1c}
.dkeu2-retry-btn{margin-left:auto;padding:5px 12px;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid currentColor;background:transparent;color:inherit;transition:opacity .2s;flex-shrink:0}
.dkeu2-retry-btn:hover{opacity:.7}

/* ── Skeleton ── */
@keyframes dkeu2Shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
.dkeu2.dark  .dkeu2-skel{background:linear-gradient(90deg,rgba(16,24,50,.7) 25%,rgba(30,50,90,.4) 50%,rgba(16,24,50,.7) 75%);background-size:800px 100%;animation:dkeu2Shimmer 1.7s infinite linear;border-radius:8px}
.dkeu2.light .dkeu2-skel{background:linear-gradient(90deg,rgba(209,250,229,.6) 25%,rgba(167,243,208,.4) 50%,rgba(209,250,229,.6) 75%);background-size:800px 100%;animation:dkeu2Shimmer 1.7s infinite linear;border-radius:8px}

/* ── Animations ── */
@keyframes dkeu2PageIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes dkeu2CardIn{from{opacity:0;transform:translateY(20px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}
.dkeu2-p {animation:dkeu2PageIn .55s cubic-bezier(.22,1,.36,1) both}
.dkeu2-c1{animation:dkeu2CardIn .55s .05s cubic-bezier(.22,1,.36,1) both}
.dkeu2-c2{animation:dkeu2CardIn .55s .10s cubic-bezier(.22,1,.36,1) both}
.dkeu2-c3{animation:dkeu2CardIn .55s .15s cubic-bezier(.22,1,.36,1) both}
.dkeu2-c4{animation:dkeu2CardIn .55s .20s cubic-bezier(.22,1,.36,1) both}
.dkeu2-c5{animation:dkeu2CardIn .55s .25s cubic-bezier(.22,1,.36,1) both}
.dkeu2-c6{animation:dkeu2CardIn .55s .31s cubic-bezier(.22,1,.36,1) both}
.dkeu2-c7{animation:dkeu2CardIn .55s .37s cubic-bezier(.22,1,.36,1) both}
.dkeu2-c8{animation:dkeu2CardIn .55s .43s cubic-bezier(.22,1,.36,1) both}
.dkeu2-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
`;

/* ══════════════════════════════════════════════════════════════
   § 2  HELPERS
══════════════════════════════════════════════════════════════ */
const getLast12Months = () => {
  const NAMES = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  const now = new Date();
  return Array.from({ length:12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    return `${NAMES[d.getMonth()]} ${d.getFullYear()}`;
  });
};

const fShort = (v) => {
  if (v >= 1e12) return `${(v/1e12).toFixed(1)} T`;
  if (v >= 1e9)  return `${(v/1e9).toFixed(1)} M`;
  if (v >= 1e6)  return `${(v/1e6).toFixed(1)} Jt`;
  if (v >= 1e3)  return `${(v/1e3).toFixed(1)} Rb`;
  return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(v);
};
const fFull = (v) =>
  new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(v);

const PORTO_LIST = [
  "BATUBARA","KSP","PIK","INDUSTRI","HMPM",
  "AEBT","MINERAL","HALAL","LABORATORIUM","SERCO","LSI",
];

/* ══════════════════════════════════════════════════════════════
   § 3  useKeuanganData — custom hook
══════════════════════════════════════════════════════════════ */
const useKeuanganData = () => {
  const [data, setData]     = useState({
    totalOrders:0, inProcess:0, completed:0,
    totalInvoice:0, totalProforma:0,
    revenueByPorto: Object.fromEntries(PORTO_LIST.map((p) => [p, 0])),
    orderTrends:  [],  // [{ bulan, jumlah }]
    financeTrends:[], // [{ bulan, invoice, proforma }]  ← NEW
  });
  const [status, setStatus] = useState({ loading:true, refreshing:false, error:null });
  const mountedRef          = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchData = useCallback(async (isRefresh = false) => {
    setStatus((s) => isRefresh
      ? { ...s, refreshing:true, error:null }
      : { loading:true, refreshing:false, error:null }
    );
    try {
      const snap   = await getDocs(query(collection(db, "orders")));
      const months = getLast12Months();

      let totalOrders = snap.size, inProcess = 0, completed = 0;
      let totalInvoice = 0, totalProforma = 0;
      const revenueByPorto   = Object.fromEntries(PORTO_LIST.map((p) => [p, 0]));
      const orderTrendMap    = {};
      const invoiceTrendMap  = {};
      const proformaTrendMap = {};

      snap.forEach((doc) => {
        const d  = doc.data();
        const iv = isNaN(Number(d.nilaiInvoice))  ? 0 : Number(d.nilaiInvoice);
        const pf = isNaN(Number(d.nilaiProforma)) ? 0 : Number(d.nilaiProforma);

        totalInvoice  += iv;
        totalProforma += pf;
        if (d.statusOrder === "Penerbitan Proforma") inProcess++;
        if (d.statusOrder === "Selesai") completed++;

        if (d.tanggalOrder?.seconds) {
          const key = new Date(d.tanggalOrder.seconds * 1000)
            .toLocaleDateString("id-ID",{month:"short",year:"numeric"});
          if (months.includes(key)) {
            orderTrendMap[key]    = (orderTrendMap[key]    || 0) + 1;
            invoiceTrendMap[key]  = (invoiceTrendMap[key]  || 0) + iv;
            proformaTrendMap[key] = (proformaTrendMap[key] || 0) + pf;
          }
        }

        if (d.portofolio) {
          const fp = d.portofolio.trim().toUpperCase();
          if (Object.hasOwn(revenueByPorto, fp)) revenueByPorto[fp] += iv;
        }
      });

      if (!mountedRef.current) return;
      setData({
        totalOrders, inProcess, completed, totalInvoice, totalProforma,
        revenueByPorto,
        orderTrends:   months.map((m) => ({ bulan:m, jumlah: orderTrendMap[m]||0 })),
        financeTrends: months.map((m) => ({
          bulan:    m,
          invoice:  +(((invoiceTrendMap[m]||0)/1e6).toFixed(2)),
          proforma: +(((proformaTrendMap[m]||0)/1e6).toFixed(2)),
        })),
      });
      setStatus({ loading:false, refreshing:false, error:null });

    } catch (err) {
      console.error("[useKeuanganData]", err);
      if (mountedRef.current)
        setStatus({ loading:false, refreshing:false, error: err.message || "Gagal memuat data." });
    }
  }, []);

  useEffect(() => { fetchData(false); }, [fetchData]);
  const refresh = useCallback(() => fetchData(true), [fetchData]);
  return { data, status, refresh };
};

/* ══════════════════════════════════════════════════════════════
   § 4  SUB-COMPONENTS
══════════════════════════════════════════════════════════════ */

const Skel = memo(({ h=16, w="100%", r=8 }) => (
  <div className="dkeu2-skel" style={{ height:h, width:w, borderRadius:r }} />
));

const KpiSkel = memo(() => (
  <div className="dkeu2-card" style={{ padding:"20px 22px", pointerEvents:"none" }}>
    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
      <Skel h={13} w="58%" /><Skel h={38} w={38} r={12} />
    </div>
    <Skel h={40} w="46%" />
    <div style={{ marginTop:7 }}><Skel h={10} w="32%" /></div>
  </div>
));

const ChartSkel = memo(({ dual = false }) => (
  <div style={{ height: dual ? 280 : 340, display:"flex", alignItems:"flex-end", gap:9, padding:"0 8px" }}>
    {[55,75,60,88,65,42,80,62,72,48,85,70].map((h, i) => (
      <div key={i} className="dkeu2-skel" style={{ flex:1, height:`${h}%`, borderRadius:"6px 6px 0 0" }} />
    ))}
  </div>
));

/* Dual-metric area chart tooltip */
const FinanceTip = memo(({ active, payload, label, isDark }) => {
  if (!active || !payload?.length) return null;
  const d = isDark;
  return (
    <div className={`dkeu2-tip ${d ? "dark" : "light"}`}>
      <p className="dkeu2-tip-title">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="dkeu2-tip-row">
          <span className="dkeu2-tip-dot" style={{ background: p.color }} />
          {p.name}: <strong>{p.value} Jt</strong>
        </p>
      ))}
    </div>
  );
});

/* Order trend chart tooltip */
const OrderTip = memo(({ active, payload, label, isDark }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={`dkeu2-tip ${isDark ? "dark" : "light"}`}>
      <p className="dkeu2-tip-title">{label}</p>
      <p className="dkeu2-tip-row">
        <span className="dkeu2-tip-dot" style={{ background:"#60a5fa" }} />
        Jumlah Order: <strong>{payload[0]?.value}</strong>
      </p>
    </div>
  );
});

/* SVG Donut chart (no recharts — pure SVG for full control) */
const DonutChart = memo(({ invoice, proforma, isDark }) => {
  const total    = invoice + proforma;
  const ivPct    = total > 0 ? invoice  / total : 0.5;
  const pfPct    = total > 0 ? proforma / total : 0.5;
  const r        = 44;
  const circ     = 2 * Math.PI * r;
  const ivDash   = ivPct * circ;
  const pfOffset = circ - ivDash;

  return (
    <div className="dkeu2-donut-wrap">
      <svg width={110} height={110} viewBox="0 0 110 110"
           role="img" aria-label="Donut chart komposisi invoice vs proforma">
        <defs>
          <linearGradient id="dkeuIvGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1d4ed8"/><stop offset="100%" stopColor="#93c5fd"/>
          </linearGradient>
          <linearGradient id="dkeuPfGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0d9488"/><stop offset="100%" stopColor="#5eead4"/>
          </linearGradient>
        </defs>
        {/* track */}
        <circle cx={55} cy={55} r={r} fill="none" strokeWidth={11}
                stroke={isDark ? "rgba(52,211,153,.07)" : "rgba(5,150,105,.08)"} />
        {/* invoice arc */}
        <circle cx={55} cy={55} r={r} fill="none" strokeWidth={11}
                stroke="url(#dkeuIvGrad)" strokeLinecap="butt"
                strokeDasharray={`${ivDash} ${circ - ivDash}`}
                transform="rotate(-90 55 55)"
                style={{ transition:"stroke-dasharray 1.2s cubic-bezier(.22,1,.36,1)" }} />
        {/* proforma arc */}
        <circle cx={55} cy={55} r={r} fill="none" strokeWidth={11}
                stroke="url(#dkeuPfGrad)" strokeLinecap="butt"
                strokeDasharray={`${pfPct * circ} ${circ - pfPct * circ}`}
                strokeDashoffset={-ivDash}
                transform="rotate(-90 55 55)"
                style={{ transition:"stroke-dasharray 1.2s .15s cubic-bezier(.22,1,.36,1)" }} />
        {/* center text */}
        <text x={55} y={50} textAnchor="middle"
              style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13, fontWeight:700,
                       fill: isDark ? "#34d399" : "#059669" }}>
          {fShort(total)}
        </text>
        <text x={55} y={64} textAnchor="middle"
              style={{ fontFamily:"'Syne',sans-serif", fontSize:9,
                       fill: isDark ? "rgba(52,211,153,.45)" : "rgba(5,150,105,.45)" }}>
          total
        </text>
      </svg>

      <div className="dkeu2-donut-legend">
        {[
          { label:"Invoice (Fee)", val: fShort(invoice), pct:(ivPct*100).toFixed(1), color:"#3b82f6" },
          { label:"Proforma (PAD)",  val: fShort(proforma), pct:(pfPct*100).toFixed(1), color:"#0d9488" },
        ].map((row) => (
          <div key={row.label} className="dkeu2-donut-legend-row">
            <span className="dkeu2-donut-legend-dot" style={{ background:row.color }} />
            <div style={{ flex:1 }}>
              <div style={{ fontSize:11.5, fontWeight:600 }}>{row.label}</div>
              <div style={{ fontSize:9.5, fontFamily:"'JetBrains Mono',monospace",
                            color: isDark?"rgba(52,211,153,.45)":"rgba(5,150,105,.4)", marginTop:1 }}>
                {row.pct}% dari total
              </div>
            </div>
            <span className="dkeu2-donut-legend-val">{row.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

/* Porto revenue card with mini bar */
const PortoCard = memo(({ name, value, totalPorto, rank }) => {
  const pct     = totalPorto > 0 ? value / totalPorto * 100 : 0;
  const isTop   = rank === 0;
  return (
    <div className={`dkeu2-porto-card${isTop ? " top1" : ""}`}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <p className="dkeu2-porto-name">{name}</p>
        {isTop && <span style={{ fontSize:12 }}>🥇</span>}
      </div>
      <p className="dkeu2-porto-val">{fShort(value)}</p>
      <p className="dkeu2-porto-full">{fFull(value)}</p>
      <div className="dkeu2-porto-track" aria-hidden>
        <div className="dkeu2-porto-fill" style={{ width:`${pct}%` }} />
      </div>
      <p className="dkeu2-porto-pct">{pct.toFixed(1)}% dari total</p>
    </div>
  );
});

/* Error banner */
const ErrorBanner = memo(({ message, onRetry }) => (
  <div className="dkeu2-error">
    <ExclamationTriangleIcon style={{ width:18, height:18, flexShrink:0 }} />
    <div style={{ flex:1 }}>
      <p style={{ fontWeight:600, fontSize:13, marginBottom:2 }}>Gagal Memuat Data</p>
      <p style={{ fontSize:11, opacity:.8 }}>{message}</p>
    </div>
    <button className="dkeu2-retry-btn" onClick={onRetry}>Coba Lagi</button>
  </div>
));

/* ══════════════════════════════════════════════════════════════
   § 5  MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
const DashboardKeuangan = () => {
  const navigate        = useNavigate();
  const { isDark }      = useTheme();
  const { activeUser }  = useUser();
  const d               = isDark;

  /* ── Auth ── */
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (!activeUser) return;
    if (activeUser.peran?.toLowerCase() !== "admin keuangan") navigate("/");
  }, [activeUser, navigate]);

  /* ── Data ── */
  const { data, status, refresh } = useKeuanganData();
  const { loading, refreshing, error } = status;

  /* ── Derived ── */
  const totalPorto = useMemo(
    () => Object.values(data.revenueByPorto).reduce((s, v) => s + v, 0),
    [data.revenueByPorto]
  );

  const totalFinance   = data.totalInvoice + data.totalProforma;
  const invoicePct     = totalFinance > 0 ? (data.totalInvoice  / totalFinance * 100) : 0;
  const proformaPct    = totalFinance > 0 ? (data.totalProforma / totalFinance * 100) : 0;

  const chartAvg = useMemo(() => {
    if (!data.orderTrends.length) return 0;
    return Math.round(data.orderTrends.reduce((s, t) => s + t.jumlah, 0) / data.orderTrends.length);
  }, [data.orderTrends]);

  const totalTrend = useMemo(
    () => data.orderTrends.reduce((s, t) => s + t.jumlah, 0),
    [data.orderTrends]
  );

  /* Porto sorted for rank */
  const sortedPorto = useMemo(
    () => PORTO_LIST.map((p) => ({ name:p, value: data.revenueByPorto[p]||0 }))
                    .sort((a, b) => b.value - a.value),
    [data.revenueByPorto]
  );
  const portoRankMap = useMemo(
    () => Object.fromEntries(sortedPorto.map((p, i) => [p.name, i])),
    [sortedPorto]
  );

  /* KPI cards */
  const kpiCards = useMemo(() => [
    {
      key:"total",   label:"Total Order",
      display: data.totalOrders.toLocaleString("id-ID"),
      color:"blue",   glow:"dkeu2-card-glow-blue",   anim:"dkeu2-c1",
      badge:{ text:"Semua bidang", type:"up" },
      Icon: ClipboardDocumentListIcon,
    },
    {
      key:"proses",  label:"Menunggu Invoice",
      display: data.inProcess.toLocaleString("id-ID"),
      sub:"Status: Penerbitan Proforma",
      color:"orange",  glow:"dkeu2-card-glow-orange",  anim:"dkeu2-c2",
      badge:{ text:"Perlu tindak lanjut", type:"warn" },
      Icon: ClockIcon,
    },
    {
      key:"selesai", label:"Order Selesai",
      display: data.completed.toLocaleString("id-ID"),
      sub:"Status: Selesai",
      color:"green",  glow:"dkeu2-card-glow-green",  anim:"dkeu2-c3",
      badge:{ text:"Terkonfirmasi", type:"up" },
      Icon: CheckCircleIcon,
    },
    {
      key:"proforma", label:"Total Proforma (PAD)",
      display: fShort(data.totalProforma),
      sub:     fFull(data.totalProforma),
      color:"teal",   glow:"dkeu2-card-glow-teal",   anim:"dkeu2-c4",
      Icon: BanknotesIcon,
    },
    {
      key:"invoice",  label:"Total Invoice (Fee)",
      display: fShort(data.totalInvoice),
      sub:     fFull(data.totalInvoice),
      color:"emerald", glow:"dkeu2-card-glow-emerald", anim:"dkeu2-c5",
      Icon: CurrencyDollarIcon,
    },
  ], [data]);

  const axisColor = d ? "rgba(52,211,153,.4)"  : "rgba(5,150,105,.4)";
  const gridColor = d ? "rgba(52,211,153,.06)" : "rgba(5,150,105,.06)";

  const handleRefresh = useCallback(() => { if (!refreshing) refresh(); }, [refresh, refreshing]);

  return (
    <>
      <style>{STYLES}</style>

      <main className={`dkeu2 ${d ? "dark" : "light"} ${mounted ? "dkeu2-p" : ""}`}
            role="main" aria-label="Dashboard Keuangan"
            style={{ transition:"background .4s ease" }}>

        <span className="dkeu2-sr">Dashboard Keuangan SIMDOR — ringkasan invoice, proforma, dan tren order</span>

        <div className="dkeu2-inner">

          {/* ══ ACCENT ══ */}
          <div className="dkeu2-accent" aria-hidden />

          {/* ══ HEADER ══ */}
          <header className="dkeu2-header dkeu2-p">
            <div className="dkeu2-header-left">
              <div className="dkeu2-header-ico" aria-hidden>
                <BuildingLibraryIcon style={{ width:23, height:23, color: d?"#34d399":"#059669" }} />
              </div>
              <div>
                <h1 className="dkeu2-page-title">Dashboard <em>Keuangan</em></h1>
                <p className="dkeu2-page-sub">SIMDOR — Invoice, Proforma &amp; Tren Order</p>
              </div>
            </div>
            <div className="dkeu2-header-right">
              <div className="dkeu2-last-update">
                <div className="dkeu2-live-dot" aria-hidden />
                <span>Real-time</span>
              </div>
              <button className="dkeu2-btn-refresh" onClick={handleRefresh}
                      disabled={refreshing || loading}
                      aria-label="Refresh data" title="Refresh data">
                <ArrowPathIcon style={{ width:17, height:17 }}
                               className={refreshing ? "dkeu2-spin" : ""} />
              </button>
            </div>
          </header>

          {/* ══ ERROR ══ */}
          {error && <ErrorBanner message={error} onRetry={handleRefresh} />}

          {/* ══ KPI CARDS ══ */}
          <section className="dkeu2-kpi-grid" aria-label="Statistik keuangan utama">
            {loading
              ? [1,2,3,4,5].map((i) => <KpiSkel key={i} />)
              : kpiCards.map(({ key, label, display, sub, badge, color, glow, anim, Icon }) => (
                  <article key={key} className={`dkeu2-card ${glow} ${anim}`}
                           style={{ padding:"20px 22px" }} aria-label={label}>
                    <div className="dkeu2-kpi-top">
                      <p className="dkeu2-kpi-label">{label}</p>
                      <div className={`dkeu2-kpi-ico ico-${color}`} aria-hidden>
                        <Icon style={{ width:20, height:20 }} />
                      </div>
                    </div>
                    <p className={`dkeu2-kpi-val ${color}`}>{display}</p>
                    {sub   && <p className="dkeu2-kpi-sub">{sub}</p>}
                    {badge && (
                      <div className={`dkeu2-kpi-badge ${badge.type}`}>{badge.text}</div>
                    )}
                  </article>
                ))
            }
          </section>

          {/* ══ FINANCE RATIO + DONUT ══ */}
          <div className="dkeu2-row2">

            {/* Finance ratio bars + summary rows */}
            <section className="dkeu2-card dkeu2-c6" aria-label="Ringkasan keuangan invoice dan proforma">
              <div className="dkeu2-card-head">
                <div className="dkeu2-card-head-l">
                  <div className="dkeu2-card-ico ico-blue" aria-hidden>
                    <ArrowTrendingUpIcon style={{ width:14, height:14 }} />
                  </div>
                  <div>
                    <p className="dkeu2-card-title">Ringkasan Keuangan</p>
                    <p className="dkeu2-card-sub">Perbandingan Invoice vs Proforma</p>
                  </div>
                </div>
              </div>
              <div className="dkeu2-card-body">
                {loading
                  ? <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                      {[1,2,3,4,5,6].map((i) => <Skel key={i} h={i%2===0?8:14} w={i%2===0?"100%":"50%"} />)}
                    </div>
                  : (
                    <div className="dkeu2-ratio-section">
                      {/* Bars */}
                      <div className="dkeu2-ratio-left">
                        {[
                          {
                            key:"invoice", label:"Invoice (Fee)", val:data.totalInvoice,
                            pct:invoicePct, barCls:"dkeu2-bar-invoice",
                            valColor: d?"#60a5fa":"#2563eb", pctColor: d?"#60a5fa":"#2563eb",
                          },
                          {
                            key:"proforma", label:"Proforma (PAD)", val:data.totalProforma,
                            pct:proformaPct, barCls:"dkeu2-bar-proforma",
                            valColor: d?"#5eead4":"#0d9488", pctColor: d?"#5eead4":"#0d9488",
                          },
                        ].map((row) => (
                          <div key={row.key} className="dkeu2-ratio-row">
                            <div className="dkeu2-ratio-meta">
                              <div>
                                <p className="dkeu2-ratio-lbl">{row.label}</p>
                                <p className="dkeu2-ratio-val" style={{
                                  background: row.key === "invoice"
                                    ? "linear-gradient(135deg,#3b82f6,#93c5fd)"
                                    : "linear-gradient(135deg,#0d9488,#5eead4)",
                                  WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text"
                                }}>
                                  {fShort(row.val)}
                                </p>
                              </div>
                              <span className="dkeu2-ratio-pct" style={{ color:row.pctColor }}>
                                {row.pct.toFixed(1)}%
                              </span>
                            </div>
                            <div className="dkeu2-ratio-track">
                              <div className={row.barCls} style={{ width:`${row.pct}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Summary rows */}
                      <div className="dkeu2-ratio-right">
                        {[
                          { label:"Total Invoice + Proforma",
                            val:fFull(totalFinance),
                            color: d?"#e8ecf8":"#1e3a5f" },
                          { label:"Selisih (Invoice − Proforma)",
                            val:fShort(Math.abs(data.totalInvoice - data.totalProforma)),
                            color: d?"#93c5fd":"#2563eb" },
                          { label:"Menunggu penerbitan invoice",
                            val:data.inProcess,
                            color: d?"#fdba74":"#ea580c" },
                          { label:"Order selesai terkonfirmasi",
                            val:data.completed,
                            color: d?"#6ee7b7":"#059669" },
                        ].map((row) => (
                          <div key={row.label} className="dkeu2-cf-row">
                            <span className="dkeu2-cf-label">{row.label}</span>
                            <span className="dkeu2-cf-val" style={{ color:row.color }}>
                              {row.val}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }
              </div>
            </section>

            {/* Donut komposisi */}
            <section className="dkeu2-card dkeu2-c7" aria-label="Komposisi keuangan">
              <div className="dkeu2-card-head">
                <div className="dkeu2-card-head-l">
                  <div className="dkeu2-card-ico ico-teal" aria-hidden>
                    <ArrowsRightLeftIcon style={{ width:14, height:14 }} />
                  </div>
                  <div>
                    <p className="dkeu2-card-title">Komposisi Keuangan</p>
                    <p className="dkeu2-card-sub">Proporsi Invoice vs Proforma</p>
                  </div>
                </div>
              </div>
              {loading
                ? <div style={{ padding:"18px 20px", display:"flex", flexDirection:"column", gap:14 }}>
                    <Skel h={110} w={110} r={55} /><Skel h={14} /><Skel h={14} />
                  </div>
                : <DonutChart invoice={data.totalInvoice} proforma={data.totalProforma} isDark={d} />
              }
            </section>
          </div>

          {/* ══ DUAL FINANCE TREND CHART ══ */}
          <section className="dkeu2-card dkeu2-c7" style={{ marginBottom:16 }}
                   aria-label="Tren keuangan per bulan">
            <div className="dkeu2-card-head">
              <div className="dkeu2-card-head-l">
                <div className="dkeu2-card-ico ico-emerald" aria-hidden>
                  <ArrowTrendingUpIcon style={{ width:14, height:14 }} />
                </div>
                <div>
                  <p className="dkeu2-card-title">Tren Keuangan per Bulan</p>
                  <p className="dkeu2-card-sub">Invoice vs Proforma (dalam jutaan Rp)</p>
                </div>
              </div>
              <div className="dkeu2-chart-legend" aria-hidden>
                <span>
                  <span className="dkeu2-legend-sq" style={{ background: d?"#3b82f6":"#2563eb" }} />
                  Invoice
                </span>
                <span>
                  <span className="dkeu2-legend-sq" style={{ background: d?"#0d9488":"#0f766e" }} />
                  Proforma
                </span>
              </div>
            </div>

            <div style={{ padding:"20px 20px 8px" }}>
              {loading
                ? <ChartSkel dual />
                : data.financeTrends.length > 0
                  ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={data.financeTrends} margin={{ top:8, right:8, left:-16, bottom:4 }}>
                        <defs>
                          <linearGradient id="dkeuIvArea" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%"   stopColor="#3b82f6" stopOpacity={d?.35:.22} />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="dkeuPfArea" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%"   stopColor="#0d9488" stopOpacity={d?.3:.18} />
                            <stop offset="100%" stopColor="#0d9488" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                        <XAxis dataKey="bulan"
                               tick={{ fill:axisColor, fontFamily:"'Syne',sans-serif", fontSize:10 }}
                               axisLine={{ stroke:gridColor }} tickLine={false} />
                        <YAxis tick={{ fill:axisColor, fontFamily:"'JetBrains Mono',monospace", fontSize:10 }}
                               axisLine={false} tickLine={false}
                               tickFormatter={(v) => `${v}Jt`} />
                        <Tooltip content={<FinanceTip isDark={d} />}
                                 cursor={{ stroke: d?"rgba(52,211,153,.15)":"rgba(5,150,105,.1)", strokeWidth:1 }} />
                        <Area dataKey="invoice" name="Invoice"
                              stroke={d?"#3b82f6":"#2563eb"} strokeWidth={2}
                              fill="url(#dkeuIvArea)" dot={false} activeDot={{ r:4, strokeWidth:0 }} />
                        <Area dataKey="proforma" name="Proforma"
                              stroke={d?"#0d9488":"#0f766e"} strokeWidth={2}
                              fill="url(#dkeuPfArea)" dot={false} activeDot={{ r:4, strokeWidth:0 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )
                  : (
                    <div style={{ height:280, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <p style={{ fontSize:13, color: d?"rgba(52,211,153,.4)":"rgba(5,150,105,.4)" }}>
                        Tidak ada data keuangan.
                      </p>
                    </div>
                  )
              }
            </div>

            <div className="dkeu2-chart-footer">
              <span><ArrowTrendingUpIcon style={{ width:13, height:13 }} /> 12 bulan terakhir</span>
              <span style={{ color: d?"#34d399":"#059669" }}>Nilai dalam juta Rupiah (Jt)</span>
            </div>
          </section>

          {/* ══ PORTO REVENUE GRID ══ */}
          <section className="dkeu2-card dkeu2-c8" style={{ marginBottom:16 }}
                   aria-label="Pendapatan per portofolio">
            <div className="dkeu2-card-head">
              <div className="dkeu2-card-head-l">
                <div className="dkeu2-card-ico ico-green" aria-hidden>
                  <CurrencyDollarIcon style={{ width:14, height:14 }} />
                </div>
                <div>
                  <p className="dkeu2-card-title">Pendapatan per Portofolio</p>
                  <p className="dkeu2-card-sub">Nilai invoice (fee) per divisi portofolio</p>
                </div>
              </div>
              {!loading && (
                <div className="dkeu2-total-pill">
                  <p className="dkeu2-total-lbl">Total Semua</p>
                  <p className="dkeu2-total-val">{fFull(totalPorto)}</p>
                </div>
              )}
            </div>

            <div className="dkeu2-card-body">
              {loading
                ? <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))", gap:10 }}>
                    {Array(11).fill(0).map((_, i) => <Skel key={i} h={86} />)}
                  </div>
                : <div className="dkeu2-porto-grid">
                    {PORTO_LIST.map((p) => (
                      <PortoCard key={p}
                                 name={p}
                                 value={data.revenueByPorto[p]||0}
                                 totalPorto={totalPorto}
                                 rank={portoRankMap[p]} />
                    ))}
                  </div>
              }
            </div>
          </section>

          {/* ══ ORDER TREND CHART ══ */}
          <section className="dkeu2-card dkeu2-c8" aria-label="Tren order per bulan">
            <div className="dkeu2-card-head">
              <div className="dkeu2-card-head-l">
                <div className="dkeu2-card-ico ico-blue" aria-hidden>
                  <ChartBarIcon style={{ width:14, height:14 }} />
                </div>
                <div>
                  <p className="dkeu2-card-title">Tren Order per Bulan</p>
                  <p className="dkeu2-card-sub">12 bulan terakhir berdasarkan tanggal order</p>
                </div>
              </div>
              <div className="dkeu2-chart-legend" aria-hidden>
                <span>
                  <span className="dkeu2-legend-sq" style={{ background: d?"#3b82f6":"#2563eb" }} />
                  Jumlah Order
                </span>
                <span>
                  <span style={{ width:10, height:2, display:"inline-block", verticalAlign:"middle",
                                 borderTop:`1.5px dashed ${d?"#34d399":"#059669"}` }} />
                  Rata-rata
                </span>
              </div>
            </div>

            <div style={{ padding:"20px 20px 8px" }}>
              {loading
                ? <ChartSkel />
                : data.orderTrends.length > 0
                  ? (
                    <ResponsiveContainer width="100%" height={340}>
                      <BarChart data={data.orderTrends} margin={{ top:8, right:8, left:-16, bottom:4 }}>
                        <defs>
                          <linearGradient id="dkeuBarGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%"   stopColor={d?"#3b82f6":"#2563eb"} stopOpacity={0.9} />
                            <stop offset="100%" stopColor={d?"#6366f1":"#93c5fd"} stopOpacity={0.4} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                        <XAxis dataKey="bulan"
                               tick={{ fill:axisColor, fontFamily:"'Syne',sans-serif", fontSize:10 }}
                               axisLine={{ stroke:gridColor }} tickLine={false} />
                        <YAxis tick={{ fill:axisColor, fontFamily:"'JetBrains Mono',monospace", fontSize:10 }}
                               axisLine={false} tickLine={false} />
                        <Tooltip content={<OrderTip isDark={d} />}
                                 cursor={{ fill: d?"rgba(52,211,153,.05)":"rgba(5,150,105,.05)", radius:6 }} />
                        {chartAvg > 0 && (
                          <ReferenceLine y={chartAvg}
                            stroke={d?"rgba(52,211,153,.5)":"rgba(5,150,105,.5)"}
                            strokeDasharray="5 4" strokeWidth={1.5}
                            label={{ value:`Rata-rata: ${chartAvg}`, position:"insideTopRight",
                                     fill: d?"rgba(52,211,153,.7)":"rgba(5,150,105,.7)",
                                     fontSize:9, fontFamily:"'JetBrains Mono',monospace" }} />
                        )}
                        <Bar dataKey="jumlah" name="Jumlah Order"
                             fill="url(#dkeuBarGrad)" radius={[6,6,0,0]} barSize={22}>
                          {data.orderTrends.map((_, i) => (
                            <Cell key={i} opacity={i === data.orderTrends.length - 1 ? 1 : 0.75} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )
                  : (
                    <div style={{ height:300, display:"flex", flexDirection:"column",
                                  alignItems:"center", justifyContent:"center", gap:10 }}>
                      <ChartBarIcon style={{ width:36, height:36,
                                             color: d?"rgba(52,211,153,.3)":"rgba(5,150,105,.3)" }} />
                      <p style={{ fontSize:13, color: d?"rgba(52,211,153,.4)":"rgba(5,150,105,.4)" }}>
                        Tidak ada data tren.
                      </p>
                    </div>
                  )
              }
            </div>

            <div className="dkeu2-chart-footer">
              <span>
                <ChartBarIcon style={{ width:13, height:13 }} />
                Total {totalTrend} order dalam 12 bulan terakhir
              </span>
              <span style={{ color: d?"#34d399":"#059669" }}>↑ Semua portofolio</span>
            </div>
          </section>

        </div>
      </main>
    </>
  );
};

export default memo(DashboardKeuangan);