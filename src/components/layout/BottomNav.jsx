import { useLocation, useNavigate, Link } from "react-router-dom";
import { LayoutDashboard, Folder, FileText, BarChart2, User, X, ChevronRight } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useTheme } from "./ThemeContext";
import { useUser } from "../../context/UserContext";

/* ─────────────────────────────────────────
   PORTO LIST — sama persis dengan Sidebar
───────────────────────────────────────── */
const PORTO_LIST = [
  "BATUBARA","KSP","PIK","INDUSTRI","HMPM",
  "AEBT","MINERAL","HALAL","LABORATORIUM","SERCO","LSI"
];

/* ─────────────────────────────────────────
   STYLES
───────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

.bnav-root {
  font-family: 'DM Sans', sans-serif;
  position: fixed;
  left: 0; right: 0;
  z-index: 9990;
}

/* ── NAV SURFACE ── */
.bnav-dark {
  background: rgba(5, 8, 20, 0.92);
  backdrop-filter: blur(32px) saturate(180%);
  -webkit-backdrop-filter: blur(32px) saturate(180%);
  border-top: 1px solid rgba(96, 165, 250, 0.1);
  box-shadow: 0 -8px 40px rgba(0,0,0,0.55), 0 -1px 0 rgba(96,165,250,0.06);
}
.bnav-light {
  background: rgba(248, 251, 255, 0.95);
  backdrop-filter: blur(32px) saturate(180%);
  -webkit-backdrop-filter: blur(32px) saturate(180%);
  border-top: 1px solid rgba(59,130,246,0.12);
  box-shadow: 0 -4px 28px rgba(59,130,246,0.08), 0 -1px 0 rgba(255,255,255,0.7);
}

/* ── ACCENT LINE ── */
.bnav-accent-dark  { height: 1px; background: linear-gradient(90deg, transparent 0%, rgba(37,99,235,0.35) 30%, rgba(96,165,250,0.5) 50%, rgba(37,99,235,0.35) 70%, transparent 100%); }
.bnav-accent-light { height: 1px; background: linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.2) 30%, rgba(59,130,246,0.38) 50%, rgba(59,130,246,0.2) 70%, transparent 100%); }

/* ── MOUNT ANIMATION ── */
@keyframes bnavIn {
  from { transform: translateY(100%); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
.bnav-mounted { animation: bnavIn 0.5s cubic-bezier(0.22,1,0.36,1) forwards; }

/* ── NAV ITEMS ── */
.bnav-items {
  display: flex;
  align-items: stretch;
  padding: 4px 6px 2px;
  gap: 2px;
}

.bnav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex: 1;
  padding: 8px 4px 7px;
  text-decoration: none;
  position: relative;
  transition: all 0.2s cubic-bezier(0.22,1,0.36,1);
  -webkit-tap-highlight-color: transparent;
  cursor: pointer;
  background: none;
  border: none;
  border-radius: 14px;
  min-height: 52px;
}
.bnav-item:active { transform: scale(0.9); }

/* Colors inactive */
.bnav-item-dark  { color: rgba(96, 125, 180, 0.55); }
.bnav-item-light { color: rgba(37, 99, 235, 0.38); }

/* Colors active */
.bnav-item-dark.bnav-active  { color: #93c5fd; }
.bnav-item-light.bnav-active { color: #1d4ed8; }

/* Active background pill */
.bnav-item-dark.bnav-active  { background: rgba(37,99,235,0.14); box-shadow: inset 0 1px 0 rgba(255,255,255,0.04); }
.bnav-item-light.bnav-active { background: rgba(219,234,254,0.75); }

/* ── ICON CONTAINER ── */
.bnav-icon {
  width: 24px; height: 24px;
  display: flex; align-items: center; justify-content: center;
  position: relative;
  transition: transform 0.25s cubic-bezier(0.22,1,0.36,1);
}
.bnav-item.bnav-active .bnav-icon { transform: translateY(-1px); }
.bnav-item:not(.bnav-active):hover .bnav-icon { transform: translateY(-2px); }

/* ── ACTIVE DOT ── */
.bnav-dot {
  position: absolute;
  bottom: -5px; left: 50%;
  transform: translateX(-50%);
  width: 4px; height: 4px;
  border-radius: 50%;
}
.bnav-item-dark.bnav-active  .bnav-dot { background: #60a5fa; box-shadow: 0 0 7px rgba(96,165,250,0.9); }
.bnav-item-light.bnav-active .bnav-dot { background: #2563eb; box-shadow: 0 0 6px rgba(37,99,235,0.5); }
@keyframes dotPop { from { transform: translateX(-50%) scale(0); } to { transform: translateX(-50%) scale(1); } }
.bnav-dot { animation: dotPop 0.25s cubic-bezier(0.22,1,0.36,1) forwards; }

/* ── LABEL ── */
.bnav-label {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  transition: opacity 0.2s;
  line-height: 1;
}
.bnav-item:not(.bnav-active) .bnav-label { opacity: 0.7; }

/* ── RIPPLE ── */
.bnav-item::after {
  content: '';
  position: absolute; inset: 3px;
  border-radius: 11px;
  background: rgba(59,130,246,0.12);
  opacity: 0; transform: scale(0.75);
  transition: opacity 0.15s, transform 0.15s;
}
.bnav-item:active::after { opacity: 1; transform: scale(1); }

/* ─────────────────────────────────────────
   PORTO BOTTOM SHEET
───────────────────────────────────────── */
.pbs-overlay {
  position: fixed; inset: 0;
  z-index: 10000;
  transition: opacity 0.3s ease;
}
.pbs-overlay.pbs-visible { opacity: 1; }
.pbs-overlay.pbs-hidden  { opacity: 0; pointer-events: none; }

.pbs-backdrop {
  position: absolute; inset: 0;
}
.pbs-backdrop-dark  { background: rgba(0,0,0,0.65); }
.pbs-backdrop-light { background: rgba(15,30,60,0.35); }

.pbs-sheet {
  position: absolute;
  left: 0; right: 0; bottom: 0;
  border-radius: 22px 22px 0 0;
  font-family: 'DM Sans', sans-serif;
  transition: transform 0.38s cubic-bezier(0.22,1,0.36,1);
  max-height: 72vh;
  display: flex; flex-direction: column;
  overflow: hidden;
}
.pbs-sheet-dark {
  background: rgba(7, 12, 28, 0.97);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(99,148,255,0.12);
  border-bottom: none;
  box-shadow: 0 -16px 64px rgba(0,0,0,0.7), 0 -1px 0 rgba(99,148,255,0.08);
}
.pbs-sheet-light {
  background: rgba(246, 250, 255, 0.98);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(59,130,246,0.14);
  border-bottom: none;
  box-shadow: 0 -8px 40px rgba(59,130,246,0.12);
}

.pbs-overlay.pbs-visible  .pbs-sheet { transform: translateY(0); }
.pbs-overlay.pbs-hidden   .pbs-sheet { transform: translateY(100%); }

/* handle */
.pbs-handle { width: 36px; height: 4px; border-radius: 100px; margin: 12px auto 0; flex-shrink: 0; }
.pbs-sheet-dark  .pbs-handle { background: rgba(99,148,255,0.2); }
.pbs-sheet-light .pbs-handle { background: rgba(37,99,235,0.15); }

/* header */
.pbs-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 18px 10px;
  flex-shrink: 0;
}
.pbs-title-dark  { font-size: 15px; font-weight: 700; color: #e2e8f8; letter-spacing: -0.01em; }
.pbs-title-light { font-size: 15px; font-weight: 700; color: #0f1f40; letter-spacing: -0.01em; }
.pbs-subtitle-dark  { font-size: 10.5px; color: rgba(99,148,255,0.45); margin-top: 2px; letter-spacing: 0.02em; }
.pbs-subtitle-light { font-size: 10.5px; color: rgba(37,99,235,0.45); margin-top: 2px; letter-spacing: 0.02em; }

.pbs-close {
  width: 30px; height: 30px; border-radius: 9px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  border: none; transition: all 0.18s ease;
}
.pbs-close-dark  { background: rgba(255,255,255,0.06); color: rgba(148,163,220,0.7); }
.pbs-close-dark:hover  { background: rgba(255,255,255,0.1); color: #93c5fd; }
.pbs-close-light { background: rgba(59,130,246,0.08); color: #4b6ea8; }
.pbs-close-light:hover { background: rgba(59,130,246,0.15); color: #1d4ed8; }

/* divider */
.pbs-divider-dark  { height: 1px; background: rgba(99,148,255,0.09); margin: 0 18px; flex-shrink: 0; }
.pbs-divider-light { height: 1px; background: rgba(59,130,246,0.1);  margin: 0 18px; flex-shrink: 0; }

/* list */
.pbs-list {
  overflow-y: auto;
  padding: 10px 12px 16px;
  flex: 1;
}
.pbs-list::-webkit-scrollbar { width: 3px; }
.pbs-list::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.2); border-radius: 10px; }

.pbs-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 7px;
}

.pbs-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 11px 14px;
  border-radius: 13px;
  text-decoration: none;
  border: 1px solid transparent;
  transition: all 0.18s cubic-bezier(0.22,1,0.36,1);
  -webkit-tap-highlight-color: transparent;
  cursor: pointer;
}
.pbs-item:active { transform: scale(0.96); }

.pbs-item-dark  {
  background: rgba(255,255,255,0.03);
  border-color: rgba(99,148,255,0.1);
  color: rgba(148,163,220,0.75);
}
.pbs-item-dark:hover  {
  background: rgba(37,99,235,0.12);
  border-color: rgba(59,130,246,0.3);
  color: #93c5fd;
  transform: translateX(2px);
  box-shadow: 0 0 14px rgba(59,130,246,0.1);
}
.pbs-item-dark.pbs-item-active {
  background: rgba(37,99,235,0.2);
  border-color: rgba(59,130,246,0.38);
  color: #93c5fd;
  box-shadow: 0 0 16px rgba(59,130,246,0.14), inset 0 1px 0 rgba(255,255,255,0.04);
}
.pbs-item-light  {
  background: rgba(255,255,255,0.7);
  border-color: rgba(59,130,246,0.12);
  color: #3b5ea8;
}
.pbs-item-light:hover  {
  background: rgba(219,234,254,0.8);
  border-color: rgba(59,130,246,0.28);
  color: #1d4ed8;
  transform: translateX(2px);
  box-shadow: 0 0 10px rgba(59,130,246,0.08);
}
.pbs-item-light.pbs-item-active {
  background: rgba(219,234,254,0.9);
  border-color: rgba(59,130,246,0.32);
  color: #1d4ed8;
  box-shadow: 0 0 12px rgba(59,130,246,0.1);
}

.pbs-item-name { font-size: 12px; font-weight: 600; letter-spacing: 0.02em; }
.pbs-item-chevron { opacity: 0.4; transition: opacity 0.15s; flex-shrink: 0; }
.pbs-item:hover .pbs-item-chevron, .pbs-item.pbs-item-active .pbs-item-chevron { opacity: 0.7; }

/* accent top */
.pbs-accent-dark  { height: 2px; background: linear-gradient(90deg, transparent 0%, rgba(37,99,235,0.5) 30%, rgba(96,165,250,0.65) 50%, rgba(37,99,235,0.5) 70%, transparent 100%); flex-shrink: 0; }
.pbs-accent-light { height: 2px; background: linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.3) 30%, rgba(59,130,246,0.5) 50%, rgba(59,130,246,0.3) 70%, transparent 100%); flex-shrink: 0; }
`;

/* ─────────────────────────────────────────
   VISUAL VIEWPORT HOOK
───────────────────────────────────────── */
function useVisualViewportBottom() {
  const [bottomOffset, setBottomOffset] = useState(() => {
    const vv = window.visualViewport;
    if (!vv) return 0;
    return Math.max(0, Math.round(window.innerHeight - (vv.offsetTop + vv.height)));
  });
  const rafRef = useRef(null);

  useEffect(() => {
    const vv = window.visualViewport;
    const compute = () => {
      if (!vv) { setBottomOffset(0); return; }
      setBottomOffset(Math.max(0, Math.round(window.innerHeight - (vv.offsetTop + vv.height))));
    };
    const schedule = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(compute);
    };
    if (vv) { vv.addEventListener("resize", schedule); vv.addEventListener("scroll", schedule); }
    window.addEventListener("resize", schedule);
    return () => {
      if (vv) { vv.removeEventListener("resize", schedule); vv.removeEventListener("scroll", schedule); }
      window.removeEventListener("resize", schedule);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return bottomOffset;
}

/* ─────────────────────────────────────────
   PORTO BOTTOM SHEET
───────────────────────────────────────── */
function PortoSheet({ visible, onClose, isDark, user }) {
  const location = useLocation();

  // lock scroll saat sheet terbuka
  useEffect(() => {
    if (visible) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [visible]);

  const d = isDark;
  const isItemActive = (item) =>
    location.pathname === `/orders/${item.toLowerCase()}`;

  return (
    <div
      className={`pbs-overlay ${visible ? "pbs-visible" : "pbs-hidden"}`}
      onTouchMove={visible ? (e) => e.stopPropagation() : undefined}
    >
      {/* backdrop */}
      <div
        className={`pbs-backdrop ${d ? "pbs-backdrop-dark" : "pbs-backdrop-light"}`}
        onClick={onClose}
      />

      {/* sheet */}
      <div className={`pbs-sheet ${d ? "pbs-sheet-dark" : "pbs-sheet-light"}`}>
        <div className={d ? "pbs-accent-dark" : "pbs-accent-light"} />
        <div className="pbs-handle" />
        <div className="pbs-header">
          <div>
            <p className={d ? "pbs-title-dark" : "pbs-title-light"}>Portofolio</p>
            <p className={d ? "pbs-subtitle-dark" : "pbs-subtitle-light"}>
              {user?.peran === "admin portofolio"
                ? "Bidang anda"
                : `${PORTO_LIST.length} bidang tersedia`}
            </p>
          </div>
          <button className={`pbs-close ${d ? "pbs-close-dark" : "pbs-close-light"}`} onClick={onClose}>
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>

        <div className={d ? "pbs-divider-dark" : "pbs-divider-light"} />

        <div className="pbs-list">
          {user?.peran === "admin portofolio" ? (
            /* Admin portofolio: hanya 1 bidang sendiri */
            <Link
              to={`/orders/${user.bidang?.toLowerCase()}`}
              className={`pbs-item ${d ? "pbs-item-dark" : "pbs-item-light"} ${
                isItemActive(user.bidang || "") ? "pbs-item-active" : ""
              }`}
              style={{ display: "flex" }}
              onClick={onClose}
            >
              <span className="pbs-item-name">{user.bidang}</span>
              <ChevronRight className="pbs-item-chevron" style={{ width: 14, height: 14 }} />
            </Link>
          ) : (
            /* Semua peran lain: tampilkan full list dalam grid 2 kolom */
            <div className="pbs-grid">
              {PORTO_LIST.map((item) => (
                <Link
                  key={item}
                  to={`/orders/${item.toLowerCase()}`}
                  className={`pbs-item ${d ? "pbs-item-dark" : "pbs-item-light"} ${
                    isItemActive(item) ? "pbs-item-active" : ""
                  }`}
                  onClick={onClose}
                >
                  <span className="pbs-item-name">{item}</span>
                  <ChevronRight className="pbs-item-chevron" style={{ width: 13, height: 13 }} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
export default function BottomNav() {
  const { isDark } = useTheme();
  const { activeUser } = useUser();
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  const [portoSheetOpen, setPortoSheetOpen] = useState(false);
  const bottomOffset = useVisualViewportBottom();

  useEffect(() => { setMounted(true); }, []);

  const user = activeUser;

  const dashMap = {
    "customer service":  "/dashboard-cs",
    "admin keuangan":    "/dashboard-keuangan",
    "admin portofolio":  "/dashboard-portofolio",
    "koordinator":       "/dashboard-koordinator",
  };
  const dashPath = dashMap[user?.peran] || "/dashboard-cs";

  const isActive = (path, matchPrefix) => {
    if (matchPrefix) return location.pathname.startsWith(matchPrefix);
    return location.pathname === path;
  };

  const isPortoActive = location.pathname.startsWith("/orders");
  const showDokumen =
    user?.peran === "admin keuangan" || user?.peran === "admin portofolio";

  const navItems = [
    {
      key: "dashboard",
      path: dashPath,
      icon: <LayoutDashboard style={{ width: 19, height: 19 }} />,
      label: "Dashboard",
      active: isActive(dashPath),
    },
    {
      key: "porto",
      isPorto: true,
      icon: <Folder style={{ width: 19, height: 19 }} />,
      label: user?.peran === "admin portofolio" ? "Orders" : "Porto",
      active: isPortoActive,
    },
    showDokumen && {
      key: "dokumen",
      path: "/documents",
      icon: <FileText style={{ width: 19, height: 19 }} />,
      label: "Dokumen",
      active: isActive("/documents"),
    },
    {
      key: "laporan",
      path: "/laporan",
      icon: <BarChart2 style={{ width: 19, height: 19 }} />,
      label: "Laporan",
      active: isActive("/laporan"),
    },
    {
      key: "profil",
      path: "/profile",
      icon: <User style={{ width: 19, height: 19 }} />,
      label: "Profil",
      active: isActive("/profile"),
    },
  ].filter(Boolean);

  const d = isDark;

  const renderItem = (item) => {
    const cls = `bnav-item ${d ? "bnav-item-dark" : "bnav-item-light"} ${item.active ? "bnav-active" : ""}`;

    const inner = (
      <>
        <div className="bnav-icon">
          {item.icon}
          {item.active && <span className="bnav-dot" />}
        </div>
        <span className="bnav-label">{item.label}</span>
      </>
    );

    if (item.isPorto) {
      return (
        <button
          key={item.key}
          className={cls}
          onClick={() => setPortoSheetOpen(true)}
          aria-label="Buka portofolio"
        >
          {inner}
        </button>
      );
    }

    return (
      <Link key={item.key} to={item.path} className={cls}>
        {inner}
      </Link>
    );
  };

  return (
    <>
      <style>{STYLES}</style>

      {/* Porto bottom sheet */}
      <PortoSheet
        visible={portoSheetOpen}
        onClose={() => setPortoSheetOpen(false)}
        isDark={d}
        user={user}
      />

      <nav
        className={`bnav-root ${d ? "bnav-dark" : "bnav-light"} ${
          mounted ? "bnav-mounted" : "opacity-0"
        }`}
        style={{
          bottom: bottomOffset,
          transition: [
            "background 0.4s ease",
            "border-color 0.4s ease",
            `bottom ${bottomOffset > 100 ? "0.05s" : "0.15s"} ease-out`,
          ].join(", "),
        }}
      >
        <div className={d ? "bnav-accent-dark" : "bnav-accent-light"} />
        <div className="bnav-items">
          {navItems.map(renderItem)}
        </div>
        {bottomOffset === 0 && (
          <div style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
        )}
      </nav>
    </>
  );
}