/**
 * DashboardPortofolio.jsx  ·  v2.0  (single-file edition)
 * ─────────────────────────────────────────────────────────────
 * Semua dalam satu file — styles, helpers, custom hook,
 * sub-components, dan main component.
 *
 * Arsitektur internal:
 *  § 1  STYLES
 *  § 2  HELPERS  (formatter, month builder)
 *  § 3  usePortofolioData  (custom hook — data & Firestore)
 *  § 4  SUB-COMPONENTS  (memoized, reusable)
 *  § 5  MAIN COMPONENT  (DashboardPortofolio)
 * ─────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback, useRef, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../services/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine,
} from "recharts";
import {
  ChartBarIcon,
  ArrowPathIcon,
  BoltIcon,
  PlusCircleIcon,
  ListBulletIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useTheme } from "../../components/layout/ThemeContext";
import { useUser }  from "../../context/UserContext";

/* ══════════════════════════════════════════════════════════════
   § 1  STYLES  —  scoped under .dp2 namespace
══════════════════════════════════════════════════════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');

.dp2*,.dp2*::before,.dp2*::after{box-sizing:border-box;margin:0;padding:0}
.dp2{font-family:'Syne',sans-serif}
.dp2.dark {background:#0a0d1a;min-height:100vh}
.dp2.light{background:#f0f6ff;min-height:100vh}
.dp2-inner{max-width:1200px;margin:0 auto;padding:28px 20px}

/* ── Header ── */
.dp2-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:8px;flex-wrap:wrap;gap:14px}
.dp2-header-left{display:flex;flex-direction:column;gap:5px}
.dp2-breadcrumb{display:flex;align-items:center;gap:5px;font-size:10.5px;letter-spacing:.09em;text-transform:uppercase;font-weight:700}
.dp2.dark  .dp2-breadcrumb{color:rgba(74,85,128,.9)}
.dp2.light .dp2-breadcrumb{color:rgba(37,99,235,.45)}
.dp2-page-title{font-size:25px;font-weight:800;letter-spacing:-.03em;line-height:1.1}
.dp2.dark  .dp2-page-title{color:#e8ecf8}
.dp2.light .dp2-page-title{color:#1e3a5f}
.dp2-page-title em{font-style:normal;background:linear-gradient(135deg,#4f8ef7,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.dp2-page-meta{display:flex;align-items:center;gap:7px;font-size:11.5px}
.dp2.dark  .dp2-page-meta{color:rgba(74,85,128,.8)}
.dp2.light .dp2-page-meta{color:rgba(37,99,235,.5)}
.dp2-live-dot{width:6px;height:6px;border-radius:50%;background:#22d3a0;box-shadow:0 0 7px #22d3a0}
@keyframes dp2Pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.75)}}
.dp2-live-dot{animation:dp2Pulse 2s ease-in-out infinite}
.dp2-header-right{display:flex;align-items:center;gap:10px}
.dp2-badge{padding:5px 14px;border-radius:9px;font-size:11px;font-weight:700;letter-spacing:.11em;color:#fff;background:linear-gradient(135deg,#1d4ed8,#a78bfa)}
.dp2-btn-icon{width:36px;height:36px;display:flex;align-items:center;justify-content:center;border-radius:10px;cursor:pointer;border:none;transition:all .2s}
.dp2.dark  .dp2-btn-icon{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);color:rgba(148,163,220,.8)}
.dp2.light .dp2-btn-icon{background:rgba(255,255,255,.8);border:1px solid rgba(59,130,246,.18);color:#4b6ea8;box-shadow:0 1px 4px rgba(59,130,246,.08)}
.dp2.dark  .dp2-btn-icon:hover{background:rgba(79,142,247,.12);border-color:rgba(79,142,247,.4);color:#7fb3ff}
.dp2.light .dp2-btn-icon:hover{background:rgba(59,130,246,.08);border-color:rgba(59,130,246,.4);color:#2563eb}
.dp2-btn-icon:disabled{opacity:.5;cursor:not-allowed}

/* ── Accent line ── */
.dp2-accent{height:1px;margin:10px 0 24px}
.dp2.dark  .dp2-accent{background:linear-gradient(90deg,transparent,rgba(79,142,247,.5),rgba(167,139,250,.4),transparent)}
.dp2.light .dp2-accent{background:linear-gradient(90deg,transparent,rgba(37,99,235,.35),rgba(99,102,241,.3),transparent)}

/* ── KPI Grid ── */
.dp2-kpi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin-bottom:16px}
.dp2-kpi{border-radius:16px;padding:18px 20px;position:relative;overflow:hidden;cursor:default;transition:border-color .25s,transform .2s,box-shadow .25s}
.dp2.dark  .dp2-kpi{background:rgba(15,19,38,.9);border:1px solid rgba(255,255,255,.06)}
.dp2.light .dp2-kpi{background:rgba(255,255,255,.85);border:1px solid rgba(59,130,246,.12);box-shadow:0 2px 16px rgba(59,130,246,.07);backdrop-filter:blur(16px)}
.dp2-kpi:hover{transform:translateY(-2px)}
.dp2.dark  .dp2-kpi:hover{border-color:rgba(255,255,255,.12);box-shadow:0 8px 28px rgba(0,0,0,.4)}
.dp2.light .dp2-kpi:hover{border-color:rgba(59,130,246,.28);box-shadow:0 6px 24px rgba(59,130,246,.12)}
.dp2-kpi::before{content:'';position:absolute;inset:0;border-radius:16px;opacity:0;transition:opacity .3s;pointer-events:none}
.dp2-kpi:hover::before{opacity:1}
.dp2-kpi.kpi-blue::before  {background:radial-gradient(ellipse at 90% 0%,rgba(79,142,247,.14),transparent 65%)}
.dp2-kpi.kpi-green::before {background:radial-gradient(ellipse at 90% 0%,rgba(34,211,160,.11),transparent 65%)}
.dp2-kpi.kpi-orange::before{background:radial-gradient(ellipse at 90% 0%,rgba(255,140,66,.11),transparent 65%)}
.dp2-kpi.kpi-purple::before{background:radial-gradient(ellipse at 90% 0%,rgba(167,139,250,.11),transparent 65%)}
.dp2-kpi.kpi-teal::before  {background:radial-gradient(ellipse at 90% 0%,rgba(6,182,212,.11),transparent 65%)}
.dp2-kpi-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px}
.dp2-kpi-label{font-size:11px;font-weight:600;letter-spacing:.055em;text-transform:uppercase;line-height:1.5;max-width:130px}
.dp2.dark  .dp2-kpi-label{color:rgba(74,85,128,.95)}
.dp2.light .dp2-kpi-label{color:#4b6ea8}
.dp2-kpi-ico{width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.dp2.dark  .dp2-kpi-ico.ico-blue  {background:rgba(79,142,247,.15);color:#7fb3ff}
.dp2.dark  .dp2-kpi-ico.ico-green {background:rgba(34,211,160,.12);color:#22d3a0}
.dp2.dark  .dp2-kpi-ico.ico-orange{background:rgba(255,140,66,.12);color:#ff8c42}
.dp2.dark  .dp2-kpi-ico.ico-purple{background:rgba(167,139,250,.12);color:#a78bfa}
.dp2.dark  .dp2-kpi-ico.ico-teal  {background:rgba(6,182,212,.12);color:#06b6d4}
.dp2.light .dp2-kpi-ico.ico-blue  {background:rgba(37,99,235,.1);color:#2563eb}
.dp2.light .dp2-kpi-ico.ico-green {background:rgba(5,150,105,.1);color:#059669}
.dp2.light .dp2-kpi-ico.ico-orange{background:rgba(234,88,12,.09);color:#ea580c}
.dp2.light .dp2-kpi-ico.ico-purple{background:rgba(124,58,237,.1);color:#7c3aed}
.dp2.light .dp2-kpi-ico.ico-teal  {background:rgba(8,145,178,.1);color:#0891b2}
.dp2-kpi-val{font-family:'JetBrains Mono',monospace;font-size:30px;font-weight:700;letter-spacing:-.02em;line-height:1}
.dp2.dark  .dp2-kpi-val.val-blue  {color:#7fb3ff}
.dp2.dark  .dp2-kpi-val.val-green {color:#88f0ce}
.dp2.dark  .dp2-kpi-val.val-orange{color:#ffb380}
.dp2.dark  .dp2-kpi-val.val-purple{color:#c4b5fd}
.dp2.dark  .dp2-kpi-val.val-teal  {color:#67e8f9}
.dp2.light .dp2-kpi-val.val-blue  {background:linear-gradient(135deg,#1d4ed8,#3b82f6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.dp2.light .dp2-kpi-val.val-green {background:linear-gradient(135deg,#059669,#34d399);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.dp2.light .dp2-kpi-val.val-orange{background:linear-gradient(135deg,#ea580c,#fdba74);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.dp2.light .dp2-kpi-val.val-purple{background:linear-gradient(135deg,#7c3aed,#c4b5fd);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.dp2.light .dp2-kpi-val.val-teal  {background:linear-gradient(135deg,#0891b2,#67e8f9);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.dp2-kpi-sub{font-size:10px;margin-top:5px;font-family:'JetBrains Mono',monospace}
.dp2.dark  .dp2-kpi-sub{color:rgba(99,148,255,.4)}
.dp2.light .dp2-kpi-sub{color:rgba(37,99,235,.4)}
.dp2-kpi-badge{display:inline-flex;align-items:center;gap:3px;font-size:10.5px;font-weight:600;margin-top:9px;padding:3px 9px;border-radius:6px}
.dp2-kpi-badge.up  {background:rgba(34,211,160,.1);color:#22d3a0}
.dp2.light .dp2-kpi-badge.up{background:rgba(5,150,105,.1);color:#059669}
.dp2-kpi-badge.warn{background:rgba(255,140,66,.1);color:#ff8c42}
.dp2.light .dp2-kpi-badge.warn{background:rgba(234,88,12,.08);color:#ea580c}

/* ── 2-col row ── */
.dp2-row2{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px}
@media(max-width:700px){.dp2-row2{grid-template-columns:1fr}}

/* ── Card ── */
.dp2-card{border-radius:16px;overflow:hidden;transition:border-color .25s}
.dp2.dark  .dp2-card{background:rgba(15,19,38,.9);border:1px solid rgba(255,255,255,.06)}
.dp2.light .dp2-card{background:rgba(255,255,255,.85);border:1px solid rgba(59,130,246,.12);box-shadow:0 2px 16px rgba(59,130,246,.06);backdrop-filter:blur(16px)}
.dp2.dark  .dp2-card:hover{border-color:rgba(255,255,255,.11)}
.dp2.light .dp2-card:hover{border-color:rgba(59,130,246,.25)}
.dp2-card-full{border-radius:16px;overflow:hidden;margin-bottom:14px;transition:border-color .25s}
.dp2.dark  .dp2-card-full{background:rgba(15,19,38,.9);border:1px solid rgba(255,255,255,.06)}
.dp2.light .dp2-card-full{background:rgba(255,255,255,.85);border:1px solid rgba(59,130,246,.12);box-shadow:0 2px 16px rgba(59,130,246,.06);backdrop-filter:blur(16px)}
.dp2-card-head{padding:13px 18px;display:flex;align-items:center;gap:10px}
.dp2.dark  .dp2-card-head{border-bottom:1px solid rgba(255,255,255,.05)}
.dp2.light .dp2-card-head{border-bottom:1px solid rgba(59,130,246,.1)}
.dp2-card-ico{width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center}
.dp2.dark  .dp2-card-ico.ico-green {background:rgba(34,211,160,.1);color:#22d3a0}
.dp2.dark  .dp2-card-ico.ico-blue  {background:rgba(79,142,247,.1);color:#4f8ef7}
.dp2.dark  .dp2-card-ico.ico-orange{background:rgba(255,140,66,.1);color:#ff8c42}
.dp2.light .dp2-card-ico.ico-green {background:rgba(5,150,105,.1);color:#059669}
.dp2.light .dp2-card-ico.ico-blue  {background:rgba(37,99,235,.1);color:#2563eb}
.dp2.light .dp2-card-ico.ico-orange{background:rgba(234,88,12,.09);color:#ea580c}
.dp2-card-title{font-size:13px;font-weight:700;letter-spacing:-.01em}
.dp2.dark  .dp2-card-title{color:#e8ecf8}
.dp2.light .dp2-card-title{color:#1e3a5f}
.dp2-card-sub{font-size:10px;margin-top:1px}
.dp2.dark  .dp2-card-sub{color:rgba(74,85,128,.8)}
.dp2.light .dp2-card-sub{color:rgba(37,99,235,.45)}
.dp2-card-body{padding:18px}

/* ── Progress ── */
.dp2-ring-wrap{display:flex;align-items:center;gap:20px;flex-wrap:wrap}
.dp2-prog-info{flex:1;min-width:180px}
.dp2-prog-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:7px}
.dp2-prog-lbl{font-size:11px}
.dp2.dark  .dp2-prog-lbl{color:rgba(148,163,220,.75)}
.dp2.light .dp2-prog-lbl{color:#4b6ea8}
.dp2-prog-pct{font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700}
.dp2.dark  .dp2-prog-pct{color:#7fb3ff}
.dp2.light .dp2-prog-pct{color:#1d4ed8}
.dp2-prog-track{border-radius:99px;height:8px;overflow:hidden;margin-bottom:18px}
.dp2.dark  .dp2-prog-track{background:rgba(79,142,247,.1)}
.dp2.light .dp2-prog-track{background:rgba(37,99,235,.1)}
@keyframes dp2Fill{from{width:0%}}
.dp2-prog-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,#1a3a8f,#4f8ef7,#7fb3ff);box-shadow:0 0 12px rgba(79,142,247,.4);animation:dp2Fill 1s cubic-bezier(.22,1,.36,1) forwards;transition:width .7s cubic-bezier(.22,1,.36,1)}
.dp2-milestones{display:flex;gap:8px;flex-wrap:wrap}
.dp2-ms{border-radius:10px;padding:10px 14px;flex:1;min-width:72px;text-align:center}
.dp2.dark  .dp2-ms{background:rgba(20,24,48,.8);border:1px solid rgba(255,255,255,.06)}
.dp2.light .dp2-ms{background:rgba(219,234,254,.5);border:1px solid rgba(59,130,246,.14)}
.dp2-ms-val{font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:700;line-height:1}
.dp2-ms-lbl{font-size:9px;letter-spacing:.05em;text-transform:uppercase;margin-top:3px}
.dp2.dark  .dp2-ms-lbl{color:rgba(74,85,128,.8)}
.dp2.light .dp2-ms-lbl{color:rgba(37,99,235,.5)}

/* ── Status pill ── */
.dp2-pill{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:9px;font-size:11px;font-weight:600;margin-top:13px}
.dp2.dark  .dp2-pill.done {background:rgba(34,211,160,.1);border:1px solid rgba(34,211,160,.25);color:#22d3a0}
.dp2.light .dp2-pill.done {background:rgba(220,252,231,.8);border:1px solid rgba(134,239,172,.7);color:#15803d}
.dp2.dark  .dp2-pill.wip  {background:rgba(255,140,66,.1);border:1px solid rgba(255,140,66,.25);color:#ff8c42}
.dp2.light .dp2-pill.wip  {background:rgba(255,237,213,.8);border:1px solid rgba(253,186,116,.6);color:#c2410c}
.dp2.dark  .dp2-pill.empty{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);color:rgba(148,163,220,.7)}
.dp2.light .dp2-pill.empty{background:rgba(241,245,249,1);border:1px solid rgba(203,213,225,1);color:#64748b}

/* ── Activity feed ── */
.dp2-act-list{display:flex;flex-direction:column}
.dp2-act-item{display:flex;align-items:flex-start;gap:11px;padding:10px 0}
.dp2.dark  .dp2-act-item{border-bottom:1px solid rgba(255,255,255,.04)}
.dp2.light .dp2-act-item{border-bottom:1px solid rgba(59,130,246,.07)}
.dp2-act-item:last-child{border-bottom:none}
.dp2-act-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;margin-top:4px}
.dp2-act-dot.done{background:#22d3a0;box-shadow:0 0 5px #22d3a0}
.dp2-act-dot.wip {background:#ff8c42;box-shadow:0 0 5px #ff8c42}
.dp2-act-dot.new {background:#4f8ef7;box-shadow:0 0 5px #4f8ef7}
.dp2-act-txt{font-size:12px;line-height:1.5}
.dp2-act-time{font-size:9.5px;font-family:'JetBrains Mono',monospace;margin-top:2px}
.dp2.dark  .dp2-act-time{color:rgba(74,85,128,.8)}
.dp2.light .dp2-act-time{color:rgba(37,99,235,.45)}

/* ── Tooltip ── */
.dp2-tooltip{padding:10px 14px;border-radius:10px}
.dp2-tooltip.dark {background:rgba(10,13,26,.97);border:1px solid rgba(79,142,247,.2)}
.dp2-tooltip.light{background:rgba(248,251,255,.98);border:1px solid rgba(59,130,246,.15)}
.dp2-tooltip-title{font-weight:700;font-size:12px;margin-bottom:4px}
.dp2-tooltip.dark  .dp2-tooltip-title{color:#93c5fd}
.dp2-tooltip.light .dp2-tooltip-title{color:#1d4ed8}
.dp2-tooltip-row{font-size:11px;font-family:'JetBrains Mono',monospace}
.dp2-tooltip.dark  .dp2-tooltip-row{color:#c8d0e8}
.dp2-tooltip.light .dp2-tooltip-row{color:#334e7a}

/* ── Chart legend & footer ── */
.dp2-chart-legend{display:flex;gap:16px;align-items:center;margin-left:auto}
.dp2-chart-legend span{display:flex;align-items:center;gap:5px;font-size:10.5px}
.dp2.dark  .dp2-chart-legend span{color:rgba(74,85,128,.9)}
.dp2.light .dp2-chart-legend span{color:rgba(37,99,235,.55)}
.dp2-legend-sq{width:10px;height:10px;border-radius:2px;display:inline-block}
.dp2-chart-footer{display:flex;align-items:center;justify-content:space-between;padding:11px 18px;flex-wrap:wrap;gap:8px;font-size:11px}
.dp2.dark  .dp2-chart-footer{border-top:1px solid rgba(255,255,255,.05);color:rgba(74,85,128,.8)}
.dp2.light .dp2-chart-footer{border-top:1px solid rgba(59,130,246,.08);color:rgba(37,99,235,.5)}
.dp2-chart-footer span{display:flex;align-items:center;gap:5px}

/* ── Quick actions ── */
.dp2-qa-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:16px}
@media(max-width:500px){.dp2-qa-grid{grid-template-columns:1fr}}
.dp2-qa{border-radius:12px;padding:14px;cursor:pointer;display:flex;flex-direction:column;align-items:flex-start;gap:8px;text-align:left;transition:all .2s;width:100%}
.dp2.dark  .dp2-qa{background:rgba(20,24,48,.7);border:1px solid rgba(255,255,255,.06);color:#e8ecf8}
.dp2.light .dp2-qa{background:rgba(239,246,255,.7);border:1px solid rgba(59,130,246,.12);color:#1e3a5f}
.dp2.dark  .dp2-qa:hover{border-color:rgba(79,142,247,.4);background:rgba(79,142,247,.08)}
.dp2.light .dp2-qa:hover{border-color:rgba(37,99,235,.35);background:rgba(219,234,254,.6)}
.dp2-qa-ico{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center}
.dp2.dark  .dp2-qa-ico{background:rgba(79,142,247,.12);color:#4f8ef7}
.dp2.light .dp2-qa-ico{background:rgba(37,99,235,.1);color:#2563eb}
.dp2-qa-lbl{font-size:12.5px;font-weight:700;letter-spacing:-.01em}
.dp2-qa-desc{font-size:10px}
.dp2.dark  .dp2-qa-desc{color:rgba(74,85,128,.8)}
.dp2.light .dp2-qa-desc{color:rgba(37,99,235,.5)}

/* ── Error banner ── */
.dp2-error{display:flex;align-items:flex-start;gap:12px;padding:13px 16px;border-radius:13px;margin-bottom:20px}
.dp2.dark  .dp2-error{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.25);color:#fca5a5}
.dp2.light .dp2-error{background:rgba(254,226,226,.8);border:1px solid rgba(252,165,165,.5);color:#b91c1c}
.dp2-retry-btn{margin-left:auto;padding:5px 12px;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid currentColor;background:transparent;color:inherit;transition:opacity .2s;flex-shrink:0}
.dp2-retry-btn:hover{opacity:.7}

/* ── Skeleton ── */
@keyframes dp2Shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
.dp2.dark  .dp2-skel{background:linear-gradient(90deg,rgba(20,24,48,.7) 25%,rgba(79,142,247,.06) 50%,rgba(20,24,48,.7) 75%);background-size:800px 100%;animation:dp2Shimmer 1.8s infinite linear}
.dp2.light .dp2-skel{background:linear-gradient(90deg,rgba(219,234,254,.6) 25%,rgba(191,219,254,.4) 50%,rgba(219,234,254,.6) 75%);background-size:800px 100%;animation:dp2Shimmer 1.8s infinite linear}

/* ── Animations ── */
@keyframes dp2PageIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes dp2CardIn{from{opacity:0;transform:translateY(18px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}
.dp2-p {animation:dp2PageIn .5s cubic-bezier(.22,1,.36,1) both}
.dp2-c1{animation:dp2CardIn .5s .04s cubic-bezier(.22,1,.36,1) both}
.dp2-c2{animation:dp2CardIn .5s .09s cubic-bezier(.22,1,.36,1) both}
.dp2-c3{animation:dp2CardIn .5s .14s cubic-bezier(.22,1,.36,1) both}
.dp2-c4{animation:dp2CardIn .5s .19s cubic-bezier(.22,1,.36,1) both}
.dp2-c5{animation:dp2CardIn .5s .24s cubic-bezier(.22,1,.36,1) both}
.dp2-c6{animation:dp2CardIn .5s .30s cubic-bezier(.22,1,.36,1) both}
.dp2-c7{animation:dp2CardIn .5s .36s cubic-bezier(.22,1,.36,1) both}
.dp2-c8{animation:dp2CardIn .5s .42s cubic-bezier(.22,1,.36,1) both}
@keyframes dp2Spin{to{transform:rotate(360deg)}}
.dp2-spin{animation:dp2Spin .8s linear infinite}
.dp2-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
`;

/* ══════════════════════════════════════════════════════════════
   § 2  HELPERS
══════════════════════════════════════════════════════════════ */

/** Returns last 12 month labels — "Jan 2025" format, oldest → newest. */
const buildMonthLabels = () => {
  const NAMES = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    return `${NAMES[d.getMonth()]} ${d.getFullYear()}`;
  });
};

/** Firestore Timestamp → "Jan 2025" label. */
const tsToLabel = (ts) => {
  if (!ts) return null;
  const NAMES = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  const d = ts.toDate ? ts.toDate() : new Date((ts.seconds || 0) * 1000);
  return `${NAMES[d.getMonth()]} ${d.getFullYear()}`;
};

/** Short IDR formatter — "4,2 Jt", "1,5 M", etc. */
const formatShort = (v) => {
  if (v >= 1_000_000_000_000) return `${(v / 1_000_000_000_000).toFixed(1)} T`;
  if (v >= 1_000_000_000)     return `${(v / 1_000_000_000).toFixed(1)} M`;
  if (v >= 1_000_000)         return `${(v / 1_000_000).toFixed(1)} Jt`;
  if (v >= 1_000)             return `${(v / 1_000).toFixed(1)} Rb`;
  return new Intl.NumberFormat("id-ID", { style:"currency", currency:"IDR", maximumFractionDigits:0 }).format(v);
};

/** Full IDR formatter — "Rp 4.200.000". */
const formatFull = (v) =>
  new Intl.NumberFormat("id-ID", { style:"currency", currency:"IDR", maximumFractionDigits:0 }).format(v);

/** Relative time — "2 menit lalu", "Kemarin", etc. */
const relativeTime = (date) => {
  if (!date) return "—";
  const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (mins < 1)    return "Baru saja";
  if (mins < 60)   return `${mins} menit lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)    return `${hrs} jam lalu`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? "Kemarin" : `${days} hari lalu`;
};

/* ══════════════════════════════════════════════════════════════
   § 3  usePortofolioData — custom hook
══════════════════════════════════════════════════════════════ */
const usePortofolioData = (bidang) => {
  const [stats, setStats]           = useState({ total:0, selesai:0, proses:0, invoice:0, proforma:0 });
  const [trends, setTrends]         = useState([]);
  const [activities, setActivities] = useState([]);
  const [status, setStatus]         = useState({ loading:true, refreshing:false, error:null });
  const mountedRef                  = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (!bidang) return;
    setStatus((s) => isRefresh
      ? { ...s, refreshing:true, error:null }
      : { loading:true, refreshing:false, error:null }
    );

    try {
      const ref    = collection(db, "orders");
      const [allSnap, doneSnap] = await Promise.all([
        getDocs(query(ref, where("portofolio", "==", bidang))),
        getDocs(query(ref, where("portofolio", "==", bidang), where("statusOrder", "in", ["Selesai"]))),
      ]);
      if (!mountedRef.current) return;

      const total   = allSnap.size;
      const selesai = doneSnap.size;
      let invoice = 0, proforma = 0;
      const trendMap  = {};
      const recentRaw = [];
      const monthLabels = buildMonthLabels();

      allSnap.forEach((doc) => {
        const data = doc.data();
        invoice  += Number(data.nilaiInvoice)  || 0;
        proforma += Number(data.nilaiProforma) || 0;
        const label = tsToLabel(data.tanggalOrder);
        if (label) trendMap[label] = (trendMap[label] || 0) + 1;
        if (data.tanggalOrder) {
          recentRaw.push({
            id:         doc.id,
            nomorOrder: data.nomorOrder || doc.id.slice(0, 10).toUpperCase(),
            status:     data.statusOrder || "Baru",
            invoice:    data.nilaiInvoice || 0,
            time:       data.tanggalOrder?.toDate
                          ? data.tanggalOrder.toDate()
                          : new Date((data.tanggalOrder?.seconds || 0) * 1000),
          });
        }
      });

      recentRaw.sort((a, b) => b.time - a.time);

      if (!mountedRef.current) return;
      setStats({ total, selesai, proses: total - selesai, invoice, proforma });
      setTrends(monthLabels.map((m) => ({ bulan:m, jumlah: trendMap[m] || 0 })));
      setActivities(recentRaw.slice(0, 6));
      setStatus({ loading:false, refreshing:false, error:null });

    } catch (err) {
      console.error("[usePortofolioData]", err);
      if (mountedRef.current)
        setStatus({ loading:false, refreshing:false, error: err.message || "Gagal memuat data." });
    }
  }, [bidang]);

  useEffect(() => { fetchData(false); }, [fetchData]);

  const refresh = useCallback(() => fetchData(true), [fetchData]);
  return { stats, trends, activities, status, refresh };
};

/* ══════════════════════════════════════════════════════════════
   § 4  SUB-COMPONENTS  (all memoized)
══════════════════════════════════════════════════════════════ */

/* ── Skeleton block ── */
const Skel = memo(({ h=16, w="100%", r=8 }) => (
  <div className="dp2-skel" style={{ height:h, width:w, borderRadius:r }} />
));

/* ── KPI card skeleton ── */
const KpiSkeleton = memo(() => (
  <div className="dp2-kpi" style={{ pointerEvents:"none" }}>
    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
      <Skel h={12} w="55%" /><Skel h={34} w={34} r={10} />
    </div>
    <Skel h={36} w="50%" />
    <div style={{ marginTop:10 }}><Skel h={10} w="35%" /></div>
  </div>
));

/* ── Completion ring (SVG donut) ── */
const CompletionRing = memo(({ pct, isDark }) => {
  const r = 44, circ = 2 * Math.PI * r;
  return (
    <svg width={110} height={110} viewBox="0 0 110 110"
         role="img" aria-label={`${pct}% order selesai`}>
      <defs>
        <linearGradient id="dp2RingGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#1a3a8f" />
          <stop offset="100%" stopColor="#7fb3ff" />
        </linearGradient>
      </defs>
      <circle cx={55} cy={55} r={r} fill="none" strokeWidth={9}
              stroke={isDark ? "rgba(79,142,247,.1)" : "rgba(37,99,235,.1)"} />
      <circle cx={55} cy={55} r={r} fill="none" strokeWidth={9}
              stroke="url(#dp2RingGrad)" strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={circ - (pct / 100) * circ}
              transform="rotate(-90 55 55)"
              style={{ transition:"stroke-dashoffset 1.2s cubic-bezier(.22,1,.36,1)" }} />
      <text x={55} y={50} textAnchor="middle"
            style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:18, fontWeight:700,
                     fill: isDark ? "#7fb3ff" : "#1d4ed8" }}>
        {pct}%
      </text>
      <text x={55} y={65} textAnchor="middle"
            style={{ fontFamily:"'Syne',sans-serif", fontSize:9,
                     fill: isDark ? "rgba(99,148,255,.5)" : "rgba(37,99,235,.45)" }}>
        selesai
      </text>
    </svg>
  );
});

/* ── Custom chart tooltip ── */
const ChartTooltip = memo(({ active, payload, label, isDark }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={`dp2-tooltip ${isDark ? "dark" : "light"}`}>
      <p className="dp2-tooltip-title">{label}</p>
      <p className="dp2-tooltip-row">Jumlah Order: <strong>{payload[0]?.value ?? 0}</strong></p>
    </div>
  );
});

/* ── Chart skeleton ── */
const ChartSkeleton = memo(() => (
  <div style={{ height:280, display:"flex", alignItems:"flex-end", gap:8, padding:"0 4px" }}>
    {[55,72,60,85,68,48,78,62,90,55,83,70].map((h, i) => (
      <div key={i} className="dp2-skel" style={{ flex:1, height:`${h}%`, borderRadius:"6px 6px 0 0" }} />
    ))}
  </div>
));

/* ── Status pill ── */
const StatusPill = memo(({ total, selesai, proses }) => {
  const done  = total > 0 && selesai === total;
  const empty = total === 0;
  return (
    <div className={`dp2-pill ${empty ? "empty" : done ? "done" : "wip"}`}>
      {done  && <CheckCircleIcon style={{ width:13, height:13 }} />}
      {empty && <ExclamationTriangleIcon style={{ width:13, height:13 }} />}
      {!done && !empty && <ClockIcon style={{ width:13, height:13 }} />}
      <span>
        {empty ? "Belum ada order"
               : done ? "✓ Semua order selesai!"
               : `${proses} order masih dalam proses`}
      </span>
    </div>
  );
});

/* ── Activity item ── */
const ACT_META = {
  Selesai: { dot:"done", text:"telah diselesaikan" },
  Proses:  { dot:"wip",  text:"sedang diproses" },
  Baru:    { dot:"new",  text:"order baru masuk" },
};
const ActivityItem = memo(({ item, bidang, isDark }) => {
  const meta = ACT_META[item.status] ?? { dot:"new", text:item.status };
  return (
    <div className="dp2-act-item">
      <div className={`dp2-act-dot ${meta.dot}`} />
      <div style={{ flex:1 }}>
        <div className="dp2-act-txt" style={{ color: isDark ? "#c8d0e8" : "#334e7a" }}>
          <strong style={{ color: isDark ? "#e8ecf8" : "#1e3a5f" }}>{item.nomorOrder}</strong>
          {" "}{meta.text}
          {item.invoice > 0 && (
            <span style={{ marginLeft:4, fontSize:11,
                           color: isDark ? "#22d3a0" : "#059669",
                           fontFamily:"'JetBrains Mono',monospace" }}>
              · {formatFull(item.invoice)}
            </span>
          )}
        </div>
        <div className="dp2-act-time">{relativeTime(item.time)} · {bidang}</div>
      </div>
    </div>
  );
});

/* ── Trend bar chart ── */
// eslint-disable-next-line react/display-name
const TrendChart = memo(({ data, isDark }) => {
  const avg       = data.length ? Math.round(data.reduce((s, d) => s + d.jumlah, 0) / data.length) : 0;
  const axisColor = isDark ? "rgba(74,85,128,.9)"    : "rgba(37,99,235,.5)";
  const gridColor = isDark ? "rgba(255,255,255,.04)" : "rgba(37,99,235,.06)";
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top:8, right:8, left:-20, bottom:4 }}>
        <defs>
          <linearGradient id="dp2BarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={isDark ? "#4f8ef7" : "#2563eb"} stopOpacity={0.9} />
            <stop offset="100%" stopColor={isDark ? "#1a3a8f" : "#93c5fd"} stopOpacity={0.45} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis dataKey="bulan"
               tick={{ fill:axisColor, fontFamily:"'Syne',sans-serif", fontSize:10 }}
               axisLine={{ stroke:gridColor }} tickLine={false} />
        <YAxis tick={{ fill:axisColor, fontFamily:"'JetBrains Mono',monospace", fontSize:10 }}
               axisLine={false} tickLine={false} />
        <Tooltip content={<ChartTooltip isDark={isDark} />}
                 cursor={{ fill: isDark ? "rgba(79,142,247,.05)" : "rgba(37,99,235,.05)", radius:6 }} />
        {avg > 0 && (
          <ReferenceLine y={avg}
            stroke={isDark ? "rgba(34,211,160,.5)" : "rgba(5,150,105,.5)"}
            strokeDasharray="5 4" strokeWidth={1.5}
            label={{ value:`Rata-rata: ${avg}`, position:"insideTopRight",
                     fill: isDark ? "rgba(34,211,160,.7)" : "rgba(5,150,105,.7)",
                     fontSize:9, fontFamily:"'JetBrains Mono',monospace" }} />
        )}
        <Bar dataKey="jumlah" name="Order" fill="url(#dp2BarGrad)" radius={[6,6,0,0]} barSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
});

/* ── Error banner ── */
const ErrorBanner = memo(({ message, onRetry }) => (
  <div className="dp2-error">
    <ExclamationTriangleIcon style={{ width:18, height:18, flexShrink:0 }} />
    <div style={{ flex:1 }}>
      <p style={{ fontWeight:600, fontSize:13, marginBottom:2 }}>Gagal Memuat Data</p>
      <p style={{ fontSize:11, opacity:.8 }}>{message}</p>
    </div>
    <button className="dp2-retry-btn" onClick={onRetry}>Coba Lagi</button>
  </div>
));

/* ══════════════════════════════════════════════════════════════
   § 5  MAIN COMPONENT
══════════════════════════════════════════════════════════════ */

/* Quick actions config — sesuaikan path sesuai routing Anda */
const buildQuickActions = (bidang) => [
  { label:"Buat Order Baru",    desc:"Input order portofolio",             path:`/orders/${bidang}/create`, Icon:PlusCircleIcon  },
  { label:"Daftar Semua Order", desc:"Lihat & kelola order",               path:`/orders/${bidang}`,        Icon:ListBulletIcon  },
  { label:"Laporan",            desc:"Penyelesaian Pekerjaan Operasional", path:"/laporan",                 Icon:DocumentTextIcon },
];

const DashboardPortofolio = () => {
  const navigate          = useNavigate();
  const { isDark }        = useTheme();
  const { activeUser }    = useUser();
  const d                 = isDark;

  /* ── Auth guard ── */
  const [authReady, setAuthReady] = useState(false);
  const [mounted,   setMounted]   = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAuthReady(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!authReady) return;
    setMounted(true);
    if (!activeUser || activeUser.peran?.toLowerCase() !== "admin portofolio") {
      navigate("/");
    }
  }, [authReady, activeUser, navigate]);

  /* ── Data ── */
  const bidang      = activeUser?.bidang ?? null;
  const bidangLabel = (bidang ?? "—").toUpperCase();

  const { stats, trends, activities, status, refresh } = usePortofolioData(bidang);
  const { loading, refreshing, error } = status;

  /* ── Derived ── */
  const pct          = stats.total > 0 ? Math.round((stats.selesai / stats.total) * 100) : 0;
  const totalTrend   = useMemo(() => trends.reduce((s, t) => s + t.jumlah, 0), [trends]);
  const QUICK_ACTIONS = useMemo(() => buildQuickActions(bidang ?? ""), [bidang]);

  /* ── KPI cards config (memoized — only rebuilds when stats/bidang change) ── */
  const kpiCards = useMemo(() => [
    {
      key:"total",   label:`Total Order — ${bidangLabel}`,
      value: stats.total.toLocaleString("id-ID"),
      badge:{ text:`${stats.total} total`, type:"up" },
      color:"blue",   anim:"dp2-c1",
      Icon: ListBulletIcon,
    },
    {
      key:"selesai", label:"Order Selesai",
      value: stats.selesai.toLocaleString("id-ID"),
      badge:{ text:"Status: Selesai", type:"up" },
      color:"green",  anim:"dp2-c2",
      Icon: CheckCircleIcon,
    },
    {
      key:"proses",  label:"Dalam Proses",
      value: stats.proses.toLocaleString("id-ID"),
      badge:{ text:"Sedang berjalan", type:"warn" },
      color:"orange", anim:"dp2-c3",
      Icon: ClockIcon,
    },
    {
      key:"invoice", label:`Nilai Invoice (Fee) — ${bidangLabel}`,
      value: formatShort(stats.invoice),
      sub:   formatFull(stats.invoice),
      color:"purple", anim:"dp2-c4",
      Icon: DocumentTextIcon,
    },
    {
      key:"proforma", label:`Nilai Proforma (PAD) — ${bidangLabel}`,
      value: formatShort(stats.proforma),
      sub:   formatFull(stats.proforma),
      color:"teal",   anim:"dp2-c5",
      Icon: ChartBarIcon,
    },
  ], [stats, bidangLabel]);

  /* ── Handlers ── */
  const handleRefresh     = useCallback(() => { if (!refreshing) refresh(); }, [refresh, refreshing]);
  const handleQuickAction = useCallback((path) => navigate(path), [navigate]);

  if (!authReady) return null;

  return (
    <>
      <style>{STYLES}</style>

      <main className={`dp2 ${d ? "dark" : "light"} ${mounted ? "dp2-p" : ""}`}
            role="main" aria-label="Dashboard Portofolio"
            style={{ transition:"background .35s ease" }}>

        <span className="dp2-sr">Dashboard Portofolio SIMDOR — ringkasan statistik order dan keuangan</span>

        <div className="dp2-inner">

          {/* ══ HEADER ══ */}
          <header className="dp2-header dp2-p">
            <div className="dp2-header-left">
              <nav className="dp2-breadcrumb" aria-label="Navigasi halaman">
                <span>SIMDOR</span><span aria-hidden>›</span>
                <span>Portofolio</span><span aria-hidden>›</span>
                <span>Dashboard</span>
              </nav>
              <h1 className="dp2-page-title">Dashboard <em>Portofolio</em></h1>
              <div className="dp2-page-meta">
                <div className="dp2-live-dot" aria-hidden />
                <span>Ringkasan order &amp; keuangan real-time</span>
              </div>
            </div>
            <div className="dp2-header-right">
              <div className="dp2-badge" aria-label={`Bidang: ${bidangLabel}`}>{bidangLabel}</div>
              <button className="dp2-btn-icon" onClick={handleRefresh}
                      disabled={refreshing || loading} aria-label="Refresh data" title="Refresh data">
                <ArrowPathIcon style={{ width:17, height:17 }} className={refreshing ? "dp2-spin" : ""} />
              </button>
            </div>
          </header>

          <div className="dp2-accent" aria-hidden />

          {/* ══ ERROR ══ */}
          {error && <ErrorBanner message={error} onRetry={handleRefresh} />}

          {/* ══ KPI CARDS ══ */}
          <section className="dp2-kpi-grid" aria-label="Statistik utama">
            {loading
              ? [1,2,3,4,5].map((i) => <KpiSkeleton key={i} />)
              : kpiCards.map(({ key, label, value, sub, badge, color, anim, Icon }) => (
                  <article key={key} className={`dp2-kpi kpi-${color} ${anim}`} aria-label={label}>
                    <div className="dp2-kpi-top">
                      <p className="dp2-kpi-label">{label}</p>
                      <div className={`dp2-kpi-ico ico-${color}`} aria-hidden>
                        <Icon style={{ width:17, height:17 }} />
                      </div>
                    </div>
                    <p className={`dp2-kpi-val val-${color}`}>{value}</p>
                    {sub   && <p className="dp2-kpi-sub">{sub}</p>}
                    {badge && <div className={`dp2-kpi-badge ${badge.type}`}>{badge.text}</div>}
                  </article>
                ))
            }
          </section>

          {/* ══ ROW 2 — Progress + Activity ══ */}
          <div className="dp2-row2">

            {/* Progress card */}
            <section className="dp2-card dp2-c6" aria-label="Progress penyelesaian order">
              <div className="dp2-card-head">
                <div className="dp2-card-ico ico-green" aria-hidden>
                  <ChartBarIcon style={{ width:14, height:14 }} />
                </div>
                <div>
                  <p className="dp2-card-title">Progress Penyelesaian</p>
                  <p className="dp2-card-sub">Rasio selesai vs total order</p>
                </div>
              </div>
              <div className="dp2-card-body">
                {loading
                  ? (
                    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                      <Skel h={110} w={110} r={55} />
                      <Skel h={12} w="70%" /><Skel h={8} />
                      <div style={{ display:"flex", gap:8 }}><Skel h={60} /><Skel h={60} /><Skel h={60} /></div>
                    </div>
                  )
                  : (
                    <div className="dp2-ring-wrap">
                      <CompletionRing pct={pct} isDark={d} />
                      <div className="dp2-prog-info">
                        <div className="dp2-prog-row">
                          <span className="dp2-prog-lbl">{stats.selesai} dari {stats.total} order selesai</span>
                          <span className="dp2-prog-pct">{pct}%</span>
                        </div>
                        <div className="dp2-prog-track" role="progressbar"
                             aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                          <div className="dp2-prog-fill" style={{ width:`${pct}%` }} />
                        </div>
                        <div className="dp2-milestones">
                          {[
                            { lbl:"Total",   val:stats.total,   color: d?"#7fb3ff":"#1d4ed8" },
                            { lbl:"Selesai", val:stats.selesai, color: d?"#88f0ce":"#059669" },
                            { lbl:"Proses",  val:stats.proses,  color: d?"#ffb380":"#ea580c" },
                          ].map((m) => (
                            <div key={m.lbl} className="dp2-ms">
                              <p className="dp2-ms-val" style={{ color:m.color }}>{m.val}</p>
                              <p className="dp2-ms-lbl">{m.lbl}</p>
                            </div>
                          ))}
                        </div>
                        <StatusPill total={stats.total} selesai={stats.selesai} proses={stats.proses} />
                      </div>
                    </div>
                  )
                }
              </div>
            </section>

            {/* Activity feed */}
            <section className="dp2-card dp2-c7" aria-label="Aktivitas terkini">
              <div className="dp2-card-head">
                <div className="dp2-card-ico ico-blue" aria-hidden>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                       strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
                       style={{ width:14, height:14 }}>
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                </div>
                <div>
                  <p className="dp2-card-title">Aktivitas Terkini</p>
                  <p className="dp2-card-sub">Update order terbaru portofolio</p>
                </div>
              </div>
              <div className="dp2-card-body" style={{ padding:"10px 18px" }}>
                {loading
                  ? (
                    <div style={{ display:"flex", flexDirection:"column", gap:14, paddingTop:6 }}>
                      {[1,2,3,4].map((i) => (
                        <div key={i} style={{ display:"flex", gap:10, alignItems:"center" }}>
                          <Skel h={8} w={8} r={8} />
                          <div style={{ flex:1 }}>
                            <Skel h={11} w="65%" />
                            <div style={{ marginTop:4 }}><Skel h={9} w="40%" /></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                  : activities.length > 0
                    ? (
                      <div className="dp2-act-list" role="feed">
                        {activities.map((item) => (
                          <ActivityItem key={item.id} item={item} bidang={bidangLabel} isDark={d} />
                        ))}
                      </div>
                    )
                    : (
                      <p style={{ textAlign:"center", padding:"24px 0", fontSize:12,
                                  color: d?"rgba(74,85,128,.7)":"rgba(37,99,235,.4)" }}>
                        Belum ada aktivitas tercatat.
                      </p>
                    )
                }
              </div>
            </section>
          </div>

          {/* ══ TREND CHART ══ */}
          <section className="dp2-card-full dp2-c8" aria-label="Tren order per bulan">
            <div className="dp2-card-head">
              <div className="dp2-card-ico ico-blue" aria-hidden>
                <ChartBarIcon style={{ width:14, height:14 }} />
              </div>
              <div style={{ flex:1 }}>
                <p className="dp2-card-title">Tren Order per Bulan</p>
                <p className="dp2-card-sub">12 bulan terakhir berdasarkan tanggal order</p>
              </div>
              <div className="dp2-chart-legend" aria-hidden>
                <span>
                  <span className="dp2-legend-sq" style={{ background: d?"#4f8ef7":"#2563eb" }} />
                  Jumlah Order
                </span>
                <span>
                  <span style={{ width:10, height:2, display:"inline-block", verticalAlign:"middle",
                                 borderTop:`1.5px dashed ${d?"#22d3a0":"#059669"}` }} />
                  Rata-rata
                </span>
              </div>
            </div>

            <div style={{ padding:"18px 18px 8px" }}>
              {loading
                ? <ChartSkeleton />
                : trends.length > 0
                  ? <TrendChart data={trends} isDark={d} />
                  : (
                    <div style={{ height:280, display:"flex", flexDirection:"column",
                                  alignItems:"center", justifyContent:"center", gap:10 }}>
                      <ChartBarIcon style={{ width:36, height:36,
                                             color: d?"rgba(79,142,247,.3)":"rgba(37,99,235,.3)" }} />
                      <p style={{ fontSize:13, color: d?"rgba(79,142,247,.4)":"rgba(37,99,235,.4)" }}>
                        Tidak ada data tren untuk ditampilkan.
                      </p>
                    </div>
                  )
              }
            </div>

            <div className="dp2-chart-footer">
              <span><ChartBarIcon style={{ width:13, height:13 }} /> Total {totalTrend} order dalam 12 bulan terakhir</span>
              <span style={{ color: d?"#22d3a0":"#059669" }}>↑ Portofolio {bidangLabel}</span>
            </div>
          </section>

          {/* ══ QUICK ACTIONS ══ */}
          <section className="dp2-card-full" style={{ marginBottom:0 }} aria-label="Aksi cepat">
            <div className="dp2-card-head">
              <div className="dp2-card-ico ico-orange" aria-hidden>
                <BoltIcon style={{ width:14, height:14 }} />
              </div>
              <div>
                <p className="dp2-card-title">Aksi Cepat</p>
                <p className="dp2-card-sub">Navigasi ke fitur utama</p>
              </div>
            </div>
            <div className="dp2-qa-grid" role="list">
              {QUICK_ACTIONS.map(({ label, desc, path, Icon }) => (
                <button key={label} className="dp2-qa" role="listitem"
                        onClick={() => handleQuickAction(path)} aria-label={label}>
                  <div className="dp2-qa-ico" aria-hidden><Icon style={{ width:17, height:17 }} /></div>
                  <span className="dp2-qa-lbl">{label}</span>
                  <span className="dp2-qa-desc">{desc}</span>
                </button>
              ))}
            </div>
          </section>

        </div>
      </main>
    </>
  );
};

export default memo(DashboardPortofolio);