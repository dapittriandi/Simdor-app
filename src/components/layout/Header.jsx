import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Bell, ChevronDown, LogOut, User, Sparkles,
  Menu, Sun, Moon, CheckCheck, Clock,
  AlertCircle, Info, CheckCircle, RefreshCw,
} from "lucide-react";
import { useTheme } from "./ThemeContext";
import { useUser } from "../../context/UserContext";
import useNotifications from "../../hooks/useNotifications";

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&display=swap');

.hdr-root {
  font-family: 'DM Sans', sans-serif;
  /* KRITIS: fixed di mobile supaya tidak ikut scroll */
  position: sticky;
  top: 0;
  z-index: 9990;
  /* Mencegah "jitter" saat scroll di iOS */
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  will-change: transform;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

/* Override untuk mobile: gunakan fixed agar benar-benar tidak bergerak */
@media (max-width: 767px) {
  .hdr-root {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    /* Tambahkan padding-top untuk safe-area (notch di atas) */
    padding-top: env(safe-area-inset-top, 0px);
  }

  /* Spacer supaya konten di bawah tidak tertutup header fixed */
  .hdr-spacer-mobile {
    /* Tinggi header ~54px + safe area top */
    height: calc(54px + env(safe-area-inset-top, 0px));
    flex-shrink: 0;
  }
}

.hdr-glass-dark {
  background: rgba(7,11,24,0.92);
  backdrop-filter: blur(22px) saturate(160%);
  -webkit-backdrop-filter: blur(22px) saturate(160%);
  border-bottom: 1px solid rgba(99,148,255,0.1);
  box-shadow: 0 2px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.03);
}
.hdr-glass-light {
  background: rgba(240,246,255,0.95);
  backdrop-filter: blur(22px) saturate(180%);
  -webkit-backdrop-filter: blur(22px) saturate(180%);
  border-bottom: 1px solid rgba(59,130,246,0.15);
  box-shadow: 0 2px 20px rgba(59,130,246,0.08), inset 0 -1px 0 rgba(255,255,255,0.6);
}

@keyframes accentFlow {
  0%   { background-position: 0 0; }
  100% { background-position: 200% 0; }
}
.hdr-accent-dark {
  height: 2px;
  background: linear-gradient(90deg, transparent 0%,#1d4ed8 15%,#60a5fa 40%,#a78bfa 60%,#3b82f6 80%,transparent 100%);
  background-size: 200% 100%;
  animation: accentFlow 4s linear infinite;
}
.hdr-accent-light {
  height: 2px;
  background: linear-gradient(90deg, transparent 0%,#3b82f6 15%,#93c5fd 40%,#6366f1 60%,#3b82f6 80%,transparent 100%);
  background-size: 200% 100%;
  animation: accentFlow 4s linear infinite;
}

@keyframes hdrIn {
  from { transform: translateY(-100%); opacity: 0; }
  to   { transform: translateY(0);     opacity: 1; }
}
.hdr-mounted { animation: hdrIn 0.55s cubic-bezier(0.22,1,0.36,1) forwards; }

.hdr-avatar {
  background: linear-gradient(135deg,#1d4ed8,#3b82f6);
  box-shadow: 0 0 0 2px rgba(96,165,250,0.28), 0 0 14px rgba(59,130,246,0.28);
}

.hdr-icon-dark {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(99,148,255,0.15);
  border-radius: 10px; color: rgba(148,163,220,0.75);
  transition: all 0.2s; cursor: pointer;
}
.hdr-icon-dark:hover {
  background: rgba(59,130,246,0.1); border-color: rgba(96,165,250,0.35);
  color: #93c5fd; box-shadow: 0 0 16px rgba(59,130,246,0.15);
}
.hdr-icon-light {
  background: rgba(255,255,255,0.75); border: 1px solid rgba(59,130,246,0.18);
  border-radius: 10px; color: #4b6ea8; transition: all 0.2s;
  box-shadow: 0 1px 4px rgba(59,130,246,0.08); cursor: pointer;
}
.hdr-icon-light:hover {
  background: rgba(59,130,246,0.08); border-color: rgba(59,130,246,0.35);
  color: #2563eb; box-shadow: 0 0 14px rgba(59,130,246,0.12);
}

.hdr-profile-dark {
  background: rgba(255,255,255,0.03); border: 1px solid rgba(99,148,255,0.15);
  border-radius: 12px; transition: all 0.22s; cursor: pointer;
}
.hdr-profile-dark:hover {
  background: rgba(59,130,246,0.1); border-color: rgba(96,165,250,0.35);
  box-shadow: 0 0 18px rgba(59,130,246,0.14);
}
.hdr-profile-light {
  background: rgba(255,255,255,0.8); border: 1px solid rgba(59,130,246,0.18);
  border-radius: 12px; transition: all 0.22s;
  box-shadow: 0 1px 6px rgba(59,130,246,0.08); cursor: pointer;
}
.hdr-profile-light:hover {
  background: rgba(255,255,255,1); border-color: rgba(59,130,246,0.35);
  box-shadow: 0 4px 16px rgba(59,130,246,0.12);
}

.hdr-notif-badge {
  background: linear-gradient(135deg,#ef4444,#f97316);
  box-shadow: 0 0 6px rgba(239,68,68,0.7);
  animation: notifPulse 2s ease-in-out infinite;
}
@keyframes notifPulse {
  0%,100% { box-shadow: 0 0 6px rgba(239,68,68,0.65); }
  50%      { box-shadow: 0 0 14px rgba(239,68,68,0.9); }
}

@keyframes dropIn {
  from { opacity: 0; transform: scale(0.95) translateY(-8px); }
  to   { opacity: 1; transform: scale(1)    translateY(0); }
}
.hdr-dropdown-dark {
  background: rgba(7,11,24,0.97); backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px); border: 1px solid rgba(99,148,255,0.14);
  box-shadow: 0 20px 60px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.02);
  border-radius: 16px; overflow: hidden;
  animation: dropIn 0.22s cubic-bezier(0.22,1,0.36,1) forwards;
  transform-origin: top right;
}
.hdr-dropdown-light {
  background: rgba(248,251,255,0.99); backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px); border: 1px solid rgba(59,130,246,0.15);
  box-shadow: 0 16px 48px rgba(37,99,235,0.12), 0 0 0 1px rgba(255,255,255,0.9);
  border-radius: 16px; overflow: hidden;
  animation: dropIn 0.22s cubic-bezier(0.22,1,0.36,1) forwards;
  transform-origin: top right;
}
.hdr-dropdown-mobile-dark {
  background: rgba(7,11,24,0.97); backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px); border: 1px solid rgba(99,148,255,0.14);
  box-shadow: 0 20px 60px rgba(0,0,0,0.65);
  border-radius: 16px; overflow: hidden;
  animation: dropIn 0.22s cubic-bezier(0.22,1,0.36,1) forwards;
  transform-origin: top right;
}
.hdr-dropdown-mobile-light {
  background: rgba(248,251,255,0.99); backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px); border: 1px solid rgba(59,130,246,0.15);
  box-shadow: 0 16px 48px rgba(37,99,235,0.12);
  border-radius: 16px; overflow: hidden;
  animation: dropIn 0.22s cubic-bezier(0.22,1,0.36,1) forwards;
  transform-origin: top right;
}

.hdr-drop-dark  { color: rgba(179,193,240,0.8); }
.hdr-drop-dark:hover  { background: rgba(59,130,246,0.09); color: #93c5fd; }
.hdr-drop-light { color: #334e7a; }
.hdr-drop-light:hover { background: rgba(59,130,246,0.07); color: #1d4ed8; }

.hdr-drop-logout-dark  { color: rgba(252,165,165,0.8); }
.hdr-drop-logout-dark:hover  { background: rgba(239,68,68,0.09); color: #fca5a5; }
.hdr-drop-logout-light { color: #dc2626; }
.hdr-drop-logout-light:hover { background: rgba(239,68,68,0.07); color: #b91c1c; }

.hdr-drop-base {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 16px; font-size: 13px;
  transition: background 0.18s, color 0.18s;
  text-decoration: none; width: 100%;
  text-align: left; background: none; border: none; cursor: pointer;
  font-family: 'DM Sans', sans-serif;
}

.hdr-switch-item-dark {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 16px; font-size: 12.5px;
  transition: background 0.18s, color 0.18s;
  cursor: pointer; border: none; background: none;
  width: 100%; text-align: left;
  color: rgba(179,193,240,0.8);
  font-family: 'DM Sans', sans-serif;
}
.hdr-switch-item-dark:hover { background: rgba(59,130,246,0.09); color: #93c5fd; }
.hdr-switch-item-light {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 16px; font-size: 12.5px;
  transition: background 0.18s, color 0.18s;
  cursor: pointer; border: none; background: none;
  width: 100%; text-align: left; color: #334e7a;
  font-family: 'DM Sans', sans-serif;
}
.hdr-switch-item-light:hover { background: rgba(59,130,246,0.07); color: #1d4ed8; }

.hdr-switch-lbl-dark  { font-size:10px; font-weight:700; letter-spacing:.1em; color:rgba(99,148,255,0.45); padding:8px 16px 4px; }
.hdr-switch-lbl-light { font-size:10px; font-weight:700; letter-spacing:.1em; color:rgba(37,99,235,0.4);  padding:8px 16px 4px; }

.hdr-other-dot-dark  { width:6px; height:6px; border-radius:50%; background:rgba(99,148,255,0.3); flex-shrink:0; }
.hdr-other-dot-dark-active  { width:6px; height:6px; border-radius:50%; background:linear-gradient(135deg,#3b82f6,#60a5fa); box-shadow:0 0 6px rgba(59,130,246,0.7); flex-shrink:0; }
.hdr-other-dot-light { width:6px; height:6px; border-radius:50%; background:rgba(37,99,235,0.25); flex-shrink:0; }

@keyframes hdrSwitchFlash {
  0%   { opacity: 0; }
  30%  { opacity: 1; }
  100% { opacity: 0; }
}
.hdr-switch-flash {
  position: fixed; inset: 0; z-index: 9999; pointer-events: none;
  background: linear-gradient(135deg, rgba(29,78,216,0.18), rgba(96,165,250,0.12));
  animation: hdrSwitchFlash 0.45s ease forwards;
}

.theme-toggle {
  position: relative; width: 52px; height: 27px;
  border-radius: 14px; cursor: pointer; border: none;
  transition: all 0.35s cubic-bezier(0.22,1,0.36,1);
  overflow: hidden; flex-shrink: 0;
}
.theme-toggle-dark  { background:rgba(37,99,235,0.25); border:1px solid rgba(96,165,250,0.3); }
.theme-toggle-light { background:rgba(251,191,36,0.15); border:1px solid rgba(251,191,36,0.4); }
.toggle-knob {
  position: absolute; top: 3px; width: 21px; height: 21px;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  transition: all 0.35s cubic-bezier(0.22,1,0.36,1);
}
.toggle-knob-dark  { left:3px;  background:linear-gradient(135deg,#1d4ed8,#60a5fa); box-shadow:0 0 10px rgba(59,130,246,0.5); }
.toggle-knob-light { left:28px; background:linear-gradient(135deg,#f59e0b,#fbbf24); box-shadow:0 0 10px rgba(251,191,36,0.6); }

.hdr-clock { font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.06em; }
.hdr-clock-dark  { color: rgba(99,148,255,0.5); }
.hdr-clock-light { color: rgba(37,99,235,0.5); }

.hdr-mobile-logo-dark  { font-weight:700; letter-spacing:.14em; font-size:15px; background:linear-gradient(135deg,#93c5fd,#fff 60%,#60a5fa); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
.hdr-mobile-logo-light { font-weight:700; letter-spacing:.14em; font-size:15px; background:linear-gradient(135deg,#1d4ed8,#2563eb 60%,#3b82f6); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }

.hdr-badge-dark  { background:linear-gradient(135deg,#1d4ed8,#3b82f6); box-shadow:0 0 14px rgba(59,130,246,0.4); }
.hdr-badge-light { background:linear-gradient(135deg,#2563eb,#60a5fa); box-shadow:0 0 14px rgba(59,130,246,0.2); }

.hdr-divider-dark  { background: rgba(99,148,255,0.15); }
.hdr-divider-light { background: rgba(37,99,235,0.12); }
.hdr-drop-divider-dark  { border-color: rgba(99,148,255,0.1); }
.hdr-drop-divider-light { border-color: rgba(59,130,246,0.1); }

.hdr-text-primary-dark  { color: #e2e8f5; }
.hdr-text-primary-light { color: #1e3a5f; }
.hdr-text-accent-dark   { color: #60a5fa; }
.hdr-text-accent-light  { color: #2563eb; }
.hdr-text-muted-dark    { color: rgba(99,148,255,0.5); }
.hdr-text-muted-light   { color: rgba(37,99,235,0.5); }

.hdr-role-dark  { background:rgba(37,99,235,0.18); border:1px solid rgba(59,130,246,0.25); }
.hdr-role-light { background:rgba(219,234,254,0.8); border:1px solid rgba(59,130,246,0.2); }
.hdr-role-text-dark  { color: #93c5fd; }
.hdr-role-text-light { color: #1d4ed8; }
.hdr-active-dot {
  width:6px; height:6px; border-radius:50%;
  background:linear-gradient(135deg,#3b82f6,#60a5fa);
  box-shadow:0 0 6px rgba(59,130,246,0.7); flex-shrink:0;
}

.hdr-notif-panel-dark {
  background: rgba(7,11,24,0.97); backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px); border: 1px solid rgba(99,148,255,0.14);
  box-shadow: 0 20px 60px rgba(0,0,0,0.65);
  border-radius: 16px; overflow: hidden;
  animation: dropIn 0.22s cubic-bezier(0.22,1,0.36,1) forwards;
  transform-origin: top right;
}
.hdr-notif-panel-light {
  background: rgba(248,251,255,0.99); backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px); border: 1px solid rgba(59,130,246,0.15);
  box-shadow: 0 16px 48px rgba(37,99,235,0.12);
  border-radius: 16px; overflow: hidden;
  animation: dropIn 0.22s cubic-bezier(0.22,1,0.36,1) forwards;
  transform-origin: top right;
}
.hdr-notif-item-dark {
  padding: 12px 16px; border-bottom: 1px solid rgba(99,148,255,0.07);
  transition: background 0.18s; cursor: pointer;
}
.hdr-notif-item-dark:hover   { background: rgba(59,130,246,0.07); }
.hdr-notif-item-dark:last-child { border-bottom: none; }
.hdr-notif-item-light {
  padding: 12px 16px; border-bottom: 1px solid rgba(59,130,246,0.07);
  transition: background 0.18s; cursor: pointer;
}
.hdr-notif-item-light:hover  { background: rgba(59,130,246,0.05); }
.hdr-notif-item-light:last-child { border-bottom: none; }

.hdr-notif-unread-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: linear-gradient(135deg,#3b82f6,#60a5fa);
  box-shadow: 0 0 6px rgba(59,130,246,0.6);
  flex-shrink: 0; margin-top: 5px;
}
.hdr-notif-icon-warn-dark  { background:rgba(245,158,11,0.15); border:1px solid rgba(245,158,11,0.25); border-radius:10px; }
.hdr-notif-icon-warn-light { background:rgba(254,243,199,0.8); border:1px solid rgba(245,158,11,0.2); border-radius:10px; }
.hdr-notif-icon-info-dark  { background:rgba(59,130,246,0.15); border:1px solid rgba(59,130,246,0.25); border-radius:10px; }
.hdr-notif-icon-info-light { background:rgba(219,234,254,0.8); border:1px solid rgba(59,130,246,0.2); border-radius:10px; }
.hdr-notif-icon-ok-dark    { background:rgba(20,184,166,0.15); border:1px solid rgba(20,184,166,0.25); border-radius:10px; }
.hdr-notif-icon-ok-light   { background:rgba(209,250,229,0.8); border:1px solid rgba(20,184,166,0.2); border-radius:10px; }

.hdr-notif-scroll {
  max-height: 320px; overflow-y: auto;
  scrollbar-width: thin; scrollbar-color: rgba(99,148,255,0.2) transparent;
}
.hdr-notif-scroll::-webkit-scrollbar { width: 3px; }
.hdr-notif-scroll::-webkit-scrollbar-track { background: transparent; }
.hdr-notif-scroll::-webkit-scrollbar-thumb { background: rgba(99,148,255,0.2); border-radius: 2px; }

.hdr-markall-dark  { color:rgba(99,148,255,0.6); font-size:11px; font-weight:500; background:none; border:none; cursor:pointer; transition:color .18s; font-family:'DM Sans',sans-serif; }
.hdr-markall-dark:hover  { color:#93c5fd; }
.hdr-markall-light { color:rgba(37,99,235,0.55); font-size:11px; font-weight:500; background:none; border:none; cursor:pointer; transition:color .18s; font-family:'DM Sans',sans-serif; }
.hdr-markall-light:hover { color:#1d4ed8; }

.hdr-notif-empty-dark  { color: rgba(99,148,255,0.4); }
.hdr-notif-empty-light { color: rgba(37,99,235,0.35); }
`;

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const shortRole = (peran, bidang) => {
  if (!peran) return "Guest";
  if (peran.toLowerCase() === "admin portofolio" && bidang) return bidang.toUpperCase();
  return { "customer service":"CS", "admin keuangan":"Keuangan", "koordinator":"Koordinator" }[peran.toLowerCase()] || peran;
};

const ROLE_LABEL = {
  "customer service":  "Customer Service",
  "admin keuangan":    "Admin Keuangan",
  "admin portofolio":  "Admin Portofolio",
  "koordinator":       "Koordinator",
};

/* ─────────────────────────────────────────────
   NOTIF TYPE CONFIG
───────────────────────────────────────────── */
const NOTIF_TYPE = {
  warning: { Icon: AlertCircle, colorDark:"#fbbf24", colorLight:"#d97706", wrapDark:"hdr-notif-icon-warn-dark", wrapLight:"hdr-notif-icon-warn-light" },
  info:    { Icon: Info,        colorDark:"#60a5fa", colorLight:"#2563eb", wrapDark:"hdr-notif-icon-info-dark", wrapLight:"hdr-notif-icon-info-light" },
  success: { Icon: CheckCircle, colorDark:"#2dd4bf", colorLight:"#0d9488", wrapDark:"hdr-notif-icon-ok-dark",   wrapLight:"hdr-notif-icon-ok-light"   },
};

/* ─────────────────────────────────────────────
   NOTIFICATION PANEL
───────────────────────────────────────────── */
const NotifPanel = ({ d, notifs, onMarkAll, onClose }) => {
  const unread = notifs.filter((n) => !n.read).length;
  return (
    <div className={`hdr-notif-panel-${d ? "dark" : "light"}`} style={{ width: 340 }}>
      <div style={{ padding:"14px 16px", borderBottom:`1px solid ${d?"rgba(99,148,255,0.1)":"rgba(59,130,246,0.09)"}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <Bell style={{ width:14, height:14, color:d?"rgba(148,163,220,0.6)":"#6885b5" }} />
          <span className={`hdr-text-primary-${d?"dark":"light"}`} style={{ fontSize:13, fontWeight:600 }}>Notifikasi</span>
          {unread > 0 && (
            <span style={{ background:"linear-gradient(135deg,#ef4444,#f97316)", color:"white", fontSize:10, fontWeight:700, padding:"1px 7px", borderRadius:20 }}>
              {unread}
            </span>
          )}
        </div>
        {unread > 0 && (
          <button className={`hdr-markall-${d?"dark":"light"}`} onClick={onMarkAll} style={{ display:"flex", alignItems:"center", gap:4 }}>
            <CheckCheck style={{ width:11, height:11 }} /> Tandai semua dibaca
          </button>
        )}
      </div>
      <div className="hdr-notif-scroll">
        {notifs.length === 0 ? (
          <div style={{ padding:"36px 16px", textAlign:"center" }}>
            <Bell style={{ width:28, height:28, margin:"0 auto 10px", opacity:0.25, color:d?"#93c5fd":"#2563eb" }} />
            <p className={`hdr-notif-empty-${d?"dark":"light"}`} style={{ fontSize:13, margin:0 }}>Tidak ada notifikasi</p>
          </div>
        ) : notifs.map((n) => {
          const cfg = NOTIF_TYPE[n.type] || NOTIF_TYPE.info;
          const Icon = cfg.Icon;
          return (
            <div key={n.id} className={`hdr-notif-item-${d?"dark":"light"}`}>
              <div style={{ display:"flex", gap:10 }}>
                <div className={cfg[`wrap${d?"Dark":"Light"}`]} style={{ width:34, height:34, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Icon style={{ width:15, height:15, color:cfg[`color${d?"Dark":"Light"}`] }} />
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p className={`hdr-text-primary-${d?"dark":"light"}`} style={{ fontSize:12.5, fontWeight:n.read?400:600, margin:"0 0 2px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {n.title}
                  </p>
                  <p style={{ fontSize:11.5, margin:"0 0 5px", lineHeight:1.4, color:d?"rgba(148,163,220,0.65)":"#6885b5", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                    {n.body}
                  </p>
                  <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                    <Clock style={{ width:10, height:10, color:d?"rgba(99,148,255,0.4)":"rgba(37,99,235,0.35)" }} />
                    <span style={{ fontSize:10.5, color:d?"rgba(99,148,255,0.4)":"rgba(37,99,235,0.35)", fontFamily:"'DM Mono',monospace" }}>{n.time}</span>
                  </div>
                </div>
                {!n.read && <div className="hdr-notif-unread-dot" />}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ padding:"10px 16px", borderTop:`1px solid ${d?"rgba(99,148,255,0.08)":"rgba(59,130,246,0.07)"}`, textAlign:"center" }}>
        <button onClick={onClose}
          style={{ fontSize:12, fontWeight:500, background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", color:d?"rgba(99,148,255,0.55)":"rgba(37,99,235,0.5)", transition:"color .18s" }}
          onMouseEnter={(e) => e.currentTarget.style.color = d?"#93c5fd":"#1d4ed8"}
          onMouseLeave={(e) => e.currentTarget.style.color = d?"rgba(99,148,255,0.55)":"rgba(37,99,235,0.5)"}>
          Lihat semua notifikasi →
        </button>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   PROFILE DROPDOWN
───────────────────────────────────────────── */
const ProfileDropdown = ({ d, userData, initial, canSwitch, otherRoles, onSwitch, onClose, logout }) => (
  <div style={{ width: 256 }}>
    <div style={{ padding:"14px 16px", borderBottom:`1px solid ${d?"rgba(99,148,255,0.1)":"rgba(59,130,246,0.09)"}` }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
        <div className="hdr-avatar" style={{ width:38, height:38, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:600, fontSize:14, flexShrink:0 }}>
          {initial}
        </div>
        <div style={{ overflow:"hidden" }}>
          <p className={`hdr-text-primary-${d?"dark":"light"}`} style={{ fontSize:13, fontWeight:600, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {userData.nama || "User"}
          </p>
          <p style={{ fontSize:11, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", color:d?"rgba(99,148,255,0.5)":"rgba(37,99,235,0.5)" }}>
            {userData.email || ""}
          </p>
        </div>
      </div>
      <div className={`hdr-role-${d?"dark":"light"}`} style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 10px", borderRadius:8 }}>
        <div className="hdr-active-dot" />
        <span className={`hdr-role-text-${d?"dark":"light"}`} style={{ fontSize:11, fontWeight:500 }}>
          {userData.peran || "Guest"}{userData.bidang ? ` — ${userData.bidang.toUpperCase()}` : ""}
        </span>
      </div>
    </div>

    {canSwitch && otherRoles.length > 0 && (
      <div style={{ borderBottom:`1px solid ${d?"rgba(99,148,255,0.08)":"rgba(59,130,246,0.07)"}` }}>
        <p className={`hdr-switch-lbl-${d?"dark":"light"}`}>GANTI PERAN</p>
        {otherRoles.map((role, i) => (
          <button
            key={i}
            className={`hdr-switch-item-${d?"dark":"light"}`}
            onClick={() => { onClose(); onSwitch(role); }}
          >
            <div className={`hdr-other-dot-${d?"dark":"light"}`} />
            <div style={{ flex:1, textAlign:"left" }}>
              <p style={{ fontSize:12.5, fontWeight:500, lineHeight:1.2, margin:0 }}>
                {ROLE_LABEL[role.peran?.toLowerCase()] || role.peran}
              </p>
              {role.bidang && (
                <p style={{ fontSize:10.5, marginTop:1, color:d?"rgba(99,148,255,0.45)":"rgba(37,99,235,0.4)" }}>
                  {role.bidang.toUpperCase()}
                </p>
              )}
            </div>
            <RefreshCw style={{ width:12, height:12, opacity:0.4, flexShrink:0 }} />
          </button>
        ))}
      </div>
    )}

    <div style={{ padding:"4px 0" }}>
      <Link to="/profile" className={`hdr-drop-base hdr-drop-${d?"dark":"light"}`} onClick={onClose}>
        <User style={{ width:15, height:15, opacity:0.65 }} />
        Profil Pengguna
      </Link>
      <button className={`hdr-drop-base hdr-drop-logout-${d?"dark":"light"}`} onClick={() => { onClose(); logout(); }}>
        <LogOut style={{ width:15, height:15 }} />
        Logout
      </button>
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   MAIN HEADER
───────────────────────────────────────────── */
export default function Header({ onHamburger }) {
  const { isDark, toggle } = useTheme();
  const { activeUser, otherRoles, canSwitch, switchRole, logout } = useUser();
  const navigate = useNavigate();
  const d = isDark;

  const userData = activeUser || {};
  const initial  = userData.nama ? userData.nama.charAt(0).toUpperCase() : "U";

  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [switching,   setSwitching]   = useState(false);
  const [mounted,     setMounted]     = useState(false);
  const [greeting,    setGreeting]    = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  const { notifications, unreadCount, markAllRead } = useNotifications(userData);

  const profileRefDesktop = useRef(null);
  const profileRefMobile  = useRef(null);
  const notifRefDesktop   = useRef(null);
  const notifRefMobile    = useRef(null);

  // Hitung tinggi header aktual untuk dropdown mobile
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(54);

  useEffect(() => {
    setMounted(true);
    const updateGreeting = () => {
      const h = new Date().getHours();
      if (h >= 5  && h < 12)  setGreeting("Selamat Pagi");
      else if (h >= 12 && h < 15) setGreeting("Selamat Siang");
      else if (h >= 15 && h < 19) setGreeting("Selamat Sore");
      else setGreeting("Selamat Malam");
    };
    updateGreeting();
    const gi = setInterval(updateGreeting, 60000);
    const ti = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => { clearInterval(gi); clearInterval(ti); };
  }, []);

  // Update header height dinamis
  useEffect(() => {
    if (!headerRef.current) return;
    const ro = new ResizeObserver(() => {
      setHeaderHeight(headerRef.current?.offsetHeight || 54);
    });
    ro.observe(headerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const inProfileDesktop = profileRefDesktop.current?.contains(e.target);
      const inProfileMobile  = profileRefMobile.current?.contains(e.target);
      const inNotifDesktop   = notifRefDesktop.current?.contains(e.target);
      const inNotifMobile    = notifRefMobile.current?.contains(e.target);

      if (profileOpen && !inProfileDesktop && !inProfileMobile) setProfileOpen(false);
      if (notifOpen   && !inNotifDesktop   && !inNotifMobile)   setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [profileOpen, notifOpen]);

  const handleSwitch = (targetRole) => {
    setSwitching(true);
    setTimeout(() => {
      switchRole(targetRole);
      setSwitching(false);
    }, 380);
  };

  const timeStr = currentTime.toLocaleTimeString("id-ID", { hour:"2-digit", minute:"2-digit", second:"2-digit" });
  const dateStr = currentTime.toLocaleDateString("id-ID", { weekday:"long", year:"numeric", month:"long", day:"numeric" });

  // Top position untuk dropdown mobile = tepat di bawah header
  const mobileDropTop = headerHeight + 4;

  return (
    <>
      <style>{STYLES}</style>

      {switching && <div className="hdr-switch-flash" />}

      {/* Spacer khusus mobile supaya konten di bawah tidak tertutup header fixed */}
      <div className="hdr-spacer-mobile md:hidden" />

      <header
        ref={headerRef}
        className={`hdr-root ${d?"hdr-glass-dark":"hdr-glass-light"} ${mounted?"hdr-mounted":"opacity-0"}`}
        style={{ transition:"background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease" }}
      >
        <div className={d?"hdr-accent-dark":"hdr-accent-light"} />

        {/* ══════ DESKTOP ══════ */}
        <div className="hidden md:flex items-center justify-between px-6 py-3 gap-4">
          {/* Left */}
          <div className="flex items-center gap-4 min-w-0">
            <div className={`${d?"hdr-badge-dark":"hdr-badge-light"} flex items-center gap-1.5 px-3 py-1.5 rounded-lg flex-shrink-0`}>
              <Sparkles style={{ width:12, height:12, color:"rgba(219,234,254,0.85)" }} />
              <span style={{ fontSize:10.5, fontWeight:600, letterSpacing:"0.12em", color:"white" }}>SIMDOR</span>
            </div>
            <div className={`hdr-divider-${d?"dark":"light"}`} style={{ width:1, height:28, flexShrink:0 }} />
            <div className="min-w-0">
              <p className={`hdr-text-primary-${d?"dark":"light"}`} style={{ fontSize:14.5, fontWeight:600, lineHeight:1.2, whiteSpace:"nowrap", transition:"color .35s" }}>
                {greeting},{" "}
                <span className={`hdr-text-accent-${d?"dark":"light"}`} style={{ transition:"color .35s" }}>{userData.nama || "User"}</span>
              </p>
              <p className={`hdr-text-muted-${d?"dark":"light"}`} style={{ fontSize:11, marginTop:2, transition:"color .35s" }}>{dateStr}</p>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <span className={`hdr-clock hdr-clock-${d?"dark":"light"} hidden lg:block`} style={{ transition:"color .35s" }}>{timeStr}</span>
            <div className={`hdr-divider-${d?"dark":"light"} hidden lg:block`} style={{ width:1, height:20 }} />

            <button onClick={toggle} className={`theme-toggle theme-toggle-${d?"dark":"light"}`} aria-label="Toggle theme">
              <span className={`toggle-knob toggle-knob-${d?"dark":"light"}`}>
                {d ? <Moon style={{ width:11, height:11, color:"white" }} /> : <Sun style={{ width:11, height:11, color:"white" }} />}
              </span>
            </button>
            <div className={`hdr-divider-${d?"dark":"light"}`} style={{ width:1, height:20 }} />

            {/* Bell desktop */}
            <div className="relative" ref={notifRefDesktop}>
              <button
                className={`hdr-icon-${d?"dark":"light"} relative w-9 h-9 flex items-center justify-center`}
                onClick={() => { setNotifOpen((v) => !v); setProfileOpen(false); }}
                aria-label="Notifikasi"
              >
                <Bell style={{ width:16, height:16 }} />
                {unreadCount > 0 && (
                  <span className="hdr-notif-badge absolute top-1 right-1 w-[15px] h-[15px] flex items-center justify-center text-[8px] font-bold text-white rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 z-50">
                  <NotifPanel d={d} notifs={notifications} onMarkAll={markAllRead} onClose={() => setNotifOpen(false)} />
                </div>
              )}
            </div>

            {/* Profile desktop */}
            <div className="relative" ref={profileRefDesktop}>
              <button
                onClick={() => { setProfileOpen((v) => !v); setNotifOpen(false); }}
                className={`hdr-profile-${d?"dark":"light"} flex items-center gap-2.5 px-2.5 py-1.5`}
                aria-label="Menu profil"
              >
                <div className="hdr-avatar w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  {initial}
                </div>
                <div className="hidden lg:block text-left">
                  <p className={`hdr-text-primary-${d?"dark":"light"}`} style={{ fontSize:13, fontWeight:500, lineHeight:1.2, maxWidth:110, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis", transition:"color .35s" }}>
                    {userData.nama || "User"}
                  </p>
                  <p style={{ fontSize:10.5, maxWidth:110, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis", transition:"color .35s", color:d?"rgba(99,148,255,0.5)":"rgba(37,99,235,0.5)" }}>
                    {shortRole(userData.peran, userData.bidang)}
                  </p>
                </div>
                <ChevronDown style={{ width:13, height:13, color:d?"rgba(99,148,255,0.5)":"rgba(37,99,235,0.45)", transition:"transform 0.28s ease, color .35s", transform:profileOpen?"rotate(180deg)":"rotate(0deg)", flexShrink:0 }} />
              </button>

              {profileOpen && (
                <div className={`${d?"hdr-dropdown-dark":"hdr-dropdown-light"} absolute right-0 mt-2 z-50`}>
                  <ProfileDropdown
                    d={d} userData={userData} initial={initial}
                    canSwitch={canSwitch} otherRoles={otherRoles}
                    onSwitch={handleSwitch}
                    onClose={() => setProfileOpen(false)} logout={logout}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ══════ MOBILE ══════ */}
        <div className="flex md:hidden items-center justify-between px-4 py-2.5">
          <button className={`hdr-icon-${d?"dark":"light"} w-9 h-9 flex items-center justify-center`} onClick={onHamburger} aria-label="Buka menu">
            <Menu style={{ width:17, height:17 }} />
          </button>

          <span className={`hdr-mobile-logo-${d?"dark":"light"}`}>SIMDOR</span>

          <div className="flex items-center gap-1.5">
            <button onClick={toggle} className={`hdr-icon-${d?"dark":"light"} w-9 h-9 flex items-center justify-center`} aria-label="Toggle tema">
              {d ? <Moon style={{ width:15, height:15 }} /> : <Sun style={{ width:15, height:15 }} />}
            </button>

            {/* Bell mobile */}
            <div className="relative" ref={notifRefMobile}>
              <button
                className={`hdr-icon-${d?"dark":"light"} relative w-9 h-9 flex items-center justify-center`}
                onClick={() => { setNotifOpen((v) => !v); setProfileOpen(false); }}
                aria-label="Notifikasi"
              >
                <Bell style={{ width:16, height:16 }} />
                {unreadCount > 0 && (
                  <span className="hdr-notif-badge absolute top-1 right-1 w-[15px] h-[15px] flex items-center justify-center text-[8px] font-bold text-white rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div
                  className={`hdr-dropdown-mobile-${d?"dark":"light"}`}
                  style={{ position:"fixed", top: mobileDropTop, right:8, left:8, zIndex:9999 }}
                >
                  <NotifPanel d={d} notifs={notifications} onMarkAll={markAllRead} onClose={() => setNotifOpen(false)} />
                </div>
              )}
            </div>

            {/* Avatar mobile */}
            <div className="relative" ref={profileRefMobile}>
              <button
                className={`hdr-icon-${d?"dark":"light"} w-9 h-9 flex items-center justify-center`}
                onClick={() => { setProfileOpen((v) => !v); setNotifOpen(false); }}
                aria-label="Menu profil"
                style={{ borderRadius:"50%", padding:0, overflow:"hidden" }}
              >
                <div className="hdr-avatar w-full h-full flex items-center justify-center text-white text-sm font-semibold" style={{ borderRadius:"inherit" }}>
                  {initial}
                </div>
              </button>
              {profileOpen && (
                <div
                  className={`hdr-dropdown-mobile-${d?"dark":"light"}`}
                  style={{ position:"fixed", top: mobileDropTop, right:8, zIndex:9999 }}
                >
                  <ProfileDropdown
                    d={d} userData={userData} initial={initial}
                    canSwitch={canSwitch} otherRoles={otherRoles}
                    onSwitch={handleSwitch}
                    onClose={() => setProfileOpen(false)} logout={logout}
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