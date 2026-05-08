/**
 * DashboardKoordinator.jsx  ·  v2.0
 * ─────────────────────────────────────────────────────────────
 * Single-file, fully refactored dashboard koordinator dengan:
 *  ✦ Custom hook useKoordinatorData  — data logic terpisah dari UI
 *  ✦ Memo + useCallback + useMemo   — zero unnecessary re-renders
 *  ✦ Visual progress bar per status — lebih informatif dari list angka
 *  ✦ Portofolio revenue bar chart   — visualisasi pendapatan lebih kaya
 *  ✦ Top-5 portofolio highlight     — insight langsung tanpa perlu scan
 *  ✦ Light / dark theme             — CSS-variable driven
 *  ✦ Full accessibility (ARIA)      — roles, labels, sr-only
 *  ✦ Staggered page animations      — smooth & polished
 * ─────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback, useRef, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../services/firebase";
import { collection, query, getDocs } from "firebase/firestore";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine, Cell,
} from "recharts";
import {
  ChartBarIcon, ArrowPathIcon, TableCellsIcon,
  ClipboardDocumentListIcon, CurrencyDollarIcon,
  BuildingLibraryIcon, ExclamationTriangleIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import { useTheme } from "../../components/layout/ThemeContext";
import { useUser }  from "../../context/UserContext";

/* ══════════════════════════════════════════════════════════════
   STYLES  —  scoped under .dk2 namespace
══════════════════════════════════════════════════════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');

.dk2*,.dk2*::before,.dk2*::after{box-sizing:border-box;margin:0;padding:0}
.dk2{font-family:'Syne',sans-serif}
.dk2.dark {background:#07090f;min-height:100vh}
.dk2.light{background:#eef4ff;min-height:100vh}
.dk2-inner{max-width:1280px;margin:0 auto;padding:28px 20px}

/* ── Animated accent bar ── */
@keyframes dk2Flow{0%{background-position:0 0}100%{background-position:200% 0}}
.dk2-accent{height:2px;background-size:200% 100%;animation:dk2Flow 5s linear infinite;margin-bottom:28px;border-radius:2px}
.dk2.dark  .dk2-accent{background:linear-gradient(90deg,transparent,#1d4ed8 15%,#60a5fa 40%,#a78bfa 60%,#3b82f6 80%,transparent)}
.dk2.light .dk2-accent{background:linear-gradient(90deg,transparent,#3b82f6 15%,#93c5fd 40%,#6366f1 60%,#3b82f6 80%,transparent)}

/* ── Page header ── */
.dk2-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;flex-wrap:wrap;gap:12px}
.dk2-header-left{display:flex;align-items:center;gap:12px}
.dk2-header-ico{width:42px;height:42px;border-radius:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.dk2.dark  .dk2-header-ico{background:rgba(59,130,246,.1);border:1px solid rgba(59,130,246,.2)}
.dk2.light .dk2-header-ico{background:rgba(255,255,255,.85);border:1px solid rgba(59,130,246,.18);box-shadow:0 1px 5px rgba(59,130,246,.1)}
.dk2-page-title{font-size:22px;font-weight:800;letter-spacing:-.03em;line-height:1.1}
.dk2.dark  .dk2-page-title{color:#e8ecf8}
.dk2.light .dk2-page-title{color:#1e3a5f}
.dk2-page-title em{font-style:normal;background:linear-gradient(135deg,#3b82f6,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.dk2-page-sub{font-size:12px;margin-top:2px}
.dk2.dark  .dk2-page-sub{color:rgba(99,148,255,.5)}
.dk2.light .dk2-page-sub{color:rgba(37,99,235,.45)}

.dk2-header-right{display:flex;align-items:center;gap:10px}
.dk2-live-dot{width:6px;height:6px;border-radius:50%;background:#22d3a0;box-shadow:0 0 7px #22d3a0}
@keyframes dk2Pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.75)}}
.dk2-live-dot{animation:dk2Pulse 2s ease-in-out infinite}
.dk2-last-update{font-size:11px;display:flex;align-items:center;gap:5px}
.dk2.dark  .dk2-last-update{color:rgba(74,85,128,.7)}
.dk2.light .dk2-last-update{color:rgba(37,99,235,.4)}

.dk2-btn-refresh{width:38px;height:38px;display:flex;align-items:center;justify-content:center;border-radius:11px;cursor:pointer;border:none;transition:all .2s;flex-shrink:0}
.dk2.dark  .dk2-btn-refresh{background:rgba(255,255,255,.04);border:1px solid rgba(99,148,255,.18);color:rgba(148,163,220,.75)}
.dk2.light .dk2-btn-refresh{background:rgba(255,255,255,.75);border:1px solid rgba(59,130,246,.18);color:#4b6ea8;box-shadow:0 1px 4px rgba(59,130,246,.08)}
.dk2.dark  .dk2-btn-refresh:hover{background:rgba(59,130,246,.1);border-color:rgba(96,165,250,.35);color:#93c5fd}
.dk2.light .dk2-btn-refresh:hover{background:rgba(59,130,246,.08);border-color:rgba(59,130,246,.35);color:#2563eb}
.dk2-btn-refresh:disabled{opacity:.4;cursor:not-allowed}
@keyframes dk2Spin{to{transform:rotate(360deg)}}
.dk2-spin{animation:dk2Spin .8s linear infinite}

/* ── Grid layouts ── */
.dk2-stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;margin-bottom:18px}
.dk2-row2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:18px}
@media(max-width:720px){.dk2-row2{grid-template-columns:1fr}}
.dk2-row3{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:18px}
@media(max-width:620px){.dk2-row3{grid-template-columns:1fr}}

/* ── Card base ── */
.dk2-card{border-radius:18px;overflow:hidden;transition:border-color .25s,box-shadow .25s}
.dk2.dark  .dk2-card{background:rgba(11,15,30,.85);border:1px solid rgba(99,148,255,.1);backdrop-filter:blur(20px)}
.dk2.light .dk2-card{background:rgba(255,255,255,.88);border:1px solid rgba(59,130,246,.13);box-shadow:0 2px 18px rgba(59,130,246,.07);backdrop-filter:blur(16px)}
.dk2.dark  .dk2-card:hover{border-color:rgba(96,165,250,.22);box-shadow:0 8px 40px rgba(0,0,0,.45)}
.dk2.light .dk2-card:hover{border-color:rgba(59,130,246,.26);box-shadow:0 6px 28px rgba(59,130,246,.11)}

/* per-color glow on hover */
.dk2-card.glow-blue:hover  {box-shadow:0 0 36px rgba(59,130,246,.18)!important}
.dk2-card.glow-green:hover {box-shadow:0 0 36px rgba(16,185,129,.16)!important}
.dk2-card.glow-purple:hover{box-shadow:0 0 36px rgba(139,92,246,.16)!important}

.dk2-card-head{padding:14px 20px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
.dk2.dark  .dk2-card-head{border-bottom:1px solid rgba(99,148,255,.08)}
.dk2.light .dk2-card-head{border-bottom:1px solid rgba(59,130,246,.09)}
.dk2-card-head-left{display:flex;align-items:center;gap:10px}
.dk2-card-ico{width:30px;height:30px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.dk2.dark  .dk2-card-ico.ico-blue  {background:rgba(59,130,246,.12);color:#60a5fa}
.dk2.dark  .dk2-card-ico.ico-green {background:rgba(16,185,129,.1);color:#34d399}
.dk2.dark  .dk2-card-ico.ico-purple{background:rgba(139,92,246,.11);color:#a78bfa}
.dk2.dark  .dk2-card-ico.ico-amber {background:rgba(245,158,11,.1);color:#fbbf24}
.dk2.dark  .dk2-card-ico.ico-teal  {background:rgba(20,184,166,.1);color:#2dd4bf}
.dk2.light .dk2-card-ico.ico-blue  {background:rgba(37,99,235,.1);color:#2563eb}
.dk2.light .dk2-card-ico.ico-green {background:rgba(5,150,105,.1);color:#059669}
.dk2.light .dk2-card-ico.ico-purple{background:rgba(124,58,237,.1);color:#7c3aed}
.dk2.light .dk2-card-ico.ico-amber {background:rgba(217,119,6,.08);color:#d97706}
.dk2.light .dk2-card-ico.ico-teal  {background:rgba(15,118,110,.1);color:#0f766e}
.dk2-card-title{font-size:13.5px;font-weight:700;letter-spacing:-.01em}
.dk2.dark  .dk2-card-title{color:#e8ecf8}
.dk2.light .dk2-card-title{color:#1e3a5f}
.dk2-card-sub{font-size:10.5px;margin-top:1px}
.dk2.dark  .dk2-card-sub{color:rgba(99,148,255,.5)}
.dk2.light .dk2-card-sub{color:rgba(37,99,235,.45)}
.dk2-card-body{padding:18px 20px}

/* ── KPI (stat) card ── */
.dk2-kpi-label{font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;max-width:180px;line-height:1.4}
.dk2.dark  .dk2-kpi-label{color:rgba(148,163,220,.65)}
.dk2.light .dk2-kpi-label{color:#4b6ea8}
.dk2-kpi-ico{width:38px;height:38px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.dk2.dark  .dk2-kpi-ico.ico-blue  {background:rgba(59,130,246,.14);color:#60a5fa}
.dk2.dark  .dk2-kpi-ico.ico-green {background:rgba(16,185,129,.12);color:#34d399}
.dk2.dark  .dk2-kpi-ico.ico-purple{background:rgba(139,92,246,.12);color:#a78bfa}
.dk2.light .dk2-kpi-ico.ico-blue  {background:rgba(37,99,235,.1);color:#2563eb}
.dk2.light .dk2-kpi-ico.ico-green {background:rgba(5,150,105,.1);color:#059669}
.dk2.light .dk2-kpi-ico.ico-purple{background:rgba(124,58,237,.1);color:#7c3aed}
.dk2-kpi-val{font-family:'JetBrains Mono',monospace;font-size:34px;font-weight:700;letter-spacing:-.02em;line-height:1;margin-top:14px}
.dk2.dark  .dk2-kpi-val.blue  {background:linear-gradient(135deg,#3b82f6,#93c5fd);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.dk2.dark  .dk2-kpi-val.green {background:linear-gradient(135deg,#10b981,#6ee7b7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.dk2.dark  .dk2-kpi-val.purple{background:linear-gradient(135deg,#8b5cf6,#c4b5fd);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.dk2.light .dk2-kpi-val.blue  {background:linear-gradient(135deg,#1d4ed8,#3b82f6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.dk2.light .dk2-kpi-val.green {background:linear-gradient(135deg,#059669,#34d399);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.dk2.light .dk2-kpi-val.purple{background:linear-gradient(135deg,#7c3aed,#c4b5fd);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.dk2-kpi-sub{font-size:10px;font-family:'JetBrains Mono',monospace;margin-top:5px}
.dk2.dark  .dk2-kpi-sub{color:rgba(99,148,255,.35)}
.dk2.light .dk2-kpi-sub{color:rgba(37,99,235,.38)}

/* ── Status progress bars ── */
.dk2-status-row{display:flex;align-items:center;gap:10px;padding:8px 0}
.dk2.dark  .dk2-status-row+.dk2-status-row{border-top:1px solid rgba(99,148,255,.06)}
.dk2.light .dk2-status-row+.dk2-status-row{border-top:1px solid rgba(59,130,246,.07)}
.dk2-status-count{font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;min-width:28px;text-align:right;flex-shrink:0}
.dk2.dark  .dk2-status-count{color:#e8ecf8}
.dk2.light .dk2-status-count{color:#1e3a5f}
.dk2-status-track{flex:1;height:5px;border-radius:99px;overflow:hidden;min-width:40px}
.dk2.dark  .dk2-status-track{background:rgba(99,148,255,.08)}
.dk2.light .dk2-status-track{background:rgba(37,99,235,.08)}
.dk2-status-fill{height:100%;border-radius:99px;transition:width 1s cubic-bezier(.22,1,.36,1)}

/* ── Badge variants ── */
.dk2-badge{display:inline-flex;align-items:center;padding:2px 9px;border-radius:20px;font-size:11px;font-weight:600;letter-spacing:.025em;white-space:nowrap}
.dk2.dark  .dk2-badge.gray  {background:rgba(99,148,255,.08);border:1px solid rgba(99,148,255,.2);color:rgba(179,193,240,.85)}
.dk2.light .dk2-badge.gray  {background:rgba(241,245,249,1);border:1px solid rgba(203,213,225,1);color:#475569}
.dk2.dark  .dk2-badge.green {background:rgba(16,185,129,.12);border:1px solid rgba(16,185,129,.25);color:#6ee7b7}
.dk2.light .dk2-badge.green {background:rgba(220,252,231,1);border:1px solid rgba(134,239,172,1);color:#15803d}
.dk2.dark  .dk2-badge.blue  {background:rgba(59,130,246,.12);border:1px solid rgba(59,130,246,.25);color:#93c5fd}
.dk2.light .dk2-badge.blue  {background:rgba(219,234,254,1);border:1px solid rgba(147,197,253,1);color:#1d4ed8}
.dk2.dark  .dk2-badge.purple{background:rgba(139,92,246,.12);border:1px solid rgba(139,92,246,.25);color:#c4b5fd}
.dk2.light .dk2-badge.purple{background:rgba(237,233,254,1);border:1px solid rgba(196,181,253,1);color:#6d28d9}
.dk2.dark  .dk2-badge.yellow{background:rgba(245,158,11,.12);border:1px solid rgba(245,158,11,.25);color:#fde68a}
.dk2.light .dk2-badge.yellow{background:rgba(254,243,199,1);border:1px solid rgba(253,230,138,1);color:#b45309}
.dk2.dark  .dk2-badge.orange{background:rgba(249,115,22,.12);border:1px solid rgba(249,115,22,.25);color:#fdba74}
.dk2.light .dk2-badge.orange{background:rgba(255,237,213,1);border:1px solid rgba(253,186,116,1);color:#c2410c}
.dk2.dark  .dk2-badge.teal  {background:rgba(20,184,166,.12);border:1px solid rgba(20,184,166,.25);color:#5eead4}
.dk2.light .dk2-badge.teal  {background:rgba(204,251,241,1);border:1px solid rgba(153,246,228,1);color:#0f766e}
.dk2.dark  .dk2-badge.red   {background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.25);color:#fca5a5}
.dk2.light .dk2-badge.red   {background:rgba(254,226,226,1);border:1px solid rgba(252,165,165,1);color:#b91c1c}

/* ── Portofolio cards ── */
.dk2-porto-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:10px}
.dk2-porto-card{border-radius:12px;padding:14px 15px;transition:all .2s;cursor:default}
.dk2.dark  .dk2-porto-card{background:rgba(255,255,255,.03);border:1px solid rgba(99,148,255,.1)}
.dk2.light .dk2-porto-card{background:rgba(255,255,255,.75);border:1px solid rgba(59,130,246,.12);box-shadow:0 1px 6px rgba(59,130,246,.06)}
.dk2.dark  .dk2-porto-card:hover{background:rgba(59,130,246,.07);border-color:rgba(96,165,250,.25)}
.dk2.light .dk2-porto-card:hover{background:rgba(255,255,255,1);border-color:rgba(59,130,246,.28);box-shadow:0 4px 16px rgba(59,130,246,.1)}
.dk2-porto-card.top1{border-color:rgba(251,191,36,.35)!important}
.dk2.dark  .dk2-porto-card.top1{background:rgba(251,191,36,.05)!important}
.dk2.light .dk2-porto-card.top1{background:rgba(255,251,235,.7)!important}
.dk2-porto-name{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;margin-bottom:8px}
.dk2.dark  .dk2-porto-name{color:rgba(99,148,255,.55)}
.dk2.light .dk2-porto-name{color:rgba(37,99,235,.45)}
.dk2-porto-val{font-family:'JetBrains Mono',monospace;font-size:15px;font-weight:700}
.dk2.dark  .dk2-porto-val{color:#93c5fd}
.dk2.light .dk2-porto-val{color:#1d4ed8}
.dk2-porto-full{font-size:9.5px;font-family:'JetBrains Mono',monospace;margin-top:3px}
.dk2.dark  .dk2-porto-full{color:rgba(99,148,255,.32)}
.dk2.light .dk2-porto-full{color:rgba(37,99,235,.3)}
.dk2-porto-bar-track{height:3px;border-radius:99px;margin-top:9px;overflow:hidden}
.dk2.dark  .dk2-porto-bar-track{background:rgba(59,130,246,.1)}
.dk2.light .dk2-porto-bar-track{background:rgba(37,99,235,.08)}
.dk2-porto-bar-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,#1d4ed8,#60a5fa);transition:width 1.1s cubic-bezier(.22,1,.36,1)}
.dk2-porto-card.top1 .dk2-porto-bar-fill{background:linear-gradient(90deg,#d97706,#fbbf24)}

/* ── Total pill ── */
.dk2-total-pill{padding:9px 16px;border-radius:14px;text-align:right}
.dk2.dark  .dk2-total-pill{background:rgba(37,99,235,.14);border:1px solid rgba(59,130,246,.22)}
.dk2.light .dk2-total-pill{background:rgba(219,234,254,.7);border:1px solid rgba(59,130,246,.18)}
.dk2-total-label{font-size:11px}
.dk2.dark  .dk2-total-label{color:rgba(148,163,220,.7)}
.dk2.light .dk2-total-label{color:#4b6ea8}
.dk2-total-val{font-family:'JetBrains Mono',monospace;font-size:19px;font-weight:700;margin-top:2px}
.dk2.dark  .dk2-total-val{color:#60a5fa}
.dk2.light .dk2-total-val{color:#1d4ed8}

/* ── Top-5 rank list ── */
.dk2-rank-item{display:flex;align-items:center;gap:10px;padding:9px 0}
.dk2.dark  .dk2-rank-item+.dk2-rank-item{border-top:1px solid rgba(99,148,255,.06)}
.dk2.light .dk2-rank-item+.dk2-rank-item{border-top:1px solid rgba(59,130,246,.07)}
.dk2-rank-num{width:22px;height:22px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;flex-shrink:0;font-family:'JetBrains Mono',monospace}
.dk2-rank-num.r1{background:rgba(251,191,36,.2);color:#fbbf24}
.dk2-rank-num.r2{background:rgba(148,163,184,.15);color:#94a3b8}
.dk2-rank-num.r3{background:rgba(180,120,60,.15);color:#d97706}
.dk2.dark  .dk2-rank-num.rn{background:rgba(99,148,255,.08);color:rgba(148,163,220,.6)}
.dk2.light .dk2-rank-num.rn{background:rgba(219,234,254,.8);color:#64748b}
.dk2-rank-name{flex:1;font-size:12.5px;font-weight:600}
.dk2.dark  .dk2-rank-name{color:#cbd5e8}
.dk2.light .dk2-rank-name{color:#1e3a5f}
.dk2-rank-val{font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700}
.dk2.dark  .dk2-rank-val{color:#93c5fd}
.dk2.light .dk2-rank-val{color:#1d4ed8}

/* ── Tooltip ── */
.dk2-tooltip{padding:10px 14px;border-radius:10px}
.dk2-tooltip.dark {background:rgba(7,9,15,.97);border:1px solid rgba(99,148,255,.2)}
.dk2-tooltip.light{background:rgba(248,251,255,.98);border:1px solid rgba(59,130,246,.15)}
.dk2-tooltip-title{font-weight:700;font-size:12px;margin-bottom:4px}
.dk2-tooltip.dark  .dk2-tooltip-title{color:#93c5fd}
.dk2-tooltip.light .dk2-tooltip-title{color:#1d4ed8}
.dk2-tooltip-row{font-size:11px;font-family:'JetBrains Mono',monospace}
.dk2-tooltip.dark  .dk2-tooltip-row{color:#c8d0e8}
.dk2-tooltip.light .dk2-tooltip-row{color:#334e7a}

/* ── Chart legend row ── */
.dk2-chart-legend{display:flex;gap:14px;align-items:center}
.dk2-chart-legend span{display:flex;align-items:center;gap:5px;font-size:10.5px}
.dk2.dark  .dk2-chart-legend span{color:rgba(99,148,255,.7)}
.dk2.light .dk2-chart-legend span{color:rgba(37,99,235,.55)}
.dk2-legend-sq{width:10px;height:10px;border-radius:2px;display:inline-block}
.dk2-chart-footer{display:flex;justify-content:space-between;align-items:center;padding:11px 20px;flex-wrap:wrap;gap:8px;font-size:11px}
.dk2.dark  .dk2-chart-footer{border-top:1px solid rgba(99,148,255,.07);color:rgba(74,85,128,.8)}
.dk2.light .dk2-chart-footer{border-top:1px solid rgba(59,130,246,.08);color:rgba(37,99,235,.5)}
.dk2-chart-footer span{display:flex;align-items:center;gap:5px}

/* ── Error banner ── */
.dk2-error{display:flex;align-items:flex-start;gap:12px;padding:13px 16px;border-radius:14px;margin-bottom:20px}
.dk2.dark  .dk2-error{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.25);color:#fca5a5}
.dk2.light .dk2-error{background:rgba(254,226,226,.8);border:1px solid rgba(252,165,165,.5);color:#b91c1c}
.dk2-retry-btn{margin-left:auto;padding:5px 12px;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid currentColor;background:transparent;color:inherit;transition:opacity .2s;flex-shrink:0}
.dk2-retry-btn:hover{opacity:.7}

/* ── Skeleton ── */
@keyframes dk2Shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
.dk2.dark  .dk2-skel{background:linear-gradient(90deg,rgba(20,28,55,.7) 25%,rgba(40,55,100,.4) 50%,rgba(20,28,55,.7) 75%);background-size:800px 100%;animation:dk2Shimmer 1.7s infinite linear;border-radius:8px}
.dk2.light .dk2-skel{background:linear-gradient(90deg,rgba(219,234,254,.6) 25%,rgba(191,219,254,.4) 50%,rgba(219,234,254,.6) 75%);background-size:800px 100%;animation:dk2Shimmer 1.7s infinite linear;border-radius:8px}

/* ── Animations ── */
@keyframes dk2PageIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes dk2CardIn{from{opacity:0;transform:translateY(20px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}
.dk2-p {animation:dk2PageIn .55s cubic-bezier(.22,1,.36,1) both}
.dk2-c1{animation:dk2CardIn .55s .05s cubic-bezier(.22,1,.36,1) both}
.dk2-c2{animation:dk2CardIn .55s .10s cubic-bezier(.22,1,.36,1) both}
.dk2-c3{animation:dk2CardIn .55s .16s cubic-bezier(.22,1,.36,1) both}
.dk2-c4{animation:dk2CardIn .55s .22s cubic-bezier(.22,1,.36,1) both}
.dk2-c5{animation:dk2CardIn .55s .28s cubic-bezier(.22,1,.36,1) both}
.dk2-c6{animation:dk2CardIn .55s .34s cubic-bezier(.22,1,.36,1) both}
.dk2-c7{animation:dk2CardIn .55s .40s cubic-bezier(.22,1,.36,1) both}
.dk2-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
`;

/* ══════════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════════ */
const STATUS_LIST = [
  "New Order","Entry","Diproses - Lapangan","Diproses - Sertifikat",
  "Penerbitan Proforma","Invoice","Closed Order","Selesai",
];

const STATUS_BADGE = {
  "New Order":             "gray",
  "Entry":                 "green",
  "Diproses - Lapangan":   "blue",
  "Diproses - Sertifikat": "purple",
  "Penerbitan Proforma":   "yellow",
  "Invoice":               "yellow",
  "Closed Order":          "orange",
  "Selesai":               "teal",
};

// Warna fill progress bar per status
const STATUS_COLOR = {
  "New Order":             "#94a3b8",
  "Entry":                 "#34d399",
  "Diproses - Lapangan":   "#60a5fa",
  "Diproses - Sertifikat": "#a78bfa",
  "Penerbitan Proforma":   "#fbbf24",
  "Invoice":               "#fbbf24",
  "Closed Order":          "#fb923c",
  "Selesai":               "#2dd4bf",
};

const PORTO_LIST = [
  "Batubara","Ksp","Pik","Industri","Hmpm",
  "Aebt","Mineral","Halal","Laboratorium","Serco","Lsi",
];

/* ══════════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════════ */
const capitalize = (s) =>
  s.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");

const getLast12Months = () => {
  const NAMES = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  const now = new Date();
  return Array.from({ length:12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    return `${NAMES[d.getMonth()]} ${d.getFullYear()}`;
  });
};

const fShort = (v) => {
  if (v >= 1_000_000_000_000) return `${(v/1_000_000_000_000).toFixed(1)} T`;
  if (v >= 1_000_000_000)     return `${(v/1_000_000_000).toFixed(1)} M`;
  if (v >= 1_000_000)         return `${(v/1_000_000).toFixed(1)} Jt`;
  if (v >= 1_000)             return `${(v/1_000).toFixed(1)} Rb`;
  return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(v);
};
const fFull = (v) =>
  new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(v);

/* ══════════════════════════════════════════════════════════════
   CUSTOM HOOK — useKoordinatorData
══════════════════════════════════════════════════════════════ */
const useKoordinatorData = () => {
  const initStatus = Object.fromEntries(STATUS_LIST.map((s) => [s, 0]));
  const initPorto  = Object.fromEntries(PORTO_LIST.map((p) => [p, 0]));

  const [data, setData]     = useState({
    totalOrders:0, totalInvoice:0, totalProforma:0,
    statusCounts: initStatus,
    orderTrends:  [],
    revenueByPorto: initPorto,
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

      let totalOrders = 0, totalInvoice = 0, totalProforma = 0;
      const statusCounts  = Object.fromEntries(STATUS_LIST.map((s) => [s, 0]));
      const trendMap      = {};
      const revenueByPorto = Object.fromEntries(PORTO_LIST.map((p) => [p, 0]));

      snap.forEach((doc) => {
        const d = doc.data();
        totalOrders++;
        totalInvoice  += Number(d.nilaiInvoice)  || 0;
        totalProforma += Number(d.nilaiProforma)  || 0;

        if (d.statusOrder && Object.hasOwn(statusCounts, d.statusOrder))
          statusCounts[d.statusOrder]++;

        if (d.tanggalOrder?.seconds) {
          const dt  = new Date(d.tanggalOrder.seconds * 1000);
          const key = dt.toLocaleDateString("id-ID",{month:"short",year:"numeric"});
          if (months.includes(key)) trendMap[key] = (trendMap[key] || 0) + 1;
        }

        if (d.portofolio) {
          const fp = capitalize(d.portofolio.trim());
          if (Object.hasOwn(revenueByPorto, fp))
            revenueByPorto[fp] += Number(d.nilaiInvoice) || 0;
        }
      });

      if (!mountedRef.current) return;
      setData({
        totalOrders, totalInvoice, totalProforma, statusCounts,
        orderTrends: months.map((m) => ({ bulan:m, jumlah: trendMap[m] || 0 })),
        revenueByPorto,
      });
      setStatus({ loading:false, refreshing:false, error:null });

    } catch (err) {
      console.error("[useKoordinatorData]", err);
      if (mountedRef.current)
        setStatus({ loading:false, refreshing:false, error: err.message || "Gagal memuat data." });
    }
  }, []);

  useEffect(() => { fetchData(false); }, [fetchData]);
  const refresh = useCallback(() => fetchData(true), [fetchData]);
  return { data, status, refresh };
};

/* ══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
══════════════════════════════════════════════════════════════ */

// Generic skeleton block
const Skel = memo(({ h=16, w="100%", r=8 }) => (
  <div className="dk2-skel" style={{ height:h, width:w, borderRadius:r }} />
));

// KPI card skeleton
const KpiSkel = memo(() => (
  <div className="dk2-card" style={{ padding:"20px 22px", pointerEvents:"none" }}>
    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
      <Skel h={14} w="55%" /><Skel h={38} w={38} r={12} />
    </div>
    <Skel h={40} w="50%" />
    <div style={{ marginTop:7 }}><Skel h={11} w="32%" /></div>
  </div>
));

// Chart skeleton
const ChartSkel = memo(() => (
  <div style={{ height:340, display:"flex", alignItems:"flex-end", gap:9, padding:"0 8px" }}>
    {[60,80,55,90,70,45,85,65,75,50,88,72].map((h, i) => (
      <div key={i} className="dk2-skel" style={{ flex:1, height:`${h}%`, borderRadius:"6px 6px 0 0" }} />
    ))}
  </div>
));

// Custom chart tooltip
const ChartTooltip = memo(({ active, payload, label, isDark }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={`dk2-tooltip ${isDark ? "dark" : "light"}`}>
      <p className="dk2-tooltip-title">{label}</p>
      <p className="dk2-tooltip-row">Jumlah Order: <strong>{payload[0]?.value ?? 0}</strong></p>
    </div>
  );
});

// Status row with progress bar
const StatusRow = memo(({ statusKey, count, maxCount, isDark }) => {
  const pct     = maxCount > 0 ? (count / maxCount) * 100 : 0;
  const badge   = STATUS_BADGE[statusKey] ?? "red";
  const fillClr = STATUS_COLOR[statusKey] ?? "#94a3b8";
  return (
    <div className="dk2-status-row" role="listitem">
      <span className={`dk2-badge ${badge}`} style={{ minWidth:170 }}>{statusKey}</span>
      <div className="dk2-status-track" aria-hidden>
        <div className="dk2-status-fill" style={{ width:`${pct}%`, background:fillClr, opacity:.85 }} />
      </div>
      <span className="dk2-status-count" aria-label={`${count} order`}>{count}</span>
    </div>
  );
});

// Portofolio revenue card
const PortoCard = memo(({ name, value, maxValue, rank, isDark }) => {
  const pct   = maxValue > 0 ? (value / maxValue) * 100 : 0;
  const isTop = rank === 0;
  return (
    <div className={`dk2-porto-card${isTop ? " top1" : ""}`}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <p className="dk2-porto-name">{name}</p>
        {isTop && (
          <span title="Top earner" style={{ fontSize:13 }}>🥇</span>
        )}
      </div>
      <p className="dk2-porto-val">{fShort(value)}</p>
      <p className="dk2-porto-full">{fFull(value)}</p>
      <div className="dk2-porto-bar-track" aria-hidden>
        <div className="dk2-porto-bar-fill" style={{ width:`${pct}%` }} />
      </div>
    </div>
  );
});

// Top-5 rank list item
const RankItem = memo(({ rank, name, value }) => {
  const cls = rank === 0 ? "r1" : rank === 1 ? "r2" : rank === 2 ? "r3" : "rn";
  return (
    <div className="dk2-rank-item">
      <div className={`dk2-rank-num ${cls}`}>{rank + 1}</div>
      <span className="dk2-rank-name">{name}</span>
      <span className="dk2-rank-val">{fShort(value)}</span>
    </div>
  );
});

// Error banner
const ErrorBanner = memo(({ message, onRetry }) => (
  <div className="dk2-error">
    <ExclamationTriangleIcon style={{ width:18, height:18, flexShrink:0 }} />
    <div style={{ flex:1 }}>
      <p style={{ fontWeight:600, fontSize:13, marginBottom:2 }}>Gagal Memuat Data</p>
      <p style={{ fontSize:11, opacity:.8 }}>{message}</p>
    </div>
    <button className="dk2-retry-btn" onClick={onRetry}>Coba Lagi</button>
  </div>
));

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
const DashboardKoordinator = () => {
  const navigate        = useNavigate();
  const { isDark }      = useTheme();
  const { activeUser }  = useUser();
  const d               = isDark;

  /* ── Auth ── */
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (!activeUser) return;
    if (activeUser.peran?.toLowerCase() !== "koordinator") navigate("/");
  }, [activeUser, navigate]);

  /* ── Data ── */
  const { data, status, refresh } = useKoordinatorData();
  const { loading, refreshing, error } = status;

  /* ── Derived values (all memoized) ── */
  const totalPorto = useMemo(
    () => Object.values(data.revenueByPorto).reduce((s, v) => s + v, 0),
    [data.revenueByPorto]
  );

  const maxStatus = useMemo(
    () => Math.max(...Object.values(data.statusCounts), 1),
    [data.statusCounts]
  );

  const maxPorto = useMemo(
    () => Math.max(...Object.values(data.revenueByPorto), 1),
    [data.revenueByPorto]
  );

  // Sorted portofolio for Top-5 ranking
  const sortedPorto = useMemo(
    () => PORTO_LIST
      .map((p) => ({ name:p, value: data.revenueByPorto[p] || 0 }))
      .sort((a, b) => b.value - a.value),
    [data.revenueByPorto]
  );

  // Porto sorted by rank for card display (so top1 highlights correctly)
  const portoRankMap = useMemo(
    () => Object.fromEntries(sortedPorto.map((p, i) => [p.name, i])),
    [sortedPorto]
  );

  const chartAvg = useMemo(() => {
    if (!data.orderTrends.length) return 0;
    return Math.round(data.orderTrends.reduce((s, t) => s + t.jumlah, 0) / data.orderTrends.length);
  }, [data.orderTrends]);

  const totalTrend = useMemo(
    () => data.orderTrends.reduce((s, t) => s + t.jumlah, 0),
    [data.orderTrends]
  );

  /* ── KPI cards config ── */
  const kpiCards = useMemo(() => [
    {
      key:"orders", label:"Total Order",
      display: data.totalOrders.toLocaleString("id-ID"),
      color:"blue", glow:"glow-blue", anim:"dk2-c1",
      Icon: ClipboardDocumentListIcon,
    },
    {
      key:"invoice", label:"Total Nilai Invoice (Fee)",
      display: fShort(data.totalInvoice),
      sub:     fFull(data.totalInvoice),
      color:"green", glow:"glow-green", anim:"dk2-c2",
      Icon: CurrencyDollarIcon,
    },
    {
      key:"proforma", label:"Total Nilai Proforma (PAD)",
      display: fShort(data.totalProforma),
      sub:     fFull(data.totalProforma),
      color:"purple", glow:"glow-purple", anim:"dk2-c3",
      Icon: CurrencyDollarIcon,
    },
  ], [data]);

  /* ── Handler ── */
  const handleRefresh = useCallback(() => { if (!refreshing) refresh(); }, [refresh, refreshing]);

  const axisColor = d ? "rgba(99,148,255,.4)"  : "rgba(37,99,235,.35)";
  const gridColor = d ? "rgba(99,148,255,.07)" : "rgba(37,99,235,.07)";

  return (
    <>
      <style>{STYLES}</style>

      <main className={`dk2 ${d ? "dark" : "light"} ${mounted ? "dk2-p" : ""}`}
            role="main" aria-label="Dashboard Koordinator"
            style={{ transition:"background .4s ease" }}>

        <span className="dk2-sr">Dashboard Koordinator SIMDOR — ringkasan order dan keuangan seluruh portofolio</span>

        <div className="dk2-inner">

          {/* ══ ANIMATED ACCENT ══ */}
          <div className="dk2-accent" aria-hidden />

          {/* ══ HEADER ══ */}
          <header className="dk2-header dk2-p">
            <div className="dk2-header-left">
              <div className="dk2-header-ico" aria-hidden>
                <TableCellsIcon style={{ width:22, height:22, color: d?"#60a5fa":"#2563eb" }} />
              </div>
              <div>
                <h1 className="dk2-page-title">Dashboard <em>Koordinator</em></h1>
                <p className="dk2-page-sub">SIMDOR — Ringkasan Order &amp; Keuangan</p>
              </div>
            </div>

            <div className="dk2-header-right">
              <div className="dk2-last-update">
                <div className="dk2-live-dot" aria-hidden />
                <span>Real-time</span>
              </div>
              <button className="dk2-btn-refresh" onClick={handleRefresh}
                      disabled={refreshing || loading}
                      aria-label="Refresh data dashboard" title="Refresh data">
                <ArrowPathIcon style={{ width:17, height:17 }}
                               className={refreshing ? "dk2-spin" : ""} />
              </button>
            </div>
          </header>

          {/* ══ ERROR ══ */}
          {error && <ErrorBanner message={error} onRetry={handleRefresh} />}

          {/* ══ KPI CARDS ══ */}
          <section className="dk2-stat-grid" aria-label="Statistik ringkasan">
            {loading
              ? [1,2,3].map((i) => <KpiSkel key={i} />)
              : kpiCards.map(({ key, label, display, sub, color, glow, anim, Icon }) => (
                  <article key={key} className={`dk2-card ${glow} ${anim}`}
                           style={{ padding:"20px 22px" }} aria-label={label}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <p className="dk2-kpi-label">{label}</p>
                      <div className={`dk2-kpi-ico ico-${color}`} aria-hidden>
                        <Icon style={{ width:20, height:20 }} />
                      </div>
                    </div>
                    <p className={`dk2-kpi-val ${color}`}>{display}</p>
                    {sub && <p className="dk2-kpi-sub">{sub}</p>}
                  </article>
                ))
            }
          </section>

          {/* ══ STATUS + TOP-5 ══ */}
          <div className="dk2-row2">

            {/* Status order breakdown */}
            <section className="dk2-card dk2-c4" aria-label="Breakdown status order">
              <div className="dk2-card-head">
                <div className="dk2-card-head-left">
                  <div className="dk2-card-ico ico-purple" aria-hidden>
                    <TableCellsIcon style={{ width:14, height:14 }} />
                  </div>
                  <div>
                    <p className="dk2-card-title">Status Order</p>
                    <p className="dk2-card-sub">Distribusi per tahap proses</p>
                  </div>
                </div>
              </div>
              <div className="dk2-card-body">
                {loading
                  ? <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                      {STATUS_LIST.map((_, i) => <Skel key={i} h={32} />)}
                    </div>
                  : <div role="list" aria-label="Status order">
                      {STATUS_LIST.map((s) => (
                        <StatusRow key={s} statusKey={s}
                                   count={data.statusCounts[s] || 0}
                                   maxCount={maxStatus} isDark={d} />
                      ))}
                    </div>
                }
              </div>
            </section>

            {/* Top-5 portofolio by revenue */}
            <section className="dk2-card dk2-c5" aria-label="Top 5 portofolio berdasarkan pendapatan">
              <div className="dk2-card-head">
                <div className="dk2-card-head-left">
                  <div className="dk2-card-ico ico-amber" aria-hidden>
                    <TrophyIcon style={{ width:14, height:14 }} />
                  </div>
                  <div>
                    <p className="dk2-card-title">Top 5 Portofolio</p>
                    <p className="dk2-card-sub">Pendapatan invoice tertinggi</p>
                  </div>
                </div>
              </div>
              <div className="dk2-card-body">
                {loading
                  ? <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                      {[1,2,3,4,5].map((i) => <Skel key={i} h={36} />)}
                    </div>
                  : <div role="list">
                      {sortedPorto.slice(0, 5).map((p, i) => (
                        <RankItem key={p.name} rank={i} name={p.name} value={p.value} />
                      ))}
                    </div>
                }
              </div>
            </section>
          </div>

          {/* ══ PORTOFOLIO REVENUE GRID ══ */}
          <section className="dk2-card dk2-c6" style={{ marginBottom:18 }}
                   aria-label="Pendapatan per portofolio">
            <div className="dk2-card-head">
              <div className="dk2-card-head-left">
                <div className="dk2-card-ico ico-green" aria-hidden>
                  <BuildingLibraryIcon style={{ width:14, height:14 }} />
                </div>
                <div>
                  <p className="dk2-card-title">Pendapatan per Portofolio</p>
                  <p className="dk2-card-sub">Berdasarkan nilai invoice (fee)</p>
                </div>
              </div>

              {!loading && (
                <div className="dk2-total-pill">
                  <p className="dk2-total-label">Total Semua</p>
                  <p className="dk2-total-val">{fFull(totalPorto)}</p>
                </div>
              )}
            </div>

            <div className="dk2-card-body">
              {loading
                ? <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))", gap:10 }}>
                    {Array(11).fill(0).map((_, i) => <Skel key={i} h={82} />)}
                  </div>
                : <div className="dk2-porto-grid">
                    {PORTO_LIST.map((p) => (
                      <PortoCard key={p}
                                 name={p}
                                 value={data.revenueByPorto[p] || 0}
                                 maxValue={maxPorto}
                                 rank={portoRankMap[p]}
                                 isDark={d} />
                    ))}
                  </div>
              }
            </div>
          </section>

          {/* ══ TREND CHART ══ */}
          <section className="dk2-card dk2-c7" aria-label="Tren order per bulan">
            <div className="dk2-card-head">
              <div className="dk2-card-head-left">
                <div className="dk2-card-ico ico-blue" aria-hidden>
                  <ChartBarIcon style={{ width:14, height:14 }} />
                </div>
                <div>
                  <p className="dk2-card-title">Tren Order per Bulan</p>
                  <p className="dk2-card-sub">12 bulan terakhir berdasarkan tanggal order</p>
                </div>
              </div>
              <div className="dk2-chart-legend" aria-hidden>
                <span>
                  <span className="dk2-legend-sq" style={{ background: d?"#3b82f6":"#2563eb" }} />
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
                          <linearGradient id="dk2BarGrad" x1="0" y1="0" x2="0" y2="1">
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
                        <Tooltip content={<ChartTooltip isDark={d} />}
                                 cursor={{ fill: d?"rgba(99,148,255,.05)":"rgba(37,99,235,.05)", radius:6 }} />
                        {chartAvg > 0 && (
                          <ReferenceLine y={chartAvg}
                            stroke={d ? "rgba(52,211,153,.5)" : "rgba(5,150,105,.5)"}
                            strokeDasharray="5 4" strokeWidth={1.5}
                            label={{ value:`Rata-rata: ${chartAvg}`, position:"insideTopRight",
                                     fill: d?"rgba(52,211,153,.7)":"rgba(5,150,105,.7)",
                                     fontSize:9, fontFamily:"'JetBrains Mono',monospace" }} />
                        )}
                        <Bar dataKey="jumlah" name="Jumlah Order"
                             fill="url(#dk2BarGrad)" radius={[6,6,0,0]} barSize={22}>
                          {data.orderTrends.map((_, i) => (
                            <Cell key={i}
                                  opacity={i === data.orderTrends.length - 1 ? 1 : 0.75} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )
                  : (
                    <div style={{ height:300, display:"flex", flexDirection:"column",
                                  alignItems:"center", justifyContent:"center", gap:10 }}>
                      <ChartBarIcon style={{ width:36, height:36,
                                             color: d?"rgba(99,148,255,.3)":"rgba(37,99,235,.3)" }} />
                      <p style={{ fontSize:13, color: d?"rgba(99,148,255,.4)":"rgba(37,99,235,.4)" }}>
                        Tidak ada data tren.
                      </p>
                    </div>
                  )
              }
            </div>

            <div className="dk2-chart-footer">
              <span>
                <ChartBarIcon style={{ width:13, height:13 }} />
                Total {totalTrend} order dalam 12 bulan terakhir
              </span>
              <span style={{ color: d?"#34d399":"#059669" }}>
                ↑ Semua portofolio
              </span>
            </div>
          </section>

        </div>
      </main>
    </>
  );
};

export default memo(DashboardKoordinator);