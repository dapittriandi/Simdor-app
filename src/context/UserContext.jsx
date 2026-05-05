import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

/* ─────────────────────────────────────────────
   UserContext

   Menyimpan:
   - activeUser  : data user/role yang sedang aktif
   - allRoles    : semua role yang dimiliki user (dari login multi-dokumen)
   - switchRole  : fungsi untuk ganti role tanpa logout
   - logout      : fungsi logout bersih

   FIX: State awal TIDAK lagi dibaca dari localStorage di sini.
   Login.jsx bertanggung jawab menulis localStorage dan navigate ke dashboard.
   UserContext hanya membaca saat mount JIKA user sudah di halaman dashboard
   (bukan di halaman login — Login.jsx akan clear localStorage saat mount).

   Cara pakai di komponen manapun:
     const { activeUser, allRoles, switchRole, logout, canSwitch } = useUser();
───────────────────────────────────────────── */

const UserContext = createContext(null);

const ROLE_DASH = {
  "customer service":  "/dashboard-cs",
  "admin keuangan":    "/dashboard-keuangan",
  "admin portofolio":  "/dashboard-portofolio",
  "koordinator":       "/dashboard-koordinator",
};

/**
 * Helper: Baca & parse localStorage dengan aman.
 * Return null jika key tidak ada atau JSON corrupt.
 */
const safeRead = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(key); // hapus data corrupt
    return null;
  }
};

/**
 * Helper: Validasi objek user minimal memiliki field 'peran'.
 */
const isValidUser = (u) => u && typeof u === "object" && typeof u.peran === "string" && u.peran.trim() !== "";

export const UserProvider = ({ children }) => {
  const navigate = useNavigate();

  // ─── State inisialisasi dari localStorage ───────────────────────────────
  // Login.jsx clear localStorage saat mount di halaman login, sehingga
  // pembacaan di sini hanya relevan saat user refresh halaman dashboard.
  const [activeUser, setActiveUser] = useState(() => {
    const u = safeRead("user");
    return isValidUser(u) ? u : null;
  });

  const [allRoles, setAllRoles] = useState(() => {
    const roles = safeRead("userRoles");
    if (Array.isArray(roles) && roles.length > 0 && roles.every(isValidUser)) {
      return roles;
    }
    return [];
  });

  // Backward compat: jika allRoles kosong tapi activeUser ada, isi dari activeUser
  useEffect(() => {
    if (activeUser && allRoles.length === 0) {
      const roles = [activeUser];
      setAllRoles(roles);
      localStorage.setItem("userRoles", JSON.stringify(roles));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Simpan activeUser ke localStorage setiap berubah (untuk refresh protection)
  useEffect(() => {
    if (activeUser) {
      localStorage.setItem("user", JSON.stringify(activeUser));
    }
  }, [activeUser]);

  /**
   * initSession — Dipanggil dari Login setelah fetch semua roles berhasil.
   * Catatan: Login.jsx saat ini menulis localStorage langsung (via navigateBasedOnRole)
   * dan UserContext membacanya saat dashboard mount. initSession tersedia sebagai
   * alternatif jika Login ingin pakai pattern context-first.
   */
  const initSession = useCallback((selectedRole, roles) => {
    if (!isValidUser(selectedRole)) {
      console.error("initSession: selectedRole tidak valid", selectedRole);
      return;
    }

    // Normalisasi peran ke lowercase
    const normalizedRole = { ...selectedRole, peran: selectedRole.peran.toLowerCase().trim() };
    const normalizedRoles = (roles && roles.length > 0 ? roles : [selectedRole]).map(r => ({
      ...r,
      peran: r.peran?.toLowerCase().trim() ?? "",
    }));

    setActiveUser(normalizedRole);
    setAllRoles(normalizedRoles);
    localStorage.setItem("user",      JSON.stringify(normalizedRole));
    localStorage.setItem("userRoles", JSON.stringify(normalizedRoles));
  }, []);

  /**
   * switchRole — Switch ke role lain tanpa logout.
   * Otomatis navigate ke dashboard sesuai peran.
   * Hanya bisa dipakai jika canSwitch === true.
   */
  const switchRole = useCallback((targetRole) => {
    if (!isValidUser(targetRole)) {
      console.error("switchRole: targetRole tidak valid", targetRole);
      return;
    }

    const normalizedRole = { ...targetRole, peran: targetRole.peran.toLowerCase().trim() };
    setActiveUser(normalizedRole);
    localStorage.setItem("user", JSON.stringify(normalizedRole));

    const dash = ROLE_DASH[normalizedRole.peran] || "/";
    navigate(dash);
  }, [navigate]);

  /**
   * logout — Hapus semua sesi dan kembali ke halaman login.
   */
  const logout = useCallback(() => {
    setActiveUser(null);
    setAllRoles([]);
    localStorage.removeItem("user");
    localStorage.removeItem("userRoles");
    navigate("/");
  }, [navigate]);

  // canSwitch: true hanya jika user memiliki lebih dari 1 role valid
  const canSwitch = allRoles.length > 1;

  // Role lain selain yang aktif (untuk UI switch role)
  const otherRoles = allRoles.filter(
    (r) => !(
      r.peran?.toLowerCase() === activeUser?.peran?.toLowerCase() &&
      r.bidang === activeUser?.bidang
    )
  );

  return (
    <UserContext.Provider value={{
      activeUser,
      allRoles,
      otherRoles,
      canSwitch,
      switchRole,
      initSession,
      logout,
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser harus dipakai di dalam <UserProvider>");
  return ctx;
};