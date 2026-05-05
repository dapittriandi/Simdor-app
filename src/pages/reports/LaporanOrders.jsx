import { useState, useEffect, useMemo, useRef } from "react";
import { db } from "../../services/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { exportToExcel } from "../../utils/exportToExcel";
import {
  FileText, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Search, X, Download, RefreshCw, SlidersHorizontal,
  TrendingUp, Package, CheckCircle2, Clock, Filter,
  LayoutList, Table2, ChevronDown, AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../components/layout/ThemeContext";

/* ═══════════════════════════════════════════
   STYLES
═══════════════════════════════════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&display=swap');

.lp-root * { box-sizing: border-box; }
.lp-root { font-family: 'DM Sans', sans-serif; }

@keyframes lp-fade-up {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.lp-mounted { animation: lp-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) forwards; }

/* ── MAIN CARD ── */
.lp-card-dark  {
  background: rgba(10,16,35,0.75);
  border: 1px solid rgba(99,148,255,0.13);
  border-radius: 18px;
  backdrop-filter: blur(16px);
  box-shadow: 0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.02);
}
.lp-card-light {
  background: rgba(255,255,255,0.92);
  border: 1px solid rgba(59,130,246,0.13);
  border-radius: 18px;
  backdrop-filter: blur(16px);
  box-shadow: 0 8px 32px rgba(59,130,246,0.08), 0 0 0 1px rgba(255,255,255,0.9);
}

/* gradient top line */
.lp-topbar {
  height: 3px;
  border-radius: 18px 18px 0 0;
  background: linear-gradient(90deg, #1d4ed8 0%, #60a5fa 40%, #a78bfa 70%, #3b82f6 100%);
  background-size: 200% 100%;
  animation: lp-flow 4s linear infinite;
}
@keyframes lp-flow { 0%{background-position:0 0} 100%{background-position:200% 0} }

/* ── STAT CARDS ── */
.lp-stat-dark {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(99,148,255,0.12);
  border-radius: 14px; padding: 15px 16px;
  transition: all .22s ease; cursor: default;
}
.lp-stat-dark:hover { background: rgba(59,130,246,0.08); border-color: rgba(96,165,250,0.25); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(59,130,246,0.1); }
.lp-stat-light {
  background: white;
  border: 1px solid rgba(59,130,246,0.12);
  border-radius: 14px; padding: 15px 16px;
  box-shadow: 0 2px 8px rgba(59,130,246,0.06);
  transition: all .22s ease; cursor: default;
}
.lp-stat-light:hover { border-color: rgba(59,130,246,0.28); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(59,130,246,0.1); }

/* Icon wrap in stat */
.lp-stat-icon { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

/* ── FILTER SECTION ── */
.lp-filter-dark  { background: rgba(255,255,255,0.03); border: 1px solid rgba(99,148,255,0.1); border-radius: 14px; padding: 16px 18px; }
.lp-filter-light { background: rgba(239,246,255,0.65); border: 1px solid rgba(59,130,246,0.13); border-radius: 14px; padding: 16px 18px; }

/* ── INPUTS ── */
.lp-input {
  display: block; width: 100%;
  padding: 8px 12px; border-radius: 10px;
  font-size: 13px; font-family: 'DM Sans', sans-serif;
  outline: none; transition: all .2s ease;
}
.lp-input-dark {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(99,148,255,0.2);
  color: #e2e8f5;
}
.lp-input-dark::placeholder { color: rgba(99,148,255,0.35); }
.lp-input-dark:focus { border-color: rgba(96,165,250,0.5); box-shadow: 0 0 0 3px rgba(59,130,246,0.13); background: rgba(255,255,255,0.07); }
.lp-input-dark option { background: #0d1526; color: #e2e8f5; }
.lp-input-light {
  background: white;
  border: 1px solid rgba(59,130,246,0.18);
  color: #1e3a5f;
  box-shadow: 0 1px 3px rgba(59,130,246,0.05);
}
.lp-input-light::placeholder { color: rgba(37,99,235,0.32); }
.lp-input-light:focus { border-color: rgba(37,99,235,0.45); box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }

.lp-search-icon-wrap { position: relative; }
.lp-search-icon-wrap .lp-si { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); pointer-events: none; }
.lp-search-icon-wrap input { padding-left: 34px !important; }
.lp-search-clear { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; padding: 2px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: color .15s; }

/* ── LABELS ── */
.lp-label-dark  { font-size: 11px; font-weight: 500; color: rgba(148,163,220,0.65); display: block; margin-bottom: 5px; letter-spacing: .02em; }
.lp-label-light { font-size: 11px; font-weight: 500; color: #4b6ea8; display: block; margin-bottom: 5px; letter-spacing: .02em; }

/* ── BUTTONS ── */
.lp-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 14px; border-radius: 10px; font-size: 13px;
  font-weight: 500; font-family: 'DM Sans', sans-serif;
  border: none; cursor: pointer; transition: all .2s ease; white-space: nowrap;
}
.lp-btn:active { transform: scale(0.97); }
.lp-btn:disabled { opacity: .4; cursor: not-allowed; transform: none !important; }

.lp-btn-primary {
  background: linear-gradient(135deg,#1d4ed8,#3b82f6);
  color: white;
  box-shadow: 0 0 14px rgba(59,130,246,0.28);
}
.lp-btn-primary:hover:not(:disabled) { background: linear-gradient(135deg,#1e40af,#2563eb); box-shadow: 0 0 22px rgba(59,130,246,0.42); transform: translateY(-1px); }

.lp-btn-ghost-dark  { background: rgba(255,255,255,0.05); border: 1px solid rgba(99,148,255,0.18) !important; color: rgba(148,163,220,0.8); }
.lp-btn-ghost-dark:hover:not(:disabled)  { background: rgba(59,130,246,0.1); border-color: rgba(96,165,250,0.32) !important; color: #93c5fd; }
.lp-btn-ghost-light { background: white; border: 1px solid rgba(59,130,246,0.18) !important; color: #4b6ea8; box-shadow: 0 1px 4px rgba(59,130,246,0.06); }
.lp-btn-ghost-light:hover:not(:disabled) { background: rgba(219,234,254,0.5); border-color: rgba(59,130,246,0.32) !important; color: #1d4ed8; }

.lp-btn-export {
  background: linear-gradient(135deg,#065f46,#059669);
  color: white;
  box-shadow: 0 0 12px rgba(5,150,105,0.25);
}
.lp-btn-export:hover:not(:disabled) { background: linear-gradient(135deg,#064e3b,#047857); box-shadow: 0 0 20px rgba(5,150,105,0.4); transform: translateY(-1px); }

/* ── STATUS BADGES ── */
.lp-badge { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 600; letter-spacing: .01em; white-space: nowrap; }
/* dark */
.lp-b-new        { background: rgba(99,148,255,0.12); color: #93c5fd; border: 1px solid rgba(99,148,255,0.22); }
.lp-b-entry      { background: rgba(16,185,129,0.12); color: #34d399; border: 1px solid rgba(16,185,129,0.22); }
.lp-b-lapangan   { background: rgba(59,130,246,0.12); color: #60a5fa; border: 1px solid rgba(59,130,246,0.22); }
.lp-b-sertifikat { background: rgba(168,85,247,0.12); color: #c084fc; border: 1px solid rgba(168,85,247,0.22); }
.lp-b-closed     { background: rgba(251,146,60,0.12); color: #fb923c; border: 1px solid rgba(251,146,60,0.22); }
.lp-b-proforma   { background: rgba(250,204,21,0.12); color: #fbbf24; border: 1px solid rgba(250,204,21,0.22); }
.lp-b-invoice    { background: rgba(234,179,8,0.12);  color: #facc15; border: 1px solid rgba(234,179,8,0.22); }
.lp-b-selesai    { background: rgba(16,185,129,0.18); color: #10b981; border: 1px solid rgba(16,185,129,0.32); }
.lp-b-default    { background: rgba(148,163,220,0.1); color: rgba(148,163,220,0.75); border: 1px solid rgba(148,163,220,0.2); }
/* light override */
.lp-light .lp-b-new        { background: rgba(219,234,254,0.7); color: #1d4ed8; border-color: rgba(59,130,246,0.2); }
.lp-light .lp-b-entry      { background: rgba(209,250,229,0.7); color: #065f46; border-color: rgba(16,185,129,0.2); }
.lp-light .lp-b-lapangan   { background: rgba(219,234,254,0.7); color: #1d4ed8; border-color: rgba(59,130,246,0.2); }
.lp-light .lp-b-sertifikat { background: rgba(237,233,254,0.7); color: #5b21b6; border-color: rgba(124,58,237,0.2); }
.lp-light .lp-b-closed     { background: rgba(255,237,213,0.7); color: #92400e; border-color: rgba(245,158,11,0.2); }
.lp-light .lp-b-proforma   { background: rgba(254,249,195,0.7); color: #78350f; border-color: rgba(234,179,8,0.2); }
.lp-light .lp-b-invoice    { background: rgba(254,243,199,0.7); color: #92400e; border-color: rgba(245,158,11,0.2); }
.lp-light .lp-b-selesai    { background: rgba(209,250,229,0.8); color: #064e3b; border-color: rgba(16,185,129,0.28); }
.lp-light .lp-b-default    { background: rgba(241,245,249,0.8); color: #475569; border-color: rgba(148,163,220,0.28); }

/* ── TABLE ── */
.lp-tbl-wrap { border-radius: 13px; overflow: hidden; }
.lp-tbl-wrap-dark  { border: 1px solid rgba(99,148,255,0.1); }
.lp-tbl-wrap-light { border: 1px solid rgba(59,130,246,0.12); }

.lp-thead-dark  { background: rgba(5,10,22,0.8); }
.lp-thead-light { background: rgba(235,244,255,0.9); }

.lp-th-dark  { padding: 11px 14px; font-size: 10px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: rgba(99,148,255,0.6); white-space: nowrap; }
.lp-th-light { padding: 11px 14px; font-size: 10px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: rgba(37,99,235,0.55); white-space: nowrap; }

.lp-tbody-dark  .lp-tr { border-bottom: 1px solid rgba(99,148,255,0.06); transition: background .15s; }
.lp-tbody-dark  .lp-tr:hover { background: rgba(59,130,246,0.06); }
.lp-tbody-dark  .lp-tr:last-child { border-bottom: none; }
.lp-tbody-light .lp-tr { border-bottom: 1px solid rgba(59,130,246,0.07); transition: background .15s; }
.lp-tbody-light .lp-tr:hover { background: rgba(219,234,254,0.35); }
.lp-tbody-light .lp-tr:last-child { border-bottom: none; }

.lp-td-dark  { padding: 10px 14px; font-size: 12.5px; color: rgba(203,213,240,0.82); white-space: nowrap; }
.lp-td-light { padding: 10px 14px; font-size: 12.5px; color: #334e7a; white-space: nowrap; }

/* sticky col */
.lp-sticky-dark  { position: sticky; z-index: 10; background: rgb(8,13,26); border-right: 1px solid rgba(99,148,255,0.1); }
.lp-sticky-light { position: sticky; z-index: 10; background: rgb(243,248,255); border-right: 1px solid rgba(59,130,246,0.1); }
.lp-tbody-dark  .lp-tr:hover .lp-sticky-dark  { background: rgb(12,19,40); }
.lp-tbody-light .lp-tr:hover .lp-sticky-light { background: rgb(234,244,255); }
.lp-thead-dark  .lp-sticky-dark  { background: rgb(5,9,20); }
.lp-thead-light .lp-sticky-light { background: rgb(231,241,255); }

/* table scrollbar */
.lp-tbl-scroll::-webkit-scrollbar { height: 5px; }
.lp-tbl-scroll::-webkit-scrollbar-track { background: transparent; }
.lp-tbl-scroll::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.22); border-radius: 10px; }

/* ── MOBILE CARDS ── */
.lp-mob-card-dark {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(99,148,255,0.12);
  border-radius: 14px; padding: 14px;
  margin-bottom: 10px;
  transition: all .2s ease;
}
.lp-mob-card-dark:hover  { background: rgba(59,130,246,0.07); border-color: rgba(99,148,255,0.22); }
.lp-mob-card-light {
  background: white;
  border: 1px solid rgba(59,130,246,0.1);
  border-radius: 14px; padding: 14px;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(59,130,246,0.05);
  transition: all .2s ease;
}
.lp-mob-card-light:hover { box-shadow: 0 4px 16px rgba(59,130,246,0.1); border-color: rgba(59,130,246,0.2); }

.lp-mob-field-label-dark  { font-size: 10px; font-weight: 500; color: rgba(99,148,255,0.5); margin-bottom: 2px; }
.lp-mob-field-label-light { font-size: 10px; font-weight: 500; color: rgba(37,99,235,0.45); margin-bottom: 2px; }
.lp-mob-field-val-dark  { font-size: 12.5px; font-weight: 500; color: rgba(203,213,240,0.85); }
.lp-mob-field-val-light { font-size: 12.5px; font-weight: 500; color: #334e7a; }

/* ── COL TOGGLE PANEL ── */
.lp-col-panel-dark  {
  background: rgba(7,11,24,0.97); border: 1px solid rgba(99,148,255,0.15);
  border-radius: 14px; box-shadow: 0 16px 48px rgba(0,0,0,0.65);
  position: absolute; top: calc(100% + 6px); right: 0; z-index: 100;
  width: 240px; max-height: 340px; overflow-y: auto; padding: 12px;
}
.lp-col-panel-light {
  background: rgba(248,251,255,0.99); border: 1px solid rgba(59,130,246,0.15);
  border-radius: 14px; box-shadow: 0 12px 40px rgba(37,99,235,0.1);
  position: absolute; top: calc(100% + 6px); right: 0; z-index: 100;
  width: 240px; max-height: 340px; overflow-y: auto; padding: 12px;
}
.lp-col-panel-dark::-webkit-scrollbar,
.lp-col-panel-light::-webkit-scrollbar { width: 3px; }
.lp-col-panel-dark::-webkit-scrollbar-thumb  { background: rgba(59,130,246,0.25); border-radius:6px; }
.lp-col-panel-light::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.2);  border-radius:6px; }
.lp-col-panel-enter { animation: lp-drop-in .2s cubic-bezier(0.22,1,0.36,1) forwards; }
@keyframes lp-drop-in { from{opacity:0;transform:translateY(-8px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }

/* ── PAGINATION ── */
.lp-pg-btn {
  width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;
  border-radius: 9px; cursor: pointer; transition: all .18s ease; font-size: 13px; font-family: 'DM Sans', sans-serif; border: none;
}
.lp-pg-btn:disabled { opacity: .3; cursor: not-allowed; }
.lp-pg-btn-dark  { background: rgba(255,255,255,0.04); border: 1px solid rgba(99,148,255,0.14) !important; color: rgba(148,163,220,0.7); }
.lp-pg-btn-dark:not(:disabled):hover  { background: rgba(59,130,246,0.1); border-color: rgba(96,165,250,0.28) !important; color: #93c5fd; }
.lp-pg-btn-dark.lp-pg-active  { background: rgba(37,99,235,0.22); border-color: rgba(59,130,246,0.38) !important; color: #93c5fd; font-weight: 600; }
.lp-pg-btn-light { background: white; border: 1px solid rgba(59,130,246,0.14) !important; color: #4b6ea8; box-shadow: 0 1px 3px rgba(59,130,246,0.05); }
.lp-pg-btn-light:not(:disabled):hover { background: rgba(219,234,254,0.5); border-color: rgba(59,130,246,0.28) !important; color: #1d4ed8; }
.lp-pg-btn-light.lp-pg-active { background: rgba(219,234,254,0.8); border-color: rgba(37,99,235,0.3) !important; color: #1d4ed8; font-weight: 600; }

/* ── LOADING SPINNER ── */
@keyframes lp-spin { to { transform: rotate(360deg); } }
.lp-spinner { width: 38px; height: 38px; border-radius: 50%; border: 3px solid rgba(59,130,246,0.15); border-top-color: #3b82f6; animation: lp-spin .75s linear infinite; }

/* ── TEXT HELPERS ── */
.lp-text-h-dark   { color: #e2e8f5; }
.lp-text-h-light  { color: #1e3a5f; }
.lp-text-m-dark   { color: rgba(99,148,255,0.55); }
.lp-text-m-light  { color: rgba(37,99,235,0.5); }
.lp-text-s-dark   { color: rgba(148,163,220,0.72); }
.lp-text-s-light  { color: #4b6ea8; }

/* ── DIVIDER ── */
.lp-div-dark  { height: 1px; background: linear-gradient(90deg,rgba(99,148,255,0.18),transparent); margin: 16px 0; }
.lp-div-light { height: 1px; background: linear-gradient(90deg,rgba(59,130,246,0.13),transparent); margin: 16px 0; }

/* ── EMPTY STATE ── */
.lp-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 0; gap: 12px; }

/* ── FILTER TAG ── */
.lp-tag-dark  { display:inline-flex; align-items:center; gap:5px; padding:3px 10px 3px 8px; border-radius:20px; font-size:11.5px; font-weight:500; background:rgba(59,130,246,0.12); border:1px solid rgba(59,130,246,0.22); color:#93c5fd; }
.lp-tag-light { display:inline-flex; align-items:center; gap:5px; padding:3px 10px 3px 8px; border-radius:20px; font-size:11.5px; font-weight:500; background:rgba(219,234,254,0.7); border:1px solid rgba(59,130,246,0.2); color:#1d4ed8; }
.lp-tag-close { background:none; border:none; cursor:pointer; display:flex; align-items:center; padding:0; opacity:.7; transition:opacity .15s; }
.lp-tag-close:hover { opacity:1; }
`;

/* ═══════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════ */
const ALL_COLS = [
  { key:"pelanggan",                           label:"Nama Pelanggan",               fixed:true, w:185, show:true  },
  { key:"portofolio",                          label:"Portofolio",                   fixed:true, w:110, show:true  },
  { key:"statusOrder",                         label:"Status",                       fixed:true, w:145, show:true  },
  { key:"nomorOrder",                          label:"Nomor Order",                              w:150, show:true  },
  { key:"tanggalOrder",                        label:"Tgl Order",                                w:120, show:true  },
  { key:"tanggalStatusOrder",                  label:"Tgl Status",                               w:120, show:true  },
  { key:"tanggalPekerjaan",                    label:"Tgl Pekerjaan",                            w:120, show:true  },
  { key:"jenisPekerjaan",                      label:"Jenis Pekerjaan",                          w:160, show:true  },
  { key:"lokasiPekerjaan",                     label:"Lokasi",                                   w:160, show:false },
  { key:"tanggalSerahOrderKeCs",               label:"Tgl Serah ke CS",                          w:130, show:false },
  { key:"proformaSerahKeOps",                  label:"Proforma → Ops",                           w:130, show:false },
  { key:"proformaSerahKeDukbis",               label:"Proforma → Dukbis",                        w:135, show:false },
  { key:"proformaBySistem",                    label:"Proforma By Sistem",                        w:140, show:false },
  { key:"noSertifikatPM06",                    label:"No. Sert. PM06",                           w:130, show:false },
  { key:"noSertifikat",                        label:"No. Sertifikat",                            w:130, show:true  },
  { key:"keteranganSertifikatPM06",            label:"Ket. Sert. PM06",                          w:155, show:false },
  { key:"jenisSerifikat",                      label:"Jenis Sertifikat",                          w:140, show:false },
  { key:"noSiSpk",                             label:"No SI/SPK",                                w:120, show:false },
  { key:"namaTongkang",                        label:"Nama Tongkang",                            w:140, show:false },
  { key:"estimasiTonase",                      label:"Est. Tonase",                              w:120, show:true  },
  { key:"tonaseDS",                            label:"Tonase DS",                                w:110, show:true  },
  { key:"nilaiProforma",                       label:"Nilai Proforma",                           w:145, show:true  },
  { key:"nilaiInvoice",                        label:"Nilai Invoice",                            w:140, show:true  },
  { key:"nomorInvoice",                        label:"No. Invoice",                              w:130, show:false },
  { key:"fakturPajak",                         label:"Faktur Pajak",                             w:120, show:false },
  { key:"tanggalPengirimanInvoice",            label:"Tgl Kirim Invoice",                        w:140, show:false },
  { key:"tanggalPengirimanFaktur",             label:"Tgl Kirim Faktur",                         w:135, show:false },
  { key:"distribusiSertifikatPengirim",        label:"Dist. Sert. (Pengirim)",                   w:175, show:false },
  { key:"distribusiSertifikatPengirimTanggal", label:"Tgl Dist. (Pengirim)",                     w:145, show:false },
  { key:"distribusiSertifikatPenerima",        label:"Dist. Sert. (Penerima)",                   w:175, show:false },
  { key:"distribusiSertifikatPenerimaTanggal", label:"Tgl Diterima Sert.",                       w:140, show:false },
  { key:"createdAt",                           label:"Dibuat Pada",                              w:120, show:false },
  { key:"updatedAt",                           label:"Diperbarui",                               w:120, show:false },
];

const PORTO_LIST  = ["BATUBARA","KSP","PIK","INDUSTRI","HMPM","AEBT","MINERAL","HALAL","LABORATORIUM","SERCO","LSI"];
const STATUS_LIST = ["New Order","Entry","Diproses - Lapangan","Diproses - Sertifikat","Closed Order","Penerbitan Proforma","Invoice","Selesai"];

/* ═══════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════ */
const parseTs = (ts) => {
  if (!ts) return null;
  if (ts?.seconds) return new Date(ts.seconds * 1000);
  if (ts instanceof Date && !isNaN(ts)) return ts;
  const p = new Date(ts);
  return isNaN(p) ? null : p;
};

const formatDate = (ts) => {
  const d = parseTs(ts);
  if (d) return d.toLocaleDateString("id-ID", { day:"2-digit", month:"2-digit", year:"numeric" });
  if (typeof ts === "string" && ts.includes("/")) {
    const parts = ts.split("/");
    if (parts.length === 3) { const p = new Date(parts[2], parts[1]-1, parts[0]); if (!isNaN(p)) return p.toLocaleDateString("id-ID",{day:"2-digit",month:"2-digit",year:"numeric"}); }
  }
  return "-";
};

const formatCurrency = (v) => { const n = Number(v); return isNaN(n) ? "Rp -" : `Rp ${n.toLocaleString("id-ID")}`; };

const BADGE_MAP = {
  "New Order":"lp-b-new","Entry":"lp-b-entry","Diproses - Lapangan":"lp-b-lapangan",
  "Diproses - Sertifikat":"lp-b-sertifikat","Closed Order":"lp-b-closed",
  "Penerbitan Proforma":"lp-b-proforma","Invoice":"lp-b-invoice","Selesai":"lp-b-selesai",
};
const getBadge = (s) => `lp-badge ${BADGE_MAP[s] || "lp-b-default"}`;

const STAT_COLORS = ["#60a5fa","#a78bfa","#fbbf24","#34d399"];
const STAT_BG_D   = ["rgba(96,165,250,0.12)","rgba(167,139,250,0.12)","rgba(251,191,36,0.12)","rgba(52,211,153,0.12)"];
const STAT_BG_L   = ["rgba(219,234,254,0.5)","rgba(237,233,254,0.5)","rgba(254,249,195,0.5)","rgba(209,250,229,0.5)"];

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
export default function LaporanOrders() {
  const { isDark } = useTheme();
  const navigate   = useNavigate();
  const colPanelRef = useRef(null);

  /* ── STATE ── */
  const [orders, setOrders]             = useState([]);
  const [filtered, setFiltered]         = useState([]);
  const [startDate, setStartDate]       = useState("");
  const [endDate, setEndDate]           = useState("");
  const [portoFilter, setPortoFilter]   = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch]             = useState("");
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [mounted, setMounted]           = useState(false);
  const [isMobile, setIsMobile]         = useState(false);
  const [viewMode, setViewMode]         = useState("table"); // "table" | "cards"
  const [showColPanel, setShowColPanel] = useState(false);
  const [colVis, setColVis]             = useState(
    () => ALL_COLS.reduce((a,c) => ({ ...a, [c.key]: c.show }), {})
  );
  const [page, setPage]       = useState(1);
  const [perPage, setPerPage] = useState(10);

  const userData   = useMemo(() => JSON.parse(localStorage.getItem("user")) || {}, []);
  const userPeran  = userData.peran  || "";
  const userBidang = userData.bidang || "";

  const d  = isDark;
  const T  = (dk,lk) => d ? dk : lk;

  /* ── RESPONSIVE ── */
  useEffect(() => {
    const check = () => { const m = window.innerWidth < 768; setIsMobile(m); if (m) setViewMode("cards"); };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* ── INIT ── */
  useEffect(() => {
    if (!userPeran) { alert("Anda tidak memiliki akses!"); navigate("/"); return; }
    setMounted(true);
    fetchOrders();
  }, [userPeran]);

  /* ── CLOSE COL PANEL ON OUTSIDE CLICK ── */
  useEffect(() => {
    const handler = (e) => { if (colPanelRef.current && !colPanelRef.current.contains(e.target)) setShowColPanel(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── FETCH ── */
  const fetchOrders = async () => {
    setLoading(true); setError(null);
    try {
      const ref = collection(db, "orders");
      let q;
      if (userPeran === "admin portofolio")
        q = query(ref, where("portofolio","==",userBidang), orderBy("createdAt","desc"));
      else if (["customer service","admin keuangan","koordinator"].includes(userPeran))
        q = query(ref, orderBy("createdAt","desc"));
      else { setError("Anda tidak memiliki akses ke laporan ini."); setLoading(false); return; }

      const snap = await getDocs(q);
      const data = snap.docs.map(doc => {
        const o = doc.data();
        const d = (f) => formatDate(parseTs(o[f]));
        return {
          ...o, id: doc.id,
          tanggalStatusOrder: d("tanggalStatusOrder"),
          tanggalSerahOrderKeCs: d("tanggalSerahOrderKeCs"),
          tanggalOrder: d("tanggalOrder"),
          tanggalPekerjaan: d("tanggalPekerjaan"),
          proformaSerahKeOps: d("proformaSerahKeOps"),
          proformaSerahKeDukbis: d("proformaSerahKeDukbis"),
          proformaBySistem: d("proformaBySistem"),
          tanggalPengirimanInvoice: d("tanggalPengirimanInvoice"),
          tanggalPengirimanFaktur: d("tanggalPengirimanFaktur"),
          distribusiSertifikatPengirimTanggal: d("distribusiSertifikatPengirimTanggal"),
          distribusiSertifikatPenerimaTanggal: d("distribusiSertifikatPenerimaTanggal"),
          createdAt: d("createdAt"),
          updatedAt: d("updatedAt"),
          nilaiProforma: formatCurrency(o.nilaiProforma),
          nilaiInvoice:  formatCurrency(o.nilaiInvoice),
          tonaseDS:      o.tonaseDS       ? Number(o.tonaseDS).toLocaleString("id-ID")       : "-",
          estimasiTonase:o.estimasiTonase ? Number(o.estimasiTonase).toLocaleString("id-ID") : "-",
          pelanggan: o.pelanggan  || "-",
          portofolio: o.portofolio || "-",
          statusOrder: o.statusOrder || "-",
        };
      });
      setOrders(data); setFiltered(data);
    } catch (e) { setError(`Terjadi kesalahan: ${e.message}`); }
    setLoading(false);
  };

  /* ── FILTER & SEARCH ── */
  const applyAll = (base = orders, q = search, sd = startDate, ed = endDate, pf = portoFilter, sf = statusFilter) => {
    let f = [...base];
    if (sd && ed) {
      const s = new Date(sd); s.setHours(0,0,0,0);
      const e = new Date(ed); e.setHours(23,59,59,999);
      f = f.filter(o => {
        if (!o.createdAt || o.createdAt === "-") return false;
        const p = o.createdAt.split("/");
        if (p.length !== 3) return false;
        const od = new Date(p[2], p[1]-1, p[0]); od.setHours(0,0,0,0);
        return !isNaN(od) && od >= s && od <= e;
      });
    }
    if (pf && userPeran !== "admin portofolio") f = f.filter(o => o.portofolio?.toLowerCase() === pf.toLowerCase());
    if (sf)  f = f.filter(o => o.statusOrder === sf);
    if (q.trim()) {
      const lq = q.toLowerCase();
      f = f.filter(o => o.pelanggan?.toLowerCase().includes(lq) || o.nomorOrder?.toLowerCase().includes(lq) || o.portofolio?.toLowerCase().includes(lq));
    }
    setFiltered(f); setPage(1);
  };

  const handleFilter   = () => applyAll();
  const handleReset    = () => { setStartDate(""); setEndDate(""); setPortoFilter(""); setStatusFilter(""); setSearch(""); setFiltered(orders); setPage(1); };
  const handleSearch   = (v) => { setSearch(v); applyAll(orders, v); };

  /* ── EXPORT ── */
  const handleExport = () => {
    if (!filtered.length) { alert("Tidak ada data untuk diekspor."); return; }
    const clean = filtered.map(item => {
      const x = {...item};
      ["nilaiProforma","nilaiInvoice"].forEach(k => { if (typeof x[k]==="string") x[k]=x[k].replace(/[Rp.\s]/g,"").replace(/,/g,""); });
      ["tonaseDS","estimasiTonase"].forEach(k => { if (typeof x[k]==="string") x[k]=x[k].replace(/\./g,""); });
      return x;
    });
    exportToExcel(clean, `Laporan_Orders_${new Date().toISOString().split("T")[0]}`, ALL_COLS);
  };

  /* ── STATS ── */
  const stats = useMemo(() => [
    { label:"Total Order",  val: filtered.length,                                                                              icon:<Package  style={{width:16,height:16}}/> },
    { label:"Diproses",     val: filtered.filter(o=>["Diproses - Lapangan","Diproses - Sertifikat"].includes(o.statusOrder)).length, icon:<TrendingUp style={{width:16,height:16}}/> },
    { label:"Invoice",      val: filtered.filter(o=>o.statusOrder==="Invoice").length,                                         icon:<Clock    style={{width:16,height:16}}/> },
    { label:"Selesai",      val: filtered.filter(o=>o.statusOrder==="Selesai").length,                                         icon:<CheckCircle2 style={{width:16,height:16}}/> },
  ], [filtered]);

  /* ── PAGINATION ── */
  const totalPages  = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated   = filtered.slice((page-1)*perPage, page*perPage);
  const goTo        = (p) => setPage(Math.max(1, Math.min(p, totalPages)));

  /* ── VISIBLE COLS ── */
  const visCols = useMemo(() => ALL_COLS.filter(c => colVis[c.key]), [colVis]);

  /* ── STICKY OFFSETS ── */
  const stickyOff = useMemo(() => {
    let off = 0;
    return visCols.filter(c=>c.fixed).reduce((acc,c) => { acc[c.key]=off; off+=c.w||150; return acc; }, {});
  }, [visCols]);

  /* ── ACTIVE FILTER TAGS ── */
  const activeTags = useMemo(() => {
    const t = [];
    if (startDate && endDate) t.push({ key:"date", label:`${startDate} → ${endDate}`, clear:()=>{setStartDate("");setEndDate("");applyAll(orders,search,"","",portoFilter,statusFilter);} });
    if (portoFilter) t.push({ key:"porto", label:`Porto: ${portoFilter.toUpperCase()}`, clear:()=>{setPortoFilter("");applyAll(orders,search,startDate,endDate,"",statusFilter);} });
    if (statusFilter) t.push({ key:"status", label:`Status: ${statusFilter}`, clear:()=>{setStatusFilter("");applyAll(orders,search,startDate,endDate,portoFilter,"");} });
    if (search) t.push({ key:"search", label:`Cari: "${search}"`, clear:()=>{setSearch("");applyAll(orders,"",startDate,endDate,portoFilter,statusFilter);} });
    return t;
  }, [startDate,endDate,portoFilter,statusFilter,search]);

  /* ══════════════════════════════
     RENDER
  ══════════════════════════════ */
  return (
    <>
      <style>{STYLES}</style>
      <div
        className={`lp-root ${d?"":"lp-light"} ${mounted?"lp-mounted":"opacity-0"}`}
        style={{ padding: isMobile ? "12px" : "24px", transition:"all .4s ease", minHeight:"100%" }}
      >
        <div className={T("lp-card-dark","lp-card-light")} style={{overflow:"hidden"}}>
          <div className="lp-topbar"/>

          <div style={{padding: isMobile?"16px":"24px 28px"}}>

            {/* ── PAGE HEADER ── */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12,marginBottom:20}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:40,height:40,borderRadius:12,flexShrink:0,background:"linear-gradient(135deg,#1d4ed8,#3b82f6)",boxShadow:"0 0 18px rgba(59,130,246,0.35)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <FileText style={{width:18,height:18,color:"white"}}/>
                </div>
                <div>
                  <h1 className={T("lp-text-h-dark","lp-text-h-light")} style={{fontSize:18,fontWeight:700,lineHeight:1.2}}>Laporan Order</h1>
                  <p className={T("lp-text-m-dark","lp-text-m-light")} style={{fontSize:12,marginTop:2}}>
                    {orders.length.toLocaleString("id-ID")} total data tersedia
                  </p>
                </div>
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <button className={`lp-btn ${T("lp-btn-ghost-dark","lp-btn-ghost-light")}`} onClick={fetchOrders} style={{padding:"8px 12px"}}>
                  <RefreshCw style={{width:14,height:14}}/>{!isMobile&&"Refresh"}
                </button>
                {userPeran !== "koordinator" && (
                  <button className="lp-btn lp-btn-export" onClick={handleExport} disabled={!filtered.length||loading}>
                    <Download style={{width:14,height:14}}/>{!isMobile&&"Export Excel"}
                  </button>
                )}
              </div>
            </div>

            {/* ── STAT CARDS ── */}
            <div style={{display:"grid",gridTemplateColumns:`repeat(${isMobile?2:4},1fr)`,gap:10,marginBottom:20}}>
              {stats.map((s,i)=>(
                <div key={i} className={T("lp-stat-dark","lp-stat-light")}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                    <div className="lp-stat-icon" style={{background:d?STAT_BG_D[i]:STAT_BG_L[i],color:STAT_COLORS[i]}}>
                      {s.icon}
                    </div>
                    <span className={T("lp-text-m-dark","lp-text-m-light")} style={{fontSize:11,fontWeight:500}}>{s.label}</span>
                  </div>
                  <p style={{fontSize:26,fontWeight:700,color:STAT_COLORS[i],lineHeight:1,fontVariantNumeric:"tabular-nums"}}>{s.val}</p>
                </div>
              ))}
            </div>

            {/* ── FILTER SECTION ── */}
            <div className={T("lp-filter-dark","lp-filter-light")} style={{marginBottom:20}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                <Filter style={{width:13,height:13,color:d?"rgba(99,148,255,0.55)":"rgba(37,99,235,0.5)"}}/>
                <span className={T("lp-text-m-dark","lp-text-m-light")} style={{fontSize:11,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase"}}>Filter Laporan</span>
              </div>

              <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(auto-fit,minmax(155px,1fr))",gap:10,marginBottom:14}}>
                <div>
                  <label className={T("lp-label-dark","lp-label-light")}>Tanggal Mulai</label>
                  <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className={`lp-input ${T("lp-input-dark","lp-input-light")}`}/>
                </div>
                <div>
                  <label className={T("lp-label-dark","lp-label-light")}>Tanggal Akhir</label>
                  <input type="date" value={endDate} min={startDate} onChange={e=>setEndDate(e.target.value)} className={`lp-input ${T("lp-input-dark","lp-input-light")}`}/>
                </div>
                {userPeran !== "admin portofolio" && (
                  <div>
                    <label className={T("lp-label-dark","lp-label-light")}>Portofolio</label>
                    <select value={portoFilter} onChange={e=>setPortoFilter(e.target.value)} className={`lp-input ${T("lp-input-dark","lp-input-light")}`}>
                      <option value="">Semua Portofolio</option>
                      {PORTO_LIST.map(p=><option key={p} value={p.toLowerCase()}>{p}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className={T("lp-label-dark","lp-label-light")}>Status Order</label>
                  <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className={`lp-input ${T("lp-input-dark","lp-input-light")}`}>
                    <option value="">Semua Status</option>
                    {STATUS_LIST.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <button className="lp-btn lp-btn-primary" onClick={handleFilter} style={{padding:"8px 16px"}}>
                  <Filter style={{width:13,height:13}}/>Terapkan
                </button>
                <button className={`lp-btn ${T("lp-btn-ghost-dark","lp-btn-ghost-light")}`} onClick={handleReset} style={{padding:"8px 14px"}}>
                  <X style={{width:13,height:13}}/>Reset
                </button>
              </div>

              {/* Active filter tags */}
              {activeTags.length > 0 && (
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:12}}>
                  {activeTags.map(tag=>(
                    <span key={tag.key} className={T("lp-tag-dark","lp-tag-light")}>
                      {tag.label}
                      <button className="lp-tag-close" onClick={tag.clear} style={{color:d?"#93c5fd":"#1d4ed8"}}>
                        <X style={{width:11,height:11}}/>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* ── LOADING / ERROR / DATA ── */}
            {loading ? (
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"64px 0",gap:14}}>
                <div className="lp-spinner"/>
                <p className={T("lp-text-m-dark","lp-text-m-light")} style={{fontSize:13}}>Memuat data laporan...</p>
              </div>
            ) : error ? (
              <div style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:12,padding:"14px 18px",display:"flex",gap:12,alignItems:"flex-start"}}>
                <AlertCircle style={{width:18,height:18,color:"#f87171",flexShrink:0,marginTop:1}}/>
                <div>
                  <p style={{fontSize:13,fontWeight:600,color:"#fca5a5",marginBottom:3}}>Error</p>
                  <p style={{fontSize:12.5,color:"rgba(252,165,165,0.75)"}}>{error}</p>
                </div>
              </div>
            ) : (
              <>
                {/* Controls bar */}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginBottom:14,flexWrap:"wrap"}}>

                  {/* Search */}
                  <div className="lp-search-icon-wrap" style={{flex:1,minWidth:180,maxWidth:320,position:"relative"}}>
                    <Search className="lp-si" style={{width:13,height:13,color:d?"rgba(99,148,255,0.4)":"rgba(37,99,235,0.38)"}}/>
                    <input
                      type="text" placeholder="Cari pelanggan, nomor order..."
                      value={search} onChange={e=>handleSearch(e.target.value)}
                      className={`lp-input ${T("lp-input-dark","lp-input-light")}`}
                      style={{margin:0}}
                    />
                    {search && (
                      <button className="lp-search-clear" onClick={()=>handleSearch("")} style={{color:d?"rgba(148,163,220,0.6)":"#4b6ea8"}}>
                        <X style={{width:13,height:13}}/>
                      </button>
                    )}
                  </div>

                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                    {/* Record info */}
                    <span className={T("lp-text-m-dark","lp-text-m-light")} style={{fontSize:12,whiteSpace:"nowrap"}}>
                      {paginated.length>0?(page-1)*perPage+1:0}–{Math.min(page*perPage,filtered.length)} / <strong>{filtered.length}</strong>
                    </span>

                    {/* Per page */}
                    <select value={perPage} onChange={e=>{setPerPage(Number(e.target.value));setPage(1);}} className={`lp-input ${T("lp-input-dark","lp-input-light")}`} style={{width:"auto",padding:"7px 10px"}}>
                      {[10,25,50,100].map(n=><option key={n} value={n}>{n}/hal</option>)}
                    </select>

                    {/* View toggle – desktop only */}
                    {!isMobile && (
                      <div style={{display:"flex",borderRadius:10,overflow:"hidden",border:d?"1px solid rgba(99,148,255,0.18)":"1px solid rgba(59,130,246,0.18)"}}>
                        {[{v:"table",icon:<Table2 style={{width:14,height:14}}/>},{v:"cards",icon:<LayoutList style={{width:14,height:14}}/>}].map(({v,icon})=>(
                          <button key={v} onClick={()=>setViewMode(v)}
                            style={{
                              padding:"7px 11px",border:"none",cursor:"pointer",display:"flex",alignItems:"center",
                              background: viewMode===v ? (d?"rgba(37,99,235,0.25)":"rgba(219,234,254,0.8)") : "transparent",
                              color: viewMode===v ? (d?"#93c5fd":"#1d4ed8") : (d?"rgba(148,163,220,0.5)":"#4b6ea8"),
                              transition:"all .18s",
                            }}>
                            {icon}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Column toggle */}
                    <div ref={colPanelRef} style={{position:"relative"}}>
                      <button className={`lp-btn ${T("lp-btn-ghost-dark","lp-btn-ghost-light")}`} onClick={()=>setShowColPanel(!showColPanel)} style={{padding:"7px 12px",gap:5}}>
                        <SlidersHorizontal style={{width:13,height:13}}/>
                        {!isMobile && <span>Kolom</span>}
                        <ChevronDown style={{width:11,height:11,transition:"transform .25s",transform:showColPanel?"rotate(180deg)":"rotate(0deg)"}}/>
                      </button>

                      {showColPanel && (
                        <div className={`${T("lp-col-panel-dark","lp-col-panel-light")} lp-col-panel-enter`}>
                          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                            <span className={T("lp-text-s-dark","lp-text-s-light")} style={{fontSize:11.5,fontWeight:600}}>Tampilkan Kolom</span>
                            <button onClick={()=>setShowColPanel(false)} style={{background:"none",border:"none",cursor:"pointer",color:d?"rgba(148,163,220,0.55)":"#4b6ea8",padding:2}}>
                              <X style={{width:13,height:13}}/>
                            </button>
                          </div>
                          <div style={{display:"flex",gap:6,marginBottom:10}}>
                            <button style={{fontSize:11,padding:"3px 8px",borderRadius:6,cursor:"pointer",background:d?"rgba(59,130,246,0.1)":"rgba(219,234,254,0.6)",border:d?"1px solid rgba(59,130,246,0.2)":"1px solid rgba(59,130,246,0.15)",color:d?"#93c5fd":"#1d4ed8"}} onClick={()=>setColVis(ALL_COLS.reduce((a,c)=>({...a,[c.key]:true}),{}))}>Semua</button>
                            <button style={{fontSize:11,padding:"3px 8px",borderRadius:6,cursor:"pointer",background:d?"rgba(255,255,255,0.04)":"white",border:d?"1px solid rgba(99,148,255,0.14)":"1px solid rgba(59,130,246,0.14)",color:d?"rgba(148,163,220,0.6)":"#4b6ea8"}} onClick={()=>setColVis(ALL_COLS.reduce((a,c)=>({...a,[c.key]:c.fixed||false}),{}))}>Minimal</button>
                          </div>
                          {ALL_COLS.map(c=>(
                            <label key={c.key} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 2px",cursor:c.fixed?"default":"pointer"}}>
                              <input type="checkbox" checked={colVis[c.key]||false} disabled={c.fixed} onChange={e=>setColVis(p=>({...p,[c.key]:e.target.checked}))} style={{accentColor:d?"#3b82f6":"#1d4ed8",width:14,height:14,cursor:c.fixed?"default":"pointer"}}/>
                              <span className={T("lp-text-s-dark","lp-text-s-light")} style={{fontSize:12,flex:1}}>{c.label}</span>
                              {c.fixed && <span style={{fontSize:9.5,color:d?"rgba(99,148,255,0.4)":"rgba(37,99,235,0.38)",fontWeight:500}}>TETAP</span>}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── TABLE VIEW ── */}
                {viewMode === "table" ? (
                  <div className={`lp-tbl-wrap ${T("lp-tbl-wrap-dark","lp-tbl-wrap-light")}`}>
                    <div className="lp-tbl-scroll" style={{overflowX:"auto"}}>
                      <table style={{minWidth:"max-content",width:"100%",borderCollapse:"collapse"}}>
                        <thead className={T("lp-thead-dark","lp-thead-light")}>
                          <tr>
                            {visCols.map(col=>(
                              <th key={col.key}
                                className={`${T("lp-th-dark","lp-th-light")} ${col.fixed?T("lp-sticky-dark","lp-sticky-light"):""}`}
                                style={col.fixed?{left:stickyOff[col.key],minWidth:col.w,width:col.w}:{minWidth:col.w}}>
                                {col.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className={T("lp-tbody-dark","lp-tbody-light")}>
                          {paginated.length > 0 ? paginated.map(order=>(
                            <tr key={order.id} className="lp-tr">
                              {visCols.map(col=>(
                                <td key={`${order.id}-${col.key}`}
                                  className={`${T("lp-td-dark","lp-td-light")} ${col.fixed?T("lp-sticky-dark","lp-sticky-light"):""}`}
                                  style={col.fixed?{left:stickyOff[col.key],minWidth:col.w,width:col.w}:{}}>
                                  {col.key==="statusOrder"
                                    ? <span className={getBadge(order[col.key]||"")}>{order[col.key]||"-"}</span>
                                    : (order[col.key]??"-")}
                                </td>
                              ))}
                            </tr>
                          )) : (
                            <tr><td colSpan={visCols.length}>
                              <div className="lp-empty">
                                <div style={{width:48,height:48,borderRadius:14,background:d?"rgba(99,148,255,0.08)":"rgba(219,234,254,0.5)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                                  <FileText style={{width:22,height:22,color:d?"rgba(99,148,255,0.4)":"rgba(37,99,235,0.35)"}}/>
                                </div>
                                <p className={T("lp-text-m-dark","lp-text-m-light")} style={{fontSize:13}}>Tidak ada data yang sesuai</p>
                                <button className={`lp-btn ${T("lp-btn-ghost-dark","lp-btn-ghost-light")}`} onClick={handleReset} style={{fontSize:12,padding:"6px 14px"}}>
                                  <X style={{width:12,height:12}}/>Reset filter
                                </button>
                              </div>
                            </td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  /* ── CARD VIEW ── */
                  <div>
                    {paginated.length > 0 ? paginated.map(order=>(
                      <div key={order.id} className={T("lp-mob-card-dark","lp-mob-card-light")}>
                        {/* Card header */}
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                          <div style={{flex:1,minWidth:0,paddingRight:10}}>
                            <p className={T("lp-text-h-dark","lp-text-h-light")} style={{fontSize:14,fontWeight:600,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                              {order.pelanggan||"-"}
                            </p>
                            <p className={T("lp-text-m-dark","lp-text-m-light")} style={{fontSize:12}}>
                              {order.nomorOrder||"-"}
                            </p>
                          </div>
                          <span className={getBadge(order.statusOrder||"")}>{order.statusOrder||"-"}</span>
                        </div>

                        {/* Card body grid */}
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 16px"}}>
                          {[
                            ["Portofolio",     order.portofolio],
                            ["Tgl Order",      order.tanggalOrder],
                            ["Jenis Pekerjaan",order.jenisPekerjaan],
                            ["Tgl Pekerjaan",  order.tanggalPekerjaan],
                            ["Tonase DS",      order.tonaseDS],
                            ["Nilai Proforma", order.nilaiProforma],
                            ["No. Sertifikat", order.noSertifikat],
                            ["Est. Tonase",    order.estimasiTonase],
                          ].map(([lbl,val])=>(
                            <div key={lbl}>
                              <p className={T("lp-mob-field-label-dark","lp-mob-field-label-light")}>{lbl}</p>
                              <p className={T("lp-mob-field-val-dark","lp-mob-field-val-light")}>{val||"-"}</p>
                            </div>
                          ))}
                        </div>

                        {/* Nilai invoice highlight */}
                        {order.nilaiInvoice && order.nilaiInvoice !== "Rp -" && (
                          <div style={{marginTop:10,padding:"8px 12px",borderRadius:9,background:d?"rgba(59,130,246,0.08)":"rgba(219,234,254,0.5)",border:d?"1px solid rgba(59,130,246,0.14)":"1px solid rgba(59,130,246,0.14)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                            <span className={T("lp-text-m-dark","lp-text-m-light")} style={{fontSize:11,fontWeight:500}}>Nilai Invoice</span>
                            <span style={{fontSize:13,fontWeight:600,color:d?"#60a5fa":"#1d4ed8"}}>{order.nilaiInvoice}</span>
                          </div>
                        )}
                      </div>
                    )) : (
                      <div className="lp-empty">
                        <div style={{width:48,height:48,borderRadius:14,background:d?"rgba(99,148,255,0.08)":"rgba(219,234,254,0.5)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                          <FileText style={{width:22,height:22,color:d?"rgba(99,148,255,0.4)":"rgba(37,99,235,0.35)"}}/>
                        </div>
                        <p className={T("lp-text-m-dark","lp-text-m-light")} style={{fontSize:13}}>Tidak ada data</p>
                        <button className={`lp-btn ${T("lp-btn-ghost-dark","lp-btn-ghost-light")}`} onClick={handleReset} style={{fontSize:12,padding:"6px 14px"}}>
                          <X style={{width:12,height:12}}/>Reset filter
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* ── PAGINATION ── */}
                {filtered.length > 0 && (
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:16,flexWrap:"wrap",gap:10}}>
                    <span className={T("lp-text-m-dark","lp-text-m-light")} style={{fontSize:12}}>
                      Halaman <strong>{page}</strong> dari <strong>{totalPages}</strong>
                    </span>

                    <div style={{display:"flex",alignItems:"center",gap:4}}>
                      {[
                        {onClick:()=>goTo(1),          icon:<ChevronsLeft  style={{width:14,height:14}}/>, disabled:page===1},
                        {onClick:()=>goTo(page-1),     icon:<ChevronLeft   style={{width:14,height:14}}/>, disabled:page===1},
                      ].map((b,i)=>(
                        <button key={i} className={`lp-pg-btn ${T("lp-pg-btn-dark","lp-pg-btn-light")}`} onClick={b.onClick} disabled={b.disabled}>{b.icon}</button>
                      ))}

                      {!isMobile && [...Array(totalPages)].map((_,i)=>{
                        const p=i+1;
                        if(p===1||p===totalPages||(p>=page-1&&p<=page+1))
                          return <button key={p} className={`lp-pg-btn ${T("lp-pg-btn-dark","lp-pg-btn-light")} ${page===p?"lp-pg-active":""}`} onClick={()=>goTo(p)}>{p}</button>;
                        if((p===page-2&&page>3)||(p===page+2&&page<totalPages-2))
                          return <span key={p} className={T("lp-text-m-dark","lp-text-m-light")} style={{padding:"0 2px",fontSize:13}}>…</span>;
                        return null;
                      })}

                      {isMobile && (
                        <span className={T("lp-text-s-dark","lp-text-s-light")} style={{fontSize:13,padding:"0 4px",fontVariantNumeric:"tabular-nums"}}>
                          {page} / {totalPages}
                        </span>
                      )}

                      {[
                        {onClick:()=>goTo(page+1),     icon:<ChevronRight  style={{width:14,height:14}}/>, disabled:page===totalPages},
                        {onClick:()=>goTo(totalPages), icon:<ChevronsRight style={{width:14,height:14}}/>, disabled:page===totalPages},
                      ].map((b,i)=>(
                        <button key={i} className={`lp-pg-btn ${T("lp-pg-btn-dark","lp-pg-btn-light")}`} onClick={b.onClick} disabled={b.disabled}>{b.icon}</button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}