import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../services/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
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
  ChevronUpIcon,
  ChevronDownIcon,
  Squares2X2Icon,
  ListBulletIcon,
  CheckCircleIcon,
  ClockIcon,
  InboxStackIcon,
  DocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { useTheme } from "../../components/layout/ThemeContext";

/* ═══════════════════════════════════════════════════════════════
   STYLES
════════════════════════════════════════════════════════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

.op-root { font-family: 'Plus Jakarta Sans', sans-serif; }

/* ── Background ── */
.op-bg-dark  {
  background: #060a14;
  background-image:
    radial-gradient(ellipse 80% 50% at 20% -10%, rgba(37,99,235,0.12) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 80% 110%, rgba(99,102,241,0.08) 0%, transparent 50%);
  min-height: 100vh;
}
.op-bg-light {
  background: #f4f7ff;
  background-image:
    radial-gradient(ellipse 80% 50% at 20% -10%, rgba(219,234,254,0.8) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 80% 110%, rgba(199,210,254,0.4) 0%, transparent 50%);
  min-height: 100vh;
}

/* ── Typography ── */
.op-title-dark  { color: #e2eaff; }
.op-title-light { color: #0f2152; }
.op-sub-dark    { color: rgba(148,163,220,0.6); }
.op-sub-light   { color: #7b95c4; }

/* ── Stat cards ── */
.op-stat-dark {
  background: rgba(12,18,38,0.85);
  border: 1px solid rgba(99,148,255,0.12);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border-radius: 16px; padding: 20px 22px;
  transition: border-color .25s, box-shadow .25s, transform .25s;
  position: relative; overflow: hidden;
}
.op-stat-dark::before {
  content: ''; position: absolute; inset: 0; opacity: 0;
  background: radial-gradient(circle at 30% 50%, rgba(59,130,246,0.06), transparent 70%);
  transition: opacity .3s;
}
.op-stat-dark:hover { border-color: rgba(99,148,255,0.25); box-shadow: 0 12px 36px rgba(0,0,0,0.35); transform: translateY(-2px); }
.op-stat-dark:hover::before { opacity: 1; }

.op-stat-light {
  background: #ffffff;
  border: 1px solid rgba(59,130,246,0.1);
  border-radius: 16px; padding: 20px 22px;
  box-shadow: 0 1px 4px rgba(15,33,82,0.04), 0 4px 16px rgba(59,130,246,0.05);
  transition: border-color .25s, box-shadow .25s, transform .25s;
  position: relative; overflow: hidden;
}
.op-stat-light::before {
  content: ''; position: absolute; inset: 0; opacity: 0;
  background: radial-gradient(circle at 30% 50%, rgba(59,130,246,0.04), transparent 70%);
  transition: opacity .3s;
}
.op-stat-light:hover { border-color: rgba(59,130,246,0.2); box-shadow: 0 8px 28px rgba(59,130,246,0.1); transform: translateY(-2px); }
.op-stat-light:hover::before { opacity: 1; }

/* ── Panel ── */
.op-panel-dark {
  background: rgba(10,15,32,0.88);
  border: 1px solid rgba(99,148,255,0.1);
  backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
  box-shadow: 0 8px 40px rgba(0,0,0,0.45);
  border-radius: 20px; overflow: hidden;
}
.op-panel-light {
  background: #ffffff;
  border: 1px solid rgba(59,130,246,0.09);
  box-shadow: 0 2px 8px rgba(15,33,82,0.04), 0 12px 40px rgba(59,130,246,0.06);
  border-radius: 20px; overflow: hidden;
}
.op-panel-hdr-dark  { border-bottom: 1px solid rgba(99,148,255,0.08); }
.op-panel-hdr-light { border-bottom: 1px solid rgba(59,130,246,0.07); }

/* ── Inputs ── */
.op-input-wrap { position: relative; }
.op-input-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; width: 15px; height: 15px; }

.op-input-dark {
  background: rgba(6,10,20,0.6); border: 1px solid rgba(99,148,255,0.12); border-radius: 11px;
  color: rgba(226,234,255,0.9); font-family: 'Plus Jakarta Sans',sans-serif; font-size: 13.5px;
  transition: border-color .2s, box-shadow .2s; outline: none; width: 100%; padding: 9.5px 12px 9.5px 38px;
}
.op-input-dark::placeholder { color: rgba(148,163,220,0.35); }
.op-input-dark:focus { border-color: rgba(96,165,250,0.4); box-shadow: 0 0 0 3px rgba(59,130,246,0.09); }

.op-input-light {
  background: #f8faff; border: 1px solid rgba(59,130,246,0.13); border-radius: 11px;
  color: #0f2152; font-family: 'Plus Jakarta Sans',sans-serif; font-size: 13.5px;
  transition: border-color .2s, box-shadow .2s; outline: none; width: 100%; padding: 9.5px 12px 9.5px 38px;
}
.op-input-light::placeholder { color: #b0c4dd; }
.op-input-light:focus { border-color: rgba(59,130,246,0.38); box-shadow: 0 0 0 3px rgba(59,130,246,0.07); }

.op-select-plain-dark {
  appearance: none; -webkit-appearance: none;
  background: rgba(6,10,20,0.6); border: 1px solid rgba(99,148,255,0.12); border-radius: 11px;
  color: rgba(226,234,255,0.9); font-family: 'Plus Jakarta Sans',sans-serif; font-size: 13.5px;
  padding: 9.5px 32px 9.5px 14px; outline: none; width: 100%;
  transition: border-color .2s, box-shadow .2s; cursor: pointer;
}
.op-select-plain-dark:focus { border-color: rgba(96,165,250,0.4); box-shadow: 0 0 0 3px rgba(59,130,246,0.09); }
.op-select-plain-dark option { background: #0d1a3a; }

.op-select-plain-light {
  appearance: none; -webkit-appearance: none;
  background: #f8faff; border: 1px solid rgba(59,130,246,0.13); border-radius: 11px;
  color: #0f2152; font-family: 'Plus Jakarta Sans',sans-serif; font-size: 13.5px;
  padding: 9.5px 32px 9.5px 14px; outline: none; width: 100%;
  transition: border-color .2s, box-shadow .2s; cursor: pointer;
}
.op-select-plain-light:focus { border-color: rgba(59,130,246,0.38); box-shadow: 0 0 0 3px rgba(59,130,246,0.07); }

/* ── Table ── */
.op-thead-dark  { background: rgba(6,10,20,0.5); }
.op-thead-light { background: #f8faff; }

.op-th-dark {
  color: rgba(148,163,220,0.55); font-size: 10.5px; font-weight: 700;
  letter-spacing: 0.1em; text-transform: uppercase; padding: 13px 18px;
  white-space: nowrap; user-select: none;
}
.op-th-light {
  color: #88a0c4; font-size: 10.5px; font-weight: 700;
  letter-spacing: 0.1em; text-transform: uppercase; padding: 13px 18px;
  white-space: nowrap; user-select: none;
}
.op-th-sort-dark  { cursor: pointer; transition: color .15s, background .15s; }
.op-th-sort-dark:hover  { color: #93c5fd; background: rgba(59,130,246,0.06); }
.op-th-sort-light { cursor: pointer; transition: color .15s, background .15s; }
.op-th-sort-light:hover { color: #2563eb; background: rgba(59,130,246,0.04); }

.op-td-dark  { color: rgba(179,197,245,0.82); font-size: 13px; padding: 13px 18px; border-bottom: 1px solid rgba(99,148,255,0.05); }
.op-td-light { color: #3d5a8a; font-size: 13px; padding: 13px 18px; border-bottom: 1px solid rgba(59,130,246,0.05); }
.op-td-name-dark  { color: rgba(226,234,255,0.92); font-weight: 600; }
.op-td-name-light { color: #0f2152; font-weight: 600; }
.op-tr-dark  { transition: background .15s; cursor: default; }
.op-tr-dark:hover  { background: rgba(59,130,246,0.05); }
.op-tr-light { transition: background .15s; cursor: default; }
.op-tr-light:hover { background: rgba(59,130,246,0.03); }

/* ── Card view ── */
.op-card-item-dark {
  background: rgba(10,16,36,0.82); border: 1px solid rgba(99,148,255,0.1);
  border-radius: 16px; padding: 18px; transition: all .22s;
}
.op-card-item-dark:hover { border-color: rgba(99,148,255,0.22); box-shadow: 0 10px 30px rgba(0,0,0,0.35); transform: translateY(-2px); }
.op-card-item-light {
  background: #ffffff; border: 1px solid rgba(59,130,246,0.09);
  border-radius: 16px; padding: 18px; transition: all .22s;
  box-shadow: 0 1px 4px rgba(15,33,82,0.04);
}
.op-card-item-light:hover { border-color: rgba(59,130,246,0.22); box-shadow: 0 10px 28px rgba(59,130,246,0.09); transform: translateY(-2px); }

/* ── Skeleton ── */
@keyframes opShimmer { 0%{opacity:.3} 50%{opacity:.7} 100%{opacity:.3} }
.op-sk-dark  { background: rgba(99,148,255,0.09); border-radius: 6px; animation: opShimmer 1.7s ease-in-out infinite; }
.op-sk-light { background: rgba(59,130,246,0.07); border-radius: 6px; animation: opShimmer 1.7s ease-in-out infinite; }

/* ── Entry animations ── */
@keyframes opIn       { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
@keyframes opFadeIn   { from{opacity:0} to{opacity:1} }
@keyframes opSlideUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
.op-animate         { animation: opIn .5s cubic-bezier(0.22,1,0.36,1) both; }
.op-animate-fade    { animation: opFadeIn .4s ease both; }
.op-animate-slide   { animation: opSlideUp .35s cubic-bezier(0.22,1,0.36,1) both; }

/* ── Buttons ── */
.op-btn-primary {
  background: linear-gradient(135deg, #1a4fd6, #3b82f6);
  color: white; border: none;
  padding: 9.5px 18px; border-radius: 11px; font-size: 13.5px; font-weight: 600;
  display: inline-flex; align-items: center; gap: 7px; cursor: pointer;
  box-shadow: 0 4px 16px rgba(37,99,235,0.38); transition: all .22s;
  font-family: 'Plus Jakarta Sans',sans-serif; letter-spacing: -0.1px;
}
.op-btn-primary:hover { background: linear-gradient(135deg,#2563eb,#60a5fa); box-shadow: 0 6px 24px rgba(37,99,235,0.52); transform: translateY(-1px); }
.op-btn-primary:active { transform: translateY(0); }

.op-btn-ghost-dark {
  background: rgba(255,255,255,0.04); border: 1px solid rgba(99,148,255,0.14); border-radius: 11px;
  color: rgba(148,163,220,0.75); padding: 9.5px 15px; font-size: 13.5px; font-weight: 500;
  display: inline-flex; align-items: center; gap: 6px; cursor: pointer; transition: all .2s;
  font-family: 'Plus Jakarta Sans',sans-serif; white-space: nowrap;
}
.op-btn-ghost-dark:hover { background: rgba(59,130,246,0.1); border-color: rgba(96,165,250,0.28); color: #93c5fd; }

.op-btn-ghost-light {
  background: #ffffff; border: 1px solid rgba(59,130,246,0.14); border-radius: 11px;
  color: #5878a8; padding: 9.5px 15px; font-size: 13.5px; font-weight: 500;
  display: inline-flex; align-items: center; gap: 6px; cursor: pointer; transition: all .2s;
  font-family: 'Plus Jakarta Sans',sans-serif; white-space: nowrap;
  box-shadow: 0 1px 3px rgba(15,33,82,0.06);
}
.op-btn-ghost-light:hover { background: #f0f6ff; border-color: rgba(59,130,246,0.28); color: #1d4ed8; }

.op-btn-icon-dark {
  background: rgba(255,255,255,0.04); border: 1px solid rgba(99,148,255,0.14); border-radius: 11px;
  color: rgba(148,163,220,0.65); padding: 9.5px 11px;
  display: inline-flex; align-items: center; cursor: pointer; transition: all .2s;
}
.op-btn-icon-dark.active { background: rgba(59,130,246,0.15); border-color: rgba(96,165,250,0.3); color: #93c5fd; }
.op-btn-icon-dark:hover  { background: rgba(59,130,246,0.1); border-color: rgba(96,165,250,0.25); color: #93c5fd; }

.op-btn-icon-light {
  background: #ffffff; border: 1px solid rgba(59,130,246,0.14); border-radius: 11px;
  color: #88a0c4; padding: 9.5px 11px;
  display: inline-flex; align-items: center; cursor: pointer; transition: all .2s;
  box-shadow: 0 1px 3px rgba(15,33,82,0.06);
}
.op-btn-icon-light.active { background: rgba(59,130,246,0.1); border-color: rgba(59,130,246,0.3); color: #1d4ed8; }
.op-btn-icon-light:hover  { background: #f0f6ff; border-color: rgba(59,130,246,0.25); color: #1d4ed8; }

.op-btn-detail-dark {
  background: rgba(59,130,246,0.13); border: 1px solid rgba(96,165,250,0.22);
  border-radius: 9px; color: #7eb8f8; padding: 6px 14px; font-size: 12.5px; font-weight: 600;
  cursor: pointer; transition: all .18s; font-family: 'Plus Jakarta Sans',sans-serif;
}
.op-btn-detail-dark:hover { background: rgba(59,130,246,0.24); border-color: rgba(96,165,250,0.42); color: #bcd9ff; box-shadow: 0 0 14px rgba(59,130,246,0.2); }

.op-btn-detail-light {
  background: rgba(59,130,246,0.07); border: 1px solid rgba(59,130,246,0.18);
  border-radius: 9px; color: #2563eb; padding: 6px 14px; font-size: 12.5px; font-weight: 600;
  cursor: pointer; transition: all .18s; font-family: 'Plus Jakarta Sans',sans-serif;
}
.op-btn-detail-light:hover { background: rgba(59,130,246,0.14); border-color: rgba(59,130,246,0.36); box-shadow: 0 0 12px rgba(59,130,246,0.12); }

/* ── Pagination ── */
.op-page-btn-dark {
  display: flex; align-items: center; gap: 5px; padding: 8px 14px; border-radius: 10px;
  border: 1px solid rgba(99,148,255,0.14); background: rgba(255,255,255,0.04);
  color: rgba(148,163,220,0.7); font-size: 13px; cursor: pointer; transition: all .2s;
  font-family: 'Plus Jakarta Sans',sans-serif;
}
.op-page-btn-dark:hover:not(:disabled) { background: rgba(59,130,246,0.1); border-color: rgba(96,165,250,0.28); color: #93c5fd; }
.op-page-btn-dark:disabled { opacity: .3; cursor: not-allowed; }

.op-page-btn-light {
  display: flex; align-items: center; gap: 5px; padding: 8px 14px; border-radius: 10px;
  border: 1px solid rgba(59,130,246,0.13); background: #ffffff;
  color: #5878a8; font-size: 13px; cursor: pointer; transition: all .2s;
  font-family: 'Plus Jakarta Sans',sans-serif;
  box-shadow: 0 1px 3px rgba(15,33,82,0.06);
}
.op-page-btn-light:hover:not(:disabled) { background: #f0f6ff; border-color: rgba(59,130,246,0.28); color: #1d4ed8; }
.op-page-btn-light:disabled { opacity: .3; cursor: not-allowed; }

.op-page-num-dark {
  min-width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center;
  font-size: 13px; border: 1px solid transparent; background: transparent; cursor: pointer; transition: all .18s;
  color: rgba(148,163,220,0.65); font-family: 'JetBrains Mono',monospace;
}
.op-page-num-dark:hover   { background: rgba(59,130,246,0.1); color: #93c5fd; border-color: rgba(96,165,250,0.2); }
.op-page-num-dark.active  { background: linear-gradient(135deg,#1a4fd6,#3b82f6); color: white; border-color: transparent; font-weight: 700; box-shadow: 0 3px 12px rgba(37,99,235,0.4); }

.op-page-num-light {
  min-width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center;
  font-size: 13px; border: 1px solid transparent; background: transparent; cursor: pointer; transition: all .18s;
  color: #6585aa; font-family: 'JetBrains Mono',monospace;
}
.op-page-num-light:hover  { background: #e8f0fe; color: #1d4ed8; border-color: rgba(59,130,246,0.18); }
.op-page-num-light.active { background: linear-gradient(135deg,#1a4fd6,#3b82f6); color: white; border-color: transparent; font-weight: 700; box-shadow: 0 3px 12px rgba(37,99,235,0.3); }

/* ── Animated accent line ── */
@keyframes accentFlow { 0%{background-position:0 0} 100%{background-position:200% 0} }
.op-accent {
  height: 3px;
  background: linear-gradient(90deg, transparent 0%, #1a4fd6 15%, #60a5fa 38%, #a78bfa 55%, #06b6d4 75%, transparent 100%);
  background-size: 200% 100%;
  animation: accentFlow 5s linear infinite;
}

/* ── Filter chips ── */
.op-filter-chip-dark {
  background: rgba(59,130,246,0.13); border: 1px solid rgba(96,165,250,0.28); color: #93c5fd;
  font-size: 11.5px; font-weight: 600; padding: 4px 10px 4px 12px; border-radius: 20px;
  display: inline-flex; align-items: center; gap: 6px;
}
.op-filter-chip-light {
  background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.2); color: #1d4ed8;
  font-size: 11.5px; font-weight: 600; padding: 4px 10px 4px 12px; border-radius: 20px;
  display: inline-flex; align-items: center; gap: 6px;
}
.op-chip-close {
  background: none; border: none; cursor: pointer; padding: 0; color: inherit;
  display: flex; align-items: center; line-height: 1; opacity: .7; font-size: 15px;
  transition: opacity .15s;
}
.op-chip-close:hover { opacity: 1; }

/* ── Progress bar (stat card) ── */
.op-progress-track-dark  { background: rgba(99,148,255,0.1); border-radius: 4px; height: 4px; margin-top: 12px; overflow: hidden; }
.op-progress-track-light { background: rgba(59,130,246,0.08); border-radius: 4px; height: 4px; margin-top: 12px; overflow: hidden; }
.op-progress-fill { height: 100%; border-radius: 4px; transition: width .6s cubic-bezier(0.22,1,0.36,1); }

/* ── Divider ── */
.op-divider-dark  { border: none; border-top: 1px solid rgba(99,148,255,0.07); margin: 0; }
.op-divider-light { border: none; border-top: 1px solid rgba(59,130,246,0.07); margin: 0; }

/* ── Row number mono ── */
.op-mono { font-family: 'JetBrains Mono', monospace; }

/* ── Refresh spin ── */
@keyframes opSpin { to { transform: rotate(360deg); } }
.op-spin { animation: opSpin .6s linear infinite; }
`;

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
════════════════════════════════════════════════════════════════ */
const STATUS_CONFIG = {
  "New Order":              { bg:"rgba(148,163,184,0.12)", border:"rgba(148,163,184,0.22)", color:"#94a3b8" },
  "Entry":                  { bg:"rgba(16,185,129,0.13)",  border:"rgba(16,185,129,0.28)",  color:"#34d399" },
  "Diproses - Lapangan":    { bg:"rgba(59,130,246,0.13)",  border:"rgba(59,130,246,0.28)",  color:"#60a5fa" },
  "Diproses - Sertifikat":  { bg:"rgba(139,92,246,0.13)",  border:"rgba(139,92,246,0.28)",  color:"#a78bfa" },
  "Penerbitan Proforma":    { bg:"rgba(6,182,212,0.13)",   border:"rgba(6,182,212,0.28)",   color:"#22d3ee" },
  "Closed Order":           { bg:"rgba(249,115,22,0.13)",  border:"rgba(249,115,22,0.28)",  color:"#fb923c" },
  "Invoice":                { bg:"rgba(245,158,11,0.13)",  border:"rgba(245,158,11,0.28)",  color:"#fbbf24" },
  "Selesai":                { bg:"rgba(20,184,166,0.13)",  border:"rgba(20,184,166,0.28)",  color:"#2dd4bf" },
};

const ALL_STATUSES = Object.keys(STATUS_CONFIG);
const PER_PAGE_OPTIONS = [10, 20, 50];

/* ═══════════════════════════════════════════════════════════════
   SUB COMPONENTS
════════════════════════════════════════════════════════════════ */
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { bg:"rgba(239,68,68,0.13)", border:"rgba(239,68,68,0.28)", color:"#f87171" };
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:5,
      padding:"3.5px 10px", borderRadius:20,
      fontSize:11.5, fontWeight:600,
      background:cfg.bg, border:`1px solid ${cfg.border}`, color:cfg.color,
      whiteSpace:"nowrap", letterSpacing:"0.01em",
    }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:cfg.color, flexShrink:0, boxShadow:`0 0 5px ${cfg.color}` }} />
      {status || "—"}
    </span>
  );
};

const KelengkapanBadge = ({ isComplete }) => (
  <span style={{
    display:"inline-flex", alignItems:"center", gap:5,
    padding:"3.5px 10px", borderRadius:20,
    fontSize:11.5, fontWeight:600, whiteSpace:"nowrap",
    background: isComplete ? "rgba(20,184,166,0.13)" : "rgba(239,68,68,0.1)",
    border: `1px solid ${isComplete ? "rgba(20,184,166,0.28)" : "rgba(239,68,68,0.22)"}`,
    color: isComplete ? "#2dd4bf" : "#f87171",
  }}>
    <span style={{
      width:5, height:5, borderRadius:"50%",
      background: isComplete ? "#2dd4bf" : "#f87171",
      flexShrink:0,
      boxShadow: isComplete ? "0 0 5px #2dd4bf" : "0 0 5px #f87171",
    }} />
    {isComplete ? "Lengkap" : "Tidak Lengkap"}
  </span>
);

const Sk = ({ w, h, d, style = {} }) => (
  <div className={`op-sk-${d?"dark":"light"}`} style={{ width:w, height:h, ...style }} />
);

const TableRowSkeleton = ({ d }) => (
  <tr>
    {[24,140,100,100,110,88,66].map((w,i) => (
      <td key={i} className={`op-td-${d?"dark":"light"}`}>
        <Sk w={w} h={i===2||i===5?20:13} d={d} style={{ ...(i===2||i===5?{borderRadius:20}:{}), animationDelay:`${i*60}ms` }} />
      </td>
    ))}
  </tr>
);

/* Sort icon */
const SortIcon = ({ field, sortKey, sortDir, color }) => {
  if (sortKey !== field) return <ChevronUpDownIcon style={{ width:13, height:13, opacity:.35 }} />;
  return sortDir === "asc"
    ? <ChevronUpIcon   style={{ width:13, height:13, color }} />
    : <ChevronDownIcon style={{ width:13, height:13, color }} />;
};

/* Stat card with progress bar & icon */
const StatCard = ({ label, value, total, color, colorRaw, d, icon: Icon }) => {
  const pct = total > 0 ? (value / total) * 100 : 0;
  const t = d ? "dark" : "light";
  return (
    <div className={`op-stat-${t}`}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:12 }}>
        <div style={{
          width:38, height:38, borderRadius:10,
          background: colorRaw ? `${colorRaw}18` : (d?"rgba(99,148,255,0.1)":"rgba(59,130,246,0.08)"),
          display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
        }}>
          {Icon && <Icon style={{ width:18, height:18, color: colorRaw || color }} />}
        </div>
        <span style={{
          fontSize:11, fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase",
          color: d?"rgba(148,163,220,0.45)":"#9ab0cc",
          textAlign:"right", lineHeight:1.3,
        }}>{label}</span>
      </div>
      <p style={{ fontSize:30, fontWeight:800, color, margin:0, fontFamily:"'JetBrains Mono',monospace", lineHeight:1, letterSpacing:"-1px" }}>
        {value}
      </p>
      {total !== undefined && (
        <>
          <div className={`op-progress-track-${t}`}>
            <div className="op-progress-fill" style={{ width:`${pct}%`, background: colorRaw || color }} />
          </div>
          <p style={{ fontSize:11, color:d?"rgba(148,163,220,0.35)":"#a0b8d8", margin:"5px 0 0", fontWeight:500 }}>
            {pct.toFixed(0)}% dari total
          </p>
        </>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════ */
const OrdersPage = () => {
  const { portofolio } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const d = isDark;
  const t = d ? "dark" : "light";

  // ── Data state ──
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // ── Filter / Search / Sort ──
  const [searchQuery,   setSearchQuery]   = useState("");
  const [filterStatus,  setFilterStatus]  = useState("");
  const [filterLengkap, setFilterLengkap] = useState("");
  const [sortKey,       setSortKey]       = useState("createdAt");
  const [sortDir,       setSortDir]       = useState("desc");

  // ── Pagination ──
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage,     setPerPage]     = useState(10);

  // ── View mode ──
  const [viewMode, setViewMode] = useState("table");

  const userData  = JSON.parse(localStorage.getItem("user")) || {};
  const userPeran = userData.peran || "";
  const userBidang= userData.bidang || "";

  // ── Search debounce ──
  const searchTimer = useRef(null);
  const [searchDebounced, setSearchDebounced] = useState("");

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setSearchDebounced(val);
      setCurrentPage(1);
    }, 350);
  };

  // ── Access guard ──
  useEffect(() => {
    if (!userPeran) { alert("Anda tidak memiliki akses!"); navigate("/"); return; }
    if (userPeran === "admin portofolio" && userBidang !== portofolio) {
      alert("Anda tidak memiliki akses!"); navigate("/"); return;
    }
  }, [userPeran, userBidang, portofolio]);

  useEffect(() => { fetchOrders(); }, [portofolio]);

  const fetchOrders = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setFetchError(null);
    try {
      const snap = await getDocs(
        query(
          collection(db, "orders"),
          where("portofolio", "==", portofolio),
          orderBy("createdAt", "desc")
        )
      );
      setAllOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error fetching orders:", err);
      setFetchError("Gagal memuat data. Coba refresh halaman.");
    }
    setLoading(false);
    setRefreshing(false);
  };

  // ── Required fields per role ──
  const REQUIRED_FIELDS = {
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
    "koordinator": [
      "pelanggan","statusOrder","tanggalStatusOrder","tanggalSerahOrderKeCs","tanggalPekerjaan",
      "proformaSerahKeOps","proformaSerahKeDukbis","jenisSertifikat","noSiSpk","jenisPekerjaan",
      "namaTongkang","lokasiPekerjaan","estimasiTonase","tonaseDS","nilaiProforma",
      "distribusiSertifikatPengirim","distribusiSertifikatPengirimTanggal",
      "distribusiSertifikatPenerima","distribusiSertifikatPenerimaTanggal",
    ],
  };

  const isComplete = useCallback((order) => {
    const fields = REQUIRED_FIELDS[userPeran] || [];
    return fields.every(f => order[f] != null && order[f] !== "");
  }, [userPeran]);

  const processedOrders = useMemo(() => {
    let list = [...allOrders];
    if (searchDebounced.trim()) {
      const q = searchDebounced.toLowerCase();
      list = list.filter(o =>
        o.pelanggan?.toLowerCase().includes(q) ||
        o.nomorOrder?.toLowerCase().includes(q) ||
        o.jenisPekerjaan?.toLowerCase().includes(q)
      );
    }
    if (filterStatus)               list = list.filter(o => o.statusOrder === filterStatus);
    if (filterLengkap === "lengkap") list = list.filter(o => isComplete(o));
    if (filterLengkap === "tidak")   list = list.filter(o => !isComplete(o));
    list.sort((a, b) => {
      let valA = a[sortKey], valB = b[sortKey];
      if (valA?.seconds != null) valA = valA.seconds;
      if (valB?.seconds != null) valB = valB.seconds;
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();
      if (valA == null && valB == null) return 0;
      if (valA == null) return 1;
      if (valB == null) return -1;
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ?  1 : -1;
      return 0;
    });
    return list;
  }, [allOrders, searchDebounced, filterStatus, filterLengkap, sortKey, sortDir, isComplete]);

  const stats = useMemo(() => {
    const total    = allOrders.length;
    const selesai  = allOrders.filter(o => o.statusOrder === "Selesai").length;
    const lengkap  = allOrders.filter(o => isComplete(o)).length;
    const berjalan = allOrders.filter(o => o.statusOrder && o.statusOrder !== "Selesai").length;
    return { total, selesai, lengkap, berjalan };
  }, [allOrders, isComplete]);

  const totalPages = Math.max(1, Math.ceil(processedOrders.length / perPage));
  const safePage   = Math.min(currentPage, totalPages);
  const pageOrders = processedOrders.slice((safePage - 1) * perPage, safePage * perPage);
  const startNum   = (safePage - 1) * perPage + 1;

  useEffect(() => { setCurrentPage(1); }, [searchDebounced, filterStatus, filterLengkap, sortKey, sortDir, perPage]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(prev => prev === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const handleReset = () => {
    setSearchQuery(""); setSearchDebounced("");
    setFilterStatus(""); setFilterLengkap("");
    setSortKey("createdAt"); setSortDir("desc");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchDebounced || filterStatus || filterLengkap;

  const formatDate = (ts) => {
    if (!ts?.seconds) return "—";
    try {
      return new Date(ts.seconds * 1000).toLocaleDateString("id-ID", { day:"2-digit", month:"short", year:"numeric" });
    } catch { return "—"; }
  };

  const pageNumbers = useMemo(() => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push("…");
      for (let i = Math.max(2, safePage-1); i <= Math.min(totalPages-1, safePage+1); i++) pages.push(i);
      if (safePage < totalPages - 2) pages.push("…");
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, safePage]);

  const iconColor = d ? "rgba(148,163,220,0.45)" : "#b0c4dc";
  const sortIconColor = d ? "#93c5fd" : "#2563eb";

  const COLUMNS = [
    { key: null,           label: "#",              sortable: false },
    { key: "pelanggan",    label: "Nama Pelanggan",  sortable: true  },
    { key: "statusOrder",  label: "Status",          sortable: true  },
    { key: "nomorOrder",   label: "No. Order",       sortable: true  },
    { key: "tanggalOrder", label: "Tanggal",         sortable: true  },
    { key: "kelengkapan",  label: "Kelengkapan",     sortable: false },
    { key: null,           label: "Aksi",            sortable: false },
  ];

  /* ── RENDER ── */
  return (
    <>
      <style>{STYLES}</style>
      <div className={`op-root op-bg-${t}`} style={{ padding:"32px 28px 64px", transition:"background .4s" }}>
        <div style={{ maxWidth:1320, margin:"0 auto" }}>

          {/* ════════════════════════════
              PAGE HEADER
          ════════════════════════════ */}
          <div className="op-animate" style={{
            display:"flex", alignItems:"flex-start", justifyContent:"space-between",
            marginBottom:28, gap:16, flexWrap:"wrap",
          }}>
            {/* Left: Title */}
            <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
              <div style={{
                width:46, height:46, borderRadius:13, flexShrink:0,
                background: d
                  ? "linear-gradient(135deg,rgba(29,78,216,0.3),rgba(59,130,246,0.2))"
                  : "linear-gradient(135deg,rgba(29,78,216,0.12),rgba(59,130,246,0.08))",
                border:`1px solid ${d?"rgba(59,130,246,0.25)":"rgba(59,130,246,0.18)"}`,
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>
                <ClipboardDocumentListIcon style={{ width:22, height:22, color:"#3b82f6" }} />
              </div>
              <div>
                <h2 className={`op-title-${t}`} style={{
                  fontSize:22, fontWeight:800, margin:0, letterSpacing:"-0.5px", lineHeight:1.2,
                }}>
                  Daftar Order
                  <span style={{
                    marginLeft:10, fontSize:14, fontWeight:700, letterSpacing:"0.08em",
                    color: d?"#3b82f6":"#2563eb",
                    background: d?"rgba(59,130,246,0.12)":"rgba(59,130,246,0.08)",
                    border:`1px solid ${d?"rgba(59,130,246,0.25)":"rgba(59,130,246,0.18)"}`,
                    padding:"2px 10px", borderRadius:8, verticalAlign:"middle",
                  }}>
                    {portofolio?.toUpperCase()}
                  </span>
                </h2>
                <p className={`op-sub-${t}`} style={{ fontSize:13, margin:"5px 0 0", fontWeight:400 }}>
                  {loading
                    ? "Memuat data…"
                    : <>
                        <span style={{ fontWeight:600, color:d?"#93c5fd":"#2563eb" }}>{processedOrders.length}</span>
                        {" "}dari{" "}
                        <span style={{ fontWeight:600, color:d?"#e2eaff":"#0f2152" }}>{allOrders.length}</span>
                        {" "}order ditampilkan
                        {hasActiveFilters && (
                          <span style={{
                            marginLeft:8, fontSize:11, fontWeight:700, letterSpacing:"0.06em",
                            color:d?"#fbbf24":"#d97706",
                            background:d?"rgba(251,191,36,0.1)":"rgba(217,119,6,0.07)",
                            border:`1px solid ${d?"rgba(251,191,36,0.2)":"rgba(217,119,6,0.15)"}`,
                            padding:"2px 8px", borderRadius:6,
                          }}>FILTER AKTIF</span>
                        )}
                      </>
                  }
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              {/* View toggle */}
              <div style={{
                display:"flex", gap:2, padding:3,
                background:d?"rgba(6,10,20,0.5)":"#f0f4fb",
                border:`1px solid ${d?"rgba(99,148,255,0.1)":"rgba(59,130,246,0.1)"}`,
                borderRadius:12,
              }}>
                <button
                  onClick={() => setViewMode("table")}
                  title="Tampilan Tabel"
                  style={{
                    padding:"7px 10px", borderRadius:9, border:"none", cursor:"pointer",
                    background: viewMode==="table" ? (d?"rgba(59,130,246,0.18)":"#fff") : "transparent",
                    color: viewMode==="table" ? (d?"#93c5fd":"#2563eb") : iconColor,
                    boxShadow: viewMode==="table" ? (d?"none":"0 1px 4px rgba(15,33,82,0.1)") : "none",
                    display:"flex", alignItems:"center", transition:"all .18s",
                  }}
                >
                  <ListBulletIcon style={{ width:16, height:16 }} />
                </button>
                <button
                  onClick={() => setViewMode("card")}
                  title="Tampilan Kartu"
                  style={{
                    padding:"7px 10px", borderRadius:9, border:"none", cursor:"pointer",
                    background: viewMode==="card" ? (d?"rgba(59,130,246,0.18)":"#fff") : "transparent",
                    color: viewMode==="card" ? (d?"#93c5fd":"#2563eb") : iconColor,
                    boxShadow: viewMode==="card" ? (d?"none":"0 1px 4px rgba(15,33,82,0.1)") : "none",
                    display:"flex", alignItems:"center", transition:"all .18s",
                  }}
                >
                  <Squares2X2Icon style={{ width:16, height:16 }} />
                </button>
              </div>

              {/* Refresh */}
              <button
                className={`op-btn-ghost-${t}`}
                onClick={() => fetchOrders(true)}
                title="Refresh data"
              >
                <ArrowPathIcon style={{ width:15, height:15, ...(refreshing?{animation:"opSpin .6s linear infinite"}:{}) }} />
                Refresh
              </button>

              {/* Add order */}
              {userPeran === "admin portofolio" && (
                <button className="op-btn-primary" onClick={() => navigate(`/orders/${portofolio}/create`)}>
                  <PlusIcon style={{ width:15, height:15 }} />
                  Tambah Order
                </button>
              )}
            </div>
          </div>

          {/* ════════════════════════════
              STAT CARDS
          ════════════════════════════ */}
          {!loading && (
            <div className="op-animate" style={{
              display:"grid",
              gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))",
              gap:14, marginBottom:24,
              animationDelay:"50ms",
            }}>
              <StatCard
                label="Total Order"
                value={stats.total}
                color={d?"#e2eaff":"#0f2152"}
                colorRaw={d?"#93c5fd":"#2563eb"}
                d={d}
                icon={InboxStackIcon}
              />
              <StatCard
                label="Sedang Berjalan"
                value={stats.berjalan}
                total={stats.total}
                color="#60a5fa"
                colorRaw="#3b82f6"
                d={d}
                icon={ClockIcon}
              />
              <StatCard
                label="Selesai"
                value={stats.selesai}
                total={stats.total}
                color="#2dd4bf"
                colorRaw="#14b8a6"
                d={d}
                icon={CheckCircleIcon}
              />
              <StatCard
                label="Data Lengkap"
                value={stats.lengkap}
                total={stats.total}
                color="#34d399"
                colorRaw="#10b981"
                d={d}
                icon={DocumentCheckIcon}
              />
            </div>
          )}

          {/* ════════════════════════════
              MAIN PANEL
          ════════════════════════════ */}
          <div className={`op-panel-${t} op-animate`} style={{ animationDelay:"90ms" }}>

            {/* Top accent */}
            <div className="op-accent" />

            {/* ── TOOLBAR ── */}
            <div className={`op-panel-hdr-${t}`} style={{ padding:"16px 20px 14px" }}>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>

                {/* Search */}
                <div className="op-input-wrap" style={{ flex:"1 1 240px" }}>
                  <MagnifyingGlassIcon className="op-input-icon" style={{ color:iconColor }} />
                  <input
                    type="text"
                    placeholder="Cari pelanggan, nomor order, jenis pekerjaan…"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className={`op-input-${t}`}
                  />
                </div>

                {/* Filter: Status */}
                <div className="op-input-wrap" style={{ flex:"0 1 200px", position:"relative" }}>
                  <FunnelIcon className="op-input-icon" style={{ color:iconColor }} />
                  <select
                    value={filterStatus}
                    onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                    className={`op-select-plain-${t}`}
                    style={{ paddingLeft:36 }}
                  >
                    <option value="">Semua Status</option>
                    {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronUpDownIcon style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", width:14, height:14, color:iconColor, pointerEvents:"none" }} />
                </div>

                {/* Filter: Kelengkapan */}
                <div className="op-input-wrap" style={{ flex:"0 1 180px", position:"relative" }}>
                  <select
                    value={filterLengkap}
                    onChange={e => { setFilterLengkap(e.target.value); setCurrentPage(1); }}
                    className={`op-select-plain-${t}`}
                    style={{ paddingLeft:14 }}
                  >
                    <option value="">Semua Kelengkapan</option>
                    <option value="lengkap">✓ Lengkap</option>
                    <option value="tidak">✗ Tidak Lengkap</option>
                  </select>
                  <ChevronUpDownIcon style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", width:14, height:14, color:iconColor, pointerEvents:"none" }} />
                </div>

                {/* Per page */}
                <div className="op-input-wrap" style={{ flex:"0 0 auto", position:"relative" }}>
                  <select
                    value={perPage}
                    onChange={e => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    className={`op-select-plain-${t}`}
                    style={{ paddingLeft:14, width:96 }}
                  >
                    {PER_PAGE_OPTIONS.map(n => <option key={n} value={n}>{n} / hal</option>)}
                  </select>
                  <ChevronUpDownIcon style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", width:14, height:14, color:iconColor, pointerEvents:"none" }} />
                </div>

                {/* Reset */}
                {hasActiveFilters && (
                  <button className={`op-btn-ghost-${t}`} onClick={handleReset}>
                    <ArrowPathIcon style={{ width:13, height:13 }} /> Reset
                  </button>
                )}
              </div>

              {/* Active filter chips */}
              {hasActiveFilters && (
                <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:10 }}>
                  {searchDebounced && (
                    <span className={`op-filter-chip-${t}`}>
                      Cari: "{searchDebounced}"
                      <button className="op-chip-close"
                        onClick={() => { setSearchQuery(""); setSearchDebounced(""); }}>×</button>
                    </span>
                  )}
                  {filterStatus && (
                    <span className={`op-filter-chip-${t}`}>
                      Status: {filterStatus}
                      <button className="op-chip-close" onClick={() => setFilterStatus("")}>×</button>
                    </span>
                  )}
                  {filterLengkap && (
                    <span className={`op-filter-chip-${t}`}>
                      {filterLengkap === "lengkap" ? "Lengkap" : "Tidak Lengkap"}
                      <button className="op-chip-close" onClick={() => setFilterLengkap("")}>×</button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Error banner */}
            {fetchError && (
              <div style={{
                padding:"12px 20px",
                background:"rgba(239,68,68,0.1)",
                borderBottom:`1px solid rgba(239,68,68,0.18)`,
                color:"#f87171", fontSize:13,
                display:"flex", alignItems:"center", gap:10,
              }}>
                <span style={{ fontSize:16 }}>⚠️</span>
                {fetchError}
                <button
                  onClick={() => fetchOrders()}
                  style={{ marginLeft:4, color:d?"#60a5fa":"#2563eb", background:"none", border:"none", cursor:"pointer", textDecoration:"underline", fontSize:13, padding:0 }}
                >
                  Coba lagi
                </button>
              </div>
            )}

            {/* ════════════════════════
                TABLE VIEW
            ════════════════════════ */}
            {viewMode === "table" && (
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", minWidth:760 }}>
                  <thead className={`op-thead-${t}`}>
                    <tr>
                      {COLUMNS.map((col, ci) => (
                        <th
                          key={ci}
                          className={`op-th-${t}${col.sortable ? ` op-th-sort-${t}` : ""}`}
                          style={{ textAlign:"left" }}
                          onClick={col.sortable ? () => handleSort(col.key) : undefined}
                        >
                          <span style={{ display:"inline-flex", alignItems:"center", gap:5 }}>
                            {col.label}
                            {col.sortable && (
                              <SortIcon field={col.key} sortKey={sortKey} sortDir={sortDir} color={sortIconColor} />
                            )}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      [...Array(7)].map((_,i) => <TableRowSkeleton key={i} d={d} />)
                    ) : pageOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7}>
                          <div style={{ textAlign:"center", padding:"64px 16px" }}>
                            <div style={{
                              width:60, height:60, borderRadius:"50%", margin:"0 auto 16px",
                              background:d?"rgba(99,148,255,0.07)":"rgba(59,130,246,0.05)",
                              display:"flex", alignItems:"center", justifyContent:"center",
                              border:`1px dashed ${d?"rgba(99,148,255,0.18)":"rgba(59,130,246,0.14)"}`,
                            }}>
                              <DocumentTextIcon style={{ width:26, height:26, color:d?"rgba(148,163,220,0.35)":"#b0c4dc" }} />
                            </div>
                            <p className={`op-title-${t}`} style={{ fontSize:15, fontWeight:700, margin:"0 0 6px" }}>
                              {hasActiveFilters ? "Tidak ada hasil yang cocok" : "Belum ada data order"}
                            </p>
                            <p className={`op-sub-${t}`} style={{ fontSize:13, margin:0 }}>
                              {hasActiveFilters ? "Coba ubah atau hapus filter yang aktif" : "Belum ada order untuk portofolio ini"}
                            </p>
                            {hasActiveFilters && (
                              <button className={`op-btn-ghost-${t}`} onClick={handleReset} style={{ margin:"18px auto 0", display:"inline-flex" }}>
                                <ArrowPathIcon style={{ width:13, height:13 }} /> Hapus Filter
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      pageOrders.map((order, idx) => {
                        const complete = isComplete(order);
                        return (
                          <tr key={order.id} className={`op-tr-${t}`}>
                            <td className={`op-td-${t}`} style={{ paddingLeft:22, width:48 }}>
                              <span className="op-mono" style={{ fontSize:11.5, opacity:.35, fontWeight:500 }}>
                                {String(startNum + idx).padStart(2,"0")}
                              </span>
                            </td>
                            <td className={`op-td-${t} op-td-name-${t}`} style={{ whiteSpace:"nowrap" }}>
                              {order.pelanggan || "—"}
                            </td>
                            <td className={`op-td-${t}`}>
                              <StatusBadge status={order.statusOrder} />
                            </td>
                            <td className={`op-td-${t}`}>
                              <span className="op-mono" style={{ fontSize:12, color:d?"rgba(179,197,245,0.7)":"#5878a8", fontWeight:500 }}>
                                {order.nomorOrder || "—"}
                              </span>
                            </td>
                            <td className={`op-td-${t}`}>
                              <span className="op-mono" style={{ fontSize:12, color:d?"rgba(179,197,245,0.7)":"#5878a8" }}>
                                {formatDate(order.tanggalOrder)}
                              </span>
                            </td>
                            <td className={`op-td-${t}`}>
                              <KelengkapanBadge isComplete={complete} />
                            </td>
                            <td className={`op-td-${t}`} style={{ whiteSpace:"nowrap" }}>
                              <button
                                className={`op-btn-detail-${t}`}
                                onClick={() => navigate(`/orders/${portofolio}/detail/${order.id}`)}
                              >
                                Detail →
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* ════════════════════════
                CARD VIEW
            ════════════════════════ */}
            {viewMode === "card" && (
              <div style={{ padding:"20px 20px 16px" }}>
                {loading ? (
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))", gap:14 }}>
                    {[...Array(6)].map((_,i) => (
                      <div key={i} className={`op-card-item-${t}`}>
                        <Sk w="55%" h={13} d={d} style={{ marginBottom:12 }} />
                        <Sk w="42%" h={22} d={d} style={{ borderRadius:20, marginBottom:12 }} />
                        <Sk w="65%" h={12} d={d} />
                      </div>
                    ))}
                  </div>
                ) : pageOrders.length === 0 ? (
                  <div style={{ textAlign:"center", padding:"48px 16px" }}>
                    <p className={`op-sub-${t}`} style={{ fontSize:14 }}>Tidak ada data yang cocok.</p>
                    {hasActiveFilters && (
                      <button className={`op-btn-ghost-${t}`} onClick={handleReset} style={{ marginTop:12, display:"inline-flex" }}>
                        <ArrowPathIcon style={{ width:13, height:13 }} /> Hapus Filter
                      </button>
                    )}
                  </div>
                ) : (
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))", gap:14 }}>
                    {pageOrders.map((order, idx) => {
                      const complete = isComplete(order);
                      return (
                        <div key={order.id}
                          className={`op-card-item-${t}`}
                          onClick={() => navigate(`/orders/${portofolio}/detail/${order.id}`)}
                          style={{ cursor:"pointer" }}
                        >
                          {/* Card top: number + kelengkapan */}
                          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                            <span className="op-mono" style={{ fontSize:11, opacity:.35, color:d?"#e2eaff":"#0f2152", fontWeight:500 }}>
                              #{String(startNum + idx).padStart(3,"0")}
                            </span>
                            <KelengkapanBadge isComplete={complete} />
                          </div>

                          {/* Customer name */}
                          <p className={`op-td-name-${t}`} style={{
                            fontSize:14.5, fontWeight:700, margin:"0 0 8px",
                            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                          }}>
                            {order.pelanggan || "—"}
                          </p>

                          {/* Status badge */}
                          <div style={{ marginBottom:14 }}>
                            <StatusBadge status={order.statusOrder} />
                          </div>

                          {/* Divider */}
                          <hr className={`op-divider-${t}`} style={{ marginBottom:12 }} />

                          {/* Footer details */}
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
                            <div>
                              <p className={`op-sub-${t}`} style={{ fontSize:10.5, margin:"0 0 3px", fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase" }}>No. Order</p>
                              <p className="op-mono" style={{ fontSize:12, color:d?"rgba(179,197,245,0.8)":"#3d5a8a", margin:0, fontWeight:500 }}>
                                {order.nomorOrder || "—"}
                              </p>
                            </div>
                            <div style={{ textAlign:"right" }}>
                              <p className={`op-sub-${t}`} style={{ fontSize:10.5, margin:"0 0 3px", fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase" }}>Tanggal</p>
                              <p className="op-mono" style={{ fontSize:12, color:d?"rgba(179,197,245,0.8)":"#3d5a8a", margin:0 }}>
                                {formatDate(order.tanggalOrder)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ════════════════════════
                PAGINATION
            ════════════════════════ */}
            {!loading && processedOrders.length > 0 && (
              <div style={{
                padding:"14px 20px",
                display:"flex", alignItems:"center", justifyContent:"space-between",
                gap:12, flexWrap:"wrap",
                borderTop:`1px solid ${d?"rgba(99,148,255,0.07)":"rgba(59,130,246,0.06)"}`,
                background: d?"rgba(6,10,20,0.3)":"rgba(248,250,255,0.7)",
              }}>
                {/* Left: range info */}
                <p className={`op-sub-${t}`} style={{ fontSize:12.5, margin:0 }}>
                  Menampilkan{" "}
                  <span style={{ fontWeight:700, color:d?"#93c5fd":"#2563eb" }}>
                    {startNum}–{Math.min(safePage * perPage, processedOrders.length)}
                  </span>
                  {" "}dari{" "}
                  <span style={{ fontWeight:700, color:d?"#e2eaff":"#0f2152" }}>{processedOrders.length}</span>
                  {" "}order
                </p>

                {/* Center: page numbers */}
                <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                  <button className={`op-page-btn-${t}`} onClick={() => setCurrentPage(p => Math.max(1,p-1))} disabled={safePage===1}>
                    <ChevronLeftIcon style={{ width:14, height:14 }} />
                  </button>

                  {pageNumbers.map((p, i) =>
                    p === "…" ? (
                      <span key={`dots-${i}`} className={`op-sub-${t}`} style={{ padding:"0 4px", fontSize:13 }}>…</span>
                    ) : (
                      <button
                        key={p}
                        className={`op-page-num-${t}${safePage===p?" active":""}`}
                        onClick={() => setCurrentPage(p)}
                      >{p}</button>
                    )
                  )}

                  <button className={`op-page-btn-${t}`} onClick={() => setCurrentPage(p => Math.min(totalPages,p+1))} disabled={safePage===totalPages}>
                    <ChevronRightIcon style={{ width:14, height:14 }} />
                  </button>
                </div>

                {/* Right: page info */}
                <p className={`op-sub-${t}`} style={{ fontSize:12.5, margin:0 }}>
                  Hal{" "}
                  <span className="op-mono" style={{ fontWeight:700, color:d?"#93c5fd":"#2563eb" }}>
                    {safePage}/{totalPages}
                  </span>
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default OrdersPage;