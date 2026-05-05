import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

/**
 * useAuthGuard — Custom hook RBAC yang aman dari redirect palsu.
 *
 * MASALAH YANG DISELESAIKAN:
 * Saat halaman dashboard pertama kali mount, UserContext butuh waktu
 * 1 render cycle untuk membaca localStorage. Di jeda itu activeUser = null
 * → guard RBAC mendeteksi "belum login" → redirect ke "/" (login page)
 * meskipun user sudah login. Ini menyebabkan loop: login → dashboard → login.
 *
 * SOLUSI:
 * Tunda eksekusi guard selama 50ms (1-2 render cycle) agar UserContext
 * sempat menginisialisasi state dari localStorage sebelum guard berjalan.
 *
 * CARA PAKAI:
 *   const { isReady, userData } = useAuthGuard("admin portofolio");
 *   if (!isReady) return null; // atau loading spinner
 *
 * @param {string|string[]} allowedRoles - Peran yang diizinkan (case-insensitive)
 * @returns {{ isReady: boolean, userData: object|null }}
 */
const useAuthGuard = (allowedRoles) => {
  const navigate = useNavigate();
  const { activeUser } = useUser();
  const [isReady, setIsReady] = useState(false);

  const allowed = Array.isArray(allowedRoles)
    ? allowedRoles.map(r => r.toLowerCase().trim())
    : [allowedRoles.toLowerCase().trim()];

  useEffect(() => {
    // Tunda 50ms agar UserContext sempat load dari localStorage
    const timer = setTimeout(() => {
      if (!activeUser) {
        navigate("/");
        return;
      }
      const peran = activeUser.peran?.toLowerCase().trim() ?? "";
      if (!allowed.includes(peran)) {
        navigate("/");
        return;
      }
      setIsReady(true);
    }, 50);

    return () => clearTimeout(timer);
  }, [activeUser]); // eslint-disable-line react-hooks/exhaustive-deps

  return { isReady, userData: activeUser };
};

export default useAuthGuard;