import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Mail, Shield, Folder, ArrowLeft,
  ChevronRight, LogOut, ExternalLink, RefreshCw,
} from "lucide-react";
import { useTheme } from "../../components/layout/ThemeContext";
import { useUser } from "../../context/UserContext";

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&display=swap');

.pp-root { font-family: 'DM Sans', sans-serif; }

/* ── Page background ── */
.pp-bg-dark  { background: #070b18; min-height: 100vh; }
.pp-bg-light { background: #f0f6ff; min-height: 100vh; }

/* ── Avatar ring ── */
@keyframes ppRingRotate { to { transform: rotate(360deg); } }
.pp-avatar-ring {
  background: conic-gradient(#1d4ed8, #60a5fa, #a78bfa, #34d399, #1d4ed8);
  border-radius: 50%;
  padding: 3px;
  animation: ppRingRotate 4s linear infinite;
}
.pp-avatar-inner {
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pp-avatar-inner-dark  { background: #0f172a; }
.pp-avatar-inner-light { background: #eff6ff; }

/* ── Name & role text ── */
.pp-name-dark  { color: #e2e8f5; font-size:22px; font-weight:700; letter-spacing:-0.02em; }
.pp-name-light { color: #1e3a5f; font-size:22px; font-weight:700; letter-spacing:-0.02em; }
.pp-email-dark  { color: rgba(99,148,255,0.55); font-size:13px; }
.pp-email-light { color: rgba(37,99,235,0.5);   font-size:13px; }

/* ── Role badge ── */
.pp-role-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
}
/* per-role colors */
.pp-role-cs-dark      { background:rgba(59,130,246,0.14); border:1px solid rgba(59,130,246,0.3);  color:#93c5fd; }
.pp-role-cs-light     { background:rgba(219,234,254,0.8); border:1px solid rgba(147,197,253,0.7); color:#1d4ed8; }
.pp-role-keu-dark     { background:rgba(16,185,129,0.14); border:1px solid rgba(16,185,129,0.3);  color:#6ee7b7; }
.pp-role-keu-light    { background:rgba(220,252,231,0.8); border:1px solid rgba(134,239,172,0.7); color:#059669; }
.pp-role-porto-dark   { background:rgba(139,92,246,0.14); border:1px solid rgba(139,92,246,0.3);  color:#c4b5fd; }
.pp-role-porto-light  { background:rgba(237,233,254,0.8); border:1px solid rgba(196,181,253,0.7); color:#6d28d9; }
.pp-role-koor-dark    { background:rgba(245,158,11,0.14); border:1px solid rgba(245,158,11,0.3);  color:#fde68a; }
.pp-role-koor-light   { background:rgba(254,243,199,0.8); border:1px solid rgba(253,230,138,0.7); color:#b45309; }
.pp-role-def-dark     { background:rgba(99,148,255,0.1);  border:1px solid rgba(99,148,255,0.22); color:rgba(179,193,240,0.85); }
.pp-role-def-light    { background:rgba(241,245,249,1);   border:1px solid rgba(203,213,225,1);   color:#475569; }

/* ── Stats row (ala Instagram) ── */
.pp-stat-dark  { border-top:1px solid rgba(99,148,255,0.1); border-bottom:1px solid rgba(99,148,255,0.1); }
.pp-stat-light { border-top:1px solid rgba(59,130,246,0.1); border-bottom:1px solid rgba(59,130,246,0.1); }
.pp-stat-val-dark  { font-size:22px; font-weight:700; font-family:'DM Mono',monospace; color:#e2e8f5; }
.pp-stat-val-light { font-size:22px; font-weight:700; font-family:'DM Mono',monospace; color:#1e3a5f; }
.pp-stat-lbl-dark  { font-size:10.5px; color:rgba(99,148,255,0.5); margin-top:2px; }
.pp-stat-lbl-light { font-size:10.5px; color:rgba(37,99,235,0.45); margin-top:2px; }
.pp-stat-sep-dark  { width:1px; background:rgba(99,148,255,0.1); }
.pp-stat-sep-light { width:1px; background:rgba(59,130,246,0.1); }

/* ── Glass card ── */
.pp-card-dark {
  background: rgba(12,18,40,0.75);
  backdrop-filter: blur(24px) saturate(160%);
  -webkit-backdrop-filter: blur(24px) saturate(160%);
  border: 1px solid rgba(99,148,255,0.13);
  box-shadow: 0 4px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.03);
  border-radius: 18px;
}
.pp-card-light {
  background: rgba(240,246,255,0.82);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(59,130,246,0.14);
  box-shadow: 0 4px 24px rgba(59,130,246,0.08), inset 0 1px 0 rgba(255,255,255,0.7);
  border-radius: 18px;
}

/* ── Info row ── */
.pp-row-dark  { border-radius:12px; background:rgba(255,255,255,0.03); border:1px solid rgba(99,148,255,0.08); transition:all 0.2s; }
.pp-row-dark:hover  { background:rgba(59,130,246,0.07); border-color:rgba(96,165,250,0.2); }
.pp-row-light { border-radius:12px; background:rgba(255,255,255,0.7);  border:1px solid rgba(59,130,246,0.1);  transition:all 0.2s; box-shadow:0 1px 4px rgba(59,130,246,0.05); }
.pp-row-light:hover { background:rgba(255,255,255,1); border-color:rgba(59,130,246,0.22); box-shadow:0 2px 10px rgba(59,130,246,0.09); }

.pp-row-lbl-dark  { font-size:10.5px; color:rgba(99,148,255,0.5); }
.pp-row-lbl-light { font-size:10.5px; color:rgba(37,99,235,0.45); }
.pp-row-val-dark  { font-size:13.5px; font-weight:500; color:#e2e8f5; margin-top:2px; }
.pp-row-val-light { font-size:13.5px; font-weight:500; color:#1e3a5f; margin-top:2px; }

/* ── Icon wrapper ── */
.pp-icon-dark  { background:rgba(255,255,255,0.05); border:1px solid rgba(99,148,255,0.15); border-radius:10px; }
.pp-icon-light { background:rgba(255,255,255,0.85); border:1px solid rgba(59,130,246,0.15); border-radius:10px; box-shadow:0 1px 4px rgba(59,130,246,0.08); }

/* ── Section label ── */
.pp-sec-lbl-dark  { font-size:10px; font-weight:700; letter-spacing:0.12em; color:rgba(99,148,255,0.45); }
.pp-sec-lbl-light { font-size:10px; font-weight:700; letter-spacing:0.12em; color:rgba(37,99,235,0.4); }

/* ── Portfolio grid card ── */
.pp-porto-dark {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(99,148,255,0.1);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.22,1,0.36,1);
  position: relative;
  overflow: hidden;
}
.pp-porto-dark::before {
  content:''; position:absolute; inset:0;
  background: linear-gradient(135deg,rgba(59,130,246,0.06),rgba(139,92,246,0.04));
  opacity:0; transition:opacity 0.2s;
}
.pp-porto-dark:hover { border-color:rgba(96,165,250,0.32); box-shadow:0 0 24px rgba(59,130,246,0.15), 0 4px 20px rgba(0,0,0,0.3); transform:translateY(-2px); }
.pp-porto-dark:hover::before { opacity:1; }

.pp-porto-light {
  background: rgba(255,255,255,0.72);
  border: 1px solid rgba(59,130,246,0.12);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.22,1,0.36,1);
  box-shadow: 0 2px 8px rgba(59,130,246,0.07);
}
.pp-porto-light:hover { background:rgba(255,255,255,1); border-color:rgba(59,130,246,0.3); box-shadow:0 6px 24px rgba(59,130,246,0.13); transform:translateY(-2px); }

.pp-porto-name-dark  { font-size:13px; font-weight:700; letter-spacing:0.06em; color:#e2e8f5; }
.pp-porto-name-light { font-size:13px; font-weight:700; letter-spacing:0.06em; color:#1e3a5f; }
.pp-porto-lbl-dark   { font-size:10px; color:rgba(99,148,255,0.45); margin-top:2px; }
.pp-porto-lbl-light  { font-size:10px; color:rgba(37,99,235,0.4); margin-top:2px; }

/* ── Porto dot accent ── */
.pp-porto-dot {
  width:8px; height:8px; border-radius:50%;
  background: linear-gradient(135deg,#3b82f6,#a78bfa);
  box-shadow: 0 0 8px rgba(59,130,246,0.6);
}

/* ── Go button (primary) ── */
.pp-btn-primary-dark {
  background: linear-gradient(135deg,#1d4ed8,#3b82f6);
  border: none; border-radius: 12px; color: white;
  font-weight: 600; font-size: 13px; cursor: pointer;
  box-shadow: 0 0 20px rgba(59,130,246,0.35);
  transition: all 0.2s;
}
.pp-btn-primary-dark:hover { box-shadow:0 0 28px rgba(59,130,246,0.5); transform:translateY(-1px); }
.pp-btn-primary-light {
  background: linear-gradient(135deg,#2563eb,#3b82f6);
  border: none; border-radius: 12px; color: white;
  font-weight: 600; font-size: 13px; cursor: pointer;
  box-shadow: 0 4px 14px rgba(37,99,235,0.28);
  transition: all 0.2s;
}
.pp-btn-primary-light:hover { box-shadow:0 6px 20px rgba(37,99,235,0.38); transform:translateY(-1px); }

/* ── Back / ghost button ── */
.pp-btn-ghost-dark  { background:rgba(255,255,255,0.04); border:1px solid rgba(99,148,255,0.18); border-radius:12px; color:rgba(148,163,220,0.8); font-size:13px; font-weight:500; cursor:pointer; transition:all 0.2s; }
.pp-btn-ghost-dark:hover  { background:rgba(59,130,246,0.1); border-color:rgba(96,165,250,0.35); color:#93c5fd; }
.pp-btn-ghost-light { background:rgba(255,255,255,0.75); border:1px solid rgba(59,130,246,0.18); border-radius:12px; color:#4b6ea8; font-size:13px; font-weight:500; cursor:pointer; transition:all 0.2s; box-shadow:0 1px 4px rgba(59,130,246,0.08); }
.pp-btn-ghost-light:hover { background:rgba(219,234,254,0.7); border-color:rgba(59,130,246,0.3); color:#2563eb; }

/* ── Logout button ── */
.pp-btn-logout-dark  { background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.2); border-radius:12px; color:#fca5a5; font-size:13px; font-weight:500; cursor:pointer; transition:all 0.2s; }
.pp-btn-logout-dark:hover  { background:rgba(239,68,68,0.14); border-color:rgba(239,68,68,0.35); }
.pp-btn-logout-light { background:rgba(254,226,226,0.6); border:1px solid rgba(252,165,165,0.4); border-radius:12px; color:#b91c1c; font-size:13px; font-weight:500; cursor:pointer; transition:all 0.2s; }
.pp-btn-logout-light:hover { background:rgba(254,226,226,0.9); border-color:rgba(252,165,165,0.6); }

/* ── Accent bar ── */
@keyframes accentFlow { 0%{background-position:0 0} 100%{background-position:200% 0} }
.pp-accent-dark  { height:2px; background:linear-gradient(90deg,transparent 0%,#1d4ed8 15%,#60a5fa 40%,#a78bfa 60%,#3b82f6 80%,transparent 100%); background-size:200% 100%; animation:accentFlow 4s linear infinite; border-radius:2px 2px 0 0; }
.pp-accent-light { height:2px; background:linear-gradient(90deg,transparent 0%,#3b82f6 15%,#93c5fd 40%,#6366f1 60%,#3b82f6 80%,transparent 100%); background-size:200% 100%; animation:accentFlow 4s linear infinite; border-radius:2px 2px 0 0; }

/* ── Skeleton shimmer ── */
@keyframes ppShimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
.pp-skel-dark  { background:linear-gradient(90deg,rgba(30,40,80,0.6) 25%,rgba(50,65,120,0.4) 50%,rgba(30,40,80,0.6) 75%); background-size:800px 100%; animation:ppShimmer 1.6s infinite linear; border-radius:8px; }
.pp-skel-light { background:linear-gradient(90deg,rgba(219,234,254,0.6) 25%,rgba(191,219,254,0.4) 50%,rgba(219,234,254,0.6) 75%); background-size:800px 100%; animation:ppShimmer 1.6s infinite linear; border-radius:8px; }

/* ── Page & card animations ── */
@keyframes ppPageIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
.pp-page-in { animation: ppPageIn 0.6s cubic-bezier(0.22,1,0.36,1) forwards; }
@keyframes ppCardIn { from{opacity:0;transform:translateY(16px) scale(0.98)} to{opacity:1;transform:translateY(0) scale(1)} }
.pp-c1 { animation: ppCardIn 0.5s 0.08s cubic-bezier(0.22,1,0.36,1) both; }
.pp-c2 { animation: ppCardIn 0.5s 0.16s cubic-bezier(0.22,1,0.36,1) both; }
.pp-c3 { animation: ppCardIn 0.5s 0.24s cubic-bezier(0.22,1,0.36,1) both; }
.pp-c4 { animation: ppCardIn 0.5s 0.32s cubic-bezier(0.22,1,0.36,1) both; }

/* ── Error state ── */
.pp-error-dark  { background:rgba(239,68,68,0.1);   border:1px solid rgba(239,68,68,0.25);  border-radius:14px; color:#fca5a5; }
.pp-error-light { background:rgba(254,226,226,0.8); border:1px solid rgba(252,165,165,0.5); border-radius:14px; color:#b91c1c; }

/* ── Divider ── */
.pp-divider-dark  { border-top:1px solid rgba(99,148,255,0.1); }
.pp-divider-light { border-top:1px solid rgba(59,130,246,0.1); }

/* ── Footer ── */
.pp-footer-dark  { color:rgba(99,148,255,0.35); font-size:11px; text-align:center; }
.pp-footer-light { color:rgba(37,99,235,0.35);  font-size:11px; text-align:center; }
`;

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const ROLE_CONFIG = {
  "customer service": {
    label: "CUSTOMER SERVICE",
    badgeDark: "pp-role-cs-dark",
    badgeLight: "pp-role-cs-light",
    iconColor: { dark: "#93c5fd", light: "#1d4ed8" },
    dashPath: "/dashboard-cs",
  },
  "admin keuangan": {
    label: "ADMIN KEUANGAN",
    badgeDark: "pp-role-keu-dark",
    badgeLight: "pp-role-keu-light",
    iconColor: { dark: "#6ee7b7", light: "#059669" },
    dashPath: "/dashboard-keuangan",
  },
  "admin portofolio": {
    label: "ADMIN PORTOFOLIO",
    badgeDark: "pp-role-porto-dark",
    badgeLight: "pp-role-porto-light",
    iconColor: { dark: "#c4b5fd", light: "#6d28d9" },
    dashPath: "/dashboard-portofolio",
  },
  koordinator: {
    label: "KOORDINATOR",
    badgeDark: "pp-role-koor-dark",
    badgeLight: "pp-role-koor-light",
    iconColor: { dark: "#fde68a", light: "#b45309" },
    dashPath: "/dashboard-koordinator",
  },
};

const getRoleConfig = (peran) =>
  ROLE_CONFIG[peran?.toLowerCase()] || {
    label: (peran || "PENGGUNA").toUpperCase(),
    badgeDark: "pp-role-def-dark",
    badgeLight: "pp-role-def-light",
    iconColor: { dark: "rgba(148,163,220,0.8)", light: "#475569" },
    dashPath: "/",
  };

const PORTOFOLIO_LIST = [
  "BATUBARA","KSP","PIK","INDUSTRI","HMPM","AEBT",
  "MINERAL","HALAL","LABORATORIUM","SERCO","LSI",
];

/* ─────────────────────────────────────────────
   SKELETON
───────────────────────────────────────────── */
const ProfileSkeleton = ({ d }) => (
  <div style={{ display:"flex", flexDirection:"column", gap:20, padding:"28px 20px", maxWidth:480, margin:"0 auto" }}>
    {/* Avatar */}
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
      <div className={d?"pp-skel-dark":"pp-skel-light"} style={{ width:90, height:90, borderRadius:"50%" }} />
      <div className={d?"pp-skel-dark":"pp-skel-light"} style={{ width:160, height:20 }} />
      <div className={d?"pp-skel-dark":"pp-skel-light"} style={{ width:100, height:16 }} />
    </div>
    <div className={d?"pp-skel-dark":"pp-skel-light"} style={{ height:72 }} />
    <div className={d?"pp-skel-dark":"pp-skel-light"} style={{ height:200 }} />
  </div>
);

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const ProfilePage = () => {
  const navigate        = useNavigate();
  const { isDark }      = useTheme();
  const d               = isDark;

  const [userData, setUserData] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [mounted,  setMounted]  = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem("user");
      if (!raw) throw new Error("Sesi tidak ditemukan. Silakan login ulang.");
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") throw new Error("Data user tidak valid.");
      setUserData({
        ...parsed,
        peran:  parsed.peran  || "Unknown Role",
        bidang: parsed.bidang || null,
        nama:   parsed.nama   || "Pengguna SIMDOR",
        email:  parsed.email  || "-",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleGoToDashboard = (path) => {
    navigate(path);
  };

  if (loading) return (
    <>
      <style>{STYLES}</style>
      <div className={`pp-root pp-bg-${d?"dark":"light"}`}>
        <ProfileSkeleton d={d} />
      </div>
    </>
  );

  if (error) return (
    <>
      <style>{STYLES}</style>
      <div className={`pp-root pp-bg-${d?"dark":"light"}`}
           style={{ padding:"28px 20px", maxWidth:480, margin:"0 auto" }}>
        <div className={`pp-error-${d?"dark":"light"}`} style={{ padding:"16px 20px" }}>
          <p style={{ fontWeight:600, fontSize:13, marginBottom:4 }}>Gagal Memuat Profil</p>
          <p style={{ fontSize:12, opacity:0.8 }}>{error}</p>
        </div>
      </div>
    </>
  );

  const peranKey    = userData.peran?.toLowerCase();
  const roleCfg     = getRoleConfig(peranKey);
  const isPortoAdmin = peranKey === "admin portofolio";
  const initial     = userData.nama?.charAt(0)?.toUpperCase() || "U";
  const iconCol     = roleCfg.iconColor[d ? "dark" : "light"];

  /* Stats untuk "Instagram header" */
  const stats = [
    { val: userData.bidang ? "1" : "—", label: "Portofolio" },
    { val: isPortoAdmin ? PORTOFOLIO_LIST.indexOf(userData.bidang?.toUpperCase()) + 1 || "—" : "—", label: "Urutan" },
    { val: new Date().getFullYear().toString(), label: "Tahun" },
  ];

  return (
    <>
      <style>{STYLES}</style>
      <div className={`pp-root pp-bg-${d?"dark":"light"} ${mounted?"pp-page-in":"opacity-0"}`}
           style={{ padding:"28px 16px", transition:"background 0.4s ease" }}>
        <div style={{ maxWidth:480, margin:"0 auto", display:"flex", flexDirection:"column", gap:16 }}>

          {/* ══════ TOP NAV ══════ */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <button
              onClick={() => navigate(-1)}
              className={`pp-btn-ghost-${d?"dark":"light"}`}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px" }}>
              <ArrowLeft style={{ width:15, height:15 }} />
              Kembali
            </button>
            <span className={`pp-sec-lbl-${d?"dark":"light"}`}>SIMDOR</span>
          </div>

          {/* ══════ PROFILE HEADER CARD ══════ */}
          <div className={`pp-card-${d?"dark":"light"} pp-c1`} style={{ overflow:"hidden" }}>
            {/* Accent bar */}
            <div className={`pp-accent-${d?"dark":"light"}`} />

            <div style={{ padding:"28px 24px 20px" }}>
              {/* Avatar + Name row */}
              <div style={{ display:"flex", alignItems:"center", gap:20, marginBottom:20 }}>
                {/* Animated ring avatar */}
                <div className="pp-avatar-ring" style={{ width:82, height:82, flexShrink:0 }}>
                  <div className={`pp-avatar-inner pp-avatar-inner-${d?"dark":"light"}`}
                       style={{ width:"100%", height:"100%",
                                background: d
                                  ? "linear-gradient(135deg,#0f172a,#1e2a5a)"
                                  : "linear-gradient(135deg,#eff6ff,#dbeafe)" }}>
                    <span style={{ fontSize:32, fontWeight:700, fontFamily:"'DM Mono',monospace",
                                   background:"linear-gradient(135deg,#3b82f6,#a78bfa)",
                                   WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                                   backgroundClip:"text" }}>
                      {initial}
                    </span>
                  </div>
                </div>

                {/* Name / email / role */}
                <div style={{ flex:1, minWidth:0 }}>
                  <p className={`pp-name-${d?"dark":"light"}`} style={{ marginBottom:3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {userData.nama}
                  </p>
                  <p className={`pp-email-${d?"dark":"light"}`} style={{ marginBottom:10, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {userData.email}
                  </p>
                  <div className={`pp-role-badge ${roleCfg[d?"badgeDark":"badgeLight"]}`}>
                    <span style={{ width:6, height:6, borderRadius:"50%",
                                   background:"currentColor", opacity:0.7,
                                   display:"inline-block", flexShrink:0 }} />
                    {roleCfg.label}
                  </div>
                </div>
              </div>

              {/* ─── Instagram-style stats row ─── */}
              <div className={`pp-stat-${d?"dark":"light"}`}
                   style={{ display:"flex", padding:"14px 0", marginBottom:20 }}>
                {["Portofolio","Peran","Tahun"].map((lbl, i) => {
                  const vals = [
                    userData.bidang?.toUpperCase() || (isPortoAdmin ? "—" : "Global"),
                    userData.peran?.split(" ").map(w => w[0].toUpperCase()).join(""),
                    new Date().getFullYear(),
                  ];
                  return (
                    <div key={lbl} style={{ flex:1, textAlign:"center", position:"relative" }}>
                      {i > 0 && <div className={`pp-stat-sep-${d?"dark":"light"}`}
                                     style={{ position:"absolute", left:0, top:"10%", height:"80%" }} />}
                      <p className={`pp-stat-val-${d?"dark":"light"}`}>{vals[i]}</p>
                      <p className={`pp-stat-lbl-${d?"dark":"light"}`}>{lbl}</p>
                    </div>
                  );
                })}
              </div>

              {/* ─── Go to dashboard button ─── */}
              <button
                onClick={() => handleGoToDashboard(roleCfg.dashPath)}
                className={`pp-btn-primary-${d?"dark":"light"}`}
                style={{ width:"100%", padding:"12px 0", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                <ExternalLink style={{ width:15, height:15 }} />
                Buka Dashboard Saya
              </button>
            </div>
          </div>

          {/* ══════ INFO DETAIL CARD ══════ */}
          <div className={`pp-card-${d?"dark":"light"} pp-c2`} style={{ padding:"18px 20px" }}>
            <p className={`pp-sec-lbl-${d?"dark":"light"}`} style={{ marginBottom:12 }}>INFORMASI AKUN</p>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {[
                { icon:<User style={{ width:15,height:15,color:iconCol }} />, label:"Nama Lengkap", val:userData.nama },
                { icon:<Mail style={{ width:15,height:15,color:iconCol }} />, label:"Email", val:userData.email },
                { icon:<Shield style={{ width:15,height:15,color:iconCol }} />, label:"Peran", val:userData.peran },
                {
                  icon:<Folder style={{ width:15,height:15,color:iconCol }} />,
                  label: isPortoAdmin ? "Portofolio" : "Bidang / Jabatan",
                  val: userData.bidang || (isPortoAdmin ? "—" : "Semua Divisi"),
                },
              ].map((row) => (
                <div key={row.label} className={`pp-row-${d?"dark":"light"}`}
                     style={{ padding:"12px 14px", display:"flex", alignItems:"center", gap:12 }}>
                  <div className={`pp-icon-${d?"dark":"light"}`}
                       style={{ width:34, height:34, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    {row.icon}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p className={`pp-row-lbl-${d?"dark":"light"}`}>{row.label}</p>
                    <p className={`pp-row-val-${d?"dark":"light"}`} style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {row.val}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ══════ PORTOFOLIO GRID (khusus admin portofolio) ══════ */}
          {isPortoAdmin && userData.bidang && (
            <div className={`pp-card-${d?"dark":"light"} pp-c3`} style={{ padding:"18px 20px" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                <p className={`pp-sec-lbl-${d?"dark":"light"}`}>PORTOFOLIO ANDA</p>
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10,
                               color:d?"rgba(99,148,255,0.45)":"rgba(37,99,235,0.4)" }}>
                  1 aktif
                </span>
              </div>

              {/* Active portfolio highlight */}
              <div
                onClick={() => handleGoToDashboard("/dashboard-portofolio")}
                className={`pp-porto-${d?"dark":"light"}`}
                style={{ padding:"18px 18px", marginBottom:12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  {/* Animated dot */}
                  <div style={{ position:"relative", flexShrink:0 }}>
                    <div className="pp-porto-dot" />
                    <div style={{ position:"absolute", inset:-3, borderRadius:"50%",
                                  border:"1px solid rgba(59,130,246,0.3)",
                                  animation:"ppRingRotate 3s linear infinite" }} />
                  </div>
                  <div style={{ flex:1 }}>
                    <p className={`pp-porto-name-${d?"dark":"light"}`}>
                      {userData.bidang.toUpperCase()}
                    </p>
                    <p className={`pp-porto-lbl-${d?"dark":"light"}`}>Portofolio Aktif — Klik untuk buka dashboard</p>
                  </div>
                  <ChevronRight style={{ width:16, height:16,
                                        color:d?"rgba(99,148,255,0.5)":"rgba(37,99,235,0.45)",
                                        flexShrink:0 }} />
                </div>

                {/* Mini info strip */}
                <div style={{ marginTop:14, paddingTop:12,
                              borderTop:d?"1px solid rgba(99,148,255,0.08)":"1px solid rgba(59,130,246,0.08)",
                              display:"flex", gap:20 }}>
                  {[
                    { label:"Status", val:"Aktif" },
                    { label:"Akses", val:"Dashboard + Data" },
                    { label:"Level", val:"Admin" },
                  ].map((info) => (
                    <div key={info.label}>
                      <p style={{ fontSize:9, fontWeight:700, letterSpacing:"0.08em",
                                  color:d?"rgba(99,148,255,0.4)":"rgba(37,99,235,0.38)" }}>
                        {info.label.toUpperCase()}
                      </p>
                      <p style={{ fontSize:11.5, fontWeight:600, marginTop:2,
                                  fontFamily:"'DM Mono',monospace",
                                  color:d?"#60a5fa":"#2563eb" }}>
                        {info.val}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* All portfolios — greyed out */}
              <p className={`pp-sec-lbl-${d?"dark":"light"}`} style={{ marginBottom:10 }}>
                SEMUA PORTOFOLIO SIMDOR
              </p>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(90px,1fr))", gap:8 }}>
                {PORTOFOLIO_LIST.map((p) => {
                  const isActive = p === userData.bidang?.toUpperCase();
                  return (
                    <div
                      key={p}
                      onClick={() => isActive && handleGoToDashboard("/dashboard-portofolio")}
                      style={{
                        padding:"10px 10px",
                        borderRadius:10,
                        textAlign:"center",
                        cursor: isActive ? "pointer" : "default",
                        border: isActive
                          ? (d ? "1px solid rgba(96,165,250,0.35)" : "1px solid rgba(37,99,235,0.3)")
                          : (d ? "1px solid rgba(99,148,255,0.07)" : "1px solid rgba(59,130,246,0.08)"),
                        background: isActive
                          ? (d ? "rgba(37,99,235,0.15)" : "rgba(219,234,254,0.7)")
                          : (d ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.4)"),
                        transition:"all 0.15s",
                      }}
                    >
                      <p style={{
                        fontSize:10, fontWeight:700, letterSpacing:"0.06em",
                        color: isActive
                          ? (d ? "#60a5fa" : "#1d4ed8")
                          : (d ? "rgba(99,148,255,0.3)" : "rgba(37,99,235,0.3)"),
                      }}>
                        {p}
                      </p>
                      {isActive && (
                        <div style={{ width:4, height:4, borderRadius:"50%",
                                      background:"#3b82f6", margin:"4px auto 0",
                                      boxShadow:"0 0 6px rgba(59,130,246,0.7)" }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══════ ACTIONS CARD ══════ */}
          <div className={`pp-card-${d?"dark":"light"} pp-c4`} style={{ padding:"18px 20px" }}>
            <p className={`pp-sec-lbl-${d?"dark":"light"}`} style={{ marginBottom:12 }}>AKSI</p>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              <button
                onClick={() => navigate(-1)}
                className={`pp-btn-ghost-${d?"dark":"light"}`}
                style={{ padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"center", gap:8, width:"100%" }}>
                <ArrowLeft style={{ width:15, height:15 }} />
                Kembali ke Halaman Sebelumnya
              </button>
              <button
                onClick={handleLogout}
                className={`pp-btn-logout-${d?"dark":"light"}`}
                style={{ padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"center", gap:8, width:"100%" }}>
                <LogOut style={{ width:15, height:15 }} />
                Keluar dari Akun
              </button>
            </div>
          </div>

          {/* ══════ FOOTER ══════ */}
          <p className={`pp-footer-${d?"dark":"light"}`} style={{ paddingBottom:8 }}>
            © {new Date().getFullYear()} SUCOFINDO · SIMDOR · All rights reserved.
          </p>

        </div>
      </div>
    </>
  );
};

export default ProfilePage;