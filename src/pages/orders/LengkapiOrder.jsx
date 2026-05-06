import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById, updateOrder } from "../../services/orderServices";
import { Timestamp } from "firebase/firestore";
import { uploadToCloudinary } from "../../services/cloudinaryService";
import {
  FiDownload, FiFile, FiTrash2, FiEdit, FiEye, FiUpload,
  FiCalendar, FiCheck, FiArrowLeft, FiAlertCircle, FiLoader,
  FiChevronRight, FiUser, FiBriefcase, FiDollarSign,
  FiFileText, FiSend, FiInfo
} from "react-icons/fi";
import { useTheme } from "../../components/layout/ThemeContext";

/* ═══════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; }

.lo-root {
  font-family: 'Plus Jakarta Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ── Page wrapper ── */
.lo-page-dark {
  background: #080c18;
  background-image:
    radial-gradient(ellipse 70% 40% at 15% 0%, rgba(37,99,235,0.13) 0%, transparent 55%),
    radial-gradient(ellipse 50% 35% at 85% 100%, rgba(99,60,255,0.09) 0%, transparent 50%);
  min-height: 100vh;
}
.lo-page-light {
  background: #f4f7fe;
  background-image:
    radial-gradient(ellipse 70% 40% at 15% 0%, rgba(37,99,235,0.07) 0%, transparent 55%),
    radial-gradient(ellipse 50% 35% at 85% 100%, rgba(99,60,255,0.05) 0%, transparent 50%);
  min-height: 100vh;
}

/* ── Main card ── */
.lo-card-dark {
  background: rgba(10,14,28,0.88);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 22px;
  overflow: hidden;
  box-shadow:
    0 1px 0 rgba(255,255,255,0.04) inset,
    0 24px 64px rgba(0,0,0,0.55),
    0 0 0 1px rgba(0,0,0,0.3);
}
.lo-card-light {
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(40px) saturate(200%);
  -webkit-backdrop-filter: blur(40px) saturate(200%);
  border: 1px solid rgba(59,130,246,0.12);
  border-radius: 22px;
  overflow: hidden;
  box-shadow:
    0 1px 0 rgba(255,255,255,0.95) inset,
    0 16px 48px rgba(37,99,235,0.09),
    0 0 0 1px rgba(59,130,246,0.06);
}

/* ── Accent bar ── */
@keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
.lo-accent {
  height: 2px;
  background: linear-gradient(90deg,
    transparent 0%,
    #1d4ed8 15%, #60a5fa 40%, #a78bfa 60%, #3b82f6 80%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: shimmer 3s ease-in-out infinite;
}

/* ── Card header ── */
.lo-card-header-dark  { border-bottom: 1px solid rgba(255,255,255,0.05); padding: 28px 32px 24px; }
.lo-card-header-light { border-bottom: 1px solid rgba(59,130,246,0.08); padding: 28px 32px 24px; }

/* ── Typography ── */
.lo-title-dark  { color: rgba(225,235,255,0.95); font-size: 22px; font-weight: 800; letter-spacing: -0.4px; }
.lo-title-light { color: #0c1e45; font-size: 22px; font-weight: 800; letter-spacing: -0.4px; }
.lo-sub-dark    { color: rgba(148,163,220,0.65); font-size: 13px; margin-top: 5px; }
.lo-sub-light   { color: #5a7ab5; font-size: 13px; margin-top: 5px; }

.lo-label-dark  {
  color: rgba(170,190,240,0.8); font-size: 11.5px; font-weight: 600;
  letter-spacing: 0.04em; margin-bottom: 7px; display: block;
}
.lo-label-light {
  color: #3b5a8a; font-size: 11.5px; font-weight: 600;
  letter-spacing: 0.04em; margin-bottom: 7px; display: block;
}

/* ── Badge (portofolio) ── */
.lo-badge-dark {
  background: linear-gradient(135deg, rgba(29,78,216,0.3), rgba(99,102,241,0.2));
  border: 1px solid rgba(96,165,250,0.22);
  color: #93c5fd; font-size: 11px; font-weight: 700;
  letter-spacing: 0.1em; text-transform: uppercase;
  padding: 4px 11px; border-radius: 7px;
}
.lo-badge-light {
  background: linear-gradient(135deg, rgba(59,130,246,0.1), rgba(99,102,241,0.06));
  border: 1px solid rgba(59,130,246,0.2);
  color: #2563eb; font-size: 11px; font-weight: 700;
  letter-spacing: 0.1em; text-transform: uppercase;
  padding: 4px 11px; border-radius: 7px;
}

/* ── Status badge ── */
.lo-status-dark  { background: rgba(16,185,129,0.1);  border: 1px solid rgba(16,185,129,0.22); color: #6ee7b7; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; padding: 4px 11px; border-radius: 20px; }
.lo-status-light { background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2);  color: #059669; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; padding: 4px 11px; border-radius: 20px; }

/* ── Section heading ── */
.lo-section-title-dark  { color: rgba(147,197,253,0.85); font-size: 11.5px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; white-space: nowrap; }
.lo-section-title-light { color: #2563eb; font-size: 11.5px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; white-space: nowrap; }
.lo-section-line-dark  { background: rgba(255,255,255,0.06); height: 1px; flex: 1; margin-left: 12px; }
.lo-section-line-light { background: rgba(59,130,246,0.1);   height: 1px; flex: 1; margin-left: 12px; }
.lo-section-icon-dark  { width: 26px; height: 26px; background: rgba(37,99,235,0.15); border: 1px solid rgba(59,130,246,0.2); border-radius: 7px; display: flex; align-items: center; justify-content: center; margin-right: 8px; flex-shrink: 0; }
.lo-section-icon-light { width: 26px; height: 26px; background: rgba(37,99,235,0.08); border: 1px solid rgba(59,130,246,0.15); border-radius: 7px; display: flex; align-items: center; justify-content: center; margin-right: 8px; flex-shrink: 0; }

/* ── Panels (section containers) ── */
.lo-panel-dark {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 14px;
  padding: 20px;
  transition: border-color .2s ease;
}
.lo-panel-dark:focus-within { border-color: rgba(59,130,246,0.2); }
.lo-panel-light {
  background: rgba(248,251,255,0.8);
  border: 1px solid rgba(59,130,246,0.08);
  border-radius: 14px;
  padding: 20px;
  transition: border-color .2s ease;
}
.lo-panel-light:focus-within { border-color: rgba(37,99,235,0.22); }

/* ── Inputs ── */
.lo-input-dark {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  color: rgba(220,232,255,0.9);
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13.5px; font-weight: 500;
  padding: 11px 14px;
  width: 100%;
  transition: border-color .2s ease, background .2s ease, box-shadow .2s ease;
  outline: none;
}
.lo-input-dark::placeholder { color: rgba(99,148,255,0.28); }
.lo-input-dark:focus {
  border-color: rgba(96,165,250,0.45);
  background: rgba(37,99,235,0.07);
  box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
}
.lo-input-dark:read-only {
  background: rgba(255,255,255,0.02);
  border-color: rgba(255,255,255,0.04);
  color: rgba(148,163,220,0.45);
  cursor: default;
}
.lo-input-light {
  background: #fff;
  border: 1px solid rgba(59,130,246,0.15);
  border-radius: 10px;
  color: #1e3a6a;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13.5px; font-weight: 500;
  padding: 11px 14px;
  width: 100%;
  transition: border-color .2s ease, background .2s ease, box-shadow .2s ease;
  outline: none;
  box-shadow: 0 1px 3px rgba(59,130,246,0.06);
}
.lo-input-light::placeholder { color: rgba(59,130,246,0.3); }
.lo-input-light:focus {
  border-color: rgba(37,99,235,0.4);
  box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
}
.lo-input-light:read-only {
  background: rgba(248,250,252,0.9);
  border-color: rgba(59,130,246,0.07);
  color: rgba(51,78,122,0.45);
  cursor: default;
}

/* Input with Rp prefix */
.lo-input-prefix-dark  { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: rgba(96,165,250,0.55); font-size: 13px; font-weight: 600; font-family: 'JetBrains Mono',monospace; pointer-events: none; }
.lo-input-prefix-light { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: #5a7ab5;             font-size: 13px; font-weight: 600; font-family: 'JetBrains Mono',monospace; pointer-events: none; }
.lo-input-mono { font-family: 'JetBrains Mono', monospace !important; font-size: 13px !important; }

/* ── Select ── */
.lo-select-dark {
  appearance: none; -webkit-appearance: none;
  background: rgba(255,255,255,0.04) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236394ff' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 14px center;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  color: rgba(220,232,255,0.9);
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13.5px; font-weight: 500;
  padding: 11px 36px 11px 14px;
  width: 100%; outline: none; cursor: pointer;
  transition: border-color .2s ease, background .2s ease, box-shadow .2s ease;
}
.lo-select-dark:focus { border-color: rgba(96,165,250,0.45); background-color: rgba(37,99,235,0.07); box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
.lo-select-dark option { background: #0d1a3a; color: rgba(220,232,255,0.9); }

.lo-select-light {
  appearance: none; -webkit-appearance: none;
  background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%232563eb' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 14px center;
  border: 1px solid rgba(59,130,246,0.15);
  border-radius: 10px;
  color: #1e3a6a;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13.5px; font-weight: 500;
  padding: 11px 36px 11px 14px;
  width: 100%; outline: none; cursor: pointer;
  transition: border-color .2s ease, background .2s ease, box-shadow .2s ease;
  box-shadow: 0 1px 3px rgba(59,130,246,0.06);
}
.lo-select-light:focus { border-color: rgba(37,99,235,0.4); box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }

/* ── Date input icon fix ── */
input[type="date"]::-webkit-calendar-picker-indicator { opacity: 0; position: absolute; right: 0; width: 40px; height: 100%; cursor: pointer; }
input[type="date"] { position: relative; }

/* ── Error hint ── */
.lo-error-dark  { color: #fca5a5; font-size: 11px; margin-top: 5px; display: flex; align-items: center; gap: 4px; font-weight: 500; }
.lo-error-light { color: #dc2626;  font-size: 11px; margin-top: 5px; display: flex; align-items: center; gap: 4px; font-weight: 500; }

/* ── File upload zone ── */
.lo-file-zone-dark {
  border: 1.5px dashed rgba(99,148,255,0.28);
  border-radius: 12px;
  background: rgba(37,99,235,0.03);
  transition: all .22s ease;
  cursor: pointer;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 32px 16px; text-align: center;
}
.lo-file-zone-dark:hover { border-color: rgba(96,165,250,0.5); background: rgba(37,99,235,0.07); box-shadow: 0 0 24px rgba(59,130,246,0.1); }
.lo-file-zone-light {
  border: 1.5px dashed rgba(59,130,246,0.25);
  border-radius: 12px;
  background: rgba(239,246,255,0.5);
  transition: all .22s ease;
  cursor: pointer;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 32px 16px; text-align: center;
}
.lo-file-zone-light:hover { border-color: rgba(37,99,235,0.45); background: rgba(219,234,254,0.4); box-shadow: 0 0 20px rgba(59,130,246,0.07); }
.lo-file-zone-uploading-dark  { border-color: rgba(245,158,11,0.4); background: rgba(245,158,11,0.04); }
.lo-file-zone-uploading-light { border-color: rgba(217,119,6,0.35);  background: rgba(255,251,235,0.7); }

/* ── File row ── */
.lo-file-row-dark {
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px; padding: 12px 14px;
  display: flex; align-items: center; justify-content: space-between;
  transition: all .18s ease;
}
.lo-file-row-dark:hover { background: rgba(37,99,235,0.07); border-color: rgba(96,165,250,0.2); }
.lo-file-row-light {
  background: #fff;
  border: 1px solid rgba(59,130,246,0.12);
  border-radius: 10px; padding: 12px 14px;
  display: flex; align-items: center; justify-content: space-between;
  transition: all .18s ease; box-shadow: 0 1px 4px rgba(59,130,246,0.05);
}
.lo-file-row-light:hover { border-color: rgba(37,99,235,0.28); box-shadow: 0 4px 14px rgba(59,130,246,0.08); }
.lo-file-row-new-dark  { border-color: rgba(52,211,153,0.22) !important; background: rgba(16,185,129,0.04) !important; }
.lo-file-row-new-light { border-color: rgba(16,185,129,0.18) !important; background: rgba(240,253,244,0.8) !important; }

/* ── File action buttons ── */
.lo-file-btn {
  width: 30px; height: 30px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  border: none; cursor: pointer; transition: all .15s ease;
  background: transparent;
}
.lo-file-btn.view-dark  { color: #60a5fa; } .lo-file-btn.view-dark:hover  { background: rgba(59,130,246,0.12); }
.lo-file-btn.edit-dark  { color: #fbbf24; } .lo-file-btn.edit-dark:hover  { background: rgba(245,158,11,0.12); }
.lo-file-btn.del-dark   { color: #f87171; } .lo-file-btn.del-dark:hover   { background: rgba(239,68,68,0.12);  }
.lo-file-btn.view-light { color: #2563eb; } .lo-file-btn.view-light:hover { background: rgba(37,99,235,0.09);  }
.lo-file-btn.edit-light { color: #d97706; } .lo-file-btn.edit-light:hover { background: rgba(245,158,11,0.1);  }
.lo-file-btn.del-light  { color: #dc2626; } .lo-file-btn.del-light:hover  { background: rgba(239,68,68,0.08);  }

/* ── File name & meta ── */
.lo-file-name-dark  { color: rgba(220,232,255,0.9); font-size: 13px; font-weight: 500; }
.lo-file-name-light { color: #1e3a6a; font-size: 13px; font-weight: 500; }
.lo-file-meta-dark  { color: rgba(99,148,255,0.5); font-size: 11px; margin-top: 2px; }
.lo-file-meta-light { color: #7a97c9; font-size: 11px; margin-top: 2px; }

/* ── Upload text ── */
.lo-upload-icon-dark  { color: rgba(96,165,250,0.5); margin-bottom: 12px; }
.lo-upload-icon-light { color: rgba(37,99,235,0.4); margin-bottom: 12px; }
.lo-upload-text-dark  { color: rgba(96,165,250,0.85); font-size: 13px; font-weight: 600; }
.lo-upload-text-light { color: #2563eb; font-size: 13px; font-weight: 600; }
.lo-upload-hint-dark  { color: rgba(99,148,255,0.38); font-size: 11px; margin-top: 5px; }
.lo-upload-hint-light { color: #93aacf; font-size: 11px; margin-top: 5px; }

/* ── Unsaved chip ── */
.lo-chip-unsaved-dark  { background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.28); color: #fcd34d; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 20px; letter-spacing: .03em; }
.lo-chip-unsaved-light { background: rgba(253,230,138,0.5);  border: 1px solid rgba(217,119,6,0.22);  color: #b45309;  font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 20px; letter-spacing: .03em; }

/* ── Buttons ── */
.lo-btn-cancel-dark {
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09);
  color: rgba(179,193,240,0.75); border-radius: 12px;
  font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 600;
  padding: 12px 24px; cursor: pointer;
  display: flex; align-items: center; gap: 8px; transition: all .2s ease;
}
.lo-btn-cancel-dark:hover { background: rgba(255,255,255,0.07); border-color: rgba(99,148,255,0.28); color: rgba(220,232,255,0.9); }
.lo-btn-cancel-light {
  background: #fff; border: 1px solid rgba(59,130,246,0.15);
  color: #4b6ea8; border-radius: 12px;
  font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 600;
  padding: 12px 24px; cursor: pointer;
  display: flex; align-items: center; gap: 8px; transition: all .2s ease;
  box-shadow: 0 1px 4px rgba(59,130,246,0.08);
}
.lo-btn-cancel-light:hover { background: #eff6ff; border-color: rgba(37,99,235,0.35); color: #1d4ed8; box-shadow: 0 4px 14px rgba(59,130,246,0.1); }

.lo-btn-submit {
  background: linear-gradient(135deg, #1d4ed8, #2563eb 50%, #4f46e5);
  border: none; color: white; border-radius: 12px;
  font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 700;
  padding: 12px 28px; cursor: pointer;
  display: flex; align-items: center; gap: 8px;
  box-shadow: 0 4px 18px rgba(37,99,235,0.38), 0 1px 0 rgba(255,255,255,0.12) inset;
  transition: all .22s cubic-bezier(0.22,1,0.36,1);
  position: relative; overflow: hidden;
}
.lo-btn-submit::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.12), transparent); opacity: 0; transition: opacity .2s ease; }
.lo-btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(37,99,235,0.48); }
.lo-btn-submit:hover:not(:disabled)::before { opacity: 1; }
.lo-btn-submit:active:not(:disabled) { transform: translateY(0); }
.lo-btn-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

/* ── Next status preview ── */
.lo-next-dark  { background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.2); border-radius: 10px; padding: 12px 16px; display: flex; align-items: center; gap: 10px; margin-bottom: 24px; }
.lo-next-light { background: rgba(238,242,255,0.9); border: 1px solid rgba(99,102,241,0.18); border-radius: 10px; padding: 12px 16px; display: flex; align-items: center; gap: 10px; margin-bottom: 24px; }

/* ── Divider ── */
.lo-divider-dark  { height: 1px; background: rgba(255,255,255,0.06); margin: 28px 0; }
.lo-divider-light { height: 1px; background: rgba(59,130,246,0.08);  margin: 28px 0; }

/* ── Spinner ── */
@keyframes spin { to { transform: rotate(360deg); } }
.lo-spinner { animation: spin 0.85s linear infinite; border-radius: 50%; }

/* ── Mount animation ── */
@keyframes loIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.lo-mounted { animation: loIn 0.5s cubic-bezier(0.22,1,0.36,1) forwards; }
.lo-opacity-0 { opacity: 0; }

/* ── Not found ── */
.lo-notfound-dark  { background: rgba(10,14,28,0.9); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 52px 40px; text-align: center; max-width: 440px; }
.lo-notfound-light { background: rgba(255,255,255,0.95); border: 1px solid rgba(59,130,246,0.12); border-radius: 20px; box-shadow: 0 20px 60px rgba(37,99,235,0.1); padding: 52px 40px; text-align: center; max-width: 440px; }

/* ── Breadcrumb ── */
.lo-breadcrumb-dark  { font-size: 11.5px; color: rgba(99,148,255,0.4); display: flex; align-items: center; gap: 5px; margin-bottom: 14px; }
.lo-breadcrumb-light { font-size: 11.5px; color: rgba(37,99,235,0.38); display: flex; align-items: center; gap: 5px; margin-bottom: 14px; }

/* ── Scrollbar ── */
.lo-root ::-webkit-scrollbar { width: 4px; }
.lo-root ::-webkit-scrollbar-track { background: transparent; }
.lo-root ::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.2); border-radius: 10px; }
`;

/* ═══════════════════════════════════════════════
   SUB-COMPONENTS (defined outside main component)
═══════════════════════════════════════════════ */

/** Section heading with horizontal rule */
const SectionHeading = ({ label, icon, isDark }) => (
  <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
    {icon && (
      <div className={isDark ? "lo-section-icon-dark" : "lo-section-icon-light"}>
        {icon}
      </div>
    )}
    <span className={isDark ? "lo-section-title-dark" : "lo-section-title-light"}>{label}</span>
    <div className={isDark ? "lo-section-line-dark" : "lo-section-line-light"} />
  </div>
);

/** Field wrapper: label + input + optional incomplete hint */
const Field = ({ label, children, name, checkForIncompleteData, isDark, style }) => (
  <div style={style}>
    <label className={isDark ? "lo-label-dark" : "lo-label-light"}>{label}</label>
    {children}
    {name && checkForIncompleteData && checkForIncompleteData(name) && (
      <p className={isDark ? "lo-error-dark" : "lo-error-light"}>
        <FiAlertCircle size={11} /> Data belum lengkap
      </p>
    )}
  </div>
);

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
const LengkapiOrder = () => {
  const { portofolio, id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const d = isDark;

  const [formData, setFormData]     = useState({});
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [mounted, setMounted]       = useState(false);

  const userData   = JSON.parse(localStorage.getItem("user") || "{}");
  const userPeran  = userData?.peran  || "";
  const userEmail  = userData?.email  || "";
  const userBidang = userData?.bidang || "";

  const [files, setFiles] = useState({
    siSpk: null, sertifikatPM06: null, sertifikat: null,
    invoice: null, fakturPajak: null,
  });
  const [filePreviews, setFilePreviews]     = useState({});
  const [uploadingFiles, setUploadingFiles] = useState({});
  const [currentStatusOrder, setCurrentStatusOrder] = useState("New Order");

  /* ── Helpers ── */
  const checkForIncompleteData = (field) =>
    !formData[field] || formData[field] === null || formData[field] === "";

  const dateLabels = {
    tanggalStatusOrder:               "Status Order",
    tanggalSerahOrderKeCs:            "Tanggal Penyerahan Order ke CS",
    tanggalPekerjaan:                 "Tanggal Pekerjaan",
    tanggalOrder:                     "Tanggal Order",
    tanggalPengirimanInvoice:         "Tanggal Pengiriman Invoice",
    tanggalPengirimanFaktur:          "Tanggal Pengiriman Faktur Pajak",
    proformaSerahKeOps:               "Tanggal Proforma ke Operasional",
    proformaBySistem:                 "Tanggal Proforma by Sistem",
    proformaSerahKeDukbis:            "Tanggal Proforma ke Dukbis",
    distribusiSertifikatPengirimTanggal: "Tanggal Pengiriman Sertifikat",
    distribusiSertifikatPenerimaTanggal: "Tanggal Diterima Sertifikat",
  };

  const formatDateForInput = (timestamp) => {
    if (!timestamp?.seconds) return "";
    return timestamp.toDate().toISOString().split("T")[0];
  };

  /* ── Access guard + single fetch ── */
  useEffect(() => {
    if (!userPeran) { alert("Anda tidak memiliki akses!"); navigate("/"); return; }
    if (userPeran === "admin portofolio" && userBidang !== portofolio) {
      alert("Anda tidak memiliki akses!"); navigate("/"); return;
    }
    setMounted(true);

    const fetchOrder = async () => {
      setLoading(true);
      try {
        const data = await getOrderById(id);
        if (data) {
          setFormData({
            ...data,
            jenisSertifikat: data.jenisSertifikat || "Tidak Terbit Sertifikat",
            tanggalStatusOrder:        data.tanggalStatusOrder instanceof Timestamp        ? data.tanggalStatusOrder : null,
            tanggalSerahOrderKeCs:     data.tanggalSerahOrderKeCs instanceof Timestamp     ? data.tanggalSerahOrderKeCs : null,
            tanggalPekerjaan:          data.tanggalPekerjaan instanceof Timestamp          ? data.tanggalPekerjaan : null,
            tanggalPengirimanInvoice:  data.tanggalPengirimanInvoice instanceof Timestamp  ? data.tanggalPengirimanInvoice : null,
            tanggalPengirimanFaktur:   data.tanggalPengirimanFaktur instanceof Timestamp   ? data.tanggalPengirimanFaktur : null,
          });
          setCurrentStatusOrder(data.statusOrder || "New Order");
        }
      } catch (err) {
        console.error("❌ Error fetching order:", err);
      }
      setLoading(false);
    };
    fetchOrder();
    return () => setMounted(false);
  }, [portofolio, userPeran, userBidang, id]);

  /* ── Field access config ── */
  const editableFields = {
    "admin portofolio": [
      "tanggalSerahOrderKeCs", "tanggalPekerjaan",
      "proformaSerahKeOps", "proformaSerahKeDukbis", "proformaBySistem",
      "noSiSpk", "jenisPekerjaan", "namaTongkang", "lokasiPekerjaan",
      "estimasiTonase", "tonaseDS", "nilaiProforma", "jenisSertifikat", "tanggalStatusOrder",
      ...(["batubara","ksp"].includes(portofolio) ? ["tonaseDS","keteranganSertifikatPM06","noSertifikatPM06"] : [])
    ],
    "customer service": ["nomorOrder", "tanggalOrder"],
    "admin keuangan":   ["tanggalStatusOrder","nilaiInvoice","tanggalPengirimanInvoice","tanggalPengirimanFaktur","nomorInvoice","fakturPajak","invoice"],
    "all":              ["distribusiSertifikatPengirim","distribusiSertifikatPengirimTanggal","distribusiSertifikatPenerima","distribusiSertifikatPenerimaTanggal"],
  };

  const getFieldsToShowByStatus = (status) => {
    switch (status) {
      case "New Order":             return ["nomorOrder","tanggalOrder"];
      case "Entry":                 return ["tanggalPekerjaan","tonaseDS","jenisPekerjaan","namaTongkang","lokasiPekerjaan","estimasiTonase","noSiSpk"];
      case "Diproses - Lapangan":   return ["keteranganSertifikatPM06","jenisSertifikat","noSertifikatPM06"];
      case "Diproses - Sertifikat": return ["tanggalStatusOrder"];
      case "Closed Order":          return ["proformaSerahKeOps","proformaSerahKeDukbis","proformaBySistem","nilaiProforma"];
      case "Penerbitan Proforma":   return ["tanggalPengirimanInvoice","tanggalPengirimanFaktur","nomorInvoice","invoice","fakturPajak","nilaiInvoice"];
      case "Invoice":               return ["distribusiSertifikatPengirim","distribusiSertifikatPengirimTanggal","distribusiSertifikatPenerima","distribusiSertifikatPenerimaTanggal"];
      default: return [];
    }
  };

  const fieldsToShow          = [...(editableFields[userPeran] || []), ...editableFields["all"]];
  const fieldsToShowByStatus  = getFieldsToShowByStatus(currentStatusOrder);
  const shouldShowField       = (fieldName) =>
    fieldsToShow.includes(fieldName) && fieldsToShowByStatus.includes(fieldName);

  /* ── Event handlers ── */
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let newValue = value.trim() === "" ? null : value;
    if (type === "number") newValue = value ? Number(value) : null;
    else if (type === "checkbox") newValue = e.target.checked;
    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    const parsed = value ? new Date(value) : null;
    const newValue = parsed && !isNaN(parsed) ? Timestamp.fromDate(parsed) : null;
    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleFormattedProforma = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    setFormData(prev => ({ ...prev, nilaiProforma: raw ? Number(raw).toLocaleString("id-ID") : "", nilaiProformaRaw: raw }));
  };

  const handleFormattedInvoice = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    setFormData(prev => ({ ...prev, nilaiInvoice: raw ? Number(raw).toLocaleString("id-ID") : "", nilaiInvoiceRaw: raw }));
  };

  const handleFileChange = (e) => {
    const { name, files: fl } = e.target;
    if (!fl?.length) return;
    const file = fl[0];
    const allowed = ["application/pdf","image/jpeg","image/png"];
    if (!allowed.includes(file.type)) { alert("Tipe file tidak didukung. Gunakan PDF atau JPEG/PNG."); return; }
    if (file.size > 5 * 1024 * 1024)  { alert("File terlalu besar. Maksimal 5 MB."); return; }
    setFiles(prev => ({ ...prev, [name]: file }));
    setFormData(prev => ({
      ...prev,
      documents: { ...prev.documents, [name]: { fileName: file.name, fileUrl: "", uploadedBy: userEmail, uploadedAt: Timestamp.now() } },
    }));
    setFilePreviews(prev => ({
      ...prev,
      [name]: { fileName: file.name, fileSize: (file.size / 1024).toFixed(1) + " KB", fileType: file.type },
    }));
  };

  const handleDeleteFile = async (fileKey) => {
    if (!formData.documents?.[fileKey]) { alert("File tidak ditemukan!"); return; }
    if (!window.confirm(`Hapus file "${formData.documents[fileKey].fileName}"?`)) return;
    setLoading(true);
    try {
      const updatedDocs = { ...formData.documents };
      delete updatedDocs[fileKey];
      await updateOrder(id, { ...formData, documents: updatedDocs, updatedAt: Timestamp.now() });
      setFormData(prev => ({ ...prev, documents: updatedDocs }));
      setFiles(prev => ({ ...prev, [fileKey]: null }));
    } catch { alert("Terjadi kesalahan saat menghapus file."); }
    finally { setLoading(false); }
  };

  const uploadFile = async (fileKey, file) => {
    if (!file) return null;
    setUploadingFiles(prev => ({ ...prev, [fileKey]: true }));
    try {
      const url = await uploadToCloudinary(file);
      return { key: fileKey, fileUrl: url, fileName: file.name };
    } catch { return null; }
    finally { setUploadingFiles(prev => ({ ...prev, [fileKey]: false })); }
  };

  /* ── Validation ── */
  const validateFormData = () => {
    const errors = [];
    if (userPeran === "admin keuangan") {
      const hasFPNum  = formData.fakturPajak?.trim();
      const hasFPFile = formData.documents?.fakturPajak || files.fakturPajak;
      if (!!hasFPNum !== !!hasFPFile)
        errors.push("Nomor Faktur Pajak dan file harus diisi bersamaan.");
      const hasInvNum  = formData.nomorInvoice?.trim();
      const hasInvFile = formData.documents?.invoice || files.invoice;
      if (!!hasInvNum !== !!hasInvFile)
        errors.push("Nomor Invoice dan file harus diisi bersamaan.");
    }
    if (userPeran === "admin portofolio") {
      const hasSiNum  = formData.noSiSpk?.trim();
      const hasSiFile = formData.documents?.siSpk || files.siSpk;
      if (!!hasSiNum !== !!hasSiFile)
        errors.push("Nomor SI/SPK dan file harus diisi bersamaan.");
      if (formData.keteranganSertifikatPM06 === "Ada") {
        if (!formData.noSertifikatPM06?.trim() || !(formData.documents?.sertifikatPM06 || files.sertifikatPM06))
          errors.push("Nomor & file Sertifikat PM06 wajib diisi jika keterangan 'Ada'.");
      }
      const jenis = formData.jenisSertifikat;
      if (jenis && jenis !== "-" && jenis !== "Tidak Terbit Sertifikat") {
        if (!formData.noSertifikat?.trim() || !(formData.documents?.sertifikat || files.sertifikat))
          errors.push("Nomor & file Sertifikat wajib diisi untuk jenis sertifikat ini.");
      }
    }
    return errors;
  };

  const checkRequiredFields = (status) => {
    const map = {
      "New Order":            ["pelanggan","nomorOrder","tanggalOrder"],
      "Entry":                ["tanggalPekerjaan","tonaseDS"],
      "Diproses - Lapangan":  ["keteranganSertifikatPM06","jenisSertifikat"],
      "Diproses - Sertifikat":["tanggalStatusOrder"],
      "Closed Order":         ["proformaSerahKeOps","proformaSerahKeDukbis","proformaBySistem","nilaiProforma"],
      "Penerbitan Proforma":  ["tanggalPengirimanInvoice","tanggalPengirimanFaktur","nomorInvoice","nilaiInvoice"],
      "Invoice":              ["distribusiSertifikatPengirim","distribusiSertifikatPengirimTanggal","distribusiSertifikatPenerima","distribusiSertifikatPenerimaTanggal"],
    };
    return (map[status] || []).filter(f => !formData[f] || formData[f] === "");
  };

  const checkDistributionFields = () =>
    ["distribusiSertifikatPengirim","distribusiSertifikatPengirimTanggal","distribusiSertifikatPenerima","distribusiSertifikatPenerimaTanggal"]
      .every(f => formData[f] && formData[f] !== "");

  const getNextStatus = (status) => {
    const list = ["New Order","Entry","Diproses - Lapangan","Diproses - Sertifikat","Closed Order","Penerbitan Proforma","Invoice","Selesai"];
    const idx = list.indexOf(status);
    return (idx === -1 || idx === list.length - 1) ? null : list[idx + 1];
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateFormData();
    if (validationErrors.length > 0) {
      alert("Perlu diperbaiki:\n" + validationErrors.join("\n"));
      return;
    }
    const missingFields = checkRequiredFields(formData.statusOrder);
    if (missingFields.length > 0) {
      alert(`Field berikut harus diisi untuk status '${formData.statusOrder}':\n${missingFields.join(", ")}`);
      return;
    }
    const nextStatus = getNextStatus(formData.statusOrder);
    if (!nextStatus) { alert("Status sudah berada di tahap terakhir."); return; }

    // If Invoice → all distribution done → jump straight to Selesai
    const finalStatus = (formData.statusOrder === "Invoice" && checkDistributionFields())
      ? "Selesai"
      : nextStatus;

    let statusDate;
    if (nextStatus === "Closed Order" && formData.tanggalStatusOrder) {
      statusDate = formData.tanggalStatusOrder;
    } else {
      statusDate = Timestamp.now();
    }

    const parseNum = (v) =>
      typeof v === "string" ? Number(v.replace(/\./g, "")) : (typeof v === "number" ? v : null);

    const payload = {
      ...formData,
      statusOrder:         finalStatus,
      tanggalStatusOrder:  statusDate,
      nilaiProforma:       parseNum(formData.nilaiProforma),
      nilaiInvoice:        parseNum(formData.nilaiInvoice),
    };

    setLoading(true); setSaving(true);
    try {
      const existingData = await getOrderById(id);
      const newFileKeys  = Object.keys(files).filter(k => files[k] !== null);
      const uploaded     = await Promise.all(newFileKeys.map(k => uploadFile(k, files[k])));
      const uploadedDocs = uploaded.reduce((acc, f) => {
        if (f) acc[f.key] = { fileName: f.fileName, fileUrl: f.fileUrl, uploadedBy: userEmail, uploadedAt: Timestamp.now() };
        return acc;
      }, {});

      const updatedData = {
        ...existingData, ...payload,
        updatedAt:     Timestamp.now(),
        lastUpdatedBy: userEmail,
        documents:     { ...formData.documents, ...uploadedDocs },
      };
      await updateOrder(id, updatedData);
      setFiles({ siSpk: null, sertifikatPM06: null, sertifikat: null, invoice: null, fakturPajak: null });
      setFilePreviews({});
      alert("Data berhasil diperbarui!");
      navigate(`/orders/${portofolio}/detail/${id}`);
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menyimpan. Silakan coba lagi.");
    } finally {
      setLoading(false); setSaving(false);
    }
  };

  /* ═══════════════════════════════════════
     renderFileUpload
  ═══════════════════════════════════════ */
  const renderFileUpload = (fileKey, displayName) => {
    const hasExisting = formData.documents?.[fileKey];
    const hasNew      = files[fileKey] || filePreviews[fileKey];
    const isUploading = uploadingFiles[fileKey];
    const mode        = d ? "dark" : "light";

    const iconColor = d ? "#60a5fa" : "#2563eb";

    return (
      <div style={{ marginBottom: 16 }}>
        <label className={`lo-label-${mode}`} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <FiFile size={12} style={{ opacity: .6, flexShrink: 0 }} />
          {displayName}
        </label>

        {/* Existing file */}
        {hasExisting && !hasNew ? (
          <div className={`lo-file-row-${mode}`}>
            <div style={{ flex: 1, minWidth: 0, marginRight: 10 }}>
              <p className={`lo-file-name-${mode}`} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {formData.documents[fileKey].fileName}
              </p>
              <p className={`lo-file-meta-${mode}`}>
                {formData.documents[fileKey].uploadedBy} · {
                  new Date(formData.documents[fileKey].uploadedAt.seconds * 1000)
                    .toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
                }
              </p>
            </div>
            <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
              <a href={formData.documents[fileKey].fileUrl} target="_blank" rel="noopener noreferrer"
                className={`lo-file-btn view-${mode}`} title="Lihat file">
                <FiEye size={14} />
              </a>
              <label className={`lo-file-btn edit-${mode}`} title="Ganti file" style={{ cursor: "pointer" }}>
                <FiEdit size={14} />
                <input type="file" name={fileKey} onChange={handleFileChange} style={{ display: "none" }} />
              </label>
              <button type="button" className={`lo-file-btn del-${mode}`} title="Hapus file"
                onClick={() => handleDeleteFile(fileKey)}>
                <FiTrash2 size={14} />
              </button>
            </div>
          </div>

        /* New (unsaved) file */
        ) : hasNew ? (
          <div className={`lo-file-row-${mode} lo-file-row-new-${mode}`}>
            <div style={{ flex: 1, minWidth: 0, marginRight: 10 }}>
              <p className={`lo-file-name-${mode}`} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {filePreviews[fileKey]?.fileName || files[fileKey]?.name || "File baru"}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                <p className={`lo-file-meta-${mode}`}>{filePreviews[fileKey]?.fileSize || ""}</p>
                <span className={`lo-chip-unsaved-${mode}`}>Belum disimpan</span>
              </div>
            </div>
            <button type="button" className={`lo-file-btn del-${mode}`} title="Batalkan"
              onClick={() => {
                setFiles(p => ({ ...p, [fileKey]: null }));
                setFilePreviews(p => { const u = { ...p }; delete u[fileKey]; return u; });
              }}>
              <FiTrash2 size={14} />
            </button>
          </div>

        /* Upload zone */
        ) : (
          <div style={{ position: "relative" }}>
            <input
              type="file" name={fileKey} onChange={handleFileChange} disabled={isUploading}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, zIndex: 10, cursor: isUploading ? "not-allowed" : "pointer" }}
            />
            <div className={`lo-file-zone-${mode} ${isUploading ? `lo-file-zone-uploading-${mode}` : ""}`}>
              {isUploading ? (
                <>
                  <div className="lo-spinner" style={{ width: 28, height: 28, borderWidth: 2.5, borderStyle: "solid", borderColor: d ? "rgba(245,158,11,0.25)" : "rgba(217,119,6,0.2)", borderTopColor: d ? "#fbbf24" : "#d97706", marginBottom: 10 }} />
                  <span style={{ fontSize: 13, color: d ? "#fcd34d" : "#b45309", fontWeight: 600 }}>Mengunggah…</span>
                </>
              ) : (
                <>
                  <div className={`lo-upload-icon-${mode}`}>
                    <FiUpload size={26} />
                  </div>
                  <p className={`lo-upload-text-${mode}`}>Klik untuk unggah file</p>
                  <p className={`lo-upload-hint-${mode}`}>PDF · JPEG · PNG — maks. 5 MB</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ═══════════════════════════════════════
     Render helpers
  ═══════════════════════════════════════ */
  const inputCls  = `lo-input-${d ? "dark" : "light"}`;
  const selectCls = `lo-select-${d ? "dark" : "light"}`;
  const panelCls  = `lo-panel-${d ? "dark" : "light"}`;
  const T         = (dk, lt) => d ? dk : lt;
  const iconColor = d ? "#60a5fa" : "#2563eb";
  const nextStatus = formData.statusOrder ? getNextStatus(formData.statusOrder) : null;

  /* ── Loading screen ── */
  if (loading && !mounted) {
    return (
      <>
        <style>{STYLES}</style>
        <div className={`lo-root lo-page-${T("dark","light")}`}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
          <div style={{ textAlign: "center" }}>
            <div className="lo-spinner" style={{ width: 44, height: 44, borderWidth: 3, borderStyle: "solid", borderColor: "rgba(59,130,246,0.15)", borderTopColor: "#3b82f6", margin: "0 auto 18px" }} />
            <p style={{ color: T("rgba(148,163,220,0.7)","#6b8cbf"), fontSize: 14, fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 500 }}>
              Memuat data order…
            </p>
          </div>
        </div>
      </>
    );
  }

  /* ── Not found screen ── */
  if (!formData.statusOrder && !loading) {
    return (
      <>
        <style>{STYLES}</style>
        <div className={`lo-root lo-page-${T("dark","light")}`}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24 }}>
          <div className={`lo-notfound-${T("dark","light")}`}>
            <div style={{ width: 52, height: 52, background: T("rgba(239,68,68,0.1)","rgba(254,242,242,0.9)"), border: `1px solid ${T("rgba(239,68,68,0.2)","rgba(239,68,68,0.18)")}`, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
              <FiAlertCircle size={22} color={T("#f87171","#dc2626")} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: T("rgba(220,232,255,0.9)","#0c1e45"), marginBottom: 8 }}>Data Tidak Ditemukan</h2>
            <p style={{ fontSize: 14, color: T("rgba(148,163,220,0.6)","#5a7ab5"), marginBottom: 28, lineHeight: 1.6 }}>
              Order yang Anda cari tidak dapat ditemukan atau telah dihapus.
            </p>
            <button className="lo-btn-submit" onClick={() => navigate(`/orders/${portofolio}`)}>
              <FiArrowLeft size={14} /> Kembali ke Daftar
            </button>
          </div>
        </div>
      </>
    );
  }

  /* ═══════════════════════════════════════
     MAIN RENDER
  ═══════════════════════════════════════ */
  return (
    <>
      <style>{STYLES}</style>
      <div className={`lo-root lo-page-${T("dark","light")}`} style={{ padding: "32px 16px 72px" }}>
        <div className={`lo-mounted`} style={{ maxWidth: 840, margin: "0 auto" }}>

          {/* ── Breadcrumb ── */}
          <div className={T("lo-breadcrumb-dark","lo-breadcrumb-light")}>
            <span style={{ cursor: "pointer", opacity: .7 }} onClick={() => navigate("/")}>Beranda</span>
            <FiChevronRight size={11} />
            <span style={{ cursor: "pointer", opacity: .7 }} onClick={() => navigate(`/orders/${portofolio}`)}>
              Order {portofolio}
            </span>
            <FiChevronRight size={11} />
            <span style={{ cursor: "pointer", opacity: .7 }} onClick={() => navigate(`/orders/${portofolio}/detail/${id}`)}>
              Detail
            </span>
            <FiChevronRight size={11} />
            <span style={{ fontWeight: 700, color: T("rgba(147,197,253,0.75)","#2563eb") }}>Lengkapi Data</span>
          </div>

          {/* ── Main Card ── */}
          <div className={`lo-card-${T("dark","light")}`}>
            <div className="lo-accent" />

            {/* ── Card header ── */}
            <div className={`lo-card-header-${T("dark","light")}`}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <h2 className={T("lo-title-dark","lo-title-light")}>Lengkapi Data Order</h2>
                  <p className={T("lo-sub-dark","lo-sub-light")}>
                    Form disesuaikan untuk peran{" "}
                    <span style={{ fontWeight: 700, color: T("#93c5fd","#1d4ed8") }}>{userPeran}</span>
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
                  <span className={T("lo-badge-dark","lo-badge-light")}>{portofolio}</span>
                  {formData.statusOrder && (
                    <span className={T("lo-status-dark","lo-status-light")}>{formData.statusOrder}</span>
                  )}
                </div>
              </div>

              {/* Next status preview */}
              {nextStatus && (
                <div className={T("lo-next-dark","lo-next-light")} style={{ marginTop: 18 }}>
                  <div style={{ width: 28, height: 28, background: T("rgba(99,102,241,0.2)","rgba(99,102,241,0.1)"), border: `1px solid ${T("rgba(99,102,241,0.3)","rgba(99,102,241,0.2)")}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <FiCheck size={14} color={T("#a78bfa","#6366f1")} />
                  </div>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 600, color: T("rgba(167,139,250,0.7)","rgba(99,102,241,0.6)"), letterSpacing: ".07em", textTransform: "uppercase", marginBottom: 2 }}>
                      Status berikutnya setelah simpan
                    </p>
                    <p style={{ fontSize: 13.5, fontWeight: 700, color: T("#a78bfa","#4f46e5") }}>{nextStatus}</p>
                  </div>
                </div>
              )}
            </div>

            {/* ═══════════════════════════════════
                FORM BODY
            ═══════════════════════════════════ */}
            <form onSubmit={handleSubmit} style={{ padding: "28px 32px" }}>

              {/* Pelanggan read-only */}
              <div style={{ marginBottom: 24 }}>
                <SectionHeading
                  label="Informasi Pelanggan" isDark={d}
                  icon={<FiUser size={12} color={iconColor} />}
                />
                <Field label="Nama Pelanggan" isDark={d}>
                  <input
                    type="text" value={formData.pelanggan || ""}
                    className={`${inputCls} lo-input-mono`} readOnly
                    style={{ opacity: .7 }}
                  />
                </Field>
              </div>

              {/* ── Tanggal Closed (admin portofolio / admin keuangan) ── */}
              {(userPeran === "admin portofolio" || userPeran === "admin keuangan") &&
                formData.statusOrder === "Diproses - Sertifikat" &&
                shouldShowField("tanggalStatusOrder") && (
                <div style={{ marginBottom: 24 }}>
                  <SectionHeading
                    label="Tanggal Closed" isDark={d}
                    icon={<FiCalendar size={12} color={iconColor} />}
                  />
                  <div className={panelCls}>
                    <Field label="Pilih Tanggal Closed" name="tanggalStatusOrder"
                      checkForIncompleteData={checkForIncompleteData} isDark={d}>
                      <div style={{ position: "relative" }}>
                        <FiCalendar size={14} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: T("rgba(96,165,250,0.5)","#5a7ab5"), pointerEvents: "none", zIndex: 1 }} />
                        <input
                          type="date" name="tanggalStatusOrder"
                          value={formData.tanggalStatusOrder ? formatDateForInput(formData.tanggalStatusOrder) : ""}
                          onChange={handleDateChange}
                          className={inputCls} style={{ paddingLeft: 36 }}
                        />
                      </div>
                    </Field>
                  </div>
                </div>
              )}

              {/* ── Admin Portofolio: Data Pekerjaan ── */}
              {userPeran === "admin portofolio" &&
                ["jenisPekerjaan","namaTongkang","lokasiPekerjaan","estimasiTonase","tonaseDS","noSiSpk","nilaiProforma"]
                  .some(f => shouldShowField(f)) && (
                <div style={{ marginBottom: 24 }}>
                  <SectionHeading
                    label="Data Pekerjaan" isDark={d}
                    icon={<FiBriefcase size={12} color={iconColor} />}
                  />
                  <div className={panelCls}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                      {shouldShowField("jenisPekerjaan") && (
                        <Field label="Jenis Pekerjaan" name="jenisPekerjaan"
                          checkForIncompleteData={checkForIncompleteData} isDark={d}>
                          <input type="text" name="jenisPekerjaan" value={formData.jenisPekerjaan || ""} onChange={handleChange} className={inputCls} placeholder="Contoh: Analisa Batubara" />
                        </Field>
                      )}
                      {shouldShowField("namaTongkang") && (
                        <Field label="Nama Tongkang" name="namaTongkang"
                          checkForIncompleteData={checkForIncompleteData} isDark={d}>
                          <input type="text" name="namaTongkang" value={formData.namaTongkang || ""} onChange={handleChange} className={inputCls} placeholder="Nama kapal/tongkang" />
                        </Field>
                      )}
                      {shouldShowField("lokasiPekerjaan") && (
                        <Field label="Lokasi Pekerjaan" name="lokasiPekerjaan"
                          checkForIncompleteData={checkForIncompleteData} isDark={d}>
                          <input type="text" name="lokasiPekerjaan" value={formData.lokasiPekerjaan || ""} onChange={handleChange} className={inputCls} placeholder="Lokasi pekerjaan" />
                        </Field>
                      )}
                      {shouldShowField("estimasiTonase") && (
                        <Field label="Estimasi Kuantitas" name="estimasiTonase"
                          checkForIncompleteData={checkForIncompleteData} isDark={d}>
                          <input type="text" name="estimasiTonase" value={formData.estimasiTonase || ""} onChange={handleChange} className={inputCls} placeholder="Estimasi kuantitas" />
                        </Field>
                      )}
                      {shouldShowField("tonaseDS") && (
                        <Field label="Tonase DS" name="tonaseDS"
                          checkForIncompleteData={checkForIncompleteData} isDark={d}>
                          <input type="number" name="tonaseDS" value={formData.tonaseDS || ""} onChange={handleChange} className={inputCls} placeholder="0" />
                        </Field>
                      )}
                      {shouldShowField("noSiSpk") && (
                        <Field label="Nomor SI/SPK" name="noSiSpk"
                          checkForIncompleteData={checkForIncompleteData} isDark={d}>
                          <input type="text" name="noSiSpk" value={formData.noSiSpk || ""} onChange={handleChange} className={`${inputCls} lo-input-mono`} placeholder="No. SI/SPK" />
                        </Field>
                      )}
                      {shouldShowField("nilaiProforma") && (
                        <Field label="Nilai Proforma (PAD)" name="nilaiProforma"
                          checkForIncompleteData={checkForIncompleteData} isDark={d}>
                          <div style={{ position: "relative" }}>
                            <span className={`lo-input-prefix-${T("dark","light")}`}>Rp</span>
                            <input type="text" name="nilaiProforma" value={formData.nilaiProforma || ""} onChange={handleFormattedProforma} className={`${inputCls} lo-input-mono`} style={{ paddingLeft: 36 }} placeholder="0" />
                          </div>
                        </Field>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Customer Service: Data Order ── */}
              {userPeran === "customer service" && shouldShowField("nomorOrder") && (
                <div style={{ marginBottom: 24 }}>
                  <SectionHeading
                    label="Data Order" isDark={d}
                    icon={<FiFileText size={12} color={iconColor} />}
                  />
                  <div className={panelCls}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                      <Field label="Nomor Order" name="nomorOrder"
                        checkForIncompleteData={checkForIncompleteData} isDark={d}>
                        <input type="text" name="nomorOrder" value={formData.nomorOrder || ""} onChange={handleChange} className={`${inputCls} lo-input-mono`} placeholder="No. Order" />
                      </Field>
                      {shouldShowField("tanggalOrder") && (
                        <Field label="Tanggal Order" name="tanggalOrder"
                          checkForIncompleteData={checkForIncompleteData} isDark={d}>
                          <div style={{ position: "relative" }}>
                            <FiCalendar size={14} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: T("rgba(96,165,250,0.5)","#5a7ab5"), pointerEvents: "none", zIndex: 1 }} />
                            <input type="date" name="tanggalOrder"
                              value={formData.tanggalOrder ? formatDateForInput(formData.tanggalOrder) : ""}
                              onChange={handleDateChange} className={inputCls} style={{ paddingLeft: 36 }} />
                          </div>
                        </Field>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Admin Keuangan: Data Keuangan ── */}
              {userPeran === "admin keuangan" &&
                ["nomorInvoice","fakturPajak","nilaiInvoice"].some(f => shouldShowField(f)) && (
                <div style={{ marginBottom: 24 }}>
                  <SectionHeading
                    label="Data Keuangan" isDark={d}
                    icon={<FiDollarSign size={12} color={iconColor} />}
                  />
                  <div className={panelCls}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                      {shouldShowField("nomorInvoice") && (
                        <Field label="Nomor Invoice" name="nomorInvoice"
                          checkForIncompleteData={checkForIncompleteData} isDark={d}>
                          <input type="text" name="nomorInvoice" value={formData.nomorInvoice || ""} onChange={handleChange} className={`${inputCls} lo-input-mono`} placeholder="No. Invoice" />
                        </Field>
                      )}
                      {shouldShowField("fakturPajak") && (
                        <Field label="Nomor Seri Faktur Pajak" name="fakturPajak"
                          checkForIncompleteData={checkForIncompleteData} isDark={d}>
                          <input type="text" name="fakturPajak" value={formData.fakturPajak || ""} onChange={handleChange} className={`${inputCls} lo-input-mono`} placeholder="No. Seri Faktur" />
                        </Field>
                      )}
                      {shouldShowField("nilaiInvoice") && (
                        <Field label="Nilai Invoice (Fee)" name="nilaiInvoice"
                          checkForIncompleteData={checkForIncompleteData} isDark={d}>
                          <div style={{ position: "relative" }}>
                            <span className={`lo-input-prefix-${T("dark","light")}`}>Rp</span>
                            <input type="text" name="nilaiInvoice" value={formData.nilaiInvoice || ""} onChange={handleFormattedInvoice} className={`${inputCls} lo-input-mono`} style={{ paddingLeft: 36 }} placeholder="0" />
                          </div>
                        </Field>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Distribusi Sertifikat (all roles) ── */}
              {["distribusiSertifikatPengirim","distribusiSertifikatPenerima"].some(f => shouldShowField(f)) && (
                <div style={{ marginBottom: 24 }}>
                  <SectionHeading
                    label="Distribusi Sertifikat" isDark={d}
                    icon={<FiSend size={12} color={iconColor} />}
                  />
                  <div className={panelCls}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                      {shouldShowField("distribusiSertifikatPengirim") && (
                        <Field label="Nama Pengirim Sertifikat" name="distribusiSertifikatPengirim"
                          checkForIncompleteData={checkForIncompleteData} isDark={d}>
                          <input type="text" name="distribusiSertifikatPengirim" value={formData.distribusiSertifikatPengirim || ""} onChange={handleChange} className={inputCls} placeholder="Nama pengirim" />
                        </Field>
                      )}
                      {shouldShowField("distribusiSertifikatPenerima") && (
                        <Field label="Nama Penerima Sertifikat" name="distribusiSertifikatPenerima"
                          checkForIncompleteData={checkForIncompleteData} isDark={d}>
                          <input type="text" name="distribusiSertifikatPenerima" value={formData.distribusiSertifikatPenerima || ""} onChange={handleChange} className={inputCls} placeholder="Nama penerima" />
                        </Field>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Tanggal fields (non-status, non-distribusi) ── */}
              {Object.keys(dateLabels).some(k =>
                k !== "tanggalStatusOrder" &&
                !["distribusiSertifikatPengirimTanggal","distribusiSertifikatPenerimaTanggal"].includes(k) &&
                fieldsToShow.includes(k) && fieldsToShowByStatus.includes(k)
              ) && (
                <div style={{ marginBottom: 24 }}>
                  <SectionHeading
                    label="Informasi Tanggal" isDark={d}
                    icon={<FiCalendar size={12} color={iconColor} />}
                  />
                  <div className={panelCls}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                      {Object.keys(dateLabels).map(key => {
                        if (key === "tanggalStatusOrder") return null;
                        if (["distribusiSertifikatPengirimTanggal","distribusiSertifikatPenerimaTanggal"].includes(key)) return null;
                        if (!fieldsToShow.includes(key) || !fieldsToShowByStatus.includes(key)) return null;
                        return (
                          <Field key={key} label={dateLabels[key]} name={key}
                            checkForIncompleteData={checkForIncompleteData} isDark={d}>
                            <div style={{ position: "relative" }}>
                              <FiCalendar size={14} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: T("rgba(96,165,250,0.5)","#5a7ab5"), pointerEvents: "none", zIndex: 1 }} />
                              <input type="date" name={key}
                                value={formData[key] ? formatDateForInput(formData[key]) : ""}
                                onChange={handleDateChange} className={inputCls} style={{ paddingLeft: 36 }} />
                            </div>
                          </Field>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Tanggal Distribusi ── */}
              {["distribusiSertifikatPengirimTanggal","distribusiSertifikatPenerimaTanggal"].some(k =>
                fieldsToShow.includes(k) && fieldsToShowByStatus.includes(k)
              ) && (
                <div className={panelCls} style={{ marginBottom: 24 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                    {["distribusiSertifikatPengirimTanggal","distribusiSertifikatPenerimaTanggal"].map(key => {
                      if (!fieldsToShow.includes(key) || !fieldsToShowByStatus.includes(key)) return null;
                      return (
                        <Field key={key} label={dateLabels[key]} name={key}
                          checkForIncompleteData={checkForIncompleteData} isDark={d}>
                          <div style={{ position: "relative" }}>
                            <FiCalendar size={14} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: T("rgba(96,165,250,0.5)","#5a7ab5"), pointerEvents: "none", zIndex: 1 }} />
                            <input type="date" name={key}
                              value={formData[key] ? formatDateForInput(formData[key]) : ""}
                              onChange={handleDateChange} className={inputCls} style={{ paddingLeft: 36 }} />
                          </div>
                        </Field>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Sertifikat PM06 ── */}
              {shouldShowField("keteranganSertifikatPM06") && userPeran === "admin portofolio" && (
                <div style={{ marginBottom: 24 }}>
                  <SectionHeading
                    label="Sertifikat PM06" isDark={d}
                    icon={<FiFileText size={12} color={iconColor} />}
                  />
                  <div className={panelCls}>
                    <Field label="Keterangan Sertifikat PM06" isDark={d}>
                      <select name="keteranganSertifikatPM06" value={formData.keteranganSertifikatPM06 || ""} onChange={handleChange} className={selectCls}>
                        {["Tidak Ada","Ada"].map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </Field>
                    {formData.keteranganSertifikatPM06 === "Ada" && (
                      <div style={{ marginTop: 16 }}>
                        <Field label="Nomor Sertifikat PM06" name="noSertifikatPM06"
                          checkForIncompleteData={checkForIncompleteData} isDark={d}>
                          <input type="text" name="noSertifikatPM06" value={formData.noSertifikatPM06 || ""} onChange={handleChange} className={`${inputCls} lo-input-mono`} placeholder="No. Sertifikat PM06" />
                        </Field>
                        <div style={{ marginTop: 16 }}>
                          {renderFileUpload("sertifikatPM06", "Upload File Sertifikat PM06")}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Jenis Sertifikat ── */}
              {shouldShowField("jenisSertifikat") && userPeran === "admin portofolio" && (
                <div style={{ marginBottom: 24 }}>
                  <SectionHeading
                    label="Informasi Sertifikat" isDark={d}
                    icon={<FiFileText size={12} color={iconColor} />}
                  />
                  <div className={panelCls}>
                    <Field label="Jenis Sertifikat" isDark={d}>
                      <select name="jenisSertifikat" value={formData.jenisSertifikat || "-"} onChange={handleChange} className={selectCls}>
                        {["-","Tidak Terbit Sertifikat","LOADING","LS (PIK)","SERTIFIKAT","LAPORAN","KALIBRASI","HALAL"]
                          .map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </Field>
                    {formData.jenisSertifikat && formData.jenisSertifikat !== "-" && formData.jenisSertifikat !== "Tidak Terbit Sertifikat" && (
                      <div style={{ marginTop: 16 }}>
                        <Field label="Nomor Sertifikat" name="noSertifikat"
                          checkForIncompleteData={checkForIncompleteData} isDark={d}>
                          <input type="text" name="noSertifikat" value={formData.noSertifikat || ""} onChange={handleChange} className={`${inputCls} lo-input-mono`} placeholder="No. Sertifikat" />
                        </Field>
                        <div style={{ marginTop: 16 }}>
                          {renderFileUpload("sertifikat", "Upload File Sertifikat")}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Dokumen Pendukung ── */}
              {(
                (shouldShowField("siSpk") && userPeran === "admin portofolio") ||
                (shouldShowField("invoice") && userPeran === "admin keuangan") ||
                (shouldShowField("fakturPajak") && userPeran === "admin keuangan")
              ) && (
                <div style={{ marginBottom: 24 }}>
                  <SectionHeading
                    label="Dokumen Pendukung" isDark={d}
                    icon={<FiFile size={12} color={iconColor} />}
                  />
                  <div className={panelCls}>
                    {shouldShowField("siSpk") && userPeran === "admin portofolio" && renderFileUpload("siSpk", "Dokumen SI/SPK")}
                    {shouldShowField("invoice") && userPeran === "admin keuangan" && renderFileUpload("invoice", "Dokumen Invoice")}
                    {shouldShowField("fakturPajak") && userPeran === "admin keuangan" && renderFileUpload("fakturPajak", "Dokumen Faktur Pajak")}
                  </div>
                </div>
              )}

              {/* ── Divider ── */}
              <div className={`lo-divider-${T("dark","light")}`} />

              {/* ── Action buttons ── */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <button
                  type="button"
                  className={`lo-btn-cancel-${T("dark","light")}`}
                  onClick={() => navigate(`/orders/${portofolio}/detail/${id}`)}
                >
                  <FiArrowLeft size={14} /> Batal
                </button>
                <button type="submit" className="lo-btn-submit" disabled={saving || loading}>
                  {saving ? (
                    <>
                      <div className="lo-spinner" style={{ width: 16, height: 16, borderWidth: 2, borderStyle: "solid", borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white" }} />
                      Menyimpan…
                    </>
                  ) : (
                    <>
                      <FiCheck size={15} /> Simpan &amp; Lanjutkan
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>{/* end card */}

        </div>
      </div>
    </>
  );
};

export default LengkapiOrder;