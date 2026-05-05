import { useState, useEffect } from "react";
import { auth, db } from "../../services/firebase";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import logo from '../../assets/logo/logo-sci.jpeg';

// ─────────────────────────────────────────────────────────────
// BUG FIXES:
// 1. Tambah 'auth/invalid-credential' ke error map (Firebase SDK v9+)
// 2. Clear localStorage stale session SEBELUM navigasi
// 3. Tambah fallback peran lowercase untuk keamanan RBAC
// 4. Fix isLoading tidak di-reset saat error tak terduga
// 5. Hapus sesi lama saat halaman login dimuat (prevent redirect loop)
// ─────────────────────────────────────────────────────────────

/* ─────────────────────────────────────────
   Inline keyframe styles (no extra CSS file needed)
───────────────────────────────────────── */
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  * { box-sizing: border-box; }

  body { margin: 0; }

  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33%       { transform: translateY(-18px) rotate(1deg); }
    66%       { transform: translateY(-8px) rotate(-1deg); }
  }
  @keyframes floatSlow {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-24px); }
  }
  @keyframes gradientShift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(32px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.92) translateY(16px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes pulse-ring {
    0%   { box-shadow: 0 0 0 0 rgba(99,179,237,0.35); }
    70%  { box-shadow: 0 0 0 12px rgba(99,179,237,0); }
    100% { box-shadow: 0 0 0 0 rgba(99,179,237,0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .anim-slide-up  { animation: slideUp  0.65s cubic-bezier(.22,1,.36,1) both; }
  .anim-fade-in   { animation: fadeIn   0.3s ease both; }
  .anim-scale-in  { animation: scaleIn  0.35s cubic-bezier(.22,1,.36,1) both; }
  .anim-spin      { animation: spin 0.8s linear infinite; }

  /* ── Glassmorphism card ── */
  .glass-card {
    background: rgba(15, 23, 42, 0.72);
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid rgba(148, 163, 184, 0.12);
    border-radius: 20px;
    box-shadow:
      0 32px 80px rgba(0,0,0,0.55),
      0 0 0 1px rgba(255,255,255,0.04) inset,
      0 1px 0 rgba(255,255,255,0.08) inset;
  }

  /* ── Input ── */
  .sci-input {
    width: 100%;
    padding: 13px 14px 13px 44px;
    background: rgba(30, 41, 59, 0.7);
    border: 1px solid rgba(100,116,139,0.3);
    border-radius: 10px;
    color: #e2e8f0;
    font-family: 'Outfit', sans-serif;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  }
  .sci-input::placeholder { color: rgba(148,163,184,0.5); }
  .sci-input:focus {
    border-color: rgba(99,179,237,0.6);
    background: rgba(30,41,59,0.9);
    box-shadow: 0 0 0 3px rgba(99,179,237,0.15);
  }

  /* ── Primary button ── */
  .btn-primary {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%);
    background-size: 200% auto;
    border: none;
    border-radius: 10px;
    color: #fff;
    font-family: 'Outfit', sans-serif;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.3px;
    cursor: pointer;
    transition: background-position 0.4s, transform 0.15s, box-shadow 0.2s, opacity 0.2s;
    box-shadow: 0 4px 20px rgba(37,99,235,0.45), 0 1px 3px rgba(0,0,0,0.3);
    position: relative;
    overflow: hidden;
  }
  .btn-primary:hover:not(:disabled) {
    background-position: right center;
    transform: translateY(-1px);
    box-shadow: 0 8px 28px rgba(37,99,235,0.55);
  }
  .btn-primary:active:not(:disabled) { transform: translateY(0); }
  .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

  /* Shimmer overlay on button hover */
  .btn-primary::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%);
    background-size: 200% auto;
    animation: shimmer 2.5s linear infinite;
    border-radius: inherit;
  }

  /* ── Secondary / ghost button ── */
  .btn-ghost {
    padding: 10px 18px;
    background: rgba(30,41,59,0.6);
    border: 1px solid rgba(100,116,139,0.3);
    border-radius: 8px;
    color: #94a3b8;
    font-family: 'Outfit', sans-serif;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-ghost:hover { background: rgba(51,65,85,0.8); color: #cbd5e1; border-color: rgba(100,116,139,0.5); }

  /* ── Role card ── */
  .role-card {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 14px 16px;
    background: rgba(30,41,59,0.5);
    border: 1px solid rgba(100,116,139,0.2);
    border-radius: 12px;
    color: #cbd5e1;
    font-family: 'Outfit', sans-serif;
    cursor: pointer;
    text-align: left;
    transition: all 0.2s;
  }
  .role-card:hover {
    background: rgba(37,99,235,0.15);
    border-color: rgba(99,179,237,0.4);
    transform: translateX(4px);
    box-shadow: 0 4px 16px rgba(37,99,235,0.2);
  }
  .role-card:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(99,179,237,0.3);
  }

  /* ── Floating orbs ── */
  .orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    opacity: 0.35;
    pointer-events: none;
  }

  /* ── Label ── */
  .sci-label {
    display: block;
    font-family: 'Outfit', sans-serif;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    color: #64748b;
    margin-bottom: 7px;
  }

  /* ── Input icon wrapper ── */
  .input-icon {
    position: absolute;
    left: 13px;
    top: 50%;
    transform: translateY(-50%);
    color: #475569;
    pointer-events: none;
    transition: color 0.2s;
  }
  .input-group:focus-within .input-icon { color: #63b3ed; }

  /* ── Alert ── */
  .alert-error {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 14px;
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.25);
    border-radius: 10px;
    color: #fca5a5;
    font-family: 'Outfit', sans-serif;
    font-size: 13px;
  }
  .alert-success {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 14px;
    background: rgba(34,197,94,0.1);
    border: 1px solid rgba(34,197,94,0.25);
    border-radius: 10px;
    color: #86efac;
    font-family: 'Outfit', sans-serif;
    font-size: 13px;
  }

  /* ── Modal backdrop ── */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.75);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
    padding: 16px;
  }

  /* ── Scrollbar ── */
  .role-list::-webkit-scrollbar { width: 4px; }
  .role-list::-webkit-scrollbar-track { background: transparent; }
  .role-list::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 4px; }

  /* ── Divider line ── */
  .divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(100,116,139,0.3), transparent);
    margin: 20px 0;
  }
`;

/* ─────────────────────────────────────────
   Icon helpers (inline SVG, no dependency)
───────────────────────────────────────── */
const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
  </svg>
);
const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
  </svg>
);
const IconEyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd"/>
    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/>
  </svg>
);
const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
  </svg>
);
const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
  </svg>
);
const IconAlert = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{flexShrink:0,marginTop:1}}>
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
  </svg>
);
const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,marginTop:1}}>
    <path d="M5 13l4 4L19 7"/>
  </svg>
);
const IconChevron = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6"/>
  </svg>
);
const IconSpinner = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="anim-spin" style={{flexShrink:0}}>
    <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
    <path d="M12 2a10 10 0 0110 10" strokeLinecap="round"/>
  </svg>
);

/* Role icon map — covers semua 4 role */
const roleConfig = {
  "customer service":   { color: "#63b3ed", bg: "rgba(99,179,237,0.12)",  label: "Customer Service",   icon: "👤" },
  "admin keuangan":     { color: "#68d391", bg: "rgba(104,211,145,0.12)", label: "Admin Keuangan",      icon: "💰" },
  "admin portofolio":   { color: "#b794f4", bg: "rgba(183,148,244,0.12)", label: "Admin Portofolio",    icon: "📁" },
  "koordinator":        { color: "#f6ad55", bg: "rgba(246,173,85,0.12)",  label: "Koordinator",         icon: "👥" },
};

/* Route map — sinkron dengan UserContext.ROLE_DASH */
const ROLE_DASH = {
  "customer service":  "/dashboard-cs",
  "admin keuangan":    "/dashboard-keuangan",
  "admin portofolio":  "/dashboard-portofolio",
  "koordinator":       "/dashboard-koordinator",
};

/* ─────────────────────────────────────────
   BUG FIX #1 — Peta error code Firebase SDK v9+
   'auth/invalid-credential' adalah kode baru yang menggantikan
   'auth/wrong-password' dan 'auth/user-not-found' di versi terbaru.
───────────────────────────────────────── */
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
  // FIX UTAMA: Gunakan initSession dari UserContext agar activeUser
  // ter-update secara reaktif SEBELUM navigate ke dashboard.
  // Tanpa ini, dashboard membaca activeUser = null dan redirect balik ke login.
  const { initSession } = useUser();

  useEffect(() => {
    setMounted(true);
    // Hapus sesi lama agar tidak ada redirect loop saat halaman login dimuat
    localStorage.removeItem("user");
    localStorage.removeItem("userRoles");
    return () => setMounted(false);
  }, []);

  /**
   * Tulis sesi ke localStorage — UserContext membaca kedua key ini saat inisialisasi.
   * "user"      → role yang sedang aktif  (dibaca UserContext.activeUser)
   * "userRoles" → semua role user         (dibaca UserContext.allRoles → canSwitch)
   *
   * BUG FIX #3 — Normalkan field 'peran' ke lowercase sebelum disimpan
   * agar RBAC check (role.peran === "admin portofolio") selalu konsisten.
   */
  const navigateBasedOnRole = (userData, allRolesArr = []) => {
    // Normalisasi peran ke lowercase untuk konsistensi RBAC
    const normalizedUser = {
      ...userData,
      peran: userData.peran?.toLowerCase().trim() ?? "",
    };

    const normalizedRoles = allRolesArr.map(r => ({
      ...r,
      peran: r.peran?.toLowerCase().trim() ?? "",
    }));

    const finalRoles = normalizedRoles.length > 0 ? normalizedRoles : [normalizedUser];

    // FIX UTAMA: Panggil initSession agar UserContext.activeUser ter-update
    // secara sinkron SEBELUM navigate. Ini yang menyebabkan dashboard tidak
    // bisa detect user sudah login (activeUser masih null saat navigate).
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

      // 1. Autentikasi Firebase Auth
      await signInWithEmailAndPassword(auth, lowerEmail, password);

      // 2. Fetch data user dari Firestore
      // Query dengan lowercase email untuk toleransi typo di Firestore
      const q             = query(collection(db, "users"), where("email", "==", lowerEmail));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // Fallback: coba query tanpa normalisasi (jika email di Firestore disimpan uppercase)
        const qFallback       = query(collection(db, "users"), where("email", "==", email.trim()));
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
      // BUG FIX #1 — Gunakan peta error yang lengkap termasuk 'auth/invalid-credential'
      const msg = AUTH_ERROR_MAP[err.code] || "Login gagal. Periksa email dan password Anda.";
      setLoginError(msg);
      setIsLoading(false);
    }
  };

  /**
   * Proses hasil query roles dari Firestore.
   * Dipisah ke helper agar tidak duplikat kode antara query normal dan fallback.
   */
  const _handleRolesResult = (roles) => {
    if (roles.length === 0) {
      setLoginError("Data pengguna tidak ditemukan di sistem. Hubungi administrator.");
      setIsLoading(false);
      return;
    }

    if (roles.length > 1) {
      // Multi-role: tampilkan modal pilih portofolio/role
      // Filter hanya role yang memiliki field 'peran' valid
      const validRoles = roles.filter(r => r.peran && ROLE_DASH[r.peran?.toLowerCase().trim()]);
      
      if (validRoles.length === 0) {
        setLoginError("Tidak ada role yang valid untuk akun ini. Hubungi administrator.");
        setIsLoading(false);
        return;
      }

      // Jika semua role invalid kecuali satu, langsung masuk
      if (validRoles.length === 1) {
        navigateBasedOnRole(validRoles[0], validRoles);
        return;
      }

      setUserRoles(validRoles);
      setShowRoleModal(true);
      setIsLoading(false);
    } else {
      // Single role: langsung navigasi
      navigateBasedOnRole(roles[0], roles);
    }
  };

  const handleRoleSelect = (selectedUserData) => {
    setShowRoleModal(false);
    setIsLoading(true);
    // Kirim semua roles agar context tahu user punya multi-role → canSwitch = true
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

      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "linear-gradient(135deg, #020617 0%, #0f172a 40%, #0c1a3a 70%, #071126 100%)",
        fontFamily: "'Outfit', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}>

        {/* ── Decorative orbs ── */}
        <div className="orb" style={{ width:520, height:520, background:"#1d4ed8", top:"-180px", left:"-160px", animationName:"floatSlow", animationDuration:"9s", animationTimingFunction:"ease-in-out", animationIterationCount:"infinite" }}/>
        <div className="orb" style={{ width:400, height:400, background:"#7c3aed", bottom:"-140px", right:"-120px", opacity:0.25, animationName:"float", animationDuration:"12s", animationTimingFunction:"ease-in-out", animationIterationCount:"infinite" }}/>
        <div className="orb" style={{ width:200, height:200, background:"#0ea5e9", top:"45%", left:"55%", opacity:0.18, filter:"blur(40px)", animationName:"floatSlow", animationDuration:"7s", animationTimingFunction:"ease-in-out", animationIterationCount:"infinite", animationDelay:"2s" }}/>

        {/* ── Subtle grid overlay ── */}
        <div style={{
          position:"absolute", inset:0, pointerEvents:"none",
          backgroundImage:"linear-gradient(rgba(99,179,237,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,179,237,0.03) 1px, transparent 1px)",
          backgroundSize:"48px 48px",
        }}/>

        {/* ── Main card ── */}
        <div
          className={`glass-card ${mounted ? "anim-slide-up" : ""}`}
          style={{ width:"100%", maxWidth:420, position:"relative", zIndex:10 }}
        >
          {/* Top accent bar */}
          <div style={{
            height:3,
            background:"linear-gradient(90deg, #1d4ed8, #3b82f6, #60a5fa, #93c5fd, #3b82f6, #1d4ed8)",
            backgroundSize:"200% auto",
            animation:"gradientShift 4s linear infinite",
            borderRadius:"20px 20px 0 0",
          }}/>

          <div style={{ padding:"36px 36px 28px" }}>

            {/* Logo */}
            <div style={{ display:"flex", justifyContent:"center", marginBottom:24 }}>
              <div style={{
                width:80, height:80,
                borderRadius:16,
                background:"rgba(30,41,59,0.8)",
                border:"1px solid rgba(100,116,139,0.2)",
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:"0 8px 32px rgba(0,0,0,0.4)",
                overflow:"hidden",
                transition:"transform 0.3s",
              }}
              onMouseEnter={e => e.currentTarget.style.transform="scale(1.05)"}
              onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}
              >
                <img src={logo} alt="SCI Logo" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
              </div>
            </div>

            {/* Title */}
            <div style={{ textAlign:"center", marginBottom:28 }}>
              <h1 style={{
                margin:0,
                fontSize:22, fontWeight:700,
                color:"#f1f5f9",
                letterSpacing:"-0.3px",
              }}>
                Monitoring Data Order
              </h1>
              <p style={{ margin:"6px 0 0", color:"#64748b", fontSize:13.5 }}>
                Masuk ke akun Anda untuk melanjutkan
              </p>
              <div style={{
                margin:"12px auto 0",
                width:40, height:2,
                background:"linear-gradient(90deg, #1d4ed8, #60a5fa)",
                borderRadius:2,
              }}/>
            </div>

            {/* Error */}
            {loginError && (
              <div className="alert-error anim-fade-in" style={{ marginBottom:16 }}>
                <IconAlert/>
                <span>{loginError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin}>

              {/* Email */}
              <div style={{ marginBottom:16 }}>
                <label className="sci-label" htmlFor="email">Email</label>
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

              {/* Password */}
              <div style={{ marginBottom:8 }}>
                <label className="sci-label" htmlFor="password">Password</label>
                <div className="input-group" style={{ position:"relative" }}>
                  <span className="input-icon"><IconLock/></span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="sci-input"
                    style={{ paddingRight:44 }}
                    placeholder="Masukkan password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    style={{
                      position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
                      background:"none", border:"none", cursor:"pointer",
                      color:"#475569", padding:4, display:"flex", alignItems:"center",
                      transition:"color 0.2s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.color="#63b3ed"}
                    onMouseLeave={e => e.currentTarget.style.color="#475569"}
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPassword ? <IconEyeOff/> : <IconEye/>}
                  </button>
                </div>
              </div>

              {/* Forgot password link */}
              <div style={{ textAlign:"right", marginBottom:24 }}>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  style={{
                    background:"none", border:"none", cursor:"pointer",
                    color:"#3b82f6", fontSize:13, fontFamily:"'Outfit', sans-serif",
                    padding:0, transition:"color 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.color="#93c5fd"}
                  onMouseLeave={e => e.currentTarget.style.color="#3b82f6"}
                >
                  Lupa password?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="btn-primary"
                disabled={isLoading}
              >
                {isLoading
                  ? <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}><IconSpinner/> Memverifikasi…</span>
                  : "Masuk"}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div style={{
            padding:"14px 36px",
            borderTop:"1px solid rgba(100,116,139,0.1)",
            textAlign:"center",
          }}>
            <p style={{ margin:0, fontSize:11.5, color:"#334155", letterSpacing:0.3 }}>
              © {new Date().getFullYear()} PT. SUCOFINDO CABANG JAMBI. All rights reserved.
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
            <div className="glass-card anim-scale-in" style={{ width:"100%", maxWidth:400, padding:"28px 30px" }}>

              {/* Header */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                <div>
                  <h3 style={{ margin:0, color:"#f1f5f9", fontSize:17, fontWeight:600 }}>Reset Password</h3>
                  <p style={{ margin:"4px 0 0", color:"#64748b", fontSize:12.5 }}>Link reset akan dikirim ke email Anda</p>
                </div>
                <button
                  onClick={closeForgotModal}
                  style={{
                    background:"rgba(30,41,59,0.6)", border:"1px solid rgba(100,116,139,0.2)",
                    borderRadius:8, padding:"6px", cursor:"pointer", color:"#64748b",
                    display:"flex", alignItems:"center", transition:"all 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color="#f1f5f9"; e.currentTarget.style.borderColor="rgba(100,116,139,0.4)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color="#64748b"; e.currentTarget.style.borderColor="rgba(100,116,139,0.2)"; }}
                  aria-label="Tutup modal"
                >
                  <IconX/>
                </button>
              </div>

              {resetError   && <div className="alert-error anim-fade-in"   style={{ marginBottom:14 }}><IconAlert/><span>{resetError}</span></div>}
              {resetMessage && <div className="alert-success anim-fade-in" style={{ marginBottom:14 }}><IconCheck/><span>{resetMessage}</span></div>}

              <form onSubmit={handleResetPassword}>
                <div style={{ marginBottom:20 }}>
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
                    style={{ width:"auto", padding:"10px 22px" }}
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
            Non-dismissible by design — user HARUS pilih role
        ══════════════════════════════ */}
        {showRoleModal && (
          <div className="modal-backdrop anim-fade-in">
            <div className="glass-card anim-scale-in" style={{ width:"100%", maxWidth:420, padding:"28px 30px" }}>

              {/* Header */}
              <div style={{ marginBottom:20 }}>
                <div style={{
                  display:"inline-flex", alignItems:"center", gap:8,
                  background:"rgba(37,99,235,0.15)", border:"1px solid rgba(99,179,237,0.2)",
                  borderRadius:20, padding:"4px 12px", marginBottom:12,
                }}>
                  <span style={{ fontSize:11, color:"#63b3ed", fontWeight:600, letterSpacing:0.5, textTransform:"uppercase" }}>Multi-Akses Terdeteksi</span>
                </div>
                <h3 style={{ margin:"0 0 6px", color:"#f1f5f9", fontSize:18, fontWeight:700 }}>Pilih Role / Portofolio</h3>
                <p style={{ margin:0, color:"#64748b", fontSize:13 }}>
                  Akun Anda memiliki beberapa akses. Pilih satu untuk melanjutkan.
                </p>
              </div>

              <div className="divider"/>

              {/* Role cards */}
              <div className="role-list" style={{ display:"flex", flexDirection:"column", gap:10, maxHeight:320, overflowY:"auto", marginBottom:20 }}>
                {userRoles.map((role, i) => {
                  const peranKey = role.peran?.toLowerCase().trim() ?? "";
                  const cfg = roleConfig[peranKey] || { color:"#94a3b8", bg:"rgba(148,163,184,0.1)", label: role.peran, icon:"👤" };
                  // Tampilkan bidang jika ada (khusus admin portofolio), atau nama role
                  const detail = role.bidang ? role.bidang.toUpperCase() : null;

                  return (
                    <button
                      key={role.id ?? i}
                      className="role-card anim-fade-in"
                      onClick={() => handleRoleSelect(role)}
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      {/* Icon badge */}
                      <div style={{
                        width:44, height:44, borderRadius:12, flexShrink:0, marginRight:14,
                        background: cfg.bg,
                        border:`1px solid ${cfg.color}30`,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:20,
                      }}>
                        {cfg.icon}
                      </div>

                      {/* Text */}
                      <div style={{ flexGrow:1 }}>
                        <div style={{ fontWeight:600, fontSize:14.5, color:"#e2e8f0", textTransform:"capitalize" }}>
                          {cfg.label}
                        </div>
                        {detail && (
                          <div style={{ fontSize:12, color:"#64748b", marginTop:2 }}>{detail}</div>
                        )}
                        {role.nama && (
                          <div style={{ fontSize:11.5, color:"#475569", marginTop:1 }}>{role.nama}</div>
                        )}
                      </div>

                      {/* Arrow */}
                      <span style={{ color:"#475569", flexShrink:0 }}><IconChevron/></span>
                    </button>
                  );
                })}
              </div>

              <div style={{ textAlign:"center" }}>
                <p style={{ margin:0, fontSize:12, color:"#334155" }}>
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