/**
 * DashboardCS.jsx  ·  v2.0
 * ─────────────────────────────────────────────────────────────
 * Dashboard Customer Service — single file, best practices:
 *
 *  § 1  STYLES         — scoped .dcs2, dark/light, animations
 *  § 2  CONSTANTS      — status config, quick actions
 *  § 3  HELPERS        — formatter, date utils
 *  § 4  useCSData       — custom hook + Firestore
 *  § 5  SUB-COMPONENTS — memoized atoms
 *  § 6  MAIN COMPONENT
 *
 * Fitur baru vs v1:
 *  ✦ Status breakdown  — donut ring + bar per status
 *  ✦ Activity feed     — 5 order terbaru dengan live dot
 *  ✦ Quick actions     — shortcut ke fitur utama CS
 *  ✦ Inline search     — filter tabel real-time (no re-fetch)
 *  ✦ Status filter     — filter tabel per status
 *  ✦ Kolom No. Order   — ditambah di tabel
 *  ✦ Ref line chart    — rata-rata bulanan
 *  ✦ Completion rate   — persen selesai di header KPI
 * ─────────────────────────────────────────────────────────────
 */

import {
  useState, useEffect, useCallback, useRef,
  useMemo, memo,
} from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../services/firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine, Cell,
} from "recharts";
import {
  ClipboardDocumentListIcon, ClockIcon, CheckCircleIcon,
  ListBulletIcon, ChartBarIcon, ExclamationTriangleIcon,
  ArrowPathIcon, MagnifyingGlassIcon, PlusCircleIcon,
  FunnelIcon, XMarkIcon, BoltIcon,
} from "@heroicons/react/24/outline";
import { useNavigate as useNav } from "react-router-dom";
import { useTheme } from "../../components/layout/ThemeContext";
import { useUser }  from "../../context/UserContext";

/* ══════════════════════════════════════════════════════════════
   § 1  STYLES
══════════════════════════════════════════════════════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');

.dcs2*,.dcs2*::before,.dcs2*::after{box-sizing:border-box;margin:0;padding:0}
.dcs2{font-family:'Syne',sans-serif}
.dcs2.dark {background:#070b18;min-height:100vh}
.dcs2.light{background:#f0f4ff;min-height:100vh}
.dcs2-inner{max-width:1280px;margin:0 auto;padding:28px 20px 48px}

/* ── Accent bar ── */
@keyframes dcs2Flow{0%{background-position:0 0}100%{background-position:200% 0}}
.dcs2-accent{height:2px;background-size:200% 100%;animation:dcs2Flow 5s linear infinite;margin-bottom:28px;border-radius:2px}
.dcs2.dark  .dcs2-accent{background:linear-gradient(90deg,transparent,#1d4ed8 15%,#60a5fa 40%,#a78bfa 60%,#3b82f6 80%,transparent)}
.dcs2.light .dcs2-accent{background:linear-gradient(90deg,transparent,#3b82f6 15%,#93c5fd 40%,#6366f1 60%,#3b82f6 80%,transparent)}

/* ── Header ── */
.dcs2-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:6px;flex-wrap:wrap;gap:12px}
.dcs2-header-left{display:flex;align-items:center;gap:12px}
.dcs2-header-ico{width:44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.dcs2.dark  .dcs2-header-ico{background:rgba(59,130,246,.12);border:1px solid rgba(59,130,246,.22)}
.dcs2.light .dcs2-header-ico{background:rgba(255,255,255,.9);border:1px solid rgba(59,130,246,.2);box-shadow:0 1px 6px rgba(59,130,246,.1)}
.dcs2-page-title{font-size:22px;font-weight:800;letter-spacing:-.03em;line-height:1.1}
.dcs2.dark  .dcs2-page-title{color:#e8ecf8}
.dcs2.light .dcs2-page-title{color:#1e3a5f}
.dcs2-page-title em{font-style:normal;background:linear-gradient(135deg,#3b82f6,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.dcs2-page-sub{font-size:12px;margin-top:2px}
.dcs2.dark  .dcs2-page-sub{color:rgba(99,148,255,.5)}
.dcs2.light .dcs2-page-sub{color:rgba(37,99,235,.45)}
.dcs2-header-right{display:flex;align-items:center;gap:9px;flex-wrap:wrap}

.dcs2-live-dot{width:6px;height:6px;border-radius:50%;background:#22d3a0;box-shadow:0 0 7px #22d3a0}
@keyframes dcs2Pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.75)}}
.dcs2-live-dot{animation:dcs2Pulse 2s ease-in-out infinite}
.dcs2-live-wrap{display:flex;align-items:center;gap:5px;font-size:11px}
.dcs2.dark  .dcs2-live-wrap{color:rgba(74,85,128,.7)}
.dcs2.light .dcs2-live-wrap{color:rgba(37,99,235,.45)}

.dcs2-btn{display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;border:none;transition:all .2s;letter-spacing:.01em}
.dcs2-btn-ghost.dark {background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.2);color:#93c5fd}
.dcs2-btn-ghost.light{background:rgba(255,255,255,.8);border:1px solid rgba(59,130,246,.2);color:#2563eb;box-shadow:0 1px 4px rgba(59,130,246,.08)}
.dcs2-btn-ghost.dark:hover {background:rgba(59,130,246,.15);border-color:rgba(96,165,250,.35)}
.dcs2-btn-ghost.light:hover{background:rgba(219,234,254,.6);border-color:rgba(59,130,246,.35)}
.dcs2-btn-primary{background:linear-gradient(135deg,#1d4ed8,#4f8ef7);color:#fff;border:none;box-shadow:0 2px 12px rgba(37,99,235,.3)}
.dcs2-btn-primary:hover{box-shadow:0 4px 20px rgba(37,99,235,.45);transform:translateY(-1px)}
.dcs2-btn:disabled{opacity:.45;cursor:not-allowed;transform:none!important}
@keyframes dcs2Spin{to{transform:rotate(360deg)}}
.dcs2-spin{animation:dcs2Spin .8s linear infinite}

/* ── Grid ── */
.dcs2-kpi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:14px;margin-bottom:16px}
.dcs2-row2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
@media(max-width:720px){.dcs2-row2{grid-template-columns:1fr}}
.dcs2-row3{display:grid;grid-template-columns:3fr 2fr;gap:16px;margin-bottom:16px}
@media(max-width:800px){.dcs2-row3{grid-template-columns:1fr}}

/* ── Card ── */
.dcs2-card{border-radius:17px;overflow:hidden;transition:border-color .25s,box-shadow .25s,transform .2s}
.dcs2.dark  .dcs2-card{background:rgba(11,16,38,.85);border:1px solid rgba(99,148,255,.1);backdrop-filter:blur(20px)}
.dcs2.light .dcs2-card{background:rgba(255,255,255,.9);border:1px solid rgba(59,130,246,.12);box-shadow:0 2px 16px rgba(59,130,246,.06);backdrop-filter:blur(16px)}
.dcs2.dark  .dcs2-card:hover{border-color:rgba(96,165,250,.22);box-shadow:0 8px 36px rgba(0,0,0,.45);transform:translateY(-2px)}
.dcs2.light .dcs2-card:hover{border-color:rgba(59,130,246,.26);box-shadow:0 6px 24px rgba(59,130,246,.1);transform:translateY(-2px)}

/* KPI accent top bar */
.dcs2-kpi-bar{height:3px;border-radius:3px 3px 0 0}

/* Panel (table/chart) */
.dcs2-panel{border-radius:17px;overflow:hidden;transition:border-color .25s}
.dcs2.dark  .dcs2-panel{background:rgba(11,16,38,.85);border:1px solid rgba(99,148,255,.1);backdrop-filter:blur(20px)}
.dcs2.light .dcs2-panel{background:rgba(255,255,255,.9);border:1px solid rgba(59,130,246,.12);box-shadow:0 2px 16px rgba(59,130,246,.06);backdrop-filter:blur(16px)}
.dcs2-panel-head{padding:14px 20px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
.dcs2.dark  .dcs2-panel-head{border-bottom:1px solid rgba(99,148,255,.08)}
.dcs2.light .dcs2-panel-head{border-bottom:1px solid rgba(59,130,246,.09)}
.dcs2-panel-head-l{display:flex;align-items:center;gap:10px}
.dcs2-panel-ico{width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.dcs2.dark  .dcs2-panel-ico{background:rgba(59,130,246,.1);color:#60a5fa}
.dcs2.light .dcs2-panel-ico{background:rgba(37,99,235,.09);color:#2563eb}
.dcs2-panel-title{font-size:13.5px;font-weight:700;letter-spacing:-.01em}
.dcs2.dark  .dcs2-panel-title{color:#e8ecf8}
.dcs2.light .dcs2-panel-title{color:#1e3a5f}
.dcs2-panel-sub{font-size:10.5px;margin-top:1px}
.dcs2.dark  .dcs2-panel-sub{color:rgba(99,148,255,.5)}
.dcs2.light .dcs2-panel-sub{color:rgba(37,99,235,.45)}

/* ── KPI val ── */
.dcs2-kpi-label{font-size:11px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;max-width:160px;line-height:1.45}
.dcs2.dark  .dcs2-kpi-label{color:rgba(148,163,220,.65)}
.dcs2.light .dcs2-kpi-label{color:#4b6ea8}
.dcs2-kpi-ico{width:38px;height:38px;border-radius:11px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.dcs2-kpi-val{font-family:'JetBrains Mono',monospace;font-size:33px;font-weight:700;letter-spacing:-.02em;line-height:1;margin-top:12px}
.dcs2-kpi-sub{font-size:10px;font-family:'JetBrains Mono',monospace;margin-top:4px}
.dcs2.dark  .dcs2-kpi-sub{color:rgba(99,148,255,.38)}
.dcs2.light .dcs2-kpi-sub{color:rgba(37,99,235,.38)}
.dcs2-kpi-badge{display:inline-flex;align-items:center;gap:3px;font-size:10px;font-weight:600;margin-top:8px;padding:3px 8px;border-radius:6px}
.dcs2-kpi-badge.up  {background:rgba(34,211,160,.1);color:#22d3a0}
.dcs2.light .dcs2-kpi-badge.up{background:rgba(5,150,105,.1);color:#059669}
.dcs2-kpi-badge.warn{background:rgba(249,115,22,.1);color:#fb923c}
.dcs2.light .dcs2-kpi-badge.warn{background:rgba(234,88,12,.08);color:#ea580c}
.dcs2-kpi-badge.neutral{background:rgba(99,148,255,.1);color:#93c5fd}
.dcs2.light .dcs2-kpi-badge.neutral{background:rgba(37,99,235,.08);color:#2563eb}

/* ── Status badge ── */
.dcs2-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:600;white-space:nowrap}
.dcs2-badge-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0}

/* ── Status breakdown bars ── */
.dcs2-sb-row{display:flex;align-items:center;gap:8px;padding:7px 0}
.dcs2.dark  .dcs2-sb-row+.dcs2-sb-row{border-top:1px solid rgba(99,148,255,.06)}
.dcs2.light .dcs2-sb-row+.dcs2-sb-row{border-top:1px solid rgba(59,130,246,.07)}
.dcs2-sb-label{font-size:11px;font-weight:600;min-width:155px;flex-shrink:0}
.dcs2.dark  .dcs2-sb-label{color:rgba(148,163,220,.8)}
.dcs2.light .dcs2-sb-label{color:#4b6ea8}
.dcs2-sb-track{flex:1;height:5px;border-radius:99px;overflow:hidden;min-width:40px}
.dcs2.dark  .dcs2-sb-track{background:rgba(99,148,255,.08)}
.dcs2.light .dcs2-sb-track{background:rgba(37,99,235,.07)}
.dcs2-sb-fill{height:100%;border-radius:99px;transition:width 1.1s cubic-bezier(.22,1,.36,1)}
.dcs2-sb-count{font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;min-width:24px;text-align:right;flex-shrink:0}
.dcs2.dark  .dcs2-sb-count{color:#e8ecf8}
.dcs2.light .dcs2-sb-count{color:#1e3a5f}

/* ── Activity feed ── */
.dcs2-act-list{display:flex;flex-direction:column}
.dcs2-act-item{display:flex;align-items:flex-start;gap:10px;padding:9px 0}
.dcs2.dark  .dcs2-act-item+.dcs2-act-item{border-top:1px solid rgba(99,148,255,.05)}
.dcs2.light .dcs2-act-item+.dcs2-act-item{border-top:1px solid rgba(59,130,246,.07)}
.dcs2-act-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;margin-top:4px}
.dcs2-act-txt{font-size:12px;line-height:1.5}
.dcs2.dark  .dcs2-act-txt{color:#c8d0e8}
.dcs2.light .dcs2-act-txt{color:#334e7a}
.dcs2-act-time{font-size:9.5px;font-family:'JetBrains Mono',monospace;margin-top:2px}
.dcs2.dark  .dcs2-act-time{color:rgba(74,85,128,.7)}
.dcs2.light .dcs2-act-time{color:rgba(37,99,235,.4)}

/* ── Quick actions ── */
.dcs2-qa-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px;padding:14px 20px}
.dcs2-qa{border-radius:11px;padding:13px;cursor:pointer;display:flex;flex-direction:column;align-items:flex-start;gap:7px;border:none;text-align:left;transition:all .2s;width:100%}
.dcs2.dark  .dcs2-qa{background:rgba(20,28,58,.7);border:1px solid rgba(99,148,255,.08);color:#e8ecf8}
.dcs2.light .dcs2-qa{background:rgba(239,246,255,.7);border:1px solid rgba(59,130,246,.11);color:#1e3a5f}
.dcs2.dark  .dcs2-qa:hover{border-color:rgba(59,130,246,.3);background:rgba(59,130,246,.08)}
.dcs2.light .dcs2-qa:hover{border-color:rgba(59,130,246,.3);background:rgba(219,234,254,.5)}
.dcs2-qa-ico{width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center}
.dcs2.dark  .dcs2-qa-ico{background:rgba(59,130,246,.12);color:#60a5fa}
.dcs2.light .dcs2-qa-ico{background:rgba(37,99,235,.09);color:#2563eb}
.dcs2-qa-lbl{font-size:12px;font-weight:700;letter-spacing:-.01em}
.dcs2-qa-desc{font-size:10px}
.dcs2.dark  .dcs2-qa-desc{color:rgba(99,148,255,.5)}
.dcs2.light .dcs2-qa-desc{color:rgba(37,99,235,.45)}

/* ── Search & filter bar ── */
.dcs2-search-bar{display:flex;gap:8px;padding:10px 20px;flex-wrap:wrap}
.dcs2.dark  .dcs2-search-bar{border-bottom:1px solid rgba(99,148,255,.07)}
.dcs2.light .dcs2-search-bar{border-bottom:1px solid rgba(59,130,246,.08)}
.dcs2-search-wrap{position:relative;flex:1;min-width:180px}
.dcs2-search-ico{position:absolute;left:10px;top:50%;transform:translateY(-50%);pointer-events:none}
.dcs2.dark  .dcs2-search-ico{color:rgba(99,148,255,.5)}
.dcs2.light .dcs2-search-ico{color:rgba(37,99,235,.4)}
.dcs2-search-input{width:100%;padding:7px 10px 7px 32px;border-radius:9px;font-size:12px;font-family:'Syne',sans-serif;outline:none;transition:border-color .2s}
.dcs2.dark  .dcs2-search-input{background:rgba(255,255,255,.04);border:1px solid rgba(99,148,255,.14);color:#e8ecf8}
.dcs2.light .dcs2-search-input{background:rgba(239,246,255,.7);border:1px solid rgba(59,130,246,.14);color:#1e3a5f}
.dcs2.dark  .dcs2-search-input:focus{border-color:rgba(96,165,250,.4);background:rgba(59,130,246,.06)}
.dcs2.light .dcs2-search-input:focus{border-color:rgba(59,130,246,.35);background:rgba(255,255,255,1)}
.dcs2-search-input::placeholder{opacity:.5}
.dcs2-filter-select{padding:7px 10px;border-radius:9px;font-size:12px;font-family:'Syne',sans-serif;outline:none;cursor:pointer;transition:border-color .2s}
.dcs2.dark  .dcs2-filter-select{background:rgba(255,255,255,.04);border:1px solid rgba(99,148,255,.14);color:#e8ecf8}
.dcs2.light .dcs2-filter-select{background:rgba(239,246,255,.7);border:1px solid rgba(59,130,246,.14);color:#1e3a5f}
.dcs2-filter-select option{background:#0f172a;color:#e8ecf8}
.dcs2.light .dcs2-filter-select option{background:#fff;color:#1e3a5f}

/* ── Table ── */
.dcs2-table{width:100%;border-collapse:collapse;min-width:680px}
.dcs2-thead{}
.dcs2.dark  .dcs2-thead{background:rgba(7,11,24,.55)}
.dcs2.light .dcs2-thead{background:rgba(240,246,255,.65)}
.dcs2-th{padding:11px 16px;font-size:10.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;text-align:left;white-space:nowrap}
.dcs2.dark  .dcs2-th{color:rgba(148,163,220,.6);border-bottom:1px solid rgba(99,148,255,.09)}
.dcs2.light .dcs2-th{color:#6885b5;border-bottom:1px solid rgba(59,130,246,.1)}
.dcs2-td{padding:10px 16px;font-size:12.5px;vertical-align:middle}
.dcs2.dark  .dcs2-td{color:rgba(179,193,240,.85);border-bottom:1px solid rgba(99,148,255,.05)}
.dcs2.light .dcs2-td{color:#334e7a;border-bottom:1px solid rgba(59,130,246,.06)}
.dcs2.dark  .dcs2-tr:hover td{background:rgba(59,130,246,.045)}
.dcs2.light .dcs2-tr:hover td{background:rgba(59,130,246,.035)}
.dcs2-td-name{font-weight:600}
.dcs2.dark  .dcs2-td-name{color:#e8ecf8}
.dcs2.light .dcs2-td-name{color:#1e3a5f}
.dcs2-td-mono{font-family:'JetBrains Mono',monospace;font-size:11.5px;white-space:nowrap}
.dcs2-td-no{font-family:'JetBrains Mono',monospace;font-size:11px;opacity:.45}
.dcs2-empty{text-align:center;padding:40px 16px;font-size:13px}
.dcs2.dark  .dcs2-empty{color:rgba(99,148,255,.4)}
.dcs2.light .dcs2-empty{color:rgba(37,99,235,.4)}

/* ── Chart tooltip ── */
.dcs2-tip{padding:10px 14px;border-radius:10px}
.dcs2-tip.dark {background:rgba(7,11,24,.97);border:1px solid rgba(99,148,255,.2);box-shadow:0 8px 24px rgba(0,0,0,.5)}
.dcs2-tip.light{background:rgba(248,251,255,.98);border:1px solid rgba(59,130,246,.18);box-shadow:0 6px 20px rgba(59,130,246,.1)}
.dcs2-tip-label{font-size:11.5px;font-weight:600;margin-bottom:4px}
.dcs2-tip.dark  .dcs2-tip-label{color:rgba(148,163,220,.7)}
.dcs2-tip.light .dcs2-tip-label{color:#6885b5}
.dcs2-tip-val{font-size:17px;font-weight:700;font-family:'JetBrains Mono',monospace}
.dcs2-tip.dark  .dcs2-tip-val{color:#93c5fd}
.dcs2-tip.light .dcs2-tip-val{color:#1d4ed8}
.dcs2-chart-footer{display:flex;justify-content:space-between;align-items:center;padding:10px 20px;flex-wrap:wrap;gap:8px;font-size:11px}
.dcs2.dark  .dcs2-chart-footer{border-top:1px solid rgba(99,148,255,.07);color:rgba(74,85,128,.8)}
.dcs2.light .dcs2-chart-footer{border-top:1px solid rgba(59,130,246,.08);color:rgba(37,99,235,.5)}
.dcs2-chart-footer span{display:flex;align-items:center;gap:5px}

/* ── Error ── */
.dcs2-error{display:flex;align-items:flex-start;gap:12px;padding:13px 16px;border-radius:14px;margin-bottom:20px}
.dcs2.dark  .dcs2-error{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.25);color:#fca5a5}
.dcs2.light .dcs2-error{background:rgba(254,226,226,.8);border:1px solid rgba(252,165,165,.5);color:#b91c1c}
.dcs2-retry-btn{margin-left:auto;padding:5px 12px;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid currentColor;background:transparent;color:inherit;transition:opacity .2s;flex-shrink:0}
.dcs2-retry-btn:hover{opacity:.7}

/* ── Skeleton ── */
@keyframes dcs2Shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
.dcs2.dark  .dcs2-skel{background:linear-gradient(90deg,rgba(18,26,60,.7) 25%,rgba(35,50,100,.4) 50%,rgba(18,26,60,.7) 75%);background-size:800px 100%;animation:dcs2Shimmer 1.7s infinite linear;border-radius:8px}
.dcs2.light .dcs2-skel{background:linear-gradient(90deg,rgba(219,234,254,.6) 25%,rgba(191,219,254,.4) 50%,rgba(219,234,254,.6) 75%);background-size:800px 100%;animation:dcs2Shimmer 1.7s infinite linear;border-radius:8px}

/* ── Animations ── */
@keyframes dcs2PageIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes dcs2CardIn{from{opacity:0;transform:translateY(18px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}
.dcs2-p {animation:dcs2PageIn .5s cubic-bezier(.22,1,.36,1) both}
.dcs2-c1{animation:dcs2CardIn .5s .04s cubic-bezier(.22,1,.36,1) both}
.dcs2-c2{animation:dcs2CardIn .5s .09s cubic-bezier(.22,1,.36,1) both}
.dcs2-c3{animation:dcs2CardIn .5s .14s cubic-bezier(.22,1,.36,1) both}
.dcs2-c4{animation:dcs2CardIn .5s .19s cubic-bezier(.22,1,.36,1) both}
.dcs2-c5{animation:dcs2CardIn .5s .25s cubic-bezier(.22,1,.36,1) both}
.dcs2-c6{animation:dcs2CardIn .5s .31s cubic-bezier(.22,1,.36,1) both}
.dcs2-c7{animation:dcs2CardIn .5s .37s cubic-bezier(.22,1,.36,1) both}
.dcs2-c8{animation:dcs2CardIn .5s .43s cubic-bezier(.22,1,.36,1) both}
.dcs2-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
`;

/* ══════════════════════════════════════════════════════════════
   § 2  CONSTANTS
══════════════════════════════════════════════════════════════ */
const STATUS_CFG = {
  "New Order":             { bg:"rgba(148,163,184,.14)", border:"rgba(148,163,184,.28)", color:"#94a3b8", fill:"#94a3b8" },
  "Entry":                 { bg:"rgba(16,185,129,.14)",  border:"rgba(16,185,129,.28)",  color:"#34d399", fill:"#34d399" },
  "Diproses - Lapangan":   { bg:"rgba(59,130,246,.14)",  border:"rgba(59,130,246,.28)",  color:"#60a5fa", fill:"#60a5fa" },
  "Diproses - Sertifikat": { bg:"rgba(139,92,246,.14)",  border:"rgba(139,92,246,.28)",  color:"#a78bfa", fill:"#a78bfa" },
  "Penerbitan Proforma":   { bg:"rgba(245,158,11,.14)",  border:"rgba(245,158,11,.28)",  color:"#fbbf24", fill:"#fbbf24" },
  "Invoice":               { bg:"rgba(245,158,11,.14)",  border:"rgba(245,158,11,.28)",  color:"#fbbf24", fill:"#fbbf24" },
  "Closed Order":          { bg:"rgba(249,115,22,.14)",  border:"rgba(249,115,22,.28)",  color:"#fb923c", fill:"#fb923c" },
  "Selesai":               { bg:"rgba(20,184,166,.14)",  border:"rgba(20,184,166,.28)",  color:"#2dd4bf", fill:"#2dd4bf" },
};

// Quick actions — sesuaikan path sesuai routing project Anda
// const QUICK_ACTIONS = [
//   { label:"Buat Order Baru",   desc:"Input order pelanggan", path:"/order/baru",   Icon:PlusCircleIcon },
//   { label:"Daftar Order",      desc:"Lihat semua order",     path:"/order/daftar", Icon:ListBulletIcon },
//   { label:"Cari Pelanggan",    desc:"Riwayat & data",        path:"/pelanggan",    Icon:MagnifyingGlassIcon },
//   { label:"Aksi Cepat",        desc:"Shortcut CS",           path:"/cs/aksi",      Icon:BoltIcon },
// ];

/* ══════════════════════════════════════════════════════════════
   § 3  HELPERS
══════════════════════════════════════════════════════════════ */
const getLast12Months = () => {
  const N = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  const now = new Date();
  return Array.from({ length:12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    return `${N[d.getMonth()]} ${d.getFullYear()}`;
  });
};

const fmtDate = (ts) => {
  if (!ts || typeof ts.seconds !== "number") return "—";
  try {
    return new Date(ts.seconds * 1000).toLocaleDateString("id-ID",
      { day:"2-digit", month:"short", year:"numeric" });
  } catch { return "—"; }
};

const relTime = (ts) => {
  if (!ts || typeof ts.seconds !== "number") return "—";
  const diff = Date.now() - ts.seconds * 1000;
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "Baru saja";
  if (mins < 60) return `${mins} mnt lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs} jam lalu`;
  return `${Math.floor(hrs / 24)} hari lalu`;
};

/* ══════════════════════════════════════════════════════════════
   § 4  useCSData — custom hook
══════════════════════════════════════════════════════════════ */
const useCSData = () => {
  const [data, setData]     = useState({
    totalOrders: 0, processingOrders: 0, completedOrders: 0,
    otherOrders: 0, statusCounts: {},
    recentOrders: [], activityFeed: [], orderTrends: [],
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
      const snap   = await getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc")));
      const months = getLast12Months();

      let totalOrders = snap.size, processingOrders = 0, completedOrders = 0, otherOrders = 0;
      const statusCounts  = {};
      const trendMap      = {};
      const recentOrders  = [];
      const activityFeed  = [];

      snap.forEach((doc) => {
        const d      = doc.data();
        const status = d.statusOrder || "Unknown";

        // counts
        if (status === "Selesai")              completedOrders++;
        else if (status === "Diproses - Lapangan") processingOrders++;
        else                                   otherOrders++;

        statusCounts[status] = (statusCounts[status] || 0) + 1;

        // trend
        const trendTs = d.tanggalOrder || d.createdAt;
        if (trendTs?.seconds) {
          const key = new Date(trendTs.seconds * 1000)
            .toLocaleDateString("id-ID", { month:"short", year:"numeric" });
          if (months.includes(key)) trendMap[key] = (trendMap[key] || 0) + 1;
        }

        // recent orders table (up to 15 for filtering)
        if (recentOrders.length < 15) {
          recentOrders.push({
            id:          doc.id,
            nomorOrder:  d.nomorOrder || doc.id.slice(0, 10).toUpperCase(),
            pelanggan:   d.pelanggan  || "—",
            portofolio:  d.portofolio || "—",
            statusOrder: status,
            tanggalOrder: fmtDate(d.tanggalOrder),
            createdAt:    fmtDate(d.createdAt),
            createdAtRaw: d.createdAt,
          });
        }

        // activity feed (up to 6 most recent)
        if (activityFeed.length < 6) {
          activityFeed.push({
            id:          doc.id,
            pelanggan:   d.pelanggan || "—",
            statusOrder: status,
            createdAt:   d.createdAt,
          });
        }
      });

      if (!mountedRef.current) return;
      setData({
        totalOrders, processingOrders, completedOrders,
        otherOrders: totalOrders - processingOrders - completedOrders,
        statusCounts,
        recentOrders,
        activityFeed,
        orderTrends: months.map((m) => ({ bulan:m, jumlah: trendMap[m]||0 })),
      });
      setStatus({ loading:false, refreshing:false, error:null });

    } catch (err) {
      console.error("[useCSData]", err);
      if (mountedRef.current)
        setStatus({ loading:false, refreshing:false,
                    error: err.message || "Tidak dapat memuat data. Coba lagi." });
    }
  }, []);

  useEffect(() => { fetchData(false); }, [fetchData]);
  const refresh = useCallback(() => fetchData(true), [fetchData]);
  return { data, status, refresh };
};

/* ══════════════════════════════════════════════════════════════
   § 5  SUB-COMPONENTS
══════════════════════════════════════════════════════════════ */

const Skel = memo(({ h=14, w="100%", r=7 }) => (
  <div className="dcs2-skel" style={{ height:h, width:w, borderRadius:r }} />
));

const KpiSkel = memo(() => (
  <div className="dcs2-card" style={{ overflow:"hidden", pointerEvents:"none" }}>
    <div style={{ height:3, background:"rgba(99,148,255,.15)" }} />
    <div style={{ padding:"16px 18px 18px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
        <Skel h={12} w="55%" /><Skel h={38} w={38} r={11} />
      </div>
      <Skel h={38} w="40%" /><div style={{ marginTop:9 }}><Skel h={10} w="35%" /></div>
    </div>
  </div>
));

const ChartSkel = memo(() => (
  <div style={{ height:340, display:"flex", alignItems:"flex-end", gap:9, padding:"0 8px" }}>
    {[55,70,45,80,65,90,50,75,60,85,40,72].map((h, i) => (
      <div key={i} className="dcs2-skel"
           style={{ flex:1, height:`${h}%`, borderRadius:"6px 6px 0 0" }} />
    ))}
  </div>
));

const ChartTooltip = memo(({ active, payload, label, isDark }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={`dcs2-tip ${isDark ? "dark" : "light"}`}>
      <p className="dcs2-tip-label">{label}</p>
      <p className="dcs2-tip-val">
        {payload[0]?.value}{" "}
        <span style={{ fontSize:11, fontWeight:400, opacity:.65 }}>order</span>
      </p>
    </div>
  );
});

const StatusBadge = memo(({ status }) => {
  const cfg = STATUS_CFG[status] || { bg:"rgba(239,68,68,.14)", border:"rgba(239,68,68,.28)", color:"#f87171" };
  return (
    <span className="dcs2-badge"
          style={{ background:cfg.bg, border:`1px solid ${cfg.border}`, color:cfg.color }}>
      <span className="dcs2-badge-dot" style={{ background:cfg.color }} />
      {status}
    </span>
  );
});

const StatusBreakdownRow = memo(({ statusKey, count, maxCount }) => {
  const cfg  = STATUS_CFG[statusKey] || { fill:"#94a3b8" };
  const pct  = maxCount > 0 ? (count / maxCount) * 100 : 0;
  return (
    <div className="dcs2-sb-row" role="listitem">
      <span className="dcs2-sb-label">{statusKey}</span>
      <div className="dcs2-sb-track" aria-hidden>
        <div className="dcs2-sb-fill" style={{ width:`${pct}%`, background:cfg.fill, opacity:.82 }} />
      </div>
      <span className="dcs2-sb-count">{count}</span>
    </div>
  );
});

const ActivityItem = memo(({ item, isDark }) => {
  const cfg = STATUS_CFG[item.statusOrder] || { color:"#94a3b8" };
  return (
    <div className="dcs2-act-item">
      <div className="dcs2-act-dot" style={{ background:cfg.color, boxShadow:`0 0 5px ${cfg.color}` }} />
      <div style={{ flex:1 }}>
        <div className="dcs2-act-txt">
          <strong style={{ color: isDark?"#e8ecf8":"#1e3a5f" }}>{item.pelanggan}</strong>
          {" "}— <StatusBadge status={item.statusOrder} />
        </div>
        <div className="dcs2-act-time">{relTime(item.createdAt)}</div>
      </div>
    </div>
  );
});

const ErrorBanner = memo(({ message, onRetry }) => (
  <div className="dcs2-error">
    <ExclamationTriangleIcon style={{ width:18, height:18, flexShrink:0 }} />
    <div style={{ flex:1 }}>
      <p style={{ fontWeight:600, fontSize:13, marginBottom:2 }}>Gagal Memuat Data</p>
      <p style={{ fontSize:11, opacity:.8 }}>{message}</p>
    </div>
    <button className="dcs2-retry-btn" onClick={onRetry}>Coba Lagi</button>
  </div>
));

/* ══════════════════════════════════════════════════════════════
   § 6  MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
const DashboardCS = () => {
  const navigate        = useNavigate();
  const { isDark }      = useTheme();
  const { activeUser }  = useUser();
  const d               = isDark;

  /* ── Auth ── */
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (!activeUser) return;
    if (activeUser.peran?.toLowerCase() !== "customer service") navigate("/");
  }, [activeUser, navigate]);

  /* ── Data ── */
  const { data, status, refresh } = useCSData();
  const { loading, refreshing, error } = status;

  /* ── Table filters ── */
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredOrders = useMemo(() => {
    let rows = data.recentOrders;
    if (statusFilter !== "all")
      rows = rows.filter((r) => r.statusOrder === statusFilter);
    if (search.trim())
      rows = rows.filter((r) =>
        r.pelanggan.toLowerCase().includes(search.toLowerCase()) ||
        r.nomorOrder.toLowerCase().includes(search.toLowerCase()) ||
        r.portofolio.toLowerCase().includes(search.toLowerCase())
      );
    return rows;
  }, [data.recentOrders, search, statusFilter]);

  /* ── Derived ── */
  const completionRate = data.totalOrders > 0
    ? Math.round((data.completedOrders / data.totalOrders) * 100)
    : 0;

  const maxStatus = useMemo(
    () => Math.max(...Object.values(data.statusCounts), 1),
    [data.statusCounts]
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
      key:"total",     label:"Total Order",
      value: data.totalOrders.toLocaleString("id-ID"),
      badge:{ text:`${completionRate}% selesai`, type:"neutral" },
      gradBar:"linear-gradient(90deg,#1d4ed8,#60a5fa)",
      iconBg: d?"rgba(59,130,246,.18)":"rgba(37,99,235,.12)",
      iconColor: d?"#60a5fa":"#2563eb",
      valColor: d?"#93c5fd":"#1d4ed8",
      anim:"dcs2-c1", Icon:ClipboardDocumentListIcon,
    },
    {
      key:"proses",    label:"Proses Lapangan",
      value: data.processingOrders.toLocaleString("id-ID"),
      sub:"Diproses - Lapangan",
      badge:{ text:"Sedang berjalan", type:"warn" },
      gradBar:"linear-gradient(90deg,#d97706,#fb923c)",
      iconBg: d?"rgba(245,158,11,.18)":"rgba(217,119,6,.12)",
      iconColor: d?"#fbbf24":"#d97706",
      valColor: d?"#fdba74":"#ea580c",
      anim:"dcs2-c2", Icon:ClockIcon,
    },
    {
      key:"selesai",   label:"Order Selesai",
      value: data.completedOrders.toLocaleString("id-ID"),
      sub:"Status: Selesai",
      badge:{ text:"Terkonfirmasi", type:"up" },
      gradBar:"linear-gradient(90deg,#0d9488,#2dd4bf)",
      iconBg: d?"rgba(20,184,166,.18)":"rgba(13,148,136,.12)",
      iconColor: d?"#2dd4bf":"#0d9488",
      valColor: d?"#5eead4":"#0f766e",
      anim:"dcs2-c3", Icon:CheckCircleIcon,
    },
    {
      key:"lain",      label:"Status Lain",
      value: data.otherOrders.toLocaleString("id-ID"),
      sub:"New Order, Entry, Closed, dll.",
      gradBar:"linear-gradient(90deg,#6366f1,#a78bfa)",
      iconBg: d?"rgba(139,92,246,.18)":"rgba(99,102,241,.12)",
      iconColor: d?"#a78bfa":"#6366f1",
      valColor: d?"#c4b5fd":"#6d28d9",
      anim:"dcs2-c4", Icon:ListBulletIcon,
    },
  ], [data, completionRate, d]);

  const axisColor = d ? "rgba(99,148,255,.4)"  : "rgba(37,99,235,.35)";
  const gridColor = d ? "rgba(99,148,255,.07)" : "rgba(37,99,235,.06)";

  const handleRefresh = useCallback(() => { if (!refreshing) refresh(); }, [refresh, refreshing]);
  const handleClearFilter = useCallback(() => { setSearch(""); setStatusFilter("all"); }, []);

  return (
    <>
      <style>{STYLES}</style>

      <main className={`dcs2 ${d ? "dark" : "light"} ${mounted ? "dcs2-p" : ""}`}
            role="main" aria-label="Dashboard Customer Service"
            style={{ transition:"background .4s ease" }}>

        <span className="dcs2-sr">Dashboard Customer Service SIMDOR — aktivitas order real-time</span>

        <div className="dcs2-inner">

          {/* ══ ACCENT ══ */}
          <div className="dcs2-accent" aria-hidden />

          {/* ══ HEADER ══ */}
          <header className="dcs2-header dcs2-p">
            <div className="dcs2-header-left">
              <div className="dcs2-header-ico" aria-hidden>
                <ChartBarIcon style={{ width:22, height:22, color: d?"#60a5fa":"#2563eb" }} />
              </div>
              <div>
                <h1 className="dcs2-page-title">Dashboard <em>CS</em></h1>
                <p className="dcs2-page-sub">SIMDOR — Aktivitas order real-time</p>
              </div>
            </div>

            <div className="dcs2-header-right">
              <div className="dcs2-live-wrap">
                <div className="dcs2-live-dot" aria-hidden />
                <span>Real Time</span>
              </div>
              <button
                className={`dcs2-btn dcs2-btn-ghost ${d ? "dark" : "light"}`}
                onClick={handleRefresh}
                disabled={refreshing || loading}
                aria-label="Refresh data"
              >
                <ArrowPathIcon style={{ width:14, height:14 }}
                               className={refreshing ? "dcs2-spin" : ""} />
                {refreshing ? "Memuat..." : "Refresh"}
              </button>
              {/* <button
                className="dcs2-btn dcs2-btn-primary"
                onClick={() => navigate("/order/baru")}
                aria-label="Buat order baru"
              >
                <PlusCircleIcon style={{ width:14, height:14 }} />
                Buat Order
              </button> */}
            </div>
          </header>

          {/* ══ ERROR ══ */}
          {error && <ErrorBanner message={error} onRetry={handleRefresh} />}

          {/* ══ KPI CARDS ══ */}
          <section className="dcs2-kpi-grid" aria-label="Statistik order">
            {loading
              ? [1,2,3,4].map((i) => <KpiSkel key={i} />)
              : kpiCards.map(({ key, label, value, sub, badge, gradBar,
                                iconBg, iconColor, valColor, anim, Icon }) => (
                <article key={key} className={`dcs2-card ${anim}`}
                         style={{ overflow:"hidden" }} aria-label={label}>
                  <div className="dcs2-kpi-bar" style={{ background:gradBar }} />
                  <div style={{ padding:"16px 18px 18px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between",
                                  alignItems:"flex-start", marginBottom:0 }}>
                      <p className="dcs2-kpi-label">{label}</p>
                      <div className="dcs2-kpi-ico" style={{ background:iconBg }} aria-hidden>
                        <Icon style={{ width:19, height:19, color:iconColor }} />
                      </div>
                    </div>
                    <p className="dcs2-kpi-val" style={{ color:valColor }}>{value}</p>
                    {sub   && <p className="dcs2-kpi-sub">{sub}</p>}
                    {badge && (
                      <div className={`dcs2-kpi-badge ${badge.type}`}>{badge.text}</div>
                    )}
                  </div>
                </article>
              ))
            }
          </section>

          {/* ══ STATUS BREAKDOWN + ACTIVITY FEED ══ */}
          <div className="dcs2-row2">

            {/* Status breakdown */}
            <section className="dcs2-panel dcs2-c5" aria-label="Breakdown status order">
              <div className="dcs2-panel-head">
                <div className="dcs2-panel-head-l">
                  <div className="dcs2-panel-ico" aria-hidden>
                    <FunnelIcon style={{ width:13, height:13 }} />
                  </div>
                  <div>
                    <p className="dcs2-panel-title">Status Breakdown</p>
                    <p className="dcs2-panel-sub">Distribusi per tahap proses</p>
                  </div>
                </div>
              </div>
              <div style={{ padding:"10px 20px 16px" }}>
                {loading
                  ? <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                      {[1,2,3,4,5,6,7,8].map((i) => <Skel key={i} h={28} />)}
                    </div>
                  : (
                    <div role="list">
                      {Object.entries(STATUS_CFG).map(([s]) => (
                        <StatusBreakdownRow
                          key={s}
                          statusKey={s}
                          count={data.statusCounts[s] || 0}
                          maxCount={maxStatus}
                        />
                      ))}
                    </div>
                  )
                }
              </div>
            </section>

            {/* Activity feed */}
            <section className="dcs2-panel dcs2-c6" aria-label="Aktivitas order terkini">
              <div className="dcs2-panel-head">
                <div className="dcs2-panel-head-l">
                  <div className="dcs2-panel-ico" aria-hidden>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
                         style={{ width:13, height:13 }}>
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                  </div>
                  <div>
                    <p className="dcs2-panel-title">Aktivitas Terkini</p>
                    <p className="dcs2-panel-sub">Order paling baru masuk</p>
                  </div>
                </div>
              </div>
              <div style={{ padding:"8px 20px 14px" }}>
                {loading
                  ? <div style={{ display:"flex", flexDirection:"column", gap:13, paddingTop:6 }}>
                      {[1,2,3,4,5].map((i) => (
                        <div key={i} style={{ display:"flex", gap:10, alignItems:"center" }}>
                          <Skel h={7} w={7} r={7} />
                          <div style={{ flex:1 }}>
                            <Skel h={11} w="65%" />
                            <div style={{ marginTop:4 }}><Skel h={9} w="40%" /></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  : data.activityFeed.length > 0
                    ? (
                      <div className="dcs2-act-list" role="feed">
                        {data.activityFeed.map((item) => (
                          <ActivityItem key={item.id} item={item} isDark={d} />
                        ))}
                      </div>
                    )
                    : (
                      <p className="dcs2-empty" style={{ paddingTop:20 }}>
                        Belum ada aktivitas tercatat.
                      </p>
                    )
                }
              </div>
            </section>
          </div>

          {/* ══ QUICK ACTIONS ══
          <section className="dcs2-panel dcs2-c6" style={{ marginBottom:16 }}
                   aria-label="Aksi cepat">
            <div className="dcs2-panel-head">
              <div className="dcs2-panel-head-l">
                <div className="dcs2-panel-ico" aria-hidden>
                  <BoltIcon style={{ width:13, height:13 }} />
                </div>
                <div>
                  <p className="dcs2-panel-title">Aksi Cepat</p>
                  <p className="dcs2-panel-sub">Shortcut navigasi untuk CS</p>
                </div>
              </div>
            </div>
            <div className="dcs2-qa-grid" role="list">
              {QUICK_ACTIONS.map(({ label, desc, path, Icon }) => (
                <button key={label} className="dcs2-qa" role="listitem"
                        onClick={() => navigate(path)} aria-label={label}>
                  <div className="dcs2-qa-ico" aria-hidden>
                    <Icon style={{ width:15, height:15 }} />
                  </div>
                  <span className="dcs2-qa-lbl">{label}</span>
                  <span className="dcs2-qa-desc">{desc}</span>
                </button>
              ))}
            </div>
          </section> */}

          {/* ══ ORDER TABLE ══ */}
          <section className="dcs2-panel dcs2-c7" style={{ marginBottom:16 }}
                   aria-label="Daftar order terkini">
            <div className="dcs2-panel-head">
              <div className="dcs2-panel-head-l">
                <div className="dcs2-panel-ico" aria-hidden>
                  <ListBulletIcon style={{ width:13, height:13 }} />
                </div>
                <div>
                  <p className="dcs2-panel-title">Daftar Order Terkini</p>
                  <p className="dcs2-panel-sub">
                    {filteredOrders.length} order ditampilkan
                    {(search || statusFilter !== "all") && " (difilter)"}
                  </p>
                </div>
              </div>
              {(search || statusFilter !== "all") && (
                <button
                  className={`dcs2-btn dcs2-btn-ghost ${d ? "dark" : "light"}`}
                  style={{ fontSize:11, padding:"5px 10px" }}
                  onClick={handleClearFilter}
                >
                  <XMarkIcon style={{ width:12, height:12 }} />
                  Reset Filter
                </button>
              )}
            </div>

            {/* Search & filter bar */}
            <div className="dcs2-search-bar">
              <div className="dcs2-search-wrap">
                <MagnifyingGlassIcon className="dcs2-search-ico" style={{ width:14, height:14 }} aria-hidden />
                <input
                  className="dcs2-search-input"
                  type="text"
                  placeholder="Cari nama pelanggan, no. order, portofolio..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Cari order"
                />
              </div>
              <select
                className="dcs2-filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter status"
              >
                <option value="all">Semua Status</option>
                {Object.keys(STATUS_CFG).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Table */}
            <div style={{ overflowX:"auto" }}>
              <table className="dcs2-table" role="table" aria-label="Daftar order">
                <thead className="dcs2-thead">
                  <tr>
                    {["#","No. Order","Pelanggan","Portofolio","Status","Tgl. Order","Dibuat"].map((h) => (
                      <th key={h} className="dcs2-th" scope="col">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? [1,2,3,4,5].map((i) => (
                        <tr key={i}>
                          {[4,18,22,14,16,14,14].map((w, j) => (
                            <td key={j} className="dcs2-td">
                              <Skel h={12} w={`${w}%`} />
                            </td>
                          ))}
                        </tr>
                      ))
                    : filteredOrders.length > 0
                      ? filteredOrders.map((order, idx) => (
                          <tr key={order.id} className="dcs2-tr">
                            <td className="dcs2-td">
                              <span className="dcs2-td-no">{String(idx + 1).padStart(2, "0")}</span>
                            </td>
                            <td className="dcs2-td">
                              <span className="dcs2-td-mono" style={{ fontSize:11 }}>
                                {order.nomorOrder}
                              </span>
                            </td>
                            <td className="dcs2-td dcs2-td-name" style={{ whiteSpace:"nowrap" }}>
                              {order.pelanggan}
                            </td>
                            <td className="dcs2-td" style={{ whiteSpace:"nowrap" }}>
                              {order.portofolio}
                            </td>
                            <td className="dcs2-td">
                              <StatusBadge status={order.statusOrder} />
                            </td>
                            <td className="dcs2-td dcs2-td-mono">{order.tanggalOrder}</td>
                            <td className="dcs2-td dcs2-td-mono">{order.createdAt}</td>
                          </tr>
                        ))
                      : (
                          <tr>
                            <td colSpan={7} className="dcs2-empty">
                              {search || statusFilter !== "all"
                                ? "Tidak ada order yang cocok dengan filter."
                                : "Tidak ada data order terbaru."}
                            </td>
                          </tr>
                        )
                  }
                </tbody>
              </table>
            </div>
          </section>

          {/* ══ TREND CHART ══ */}
          <section className="dcs2-panel dcs2-c8" aria-label="Tren order per bulan">
            <div className="dcs2-panel-head">
              <div className="dcs2-panel-head-l">
                <div className="dcs2-panel-ico" aria-hidden>
                  <ChartBarIcon style={{ width:13, height:13 }} />
                </div>
                <div>
                  <p className="dcs2-panel-title">Tren Order per Bulan</p>
                  <p className="dcs2-panel-sub">12 bulan terakhir berdasarkan tanggal order</p>
                </div>
              </div>
              <div style={{ display:"flex", gap:14, alignItems:"center" }} aria-hidden>
                <span style={{ display:"flex", alignItems:"center", gap:5, fontSize:10.5,
                               color: d?"rgba(99,148,255,.7)":"rgba(37,99,235,.55)" }}>
                  <span style={{ width:10, height:10, borderRadius:2,
                                 background: d?"#3b82f6":"#2563eb", display:"inline-block" }} />
                  Jumlah Order
                </span>
                <span style={{ display:"flex", alignItems:"center", gap:5, fontSize:10.5,
                               color: d?"rgba(99,148,255,.7)":"rgba(37,99,235,.55)" }}>
                  <span style={{ width:10, height:2, display:"inline-block", verticalAlign:"middle",
                                 borderTop:`1.5px dashed ${d?"#34d399":"#059669"}` }} />
                  Rata-rata
                </span>
              </div>
            </div>

            <div style={{ padding:"18px 20px 8px" }}>
              {loading
                ? <ChartSkel />
                : data.orderTrends.length > 0
                  ? (
                    <ResponsiveContainer width="100%" height={340}>
                      <BarChart data={data.orderTrends} margin={{ top:8, right:8, left:-16, bottom:4 }}>
                        <defs>
                          <linearGradient id="dcs2BarGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%"   stopColor={d?"#3b82f6":"#2563eb"} stopOpacity={0.9} />
                            <stop offset="100%" stopColor={d?"#60a5fa":"#93c5fd"} stopOpacity={0.45} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                        <XAxis dataKey="bulan"
                               tick={{ fill:axisColor, fontFamily:"'Syne',sans-serif", fontSize:10 }}
                               axisLine={{ stroke:gridColor }} tickLine={false} />
                        <YAxis tick={{ fill:axisColor, fontFamily:"'JetBrains Mono',monospace", fontSize:10 }}
                               axisLine={false} tickLine={false} />
                        <Tooltip content={<ChartTooltip isDark={d} />}
                                 cursor={{ fill: d?"rgba(59,130,246,.06)":"rgba(59,130,246,.05)", radius:6 }} />
                        {chartAvg > 0 && (
                          <ReferenceLine y={chartAvg}
                            stroke={d?"rgba(52,211,153,.5)":"rgba(5,150,105,.5)"}
                            strokeDasharray="5 4" strokeWidth={1.5}
                            label={{ value:`Rata-rata: ${chartAvg}`, position:"insideTopRight",
                                     fill: d?"rgba(52,211,153,.7)":"rgba(5,150,105,.7)",
                                     fontSize:9, fontFamily:"'JetBrains Mono',monospace" }} />
                        )}
                        <Bar dataKey="jumlah" name="Jumlah Order"
                             fill="url(#dcs2BarGrad)" radius={[6,6,0,0]} barSize={22}>
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

            <div className="dcs2-chart-footer">
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

export default memo(DashboardCS);