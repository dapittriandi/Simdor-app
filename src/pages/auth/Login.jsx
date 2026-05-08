import { useState, useEffect } from "react";
import { auth, db } from "../../services/firebase";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import logo from '../../assets/logo/logo-sci.jpeg';

/* ─────────────────────────────────────────
   Inline styles & keyframes
───────────────────────────────────────── */
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; }

  @keyframes drift {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33%       { transform: translate(30px, -40px) scale(1.05); }
    66%       { transform: translate(-20px, -20px) scale(0.97); }
  }
  @keyframes driftAlt {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    50%       { transform: translate(-35px, 25px) rotate(3deg); }
  }
  @keyframes gradientFlow {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(40px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.90) translateY(20px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(0.8); }
  }
  @keyframes scanline {
    0%   { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }

  .anim-slide-up  { animation: slideUp  0.7s cubic-bezier(.22,1,.36,1) both; }
  .anim-fade-in   { animation: fadeIn   0.3s ease both; }
  .anim-scale-in  { animation: scaleIn  0.4s cubic-bezier(.22,1,.36,1) both; }
  .anim-spin      { animation: spin 0.8s linear infinite; }

  /* ── Card ── */
  .glass-card {
    background: rgba(8, 14, 30, 0.85);
    backdrop-filter: blur(32px) saturate(200%);
    -webkit-backdrop-filter: blur(32px) saturate(200%);
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 24px;
    box-shadow:
      0 40px 100px rgba(0,0,0,0.6),
      0 0 0 1px rgba(255,255,255,0.03) inset,
      0 1px 0 rgba(255,255,255,0.06) inset;
  }

  /* ── Input ── */
  .sci-input {
    width: 100%;
    padding: 14px 14px 14px 46px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    color: #e8edf5;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 14px;
    font-weight: 400;
    outline: none;
    transition: border-color 0.25s, box-shadow 0.25s, background 0.25s;
    letter-spacing: 0.01em;
  }
  .sci-input::placeholder { color: rgba(148,163,184,0.4); font-weight: 300; }
  .sci-input:focus {
    border-color: rgba(56, 139, 253, 0.6);
    background: rgba(56, 139, 253, 0.06);
    box-shadow: 0 0 0 4px rgba(56,139,253,0.12);
  }

  /* ── Primary button ── */
  .btn-primary {
    width: 100%;
    padding: 15px;
    background: linear-gradient(135deg, #1a56db 0%, #2563eb 50%, #3b82f6 100%);
    background-size: 200% auto;
    border: none;
    border-radius: 12px;
    color: #fff;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.2px;
    cursor: pointer;
    transition: background-position 0.4s, transform 0.15s, box-shadow 0.25s, opacity 0.2s;
    box-shadow: 0 4px 24px rgba(37,99,235,0.4), 0 1px 3px rgba(0,0,0,0.4);
    position: relative;
    overflow: hidden;
  }
  .btn-primary:hover:not(:disabled) {
    background-position: right center;
    transform: translateY(-2px);
    box-shadow: 0 12px 36px rgba(37,99,235,0.5);
  }
  .btn-primary:active:not(:disabled) { transform: translateY(0px); }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-primary::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%);
    background-size: 200% auto;
    animation: shimmer 3s linear infinite;
    border-radius: inherit;
  }

  /* ── Ghost button ── */
  .btn-ghost {
    padding: 11px 20px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    color: #94a3b8;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-ghost:hover {
    background: rgba(255,255,255,0.09);
    color: #cbd5e1;
    border-color: rgba(255,255,255,0.14);
  }

  /* ── Role card ── */
  .role-card {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 14px 16px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    color: #cbd5e1;
    font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer;
    text-align: left;
    transition: all 0.22s cubic-bezier(.22,1,.36,1);
  }
  .role-card:hover {
    background: rgba(37,99,235,0.1);
    border-color: rgba(56,139,253,0.35);
    transform: translateX(6px);
    box-shadow: 0 4px 20px rgba(37,99,235,0.15), inset 0 0 0 1px rgba(56,139,253,0.1);
  }
  .role-card:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(56,139,253,0.3);
  }

  /* ── Labels ── */
  .sci-label {
    display: block;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 11.5px;
    font-weight: 600;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: #475569;
    margin-bottom: 8px;
  }

  /* ── Input icon ── */
  .input-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #3b4d6b;
    pointer-events: none;
    transition: color 0.2s;
  }
  .input-group:focus-within .input-icon { color: #388bfd; }

  /* ── Alerts ── */
  .alert-error {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 16px;
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.2);
    border-left: 3px solid rgba(239,68,68,0.6);
    border-radius: 12px;
    color: #fca5a5;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px;
    line-height: 1.5;
  }
  .alert-success {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 16px;
    background: rgba(34,197,94,0.08);
    border: 1px solid rgba(34,197,94,0.2);
    border-left: 3px solid rgba(34,197,94,0.6);
    border-radius: 12px;
    color: #86efac;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px;
    line-height: 1.5;
  }

  /* ── Modal ── */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.8);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
    padding: 20px;
  }

  /* ── Scrollbar ── */
  .role-list::-webkit-scrollbar { width: 3px; }
  .role-list::-webkit-scrollbar-track { background: transparent; }
  .role-list::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.25); border-radius: 4px; }

  /* ── Divider ── */
  .divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent);
    margin: 20px 0;
  }

  /* ── Status badge ── */
  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    background: rgba(34,197,94,0.08);
    border: 1px solid rgba(34,197,94,0.18);
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    color: #4ade80;
  }
  .status-dot {
    width: 6px; height: 6px;
    background: #4ade80;
    border-radius: 50%;
    animation: pulse-dot 2s ease-in-out infinite;
  }
`;

/* ─────────────────────────────────────────
   Icons (inline SVG)
───────────────────────────────────────── */
const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="3"/>
    <path d="m2 7 10 7 10-7"/>
  </svg>
);
const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconEyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconAlert = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,marginTop:1}}>
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const IconCheck = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,marginTop:1}}>
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconChevron = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const IconSpinner = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="anim-spin" style={{flexShrink:0}}>
    <circle cx="12" cy="12" r="10" strokeOpacity="0.2"/>
    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
  </svg>
);
const IconShield = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

/* ─────────────────────────────────────────
   Role / Route Config
───────────────────────────────────────── */
const roleConfig = {
  "customer service":   { color: "#38bdf8", bg: "rgba(56,189,248,0.1)",   label: "Customer Service",   icon: "👤" },
  "admin keuangan":     { color: "#4ade80", bg: "rgba(74,222,128,0.1)",   label: "Admin Keuangan",      icon: "💰" },
  "admin portofolio":   { color: "#c084fc", bg: "rgba(192,132,252,0.1)",  label: "Admin Portofolio",    icon: "📁" },
  "koordinator":        { color: "#fb923c", bg: "rgba(251,146,60,0.1)",   label: "Koordinator",         icon: "👥" },
};

const ROLE_DASH = {
  "customer service":  "/dashboard-cs",
  "admin keuangan":    "/dashboard-keuangan",
  "admin portofolio":  "/dashboard-portofolio",
  "koordinator":       "/dashboard-koordinator",
};

const AUTH_ERROR_MAP = {
  "auth/invalid-credential":    "Email atau password salah.",
  "auth/wrong-password":        "Password salah.",
  "auth/user-not-found":        "Email tidak terdaftar.",
  "auth/invalid-email":         "Format email tidak valid.",
  "auth/user-disabled":         "Akun ini dinonaktifkan. Hubungi administrator.",
  "auth/too-many-requests":     "Terlalu banyak percobaan. Tunggu beberapa menit.",
  "auth/network-request-failed":"Koneksi gagal. Periksa jaringan Anda.",
  "auth/operation-not-allowed": "Metode login ini tidak diizinkan.",
};

/* ─────────────────────────────────────────
   Main Component
───────────────────────────────────────── */
const Login = () => {
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [loginError,      setLoginError]      = useState("");
  const [resetError,      setResetError]      = useState("");
  const [resetMessage,    setResetMessage]    = useState("");
  const [isLoading,       setIsLoading]       = useState(false);
  const [isResetting,     setIsResetting]     = useState(false);
  const [showPassword,    setShowPassword]    = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail,      setResetEmail]      = useState("");
  const [mounted,         setMounted]         = useState(false);
  const [showRoleModal,   setShowRoleModal]   = useState(false);
  const [userRoles,       setUserRoles]       = useState([]);

  const navigate = useNavigate();
  const { initSession } = useUser();

  useEffect(() => {
    setMounted(true);
    localStorage.removeItem("user");
    localStorage.removeItem("userRoles");
    return () => setMounted(false);
  }, []);

  const navigateBasedOnRole = (userData, allRolesArr = []) => {
    const normalizedUser = {
      ...userData,
      peran: userData.peran?.toLowerCase().trim() ?? "",
    };
    const normalizedRoles = allRolesArr.map(r => ({
      ...r,
      peran: r.peran?.toLowerCase().trim() ?? "",
    }));
    const finalRoles = normalizedRoles.length > 0 ? normalizedRoles : [normalizedUser];
    initSession(normalizedUser, finalRoles);
    const route = ROLE_DASH[normalizedUser.peran];
    if (route) {
      navigate(route);
    } else {
      setLoginError(`Peran "${normalizedUser.peran}" tidak dikenali. Hubungi administrator.`);
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setIsLoading(true);
    try {
      const lowerEmail = email.toLowerCase().trim();
      await signInWithEmailAndPassword(auth, lowerEmail, password);
      const q             = query(collection(db, "users"), where("email", "==", lowerEmail));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        const qFallback        = query(collection(db, "users"), where("email", "==", email.trim()));
        const snapshotFallback = await getDocs(qFallback);
        if (snapshotFallback.empty) {
          setLoginError("Data pengguna tidak ditemukan di sistem. Hubungi administrator.");
          setIsLoading(false);
          return;
        }
        const roles = snapshotFallback.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        _handleRolesResult(roles);
        return;
      }
      const roles = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      _handleRolesResult(roles);
    } catch (err) {
      console.error("Login error:", err.code, err.message);
      const msg = AUTH_ERROR_MAP[err.code] || "Login gagal. Periksa email dan password Anda.";
      setLoginError(msg);
      setIsLoading(false);
    }
  };

  const _handleRolesResult = (roles) => {
    if (roles.length === 0) {
      setLoginError("Data pengguna tidak ditemukan di sistem. Hubungi administrator.");
      setIsLoading(false);
      return;
    }
    if (roles.length > 1) {
      const validRoles = roles.filter(r => r.peran && ROLE_DASH[r.peran?.toLowerCase().trim()]);
      if (validRoles.length === 0) {
        setLoginError("Tidak ada role yang valid untuk akun ini. Hubungi administrator.");
        setIsLoading(false);
        return;
      }
      if (validRoles.length === 1) {
        navigateBasedOnRole(validRoles[0], validRoles);
        return;
      }
      setUserRoles(validRoles);
      setShowRoleModal(true);
      setIsLoading(false);
    } else {
      navigateBasedOnRole(roles[0], roles);
    }
  };

  const handleRoleSelect = (selectedUserData) => {
    setShowRoleModal(false);
    setIsLoading(true);
    navigateBasedOnRole(selectedUserData, userRoles);
  };

  const handleForgotPassword = () => {
    setShowForgotModal(true);
    setResetEmail(email);
    setResetError("");
    setResetMessage("");
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetMessage("");
    setResetError("");
    setIsResetting(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      setResetMessage("Email reset password telah dikirim. Silakan periksa inbox Anda.");
      setTimeout(() => {
        setShowForgotModal(false);
        setResetMessage("");
      }, 5000);
    } catch (err) {
      const msg = AUTH_ERROR_MAP[err.code] || "Gagal mengirim email. Pastikan email ini sudah terdaftar.";
      setResetError(msg);
    } finally {
      setIsResetting(false);
    }
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setResetError("");
    setResetMessage("");
  };

  /* ─── Render ─── */
  return (
    <>
      <style>{globalStyles}</style>

      {/* ══════════════════════════════
          BACKGROUND
      ══════════════════════════════ */}
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "#060c1a",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}>

        {/* Mesh gradient blobs */}
        <div style={{
          position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden",
        }}>
          <div style={{
            position:"absolute", width:700, height:700,
            background:"radial-gradient(circle, rgba(29,78,216,0.18) 0%, transparent 70%)",
            top:"-200px", left:"-200px",
            animation:"drift 18s ease-in-out infinite",
          }}/>
          <div style={{
            position:"absolute", width:600, height:600,
            background:"radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)",
            bottom:"-150px", right:"-150px",
            animation:"driftAlt 22s ease-in-out infinite",
          }}/>
          <div style={{
            position:"absolute", width:400, height:400,
            background:"radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)",
            top:"40%", left:"50%",
            animation:"drift 14s ease-in-out infinite reverse",
          }}/>
        </div>

        {/* Dot grid texture */}
        <div style={{
          position:"absolute", inset:0, pointerEvents:"none",
          backgroundImage:"radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize:"28px 28px",
        }}/>

        {/* ══════════════════════════════
            MAIN CARD
        ══════════════════════════════ */}
        <div
          className={`glass-card ${mounted ? "anim-slide-up" : ""}`}
          style={{ width:"100%", maxWidth:440, position:"relative", zIndex:10 }}
        >

          {/* Animated top accent */}
          <div style={{
            height:2,
            background:"linear-gradient(90deg, transparent, #1d4ed8, #3b82f6, #38bdf8, #3b82f6, #1d4ed8, transparent)",
            backgroundSize:"300% auto",
            animation:"gradientFlow 5s linear infinite",
            borderRadius:"24px 24px 0 0",
          }}/>

          {/* ─── Card header: Logo + Title ─── */}
          <div style={{
            padding: "36px 40px 32px",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}>
            {/* Logo + brand row */}
            <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:28 }}>
              <div style={{
                width:56, height:56,
                borderRadius:14,
                border:"1px solid rgba(255,255,255,0.1)",
                background:"rgba(255,255,255,0.05)",
                display:"flex", alignItems:"center", justifyContent:"center",
                overflow:"hidden",
                boxShadow:"0 8px 32px rgba(0,0,0,0.5)",
                flexShrink: 0,
                transition:"transform 0.3s, box-shadow 0.3s",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform="scale(1.06)"; e.currentTarget.style.boxShadow="0 12px 40px rgba(37,99,235,0.3)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform="scale(1)"; e.currentTarget.style.boxShadow="0 8px 32px rgba(0,0,0,0.5)"; }}
              >
                <img src={logo} alt="SUCOFINDO Logo" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
              </div>
              <div>
                <div style={{
                  fontSize:11, fontWeight:700, letterSpacing:"1.2px",
                  textTransform:"uppercase", color:"#3b82f6", marginBottom:3,
                }}>
                  PT. SUCOFINDO
                </div>
                <div style={{ fontSize:15, fontWeight:700, color:"#e8edf5", lineHeight:1.2 }}>
                  Cabang Jambi
                </div>
              </div>
              {/* Spacer + status */}
              <div style={{ marginLeft:"auto" }}>
                <div className="status-badge">
                  <div className="status-dot"/>
                  Online
                </div>
              </div>
            </div>

            {/* Heading */}
            <div>
              <h1 style={{
                margin:0,
                fontSize:26, fontWeight:800,
                color:"#f0f5ff",
                letterSpacing:"-0.5px",
                lineHeight:1.1,
              }}>
                Selamat Datang
              </h1>
              <p style={{
                margin:"8px 0 0",
                fontSize:14, color:"#4a5568",
                fontWeight:400, lineHeight:1.5,
              }}>
                Masuk ke <span style={{ color:"#64748b" }}>Sistem Monitoring Data Order</span> untuk melanjutkan
              </p>
            </div>
          </div>

          {/* ─── Form body ─── */}
          <div style={{ padding:"28px 40px" }}>

            {/* Error alert */}
            {loginError && (
              <div className="alert-error anim-fade-in" style={{ marginBottom:20 }}>
                <IconAlert/>
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin}>

              {/* Email field */}
              <div style={{ marginBottom:16 }}>
                <label className="sci-label" htmlFor="email">Alamat Email</label>
                <div className="input-group" style={{ position:"relative" }}>
                  <span className="input-icon"><IconMail/></span>
                  <input
                    id="email"
                    type="email"
                    className="sci-input"
                    placeholder="nama@perusahaan.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password field */}
              <div style={{ marginBottom:6 }}>
                <label className="sci-label" htmlFor="password">Kata Sandi</label>
                <div className="input-group" style={{ position:"relative" }}>
                  <span className="input-icon"><IconLock/></span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="sci-input"
                    style={{ paddingRight:46 }}
                    placeholder="Masukkan kata sandi"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    style={{
                      position:"absolute", right:13, top:"50%", transform:"translateY(-50%)",
                      background:"none", border:"none", cursor:"pointer",
                      color:"#3b4d6b", padding:4, display:"flex", alignItems:"center",
                      transition:"color 0.2s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.color="#388bfd"}
                    onMouseLeave={e => e.currentTarget.style.color="#3b4d6b"}
                    aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  >
                    {showPassword ? <IconEyeOff/> : <IconEye/>}
                  </button>
                </div>
              </div>

              {/* Forgot password */}
              <div style={{ textAlign:"right", marginBottom:24, marginTop:10 }}>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  style={{
                    background:"none", border:"none", cursor:"pointer",
                    color:"#3b82f6", fontSize:13, fontFamily:"'Plus Jakarta Sans', sans-serif",
                    fontWeight:500, padding:0, transition:"color 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.color="#93c5fd"}
                  onMouseLeave={e => e.currentTarget.style.color="#3b82f6"}
                >
                  Lupa kata sandi?
                </button>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="btn-primary"
                disabled={isLoading}
              >
                {isLoading
                  ? <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                      <IconSpinner/> Memverifikasi…
                    </span>
                  : <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                      <IconShield/> Masuk ke Sistem
                    </span>
                }
              </button>

            </form>
          </div>

          {/* ─── Footer ─── */}
          <div style={{
            padding:"14px 40px 18px",
            borderTop:"1px solid rgba(255,255,255,0.04)",
            display:"flex",
            alignItems:"center",
            justifyContent:"center",
            gap:8,
          }}>
            <div style={{
              width:16, height:16, opacity:0.3,
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              <IconShield/>
            </div>
            <p style={{
              margin:0, fontSize:11.5, color:"#1e293b",
              letterSpacing:0.2, fontWeight:500,
            }}>
              © {new Date().getFullYear()} PT. Sucofindo Cabang Jambi · Sistem Terlindungi
            </p>
          </div>
        </div>

        {/* ══════════════════════════════
            FORGOT PASSWORD MODAL
        ══════════════════════════════ */}
        {showForgotModal && (
          <div
            className="modal-backdrop anim-fade-in"
            onClick={e => { if (e.target === e.currentTarget) closeForgotModal(); }}
          >
            <div className="glass-card anim-scale-in" style={{ width:"100%", maxWidth:400, padding:"30px 32px" }}>

              {/* Header */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:22 }}>
                <div>
                  <div style={{
                    display:"inline-flex", alignItems:"center", gap:6,
                    padding:"4px 10px",
                    background:"rgba(59,130,246,0.1)",
                    border:"1px solid rgba(59,130,246,0.2)",
                    borderRadius:20, marginBottom:10,
                  }}>
                    <span style={{ fontSize:10.5, color:"#60a5fa", fontWeight:700, letterSpacing:"0.8px", textTransform:"uppercase" }}>Reset Akses</span>
                  </div>
                  <h3 style={{ margin:0, color:"#f0f5ff", fontSize:18, fontWeight:700, letterSpacing:"-0.3px" }}>Reset Kata Sandi</h3>
                  <p style={{ margin:"5px 0 0", color:"#475569", fontSize:13 }}>Link reset akan dikirim ke email Anda</p>
                </div>
                <button
                  onClick={closeForgotModal}
                  style={{
                    background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)",
                    borderRadius:8, padding:"7px", cursor:"pointer", color:"#475569",
                    display:"flex", alignItems:"center", transition:"all 0.2s", flexShrink:0,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color="#e2e8f0"; e.currentTarget.style.background="rgba(255,255,255,0.1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color="#475569"; e.currentTarget.style.background="rgba(255,255,255,0.05)"; }}
                  aria-label="Tutup modal"
                >
                  <IconX/>
                </button>
              </div>

              {resetError   && <div className="alert-error anim-fade-in"   style={{ marginBottom:16 }}><IconAlert/><span>{resetError}</span></div>}
              {resetMessage && <div className="alert-success anim-fade-in" style={{ marginBottom:16 }}><IconCheck/><span>{resetMessage}</span></div>}

              <form onSubmit={handleResetPassword}>
                <div style={{ marginBottom:22 }}>
                  <label className="sci-label" htmlFor="resetEmail">Email Terdaftar</label>
                  <div style={{ position:"relative" }}>
                    <span className="input-icon"><IconMail/></span>
                    <input
                      id="resetEmail"
                      type="email"
                      className="sci-input"
                      placeholder="nama@perusahaan.com"
                      value={resetEmail}
                      onChange={e => setResetEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
                  <button type="button" className="btn-ghost" onClick={closeForgotModal}>
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={isResetting}
                    style={{ width:"auto", padding:"11px 24px" }}
                  >
                    {isResetting
                      ? <span style={{ display:"flex", alignItems:"center", gap:8 }}><IconSpinner/> Mengirim…</span>
                      : "Kirim Link Reset"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ══════════════════════════════
            ROLE SELECTION MODAL
        ══════════════════════════════ */}
        {showRoleModal && (
          <div className="modal-backdrop anim-fade-in">
            <div className="glass-card anim-scale-in" style={{ width:"100%", maxWidth:420, padding:"30px 32px" }}>

              {/* Header */}
              <div style={{ marginBottom:20 }}>
                <div style={{
                  display:"inline-flex", alignItems:"center", gap:6,
                  padding:"4px 12px",
                  background:"rgba(251,146,60,0.1)",
                  border:"1px solid rgba(251,146,60,0.2)",
                  borderRadius:20, marginBottom:12,
                }}>
                  <div style={{ width:5, height:5, background:"#fb923c", borderRadius:"50%" }}/>
                  <span style={{ fontSize:10.5, color:"#fb923c", fontWeight:700, letterSpacing:"0.8px", textTransform:"uppercase" }}>Multi-Akses Terdeteksi</span>
                </div>
                <h3 style={{ margin:"0 0 6px", color:"#f0f5ff", fontSize:20, fontWeight:800, letterSpacing:"-0.4px" }}>
                  Pilih Role Akses
                </h3>
                <p style={{ margin:0, color:"#475569", fontSize:13.5, lineHeight:1.5 }}>
                  Akun Anda memiliki beberapa akses. Pilih satu untuk melanjutkan sesi.
                </p>
              </div>

              <div className="divider"/>

              {/* Role cards */}
              <div className="role-list" style={{ display:"flex", flexDirection:"column", gap:10, maxHeight:320, overflowY:"auto", marginBottom:20 }}>
                {userRoles.map((role, i) => {
                  const peranKey = role.peran?.toLowerCase().trim() ?? "";
                  const cfg = roleConfig[peranKey] || { color:"#94a3b8", bg:"rgba(148,163,184,0.1)", label: role.peran, icon:"👤" };
                  const detail = role.bidang ? role.bidang.toUpperCase() : null;

                  return (
                    <button
                      key={role.id ?? i}
                      className="role-card anim-fade-in"
                      onClick={() => handleRoleSelect(role)}
                      style={{ animationDelay:`${i * 60}ms` }}
                    >
                      {/* Icon */}
                      <div style={{
                        width:44, height:44, borderRadius:12, flexShrink:0, marginRight:14,
                        background: cfg.bg,
                        border:`1px solid ${cfg.color}25`,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:20,
                      }}>
                        {cfg.icon}
                      </div>

                      {/* Text */}
                      <div style={{ flexGrow:1 }}>
                        <div style={{ fontWeight:700, fontSize:14.5, color:"#e8edf5", textTransform:"capitalize" }}>
                          {cfg.label}
                        </div>
                        {detail && (
                          <div style={{ fontSize:11.5, color:"#475569", marginTop:2, fontWeight:500, letterSpacing:"0.3px" }}>
                            {detail}
                          </div>
                        )}
                        {role.nama && (
                          <div style={{ fontSize:11.5, color:"#334155", marginTop:1 }}>{role.nama}</div>
                        )}
                      </div>

                      {/* Arrow */}
                      <span style={{ color:"#2d3f5e", flexShrink:0 }}><IconChevron/></span>
                    </button>
                  );
                })}
              </div>

              <div style={{
                textAlign:"center", padding:"10px 0 0",
                borderTop:"1px solid rgba(255,255,255,0.04)",
              }}>
                <p style={{ margin:0, fontSize:12, color:"#1e293b", letterSpacing:"0.2px" }}>
                  Anda harus memilih role untuk melanjutkan
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Login;