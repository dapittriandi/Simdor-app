import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Bell, ChevronDown, LogOut, User, Sparkles, Menu, Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeContext";

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&display=swap');

.hdr-root { font-family: 'DM Sans', sans-serif; }

/* ── DARK glass ── */
.hdr-glass-dark {
  background: rgba(7,11,24,0.82);
  backdrop-filter: blur(22px) saturate(160%);
  -webkit-backdrop-filter: blur(22px) saturate(160%);
  border-bottom: 1px solid rgba(99,148,255,0.1);
  box-shadow: 0 2px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.03);
}

/* ── LIGHT glass ── */
.hdr-glass-light {
  background: rgba(240,246,255,0.88);
  backdrop-filter: blur(22px) saturate(180%);
  -webkit-backdrop-filter: blur(22px) saturate(180%);
  border-bottom: 1px solid rgba(59,130,246,0.15);
  box-shadow: 0 2px 20px rgba(59,130,246,0.08), inset 0 -1px 0 rgba(255,255,255,0.6);
}

@keyframes accentFlow {
  0% { background-position: 0 0; } 100% { background-position: 200% 0; }
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

/* ── Avatar ── */
.hdr-avatar {
  background: linear-gradient(135deg,#1d4ed8,#3b82f6);
  box-shadow: 0 0 0 2px rgba(96,165,250,0.28), 0 0 14px rgba(59,130,246,0.28);
}

/* ── Icon buttons DARK ── */
.hdr-icon-dark {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(99,148,255,0.15);
  border-radius: 10px;
  color: rgba(148,163,220,0.75);
  transition: all 0.2s ease;
}
.hdr-icon-dark:hover {
  background: rgba(59,130,246,0.1);
  border-color: rgba(96,165,250,0.35);
  color: #93c5fd;
  box-shadow: 0 0 16px rgba(59,130,246,0.15);
}

/* ── Icon buttons LIGHT ── */
.hdr-icon-light {
  background: rgba(255,255,255,0.75);
  border: 1px solid rgba(59,130,246,0.18);
  border-radius: 10px;
  color: #4b6ea8;
  transition: all 0.2s ease;
  box-shadow: 0 1px 4px rgba(59,130,246,0.08);
}
.hdr-icon-light:hover {
  background: rgba(59,130,246,0.08);
  border-color: rgba(59,130,246,0.35);
  color: #2563eb;
  box-shadow: 0 0 14px rgba(59,130,246,0.12);
}

/* ── Profile btn DARK ── */
.hdr-profile-dark {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(99,148,255,0.15);
  border-radius: 12px;
  transition: all 0.22s ease;
}
.hdr-profile-dark:hover {
  background: rgba(59,130,246,0.1);
  border-color: rgba(96,165,250,0.35);
  box-shadow: 0 0 18px rgba(59,130,246,0.14);
}

/* ── Profile btn LIGHT ── */
.hdr-profile-light {
  background: rgba(255,255,255,0.8);
  border: 1px solid rgba(59,130,246,0.18);
  border-radius: 12px;
  transition: all 0.22s ease;
  box-shadow: 0 1px 6px rgba(59,130,246,0.08);
}
.hdr-profile-light:hover {
  background: rgba(255,255,255,1);
  border-color: rgba(59,130,246,0.35);
  box-shadow: 0 4px 16px rgba(59,130,246,0.12);
}

/* Notif badge */
.hdr-notif-badge {
  background: linear-gradient(135deg,#ef4444,#f97316);
  box-shadow: 0 0 6px rgba(239,68,68,0.7);
  animation: notifPulse 2s ease-in-out infinite;
}
@keyframes notifPulse {
  0%,100% { box-shadow: 0 0 6px rgba(239,68,68,0.65); }
  50%      { box-shadow: 0 0 14px rgba(239,68,68,0.9); }
}

/* ── Dropdown DARK ── */
.hdr-dropdown-dark {
  background: rgba(7,11,24,0.96);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  border: 1px solid rgba(99,148,255,0.14);
  box-shadow: 0 20px 60px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.02);
  border-radius: 16px; overflow: hidden;
  animation: dropIn 0.2s cubic-bezier(0.22,1,0.36,1) forwards;
  transform-origin: top right;
}

/* ── Dropdown LIGHT ── */
.hdr-dropdown-light {
  background: rgba(248,251,255,0.98);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  border: 1px solid rgba(59,130,246,0.15);
  box-shadow: 0 16px 48px rgba(37,99,235,0.12), 0 0 0 1px rgba(255,255,255,0.9);
  border-radius: 16px; overflow: hidden;
  animation: dropIn 0.2s cubic-bezier(0.22,1,0.36,1) forwards;
  transform-origin: top right;
}

@keyframes dropIn {
  from { opacity: 0; transform: scale(0.95) translateY(-6px); }
  to   { opacity: 1; transform: scale(1)    translateY(0); }
}

.hdr-drop-dark { color: rgba(179,193,240,0.8); }
.hdr-drop-dark:hover { background: rgba(59,130,246,0.09); color: #93c5fd; }

.hdr-drop-light { color: #334e7a; }
.hdr-drop-light:hover { background: rgba(59,130,246,0.07); color: #1d4ed8; }

.hdr-drop-logout-dark { color: rgba(252,165,165,0.8); }
.hdr-drop-logout-dark:hover { background: rgba(239,68,68,0.09); color: #fca5a5; }

.hdr-drop-logout-light { color: #dc2626; }
.hdr-drop-logout-light:hover { background: rgba(239,68,68,0.07); color: #b91c1c; }

.hdr-drop-base {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 16px; font-size: 13px;
  transition: background 0.18s, color 0.18s;
  text-decoration: none; width: 100%;
  text-align: left; background: none; border: none; cursor: pointer;
}

/* ── Theme toggle button ── */
.theme-toggle {
  position: relative;
  width: 52px; height: 27px;
  border-radius: 14px;
  cursor: pointer; border: none;
  transition: all 0.35s cubic-bezier(0.22,1,0.36,1);
  overflow: hidden;
  flex-shrink: 0;
}
.theme-toggle-dark {
  background: rgba(37,99,235,0.25);
  border: 1px solid rgba(96,165,250,0.3);
  box-shadow: inset 0 0 12px rgba(37,99,235,0.15), 0 0 10px rgba(59,130,246,0.1);
}
.theme-toggle-light {
  background: rgba(251,191,36,0.15);
  border: 1px solid rgba(251,191,36,0.4);
  box-shadow: inset 0 0 10px rgba(251,191,36,0.12), 0 0 10px rgba(251,191,36,0.08);
}
.toggle-knob {
  position: absolute; top: 3px;
  width: 21px; height: 21px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.35s cubic-bezier(0.22,1,0.36,1);
}
.toggle-knob-dark {
  left: 3px;
  background: linear-gradient(135deg,#1d4ed8,#60a5fa);
  box-shadow: 0 0 10px rgba(59,130,246,0.5);
}
.toggle-knob-light {
  left: 28px;
  background: linear-gradient(135deg,#f59e0b,#fbbf24);
  box-shadow: 0 0 10px rgba(251,191,36,0.6);
}

/* Clock */
.hdr-clock { font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.06em; }
.hdr-clock-dark  { color: rgba(99,148,255,0.5); }
.hdr-clock-light { color: rgba(37,99,235,0.5); }

/* Mobile logo */
.hdr-mobile-logo-dark  { font-weight:700; letter-spacing:.14em; font-size:15px; background:linear-gradient(135deg,#93c5fd,#fff 60%,#60a5fa); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
.hdr-mobile-logo-light { font-weight:700; letter-spacing:.14em; font-size:15px; background:linear-gradient(135deg,#1d4ed8,#2563eb 60%,#3b82f6); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }

/* System badge */
.hdr-badge-dark  { background:linear-gradient(135deg,#1d4ed8,#3b82f6); box-shadow:0 0 14px rgba(59,130,246,0.4); }
.hdr-badge-light { background:linear-gradient(135deg,#2563eb,#60a5fa); box-shadow:0 0 14px rgba(59,130,246,0.2); }

/* Dividers */
.hdr-divider-dark  { background: rgba(99,148,255,0.15); }
.hdr-divider-light { background: rgba(37,99,235,0.12); }

/* Text colors */
.hdr-text-primary-dark  { color: #e2e8f5; }
.hdr-text-primary-light { color: #1e3a5f; }
.hdr-text-accent-dark   { color: #60a5fa; }
.hdr-text-accent-light  { color: #2563eb; }
.hdr-text-muted-dark    { color: rgba(99,148,255,0.5); }
.hdr-text-muted-light   { color: rgba(37,99,235,0.5); }
.hdr-text-sub-dark      { color: rgba(148,163,220,0.7); }
.hdr-text-sub-light     { color: #4b6ea8; }

/* Role badge */
.hdr-role-dark  { background:rgba(37,99,235,0.18); border:1px solid rgba(59,130,246,0.25); }
.hdr-role-light { background:rgba(219,234,254,0.8); border:1px solid rgba(59,130,246,0.2); }
.hdr-role-text-dark  { color: #93c5fd; }
.hdr-role-text-light { color: #1d4ed8; }

/* Dropdown divider */
.hdr-drop-divider-dark  { border-color: rgba(99,148,255,0.1); }
.hdr-drop-divider-light { border-color: rgba(59,130,246,0.1); }
`;

export default function Header({ onHamburger }) {
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [notifications] = useState(2);
  const userData = JSON.parse(localStorage.getItem("user")) || {};
  const [greeting, setGreeting] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    updateGreeting();
    const gi = setInterval(updateGreeting, 60000);
    const ti = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => { clearInterval(gi); clearInterval(ti); };
  }, []);

  const updateGreeting = () => {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) setGreeting("Selamat Pagi");
    else if (h >= 12 && h < 15) setGreeting("Selamat Siang");
    else if (h >= 15 && h < 19) setGreeting("Selamat Sore");
    else setGreeting("Selamat Malam");
  };

  useEffect(() => {
    const close = (e) => { if (isDropdownOpen && !e.target.closest(".hdr-user-menu")) setIsDropdownOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [isDropdownOpen]);

  const timeStr = currentTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateStr = currentTime.toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const initial = userData.nama ? userData.nama.charAt(0).toUpperCase() : "U";

  // Shorthand helpers
  const d = isDark; // true = dark, false = light

  return (
    <>
      <style>{STYLES}</style>

      <header
        className={`hdr-root sticky top-0 z-[9990] ${d ? "hdr-glass-dark" : "hdr-glass-light"} ${mounted ? "hdr-mounted" : "opacity-0"}`}
        style={{ transition: "background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease" }}
      >
        <div className={d ? "hdr-accent-dark" : "hdr-accent-light"} />

        {/* ══════ DESKTOP ══════ */}
        <div className="hidden md:flex items-center justify-between px-6 py-3 gap-4">

          {/* Left */}
          <div className="flex items-center gap-4 min-w-0">
            <div className={`${d ? "hdr-badge-dark" : "hdr-badge-light"} flex items-center gap-1.5 px-3 py-1.5 rounded-lg flex-shrink-0`}>
              <Sparkles style={{ width: 12, height: 12, color: d ? "rgba(219,234,254,0.85)" : "white" }} />
              <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.12em", color: "white" }}>SIMDOR</span>
            </div>

            <div className={`hdr-divider-${d ? "dark" : "light"}`} style={{ width: 1, height: 28, flexShrink: 0 }} />

            <div className="min-w-0">
              <p className={`hdr-text-primary-${d ? "dark" : "light"}`} style={{ fontSize: 14.5, fontWeight: 600, lineHeight: 1.2, whiteSpace: "nowrap", transition: "color 0.35s" }}>
                {greeting},{" "}
                <span className={`hdr-text-accent-${d ? "dark" : "light"}`} style={{ transition: "color 0.35s" }}>
                  {userData.nama || "User"}
                </span>
              </p>
              <p className={`hdr-text-muted-${d ? "dark" : "light"}`} style={{ fontSize: 11, marginTop: 2, transition: "color 0.35s" }}>
                {dateStr}
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {/* Clock */}
            <span className={`hdr-clock hdr-clock-${d ? "dark" : "light"} hidden lg:block`} style={{ transition: "color 0.35s" }}>
              {timeStr}
            </span>
            <div className={`hdr-divider-${d ? "dark" : "light"} hidden lg:block`} style={{ width: 1, height: 20, transition: "background 0.35s" }} />

            {/* ── Theme Toggle ── */}
            <button
              onClick={toggle}
              className={`theme-toggle theme-toggle-${d ? "dark" : "light"}`}
              title={d ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle theme"
            >
              <span className={`toggle-knob toggle-knob-${d ? "dark" : "light"}`}>
                {d
                  ? <Moon style={{ width: 11, height: 11, color: "white" }} />
                  : <Sun  style={{ width: 11, height: 11, color: "white" }} />
                }
              </span>
            </button>

            <div className={`hdr-divider-${d ? "dark" : "light"}`} style={{ width: 1, height: 20, transition: "background 0.35s" }} />

            {/* Bell */}
            <button className={`hdr-icon-${d ? "dark" : "light"} relative w-9 h-9 flex items-center justify-center`}>
              <Bell style={{ width: 16, height: 16 }} />
              {notifications > 0 && (
                <span className="hdr-notif-badge absolute top-1 right-1 w-[15px] h-[15px] flex items-center justify-center text-[8px] font-bold text-white rounded-full">
                  {notifications}
                </span>
              )}
            </button>

            {/* Profile */}
            <div className="relative hdr-user-menu">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`hdr-profile-${d ? "dark" : "light"} flex items-center gap-2.5 px-2.5 py-1.5`}
              >
                <div className="hdr-avatar w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  {initial}
                </div>
                <div className="hidden lg:block text-left">
                  <p className={`hdr-text-primary-${d ? "dark" : "light"}`} style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.2, maxWidth: 110, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", transition: "color 0.35s" }}>
                    {userData.nama || "User"}
                  </p>
                  <p className={`hdr-text-muted-${d ? "dark" : "light"}`} style={{ fontSize: 10.5, maxWidth: 110, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", transition: "color 0.35s" }}>
                    {userData.peran || "Guest"}
                  </p>
                </div>
                <ChevronDown style={{
                  width: 13, height: 13,
                  color: d ? "rgba(99,148,255,0.5)" : "rgba(37,99,235,0.45)",
                  transition: "transform 0.28s ease, color 0.35s",
                  transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                  flexShrink: 0,
                }} />
              </button>

              {isDropdownOpen && (
                <div className={`${d ? "hdr-dropdown-dark" : "hdr-dropdown-light"} absolute right-0 mt-2 w-60 z-50`}>
                  {/* Profile info */}
                  <div className={`px-4 py-3 border-b hdr-drop-divider-${d ? "dark" : "light"}`}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <div className="hdr-avatar w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {initial}
                      </div>
                      <div style={{ overflow: "hidden" }}>
                        <p className={`hdr-text-primary-${d ? "dark" : "light"}`} style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {userData.nama || "User"}
                        </p>
                        <p className={`hdr-text-muted-${d ? "dark" : "light"}`} style={{ fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {userData.email || ""}
                        </p>
                      </div>
                    </div>
                    <div className={`hdr-role-${d ? "dark" : "light"} inline-block px-2.5 py-1 rounded-lg`}>
                      <span className={`hdr-role-text-${d ? "dark" : "light"}`} style={{ fontSize: 11, fontWeight: 500 }}>
                        {userData.peran || "Guest"}
                      </span>
                    </div>
                  </div>

                  <div style={{ padding: "4px 0" }}>
                    <Link
                      to="/profile"
                      className={`hdr-drop-base hdr-drop-${d ? "dark" : "light"}`}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <User style={{ width: 15, height: 15, opacity: 0.65 }} />
                      Profil Pengguna
                    </Link>
                    <button
                      className={`hdr-drop-base hdr-drop-logout-${d ? "dark" : "light"}`}
                      onClick={() => { localStorage.removeItem("user"); navigate("/"); }}
                    >
                      <LogOut style={{ width: 15, height: 15 }} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ══════ MOBILE TOP BAR ══════ */}
        <div className="flex md:hidden items-center justify-between px-4 py-2.5">
          <button
            className={`hdr-icon-${d ? "dark" : "light"} w-9 h-9 flex items-center justify-center`}
            onClick={onHamburger}
            aria-label="Open menu"
          >
            <Menu style={{ width: 17, height: 17 }} />
          </button>

          <span className={`hdr-mobile-logo-${d ? "dark" : "light"}`}>SIMDOR</span>

          <div className="flex items-center gap-2">
            {/* Theme toggle mobile */}
            <button
              onClick={toggle}
              className={`hdr-icon-${d ? "dark" : "light"} w-9 h-9 flex items-center justify-center`}
              aria-label="Toggle theme"
            >
              {d
                ? <Moon style={{ width: 15, height: 15 }} />
                : <Sun  style={{ width: 15, height: 15 }} />
              }
            </button>

            <button className={`hdr-icon-${d ? "dark" : "light"} relative w-9 h-9 flex items-center justify-center`}>
              <Bell style={{ width: 16, height: 16 }} />
              {notifications > 0 && (
                <span className="hdr-notif-badge absolute top-1 right-1 w-[15px] h-[15px] flex items-center justify-center text-[8px] font-bold text-white rounded-full">
                  {notifications}
                </span>
              )}
            </button>

            <div className="hdr-avatar w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold cursor-pointer">
              {initial}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}