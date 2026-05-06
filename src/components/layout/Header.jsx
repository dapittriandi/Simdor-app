/**
 * Header.jsx — "Obsidian Chrome" Edition (Polished)
 * Font: Outfit (display) + JetBrains Mono (data/clock)
 * Fix: logout desktop, notifikasi navigable
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Bell, ChevronDown, LogOut, User, Zap,
  Menu, Sun, Moon, CheckCheck, Clock,
  AlertCircle, Info, CheckCircle, RefreshCw, Shield,
  ArrowRight, Package, FileText, BarChart2,
} from "lucide-react";
import { useTheme } from "./ThemeContext";
import { useUser } from "../../context/UserContext";
import useNotifications from "../../hooks/useNotifications";

/* ═══════════════════════════════════════════
   STYLES
═══════════════════════════════════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --hdr-h: 54px;
  --hdr-bg-d: rgba(6, 8, 18, 0.97);
  --hdr-bg-l: rgba(246, 249, 255, 0.97);
  --hdr-border-d: rgba(56,189,248,0.1);
  --hdr-border-l: rgba(14,165,233,0.13);
  --accent-d: #38bdf8;
  --accent-l: #0369a1;
  --accent2-d: #818cf8;
  --accent2-l: #6366f1;
  --text-d: #e2e8f5;
  --text-l: #0f172a;
  --surface-d: rgba(255,255,255,0.035);
  --surface-l: rgba(255,255,255,0.9);
  --surface-hover-d: rgba(56,189,248,0.07);
  --surface-hover-l: rgba(14,165,233,0.06);
}

/* ── Root ── */
.h-root {
  font-family: 'Outfit', sans-serif;
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 9990;
  padding-top: env(safe-area-inset-top, 0px);
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  will-change: transform;
  backface-visibility: hidden;
}
@media (min-width: 768px) {
  .h-root { position: sticky; }
}
.h-spacer {
  height: calc(var(--hdr-h) + env(safe-area-inset-top, 0px));
  flex-shrink: 0;
}

/* ── Glass ── */
.h-dark {
  background: var(--hdr-bg-d);
  border-bottom: 1px solid var(--hdr-border-d);
  box-shadow: 0 1px 0 rgba(255,255,255,0.025), 0 4px 32px rgba(0,0,0,0.55), 0 0 80px rgba(56,189,248,0.025);
  backdrop-filter: blur(28px) saturate(200%);
  -webkit-backdrop-filter: blur(28px) saturate(200%);
}
.h-light {
  background: var(--hdr-bg-l);
  border-bottom: 1px solid var(--hdr-border-l);
  box-shadow: 0 1px 0 rgba(255,255,255,0.95), 0 4px 28px rgba(14,165,233,0.07);
  backdrop-filter: blur(28px) saturate(200%);
  -webkit-backdrop-filter: blur(28px) saturate(200%);
}

/* ── Spectrum line ── */
.h-spectrum {
  height: 2px;
  position: relative;
  overflow: hidden;
}
.h-spectrum::before {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(90deg, transparent 0%, #1d4ed8 8%, #38bdf8 30%, #818cf8 50%, #38bdf8 70%, #1d4ed8 88%, transparent 100%);
  background-size: 300% 100%;
  animation: spectrumFlow 5s linear infinite;
}
.h-spectrum-l::before {
  background: linear-gradient(90deg, transparent 0%, #0369a1 8%, #0ea5e9 30%, #6366f1 50%, #0ea5e9 70%, #0369a1 88%, transparent 100%);
  background-size: 300% 100%;
}
@keyframes spectrumFlow {
  from { background-position: 200% 0; }
  to   { background-position: -100% 0; }
}

/* ── Mount ── */
@keyframes hdrSlideIn {
  from { transform: translateY(-110%); opacity: 0; }
  to   { transform: translateY(0);     opacity: 1; }
}
.h-mounted { animation: hdrSlideIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }

/* ── Divider ── */
.h-div {
  width: 1px; height: 20px;
  border-radius: 1px; flex-shrink: 0;
}
.h-div-d { background: rgba(56,189,248,0.1); }
.h-div-l { background: rgba(14,165,233,0.13); }

/* ── Logo badge ── */
.h-logo-badge {
  display: flex; align-items: center; gap: 6px;
  padding: 5px 11px 5px 9px;
  border-radius: 10px; border: 1px solid;
  position: relative; overflow: hidden;
  cursor: default;
}
.h-logo-badge-d { background: rgba(56,189,248,0.05); border-color: rgba(56,189,248,0.18); }
.h-logo-badge-l { background: rgba(14,165,233,0.05); border-color: rgba(14,165,233,0.15); }
.h-logo-badge::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(56,189,248,0.07) 0%, transparent 55%);
  pointer-events: none;
}
.h-logo-icon-d { color: #38bdf8; }
.h-logo-icon-l { color: #0369a1; }
.h-logo-text { font-size: 13px; font-weight: 800; letter-spacing: 0.16em; }
.h-logo-text-d {
  background: linear-gradient(90deg, #38bdf8, #818cf8);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.h-logo-text-l {
  background: linear-gradient(90deg, #0369a1, #6366f1);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}

/* ── Greeting ── */
.h-greet-name { font-size: 14px; font-weight: 600; line-height: 1.2; }
.h-greet-name-d { color: var(--text-d); }
.h-greet-name-l { color: var(--text-l); }
.h-greet-accent-d { color: #38bdf8; }
.h-greet-accent-l { color: #0369a1; }
.h-greet-date { font-size: 10px; margin-top: 2px; font-family: 'JetBrains Mono', monospace; }
.h-greet-date-d { color: rgba(56,189,248,0.38); }
.h-greet-date-l { color: rgba(3,105,161,0.42); }

/* ── Clock ── */
.h-clock {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px; letter-spacing: 0.07em;
  padding: 4px 9px; border-radius: 7px; border: 1px solid;
}
.h-clock-d { color: rgba(56,189,248,0.48); background: rgba(56,189,248,0.04); border-color: rgba(56,189,248,0.1); }
.h-clock-l { color: rgba(3,105,161,0.5);   background: rgba(14,165,233,0.04); border-color: rgba(14,165,233,0.1); }

/* ── Icon buttons ── */
.h-btn {
  width: 36px; height: 36px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; position: relative;
  transition: all 0.18s cubic-bezier(0.16,1,0.3,1);
  -webkit-tap-highlight-color: transparent;
  border: 1px solid; flex-shrink: 0;
}
.h-btn-d { background: var(--surface-d); border-color: rgba(56,189,248,0.1); color: rgba(148,163,184,0.65); }
.h-btn-d:hover { background: var(--surface-hover-d); border-color: rgba(56,189,248,0.28); color: #38bdf8; box-shadow: 0 0 18px rgba(56,189,248,0.09); }
.h-btn-d:active { transform: scale(0.92); }
.h-btn-l { background: var(--surface-l); border-color: rgba(14,165,233,0.13); color: rgba(71,85,105,0.65); box-shadow: 0 1px 3px rgba(14,165,233,0.05); }
.h-btn-l:hover { background: rgba(14,165,233,0.07); border-color: rgba(14,165,233,0.28); color: #0369a1; box-shadow: 0 2px 12px rgba(14,165,233,0.09); }
.h-btn-l:active { transform: scale(0.92); }

/* ── Badge ── */
.h-badge {
  position: absolute; top: 4px; right: 4px;
  min-width: 16px; height: 16px; padding: 0 4px;
  border-radius: 8px; font-size: 9px; font-weight: 700;
  color: white; display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #ef4444, #f97316);
  border: 1.5px solid; font-family: 'JetBrains Mono', monospace; line-height: 1;
  animation: badgePulse 2.5s ease-in-out infinite;
}
.h-badge-d { border-color: rgba(6,8,18,0.85); }
.h-badge-l { border-color: rgba(246,249,255,0.9); }
@keyframes badgePulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); }
  50%      { box-shadow: 0 0 0 4px rgba(239,68,68,0); }
}

/* ── Theme toggle ── */
.h-toggle {
  width: 46px; height: 25px; border-radius: 13px;
  cursor: pointer; border: 1px solid;
  position: relative; overflow: hidden;
  transition: all 0.3s cubic-bezier(0.16,1,0.3,1); flex-shrink: 0;
}
.h-toggle-d { background: rgba(56,189,248,0.09); border-color: rgba(56,189,248,0.18); }
.h-toggle-l { background: rgba(251,191,36,0.1);  border-color: rgba(251,191,36,0.3); }
.h-knob {
  position: absolute; top: 2.5px;
  width: 20px; height: 20px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  transition: left 0.3s cubic-bezier(0.16,1,0.3,1);
}
.h-knob-d { left: 2.5px; background: linear-gradient(135deg,#1d4ed8,#38bdf8); box-shadow: 0 0 10px rgba(56,189,248,0.5); }
.h-knob-l { left: 24px;  background: linear-gradient(135deg,#f59e0b,#fbbf24); box-shadow: 0 0 10px rgba(251,191,36,0.5); }

/* ── Profile btn ── */
.h-profile {
  display: flex; align-items: center; gap: 8px;
  padding: 4px 8px 4px 4px;
  border-radius: 12px; cursor: pointer; border: 1px solid;
  transition: all 0.18s cubic-bezier(0.16,1,0.3,1);
  -webkit-tap-highlight-color: transparent;
}
.h-profile-d { background: var(--surface-d); border-color: rgba(56,189,248,0.1); }
.h-profile-d:hover { background: var(--surface-hover-d); border-color: rgba(56,189,248,0.24); box-shadow: 0 0 18px rgba(56,189,248,0.05); }
.h-profile-l { background: var(--surface-l); border-color: rgba(14,165,233,0.13); box-shadow: 0 1px 4px rgba(14,165,233,0.05); }
.h-profile-l:hover { background: rgba(14,165,233,0.05); border-color: rgba(14,165,233,0.26); }
.h-avatar {
  width: 28px; height: 28px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 12px; color: white; flex-shrink: 0;
  background: linear-gradient(135deg, #1d4ed8, #38bdf8);
  box-shadow: 0 0 0 1.5px rgba(56,189,248,0.28);
}
.h-avatar-lg {
  width: 38px; height: 38px; border-radius: 11px; font-size: 15px;
  background: linear-gradient(135deg, #1d4ed8, #38bdf8);
  box-shadow: 0 0 0 2px rgba(56,189,248,0.22), 0 4px 14px rgba(56,189,248,0.18);
}
.h-profile-name { font-size: 13px; font-weight: 600; line-height: 1.2; max-width: 90px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.h-profile-name-d { color: var(--text-d); }
.h-profile-name-l { color: var(--text-l); }
.h-profile-role { font-size: 10px; line-height: 1; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.04em; }
.h-profile-role-d { color: rgba(56,189,248,0.42); }
.h-profile-role-l { color: rgba(3,105,161,0.48); }
.h-chevron { transition: transform 0.28s cubic-bezier(0.16,1,0.3,1); flex-shrink: 0; }
.h-chevron-d { color: rgba(56,189,248,0.38); }
.h-chevron-l { color: rgba(3,105,161,0.38); }
.h-chevron-open { transform: rotate(180deg); }

/* ── Hamburger ── */
.h-ham { display: flex; flex-direction: column; gap: 4.5px; padding: 10px 9px; }
.h-ham-bar { height: 1.5px; border-radius: 2px; transition: all 0.2s; }
.h-ham-bar-d { background: rgba(148,163,184,0.65); }
.h-ham-bar-l { background: rgba(71,85,105,0.65); }
.h-btn-d:hover .h-ham-bar-d { background: #38bdf8; }
.h-btn-l:hover .h-ham-bar-l { background: #0369a1; }
.h-ham-bar-1 { width: 16px; }
.h-ham-bar-2 { width: 11px; }
.h-ham-bar-3 { width: 16px; }

/* ── Mobile logo ── */
.h-mob-logo {
  font-size: 15px; font-weight: 800; letter-spacing: 0.14em;
  background: linear-gradient(90deg,#38bdf8 0%,#fff 55%,#818cf8 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.h-mob-logo-l {
  background: linear-gradient(90deg,#0369a1 0%,#0f172a 55%,#6366f1 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}

/* ── Dropdowns ── */
@keyframes dropReveal {
  from { opacity: 0; transform: scale(0.95) translateY(-8px); }
  to   { opacity: 1; transform: scale(1)    translateY(0); }
}
.h-drop {
  border-radius: 16px; overflow: hidden;
  animation: dropReveal 0.2s cubic-bezier(0.16,1,0.3,1) forwards;
  transform-origin: top right;
}
.h-drop-d {
  background: rgba(7,9,20,0.98);
  border: 1px solid rgba(56,189,248,0.12);
  box-shadow: 0 20px 60px rgba(0,0,0,0.72), 0 0 0 1px rgba(255,255,255,0.018), 0 0 40px rgba(56,189,248,0.04);
  backdrop-filter: blur(32px); -webkit-backdrop-filter: blur(32px);
}
.h-drop-l {
  background: rgba(250,253,255,0.99);
  border: 1px solid rgba(14,165,233,0.12);
  box-shadow: 0 16px 48px rgba(14,165,233,0.1), 0 0 0 1px rgba(255,255,255,0.9);
  backdrop-filter: blur(32px); -webkit-backdrop-filter: blur(32px);
}
.h-drop-head { padding: 14px 16px 12px; border-bottom: 1px solid; }
.h-drop-head-d { border-color: rgba(56,189,248,0.07); }
.h-drop-head-l { border-color: rgba(14,165,233,0.07); }
.h-drop-section-title {
  font-size: 9.5px; font-weight: 700; letter-spacing: 0.13em;
  padding: 9px 16px 4px; font-family: 'JetBrains Mono', monospace;
}
.h-drop-section-title-d { color: rgba(56,189,248,0.32); }
.h-drop-section-title-l { color: rgba(3,105,161,0.38); }

/* ── Drop items ── */
.h-drop-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 16px;
  font-size: 13px; font-weight: 500;
  cursor: pointer; border: none; background: none; width: 100%;
  text-align: left; text-decoration: none;
  transition: background 0.15s, color 0.15s;
  font-family: 'Outfit', sans-serif;
  -webkit-tap-highlight-color: transparent;
}
.h-drop-item-d { color: rgba(179,193,220,0.75); }
.h-drop-item-d:hover { background: rgba(56,189,248,0.07); color: #38bdf8; }
.h-drop-item-l { color: #334155; }
.h-drop-item-l:hover { background: rgba(14,165,233,0.06); color: #0369a1; }

/* ── Danger item (Logout) — terpisah dari .h-drop-item supaya tidak confict ── */
.h-logout-btn {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 16px; margin: 2px 8px 8px;
  font-size: 13px; font-weight: 500;
  cursor: pointer; border: 1px solid transparent; border-radius: 10px; background: none; width: calc(100% - 16px);
  text-align: left;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  font-family: 'Outfit', sans-serif;
  -webkit-tap-highlight-color: transparent;
}
.h-logout-btn-d { color: rgba(252,165,165,0.8); }
.h-logout-btn-d:hover { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.2); color: #fca5a5; }
.h-logout-btn-l { color: #dc2626; }
.h-logout-btn-l:hover { background: rgba(239,68,68,0.07); border-color: rgba(239,68,68,0.18); color: #b91c1c; }

.h-drop-divider { height: 1px; margin: 3px 0; }
.h-drop-divider-d { background: rgba(56,189,248,0.06); }
.h-drop-divider-l { background: rgba(14,165,233,0.06); }

/* ── Role pill ── */
.h-role-pill {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 9px; border-radius: 7px;
  font-size: 10.5px; font-weight: 600;
  font-family: 'JetBrains Mono', monospace; letter-spacing: 0.04em; border: 1px solid;
}
.h-role-pill-d { background: rgba(56,189,248,0.07); border-color: rgba(56,189,248,0.18); color: #38bdf8; }
.h-role-pill-l { background: rgba(14,165,233,0.06); border-color: rgba(14,165,233,0.18); color: #0369a1; }
.h-online-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: #22c55e; box-shadow: 0 0 5px rgba(34,197,94,0.7);
  animation: onlineGlow 2s ease-in-out infinite;
}
@keyframes onlineGlow { 0%,100% { opacity:1; } 50% { opacity:0.5; } }

/* ── Switch role ── */
.h-switch-item {
  display: flex; align-items: center; gap: 9px;
  padding: 8px 16px; font-size: 12.5px; font-weight: 500;
  cursor: pointer; border: none; background: none; width: 100%;
  text-align: left; transition: background 0.15s, color 0.15s;
  font-family: 'Outfit', sans-serif;
}
.h-switch-item-d { color: rgba(148,163,184,0.68); }
.h-switch-item-d:hover { background: rgba(56,189,248,0.07); color: #38bdf8; }
.h-switch-item-l { color: #475569; }
.h-switch-item-l:hover { background: rgba(14,165,233,0.06); color: #0369a1; }
.h-switch-dot {
  width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
}
.h-switch-dot-d { background: rgba(56,189,248,0.22); border: 1px solid rgba(56,189,248,0.28); }
.h-switch-dot-l { background: rgba(14,165,233,0.18); border: 1px solid rgba(14,165,233,0.24); }

/* ── Notif panel ── */
.h-notif-scroll {
  max-height: 320px; overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(56,189,248,0.14) transparent;
}
.h-notif-scroll::-webkit-scrollbar { width: 3px; }
.h-notif-scroll::-webkit-scrollbar-thumb { background: rgba(56,189,248,0.14); border-radius: 2px; }

/* Notif rows — now clickable link */
.h-notif-row {
  padding: 11px 16px; display: flex; gap: 10px;
  cursor: pointer; transition: background 0.15s;
  border-bottom: 1px solid; text-decoration: none;
}
.h-notif-row:last-child { border-bottom: none; }
.h-notif-row-d { border-color: rgba(56,189,248,0.045); }
.h-notif-row-d:hover { background: rgba(56,189,248,0.05); }
.h-notif-row-l { border-color: rgba(14,165,233,0.055); }
.h-notif-row-l:hover { background: rgba(14,165,233,0.04); }

.h-notif-icon {
  width: 32px; height: 32px; border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; border: 1px solid;
}
.h-notif-title { font-size: 12.5px; font-weight: 600; line-height: 1.2; margin-bottom: 2px; }
.h-notif-title-d { color: #e2e8f5; }
.h-notif-title-d-read { color: rgba(148,163,184,0.65); font-weight: 400; }
.h-notif-title-l { color: #0f172a; }
.h-notif-body { font-size: 11.5px; line-height: 1.4; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.h-notif-body-d { color: rgba(148,163,184,0.5); }
.h-notif-body-l { color: #64748b; }
.h-notif-time { font-size: 9.5px; margin-top: 4px; display: flex; align-items: center; gap: 3px; font-family: 'JetBrains Mono', monospace; }
.h-notif-time-d { color: rgba(56,189,248,0.32); }
.h-notif-time-l { color: rgba(3,105,161,0.38); }
.h-unread-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #38bdf8; box-shadow: 0 0 6px rgba(56,189,248,0.7);
  flex-shrink: 0; margin-top: 5px;
}

/* ── Notif type badge ── */
.h-notif-type {
  display: inline-flex; align-items: center;
  font-size: 9px; font-weight: 700; letter-spacing: 0.08em;
  padding: 1.5px 6px; border-radius: 5px;
  font-family: 'JetBrains Mono', monospace;
  margin-bottom: 3px; border: 1px solid;
}
.h-notif-type-warning-d { background: rgba(251,191,36,0.1); border-color: rgba(251,191,36,0.22); color: #fbbf24; }
.h-notif-type-warning-l { background: rgba(254,243,199,0.8); border-color: rgba(251,191,36,0.2); color: #b45309; }
.h-notif-type-success-d { background: rgba(52,211,153,0.1); border-color: rgba(52,211,153,0.22); color: #34d399; }
.h-notif-type-success-l { background: rgba(209,250,229,0.8); border-color: rgba(16,185,129,0.2); color: #047857; }
.h-notif-type-info-d { background: rgba(56,189,248,0.1); border-color: rgba(56,189,248,0.22); color: #38bdf8; }
.h-notif-type-info-l { background: rgba(224,242,254,0.8); border-color: rgba(14,165,233,0.2); color: #0369a1; }

/* Notif nav hint */
.h-notif-nav {
  display: flex; align-items: center; gap: 3px;
  margin-top: 3px; font-size: 9.5px; font-family: 'JetBrains Mono', monospace;
  opacity: 0; transition: opacity 0.15s;
}
.h-notif-row:hover .h-notif-nav { opacity: 1; }
.h-notif-nav-d { color: rgba(56,189,248,0.55); }
.h-notif-nav-l { color: rgba(3,105,161,0.55); }

/* ── Flash ── */
@keyframes switchFlash {
  0% { opacity:0; } 25% { opacity:1; } 100% { opacity:0; }
}
.h-flash {
  position: fixed; inset: 0; z-index: 9999; pointer-events: none;
  background: radial-gradient(ellipse at 50% 0%, rgba(56,189,248,0.1), transparent 60%);
  animation: switchFlash 0.5s ease forwards;
}
`;

/* ═══════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════ */
const shortRole = (peran, bidang) => {
  if (!peran) return "—";
  if (peran.toLowerCase() === "admin portofolio" && bidang) return bidang.toUpperCase();
  return { "customer service":"CS", "admin keuangan":"Keu", "koordinator":"Koor" }[peran.toLowerCase()] || peran.slice(0,6).toUpperCase();
};
const ROLE_LABEL = {
  "customer service": "Customer Service",
  "admin keuangan":   "Admin Keuangan",
  "admin portofolio": "Admin Portofolio",
  "koordinator":      "Koordinator",
};
const NOTIF_CFG = {
  warning: { Icon: AlertCircle, colorD:"#fbbf24", colorL:"#d97706", bgD:"rgba(251,191,36,0.1)", bgL:"rgba(254,243,199,0.75)", bdD:"rgba(251,191,36,0.2)", bdL:"rgba(251,191,36,0.14)" },
  info:    { Icon: Info,        colorD:"#38bdf8",  colorL:"#0369a1", bgD:"rgba(56,189,248,0.1)",  bgL:"rgba(224,242,254,0.75)", bdD:"rgba(56,189,248,0.2)",  bdL:"rgba(14,165,233,0.14)" },
  success: { Icon: CheckCircle, colorD:"#34d399",  colorL:"#059669", bgD:"rgba(52,211,153,0.1)",  bgL:"rgba(209,250,229,0.75)", bdD:"rgba(52,211,153,0.2)",  bdL:"rgba(16,185,129,0.14)" },
};

/**
 * Resolves navigation path dari notifikasi.
 *
 * Route yang benar (sesuai App.jsx):
 *   /orders/:portofolio/detail/:id
 *   /orders/:portofolio/detail/lengkapi/:id
 *   /documents
 *   /laporan
 *
 * Notif dari useNotifications diharapkan punya:
 *   - n.orderId   → Firestore document ID dari order
 *   - n.portofolio → portofolio slug (misal: "sipil", "mekanikal", dsb.)
 *   - n.link      → override manual (opsional, future-proof)
 *   - n.action    → "lengkapi" | "edit" | "detail" (opsional, default: detail)
 */
function resolveNotifPath(n) {
  // Manual override (future-proof)
  if (n.link) return n.link;

  // Notif invoice / proforma → halaman documents
  if (n.type === "invoice" || n.id?.includes("invoice") || n.id?.includes("proforma")) {
    return "/documents";
  }

  // Notif laporan → halaman laporan
  if (n.id?.includes("laporan") || n.type === "laporan") {
    return "/laporan";
  }

  // Notif order — butuh orderId + portofolio untuk path yang benar
  if (n.orderId) {
    const porto = n.portofolio || "umum"; // fallback portofolio jika tidak ada
    const action = n.action === "lengkapi"
      ? `lengkapi/${n.orderId}`
      : n.action === "edit"
        ? `edit/${n.orderId}`
        : n.orderId; // default: detail
    return `/orders/${porto}/detail/${action}`;
  }

  return "/orders/umum";
}

/* ── Notif Panel ── */
function NotifPanel({ d, notifs, onMarkAll, onMarkOne, onClose }) {
  const navigate = useNavigate();
  const unread = notifs.filter(n => !n.read).length;

  const handleNotifClick = (n) => {
    onMarkOne?.(n.id);              // tandai terbaca
    onClose();                      // tutup panel
    navigate(resolveNotifPath(n));  // navigasi ke /orders/{orderId}
  };

  return (
    <div className={`h-drop h-drop-${d?"d":"l"}`} style={{ width: 334 }}>
      <div className={`h-drop-head h-drop-head-${d?"d":"l"}`}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
            <Bell style={{ width:13, height:13, color:d?"rgba(56,189,248,0.58)":"rgba(3,105,161,0.58)", flexShrink:0 }} />
            <span style={{ fontSize:13, fontWeight:700, color:d?"#e2e8f5":"#0f172a", fontFamily:"'Outfit',sans-serif" }}>
              Notifikasi
            </span>
            {unread > 0 && (
              <span style={{
                background:"linear-gradient(135deg,#ef4444,#f97316)",
                color:"white", fontSize:9, fontWeight:700,
                padding:"1.5px 6px", borderRadius:20, fontFamily:"'JetBrains Mono',monospace"
              }}>{unread}</span>
            )}
          </div>
          {unread > 0 && (
            <button
              onClick={onMarkAll}
              style={{
                display:"flex", alignItems:"center", gap:4,
                fontSize:10.5, fontWeight:500, cursor:"pointer",
                background:"none", border:"none",
                color:d?"rgba(56,189,248,0.48)":"rgba(3,105,161,0.48)",
                fontFamily:"'Outfit',sans-serif", transition:"color 0.15s",
                padding: "2px 4px", borderRadius: 6,
              }}
              onMouseEnter={e=>e.currentTarget.style.color=d?"#38bdf8":"#0369a1"}
              onMouseLeave={e=>e.currentTarget.style.color=d?"rgba(56,189,248,0.48)":"rgba(3,105,161,0.48)"}
            >
              <CheckCheck style={{ width:11, height:11 }} /> Baca semua
            </button>
          )}
        </div>
      </div>

      <div className="h-notif-scroll">
        {notifs.length === 0 ? (
          <div style={{ padding:"32px 16px", textAlign:"center" }}>
            <Bell style={{ width:24, height:24, margin:"0 auto 8px", opacity:0.18, color:d?"#38bdf8":"#0369a1", display:"block" }} />
            <p style={{ fontSize:12.5, color:d?"rgba(148,163,184,0.38)":"rgba(71,85,105,0.45)", fontFamily:"'Outfit',sans-serif" }}>
              Tidak ada notifikasi
            </p>
          </div>
        ) : notifs.map(n => {
          const cfg = NOTIF_CFG[n.type] || NOTIF_CFG.info;
          const typeKey = n.type || "info";
          const navLabel = (() => {
            if (n.type === "invoice" || n.id?.includes("invoice") || n.id?.includes("proforma")) return "→ Dokumen";
            if (n.id?.includes("laporan")) return "→ Laporan";
            if (n.action === "lengkapi") return "→ Lengkapi Order";
            if (n.action === "edit") return "→ Edit Order";
            if (n.portofolio) return `→ ${n.portofolio.toUpperCase()} / Detail`;
            return "→ Detail Order";
          })();
          const typeLabel = { warning:"PERINGATAN", info:"INFO", success:"SELESAI" }[typeKey] || typeKey.toUpperCase();
          return (
            /* Setiap notifikasi = div dengan onClick navigasi */
            <div
              key={n.id}
              className={`h-notif-row h-notif-row-${d?"d":"l"}`}
              onClick={() => handleNotifClick(n)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === "Enter" && handleNotifClick(n)}
            >
              <div className="h-notif-icon" style={{
                background: cfg[`bg${d?"D":"L"}`],
                borderColor: cfg[`bd${d?"D":"L"}`],
              }}>
                <cfg.Icon style={{ width:14, height:14, color:cfg[`color${d?"D":"L"}`] }} />
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <span className={`h-notif-type h-notif-type-${typeKey}-${d?"d":"l"}`}>{typeLabel}</span>
                <p className={`h-notif-title ${n.read ? (d?"h-notif-title-d-read":"") : (d?"h-notif-title-d":"h-notif-title-l")}`}>
                  {n.title}
                </p>
                <p className={`h-notif-body h-notif-body-${d?"d":"l"}`}>{n.body}</p>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div className={`h-notif-time h-notif-time-${d?"d":"l"}`}>
                    <Clock style={{ width:9, height:9 }} />
                    {n.time}
                  </div>
                  {/* Nav hint — muncul saat hover */}
                  <div className={`h-notif-nav h-notif-nav-${d?"d":"l"}`}>
                    <span>{navLabel}</span>
                    <ArrowRight style={{ width:9, height:9 }} />
                  </div>
                </div>
              </div>
              {!n.read && <div className="h-unread-dot" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Profile Dropdown ── */
function ProfileDrop({ d, userData, initial, canSwitch, otherRoles, onSwitch, onClose, logout }) {
  /**
   * FIX LOGOUT DESKTOP:
   * Bug asal: onClose() unmount dropdown → onClick handler terputus sebelum logout() terpanggil.
   * Fix: panggil logout() dulu, baru onClose(). Atau gunakan setTimeout agar
   * unmount tidak cancel event chain.
   */
  const handleLogout = useCallback(() => {
    logout();       // pastikan logout dipanggil dulu
    onClose();      // baru tutup dropdown
  }, [logout, onClose]);

  return (
    <div className={`h-drop h-drop-${d?"d":"l"}`} style={{ width:252 }}>
      {/* User info */}
      <div className={`h-drop-head h-drop-head-${d?"d":"l"}`}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
          <div className="h-avatar h-avatar-lg" style={{ display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:700, fontFamily:"'Outfit',sans-serif" }}>
            {initial}
          </div>
          <div style={{ overflow:"hidden", flex:1 }}>
            <p style={{ fontSize:13.5, fontWeight:700, color:d?"#e2e8f5":"#0f172a", margin:0, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis", fontFamily:"'Outfit',sans-serif" }}>
              {userData.nama || "User"}
            </p>
            <p style={{ fontSize:10.5, margin:"2px 0 0", overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis", color:d?"rgba(56,189,248,0.38)":"rgba(3,105,161,0.42)", fontFamily:"'JetBrains Mono',monospace" }}>
              {userData.email || ""}
            </p>
          </div>
        </div>
        <div className={`h-role-pill h-role-pill-${d?"d":"l"}`}>
          <div className="h-online-dot" />
          {ROLE_LABEL[userData.peran?.toLowerCase()] || userData.peran || "Guest"}
          {userData.bidang ? ` — ${userData.bidang.toUpperCase()}` : ""}
        </div>
      </div>

      {/* Switch roles */}
      {canSwitch && otherRoles?.length > 0 && (
        <>
          <p className={`h-drop-section-title h-drop-section-title-${d?"d":"l"}`}>GANTI PERAN</p>
          {otherRoles.map((role, i) => (
            <button key={i} className={`h-switch-item h-switch-item-${d?"d":"l"}`}
              onClick={() => { onClose(); onSwitch(role); }}>
              <div className={`h-switch-dot h-switch-dot-${d?"d":"l"}`} />
              <div style={{ flex:1, textAlign:"left" }}>
                <div style={{ fontSize:12.5, fontWeight:600, lineHeight:1.2 }}>
                  {ROLE_LABEL[role.peran?.toLowerCase()] || role.peran}
                </div>
                {role.bidang && (
                  <div style={{ fontSize:10, marginTop:1, opacity:0.45, fontFamily:"'JetBrains Mono',monospace" }}>
                    {role.bidang.toUpperCase()}
                  </div>
                )}
              </div>
              <RefreshCw style={{ width:11, height:11, opacity:0.28, flexShrink:0 }} />
            </button>
          ))}
          <div className={`h-drop-divider h-drop-divider-${d?"d":"l"}`} />
        </>
      )}

      {/* Actions */}
      <div style={{ padding:"4px 0 2px" }}>
        <Link
          to="/profile"
          className={`h-drop-item h-drop-item-${d?"d":"l"}`}
          onClick={onClose}
          style={{ display:"flex" }}
        >
          <User style={{ width:14, height:14, opacity:0.55, flexShrink:0 }} />
          Profil Pengguna
        </Link>
      </div>

      {/* Logout — pakai class tersendiri, handler fix */}
      <button
        type="button"
        className={`h-logout-btn h-logout-btn-${d?"d":"l"}`}
        onClick={handleLogout}
      >
        <LogOut style={{ width:14, height:14, flexShrink:0 }} />
        Logout
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
export default function Header({ onHamburger }) {
  const { isDark, toggle } = useTheme();
  const { activeUser, otherRoles, canSwitch, switchRole, logout } = useUser();
  const d = isDark;

  const userData = activeUser || {};
  const initial  = userData.nama ? userData.nama.charAt(0).toUpperCase() : "U";

  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [switching,   setSwitching]   = useState(false);
  const [mounted,     setMounted]     = useState(false);
  const [greeting,    setGreeting]    = useState("");
  const [clock,       setClock]       = useState(new Date());

  const { notifications, unreadCount, markAllRead, markOneRead } = useNotifications(userData);

  // Desktop & mobile refs dipisah agar tidak saling menimpa
  const profileRefDesktop = useRef(null);
  const notifRefDesktop   = useRef(null);
  const profileRefMobile  = useRef(null);
  const notifRefMobile    = useRef(null);
  const headerRef  = useRef(null);
  const [headerH, setHeaderH] = useState(54);

  useEffect(() => {
    const calc = () => {
      const h = new Date().getHours();
      setGreeting(h<5?"Selamat Malam":h<12?"Selamat Pagi":h<15?"Selamat Siang":h<19?"Selamat Sore":"Selamat Malam");
    };
    calc();
    const gi = setInterval(calc, 60000);
    const ti = setInterval(() => setClock(new Date()), 1000);
    setMounted(true);
    return () => { clearInterval(gi); clearInterval(ti); };
  }, []);

  useEffect(() => {
    if (!headerRef.current) return;
    const ro = new ResizeObserver(() => setHeaderH(headerRef.current?.offsetHeight || 54));
    ro.observe(headerRef.current);
    return () => ro.disconnect();
  }, []);

  // Outside click — cek semua 4 ref (desktop + mobile)
  useEffect(() => {
    const fn = e => {
      const inProfile =
        profileRefDesktop.current?.contains(e.target) ||
        profileRefMobile.current?.contains(e.target);
      const inNotif =
        notifRefDesktop.current?.contains(e.target) ||
        notifRefMobile.current?.contains(e.target);
      if (profileOpen && !inProfile) setProfileOpen(false);
      if (notifOpen   && !inNotif)   setNotifOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [profileOpen, notifOpen]);

  const handleSwitch = role => {
    setSwitching(true);
    setTimeout(() => { switchRole(role); setSwitching(false); }, 400);
  };

  const timeStr = clock.toLocaleTimeString("id-ID", { hour:"2-digit", minute:"2-digit", second:"2-digit" });
  const dateStr = clock.toLocaleDateString("id-ID", { weekday:"long", day:"numeric", month:"short" });
  const mobileDropTop = headerH + 4;

  return (
    <>
      <style>{STYLES}</style>
      {switching && <div className="h-flash" />}

      {/* Mobile spacer */}
      <div className="h-spacer md:hidden" />

      <header
        ref={headerRef}
        className={`h-root h-${d?"dark":"light"} ${mounted?"h-mounted":"opacity-0"}`}
        style={{ transition:"background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease" }}
      >
        <div className={`h-spectrum${d?"":" h-spectrum-l"}`} />

        {/* ──────── DESKTOP ──────── */}
        <div className="hidden md:flex items-center justify-between px-6" style={{ height:"var(--hdr-h)" }}>
          {/* Left */}
          <div className="flex items-center gap-3 min-w-0">
            <div className={`h-logo-badge h-logo-badge-${d?"d":"l"}`}>
              <Zap style={{ width:12, height:12 }} className={`h-logo-icon-${d?"d":"l"}`} />
              <span className={`h-logo-text h-logo-text-${d?"d":"l"}`}>SIMDOR</span>
            </div>
            <div className={`h-div h-div-${d?"d":"l"}`} />
            <div>
              <p className={`h-greet-name h-greet-name-${d?"d":"l"}`}>
                {greeting},{" "}
                <span className={`h-greet-accent-${d?"d":"l"}`}>{userData.nama || "User"}</span>
              </p>
              <p className={`h-greet-date h-greet-date-${d?"d":"l"}`}>{dateStr}</p>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`h-clock h-clock-${d?"d":"l"} hidden lg:block`}>{timeStr}</span>
            <div className={`h-div h-div-${d?"d":"l"} hidden lg:block`} />

            {/* Theme toggle */}
            <button onClick={toggle} className={`h-toggle h-toggle-${d?"d":"l"}`} aria-label="Toggle tema">
              <span className={`h-knob h-knob-${d?"d":"l"}`}>
                {d ? <Moon style={{ width:10,height:10,color:"white" }} />
                   : <Sun  style={{ width:10,height:10,color:"white" }} />}
              </span>
            </button>

            <div className={`h-div h-div-${d?"d":"l"}`} />

            {/* Bell */}
            <div className="relative" ref={notifRefDesktop}>
              <button
                className={`h-btn h-btn-${d?"d":"l"}`}
                onClick={() => { setNotifOpen(v=>!v); setProfileOpen(false); }}
                aria-label="Notifikasi"
              >
                <Bell style={{ width:15,height:15 }} />
                {unreadCount > 0 && <span className={`h-badge h-badge-${d?"d":"l"}`}>{unreadCount}</span>}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2" style={{ zIndex:10000 }}>
                  <NotifPanel
                    d={d}
                    notifs={notifications}
                    onMarkAll={markAllRead}
                    onMarkOne={markOneRead}
                    onClose={() => setNotifOpen(false)}
                  />
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative" ref={profileRefDesktop}>
              <button
                className={`h-profile h-profile-${d?"d":"l"}`}
                onClick={() => { setProfileOpen(v=>!v); setNotifOpen(false); }}
                aria-label="Menu profil"
              >
                <div className="h-avatar" style={{ display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:700,fontFamily:"'Outfit',sans-serif" }}>
                  {initial}
                </div>
                <div className="hidden lg:block">
                  <p className={`h-profile-name h-profile-name-${d?"d":"l"}`}>{userData.nama||"User"}</p>
                  <p className={`h-profile-role h-profile-role-${d?"d":"l"}`}>{shortRole(userData.peran,userData.bidang)}</p>
                </div>
                <ChevronDown
                  style={{ width:13,height:13 }}
                  className={`h-chevron h-chevron-${d?"d":"l"} ${profileOpen?"h-chevron-open":""}`}
                />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2" style={{ zIndex:10000 }}>
                  <ProfileDrop
                    d={d} userData={userData} initial={initial}
                    canSwitch={canSwitch} otherRoles={otherRoles}
                    onSwitch={handleSwitch}
                    onClose={() => setProfileOpen(false)}
                    logout={logout}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ──────── MOBILE ──────── */}
        <div className="flex md:hidden items-center justify-between px-4" style={{ height:"var(--hdr-h)" }}>
          <button className={`h-btn h-btn-${d?"d":"l"}`} onClick={onHamburger} aria-label="Buka menu">
            <div className="h-ham">
              <div className={`h-ham-bar h-ham-bar-1 h-ham-bar-${d?"d":"l"}`} />
              <div className={`h-ham-bar h-ham-bar-2 h-ham-bar-${d?"d":"l"}`} />
              <div className={`h-ham-bar h-ham-bar-3 h-ham-bar-${d?"d":"l"}`} />
            </div>
          </button>

          <span className={`h-mob-logo${d?"":" h-mob-logo-l"}`}>SIMDOR</span>

          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <button className={`h-btn h-btn-${d?"d":"l"}`} onClick={toggle} aria-label="Toggle tema">
              {d ? <Moon style={{ width:15,height:15 }} /> : <Sun style={{ width:15,height:15 }} />}
            </button>

            {/* Bell mobile */}
            <div style={{ position:"relative" }} ref={notifRefMobile}>
              <button
                className={`h-btn h-btn-${d?"d":"l"}`}
                onClick={() => { setNotifOpen(v=>!v); setProfileOpen(false); }}
                aria-label="Notifikasi"
              >
                <Bell style={{ width:15,height:15 }} />
                {unreadCount > 0 && <span className={`h-badge h-badge-${d?"d":"l"}`}>{unreadCount}</span>}
              </button>
              {notifOpen && (
                <div className={`h-drop h-drop-${d?"d":"l"}`}
                  style={{ position:"fixed", top:mobileDropTop, left:8, right:8, zIndex:9999 }}>
                  <NotifPanel
                    d={d}
                    notifs={notifications}
                    onMarkAll={markAllRead}
                    onMarkOne={markOneRead}
                    onClose={() => setNotifOpen(false)}
                  />
                </div>
              )}
            </div>

            {/* Avatar mobile */}
            <div style={{ position:"relative" }} ref={profileRefMobile}>
              <button
                className={`h-btn h-btn-${d?"d":"l"}`}
                style={{ borderRadius:"50%", padding:0, overflow:"hidden", border:"none" }}
                onClick={() => { setProfileOpen(v=>!v); setNotifOpen(false); }}
                aria-label="Profil"
              >
                <div className="h-avatar" style={{ width:36,height:36,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:700,fontFamily:"'Outfit',sans-serif" }}>
                  {initial}
                </div>
              </button>
              {profileOpen && (
                <div className={`h-drop h-drop-${d?"d":"l"}`}
                  style={{ position:"fixed", top:mobileDropTop, right:8, zIndex:9999 }}>
                  <ProfileDrop
                    d={d} userData={userData} initial={initial}
                    canSwitch={canSwitch} otherRoles={otherRoles}
                    onSwitch={handleSwitch}
                    onClose={() => setProfileOpen(false)}
                    logout={logout}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}