import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut, LayoutDashboard, FileText, BarChart2, Folder, ChevronDown, X } from "lucide-react";
import { useTheme } from "./ThemeContext";
import { useUser } from "../../context/UserContext";

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
.sb-root { font-family: 'DM Sans', sans-serif; }

/* DARK */
.sb-glass-dark {
  background: rgba(6,10,22,0.92);
  backdrop-filter: blur(28px) saturate(160%);
  -webkit-backdrop-filter: blur(28px) saturate(160%);
  border-right: 1px solid rgba(99,148,255,0.1);
  box-shadow: 4px 0 48px rgba(0,0,0,0.55);
}
/* LIGHT */
.sb-glass-light {
  background: rgba(236,244,255,0.92);
  backdrop-filter: blur(28px) saturate(180%);
  -webkit-backdrop-filter: blur(28px) saturate(180%);
  border-right: 1px solid rgba(59,130,246,0.14);
  box-shadow: 4px 0 32px rgba(59,130,246,0.08);
}

@keyframes accentFlow { 0%{background-position:0 0}100%{background-position:200% 0} }
.sb-accent-dark  { height:2px; background:linear-gradient(90deg,transparent,#1d4ed8 25%,#60a5fa 50%,#1d4ed8 75%,transparent); background-size:200% 100%; animation:accentFlow 4s linear infinite; }
.sb-accent-light { height:2px; background:linear-gradient(90deg,transparent,#3b82f6 25%,#93c5fd 50%,#3b82f6 75%,transparent); background-size:200% 100%; animation:accentFlow 4s linear infinite; }

.sb-logo-dark  { font-weight:700; letter-spacing:.14em; font-size:18px; background:linear-gradient(135deg,#93c5fd,#fff 55%,#60a5fa); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
.sb-logo-light { font-weight:700; letter-spacing:.14em; font-size:18px; background:linear-gradient(135deg,#1d4ed8,#2563eb 55%,#3b82f6); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }

.sb-subtitle-dark  { font-size:8.5px; color:rgba(99,148,255,0.4); letter-spacing:.1em; margin-top:1px; }
.sb-subtitle-light { font-size:8.5px; color:rgba(37,99,235,0.4); letter-spacing:.1em; margin-top:1px; }

/* Section label */
.sb-section-label { font-size:9px; font-weight:600; letter-spacing:.16em; text-transform:uppercase; padding:0 12px; margin:14px 0 5px; display:flex; align-items:center; gap:8px; }
.sb-section-label::after { content:''; flex:1; height:1px; }
.sb-section-dark  .sb-section-label { color:rgba(99,148,255,0.38); }
.sb-section-dark  .sb-section-label::after { background:linear-gradient(90deg,rgba(99,148,255,0.15),transparent); }
.sb-section-light .sb-section-label { color:rgba(37,99,235,0.4); }
.sb-section-light .sb-section-label::after { background:linear-gradient(90deg,rgba(37,99,235,0.12),transparent); }

/* Nav item BASE */
.sb-nav-item {
  display:flex; align-items:center; padding:9px 12px; border-radius:11px;
  font-size:13px; font-weight:500; border:1px solid transparent;
  transition: all 0.2s cubic-bezier(0.22,1,0.36,1);
  position:relative; overflow:hidden; text-decoration:none;
  width:100%; text-align:left; background:none; cursor:pointer;
}
/* DARK nav */
.sb-nav-dark { color:rgba(148,163,220,0.7); }
.sb-nav-dark:hover { background:rgba(59,130,246,0.07); border-color:rgba(99,148,255,0.16); color:#bfdbfe; transform:translateX(2px); }
.sb-nav-dark.active { background:rgba(37,99,235,0.18); border-color:rgba(59,130,246,0.32); color:#93c5fd; box-shadow:0 0 18px rgba(59,130,246,0.1),inset 0 1px 0 rgba(255,255,255,0.04); }
/* LIGHT nav */
.sb-nav-light { color:#4b6ea8; }
.sb-nav-light:hover { background:rgba(59,130,246,0.07); border-color:rgba(59,130,246,0.2); color:#1d4ed8; transform:translateX(2px); }
.sb-nav-light.active { background:rgba(219,234,254,0.8); border-color:rgba(59,130,246,0.28); color:#1d4ed8; box-shadow:0 0 14px rgba(59,130,246,0.08); }

.sb-active-bar { position:absolute; left:0; top:20%; height:60%; width:3px; border-radius:0 4px 4px 0; background:linear-gradient(180deg,#3b82f6,#60a5fa); box-shadow:0 0 8px rgba(59,130,246,0.7); }

.sb-nav-icon { transition:color 0.2s; flex-shrink:0; }
.sb-nav-dark  .sb-nav-icon { color:rgba(99,148,255,0.5); }
.sb-nav-dark:hover  .sb-nav-icon, .sb-nav-dark.active  .sb-nav-icon { color:#60a5fa; }
.sb-nav-light .sb-nav-icon { color:rgba(37,99,235,0.45); }
.sb-nav-light:hover .sb-nav-icon, .sb-nav-light.active .sb-nav-icon { color:#2563eb; }

/* Accordion */
.sb-accordion { overflow:hidden; transition:max-height .35s cubic-bezier(0.22,1,0.36,1),opacity .28s ease; }
.sb-accordion.open  { max-height:280px; opacity:1; }
.sb-accordion.closed{ max-height:0;     opacity:0; }

.sb-dropdown-scroll { margin:4px 0 4px 14px; padding-left:12px; overflow-y:auto; max-height:200px; }
.sb-dropdown-dark  .sb-dropdown-scroll { border-left:1px solid rgba(59,130,246,0.15); }
.sb-dropdown-light .sb-dropdown-scroll { border-left:1px solid rgba(59,130,246,0.2); }
.sb-dropdown-scroll::-webkit-scrollbar { width:3px; }
.sb-dropdown-scroll::-webkit-scrollbar-thumb { background:rgba(59,130,246,0.22); border-radius:10px; }

.sb-sub-link { display:block; padding:6.5px 10px; border-radius:8px; font-size:12px; font-weight:500; transition:all .18s ease; text-decoration:none; margin-bottom:1px; }
.sb-nav-dark  ~ .sb-accordion .sb-sub-link,
.sb-dropdown-dark  .sb-sub-link { color:rgba(148,163,220,0.6); }
.sb-dropdown-dark  .sb-sub-link:hover { background:rgba(59,130,246,0.1); color:#93c5fd; padding-left:14px; }
.sb-dropdown-light .sb-sub-link { color:#4b6ea8; }
.sb-dropdown-light .sb-sub-link:hover { background:rgba(59,130,246,0.08); color:#1d4ed8; padding-left:14px; }

/* User card */
.sb-user-card-dark  { background:rgba(255,255,255,0.025); border:1px solid rgba(99,148,255,0.1); border-radius:13px; padding:11px 12px; margin-bottom:10px; }
.sb-user-card-light { background:rgba(255,255,255,0.8); border:1px solid rgba(59,130,246,0.14); border-radius:13px; padding:11px 12px; margin-bottom:10px; box-shadow:0 1px 6px rgba(59,130,246,0.06); }

.sb-user-name-dark  { font-size:12.5px; font-weight:600; color:#cbd5f0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.sb-user-name-light { font-size:12.5px; font-weight:600; color:#1e3a5f; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.sb-user-role-dark  { font-size:10.5px; color:rgba(99,148,255,0.5); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.sb-user-role-light { font-size:10.5px; color:rgba(37,99,235,0.5); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

.sb-user-avatar { width:32px; height:32px; border-radius:9px; flex-shrink:0; background:linear-gradient(135deg,#1d4ed8,#3b82f6); box-shadow:0 0 10px rgba(59,130,246,0.3); display:flex; align-items:center; justify-content:center; font-weight:600; font-size:13px; color:white; }

.sb-logout-dark  { width:100%; display:flex; align-items:center; justify-content:center; gap:8px; background:rgba(239,68,68,0.07); border:1px solid rgba(239,68,68,0.16); color:rgba(252,165,165,0.8); border-radius:11px; padding:9px; font-size:13px; font-weight:500; cursor:pointer; transition:all .22s ease; }
.sb-logout-dark:hover  { background:rgba(239,68,68,0.14); border-color:rgba(239,68,68,0.32); color:#fca5a5; box-shadow:0 0 18px rgba(239,68,68,0.12); transform:scale(1.01); }
.sb-logout-light { width:100%; display:flex; align-items:center; justify-content:center; gap:8px; background:rgba(239,68,68,0.05); border:1px solid rgba(239,68,68,0.18); color:#dc2626; border-radius:11px; padding:9px; font-size:13px; font-weight:500; cursor:pointer; transition:all .22s ease; }
.sb-logout-light:hover { background:rgba(239,68,68,0.1); border-color:rgba(239,68,68,0.3); color:#b91c1c; box-shadow:0 0 14px rgba(239,68,68,0.08); transform:scale(1.01); }

.sb-close-dark  { background:rgba(255,255,255,0.05); border:1px solid rgba(99,148,255,0.15); border-radius:9px; padding:6px; cursor:pointer; color:rgba(148,163,220,0.7); transition:all .2s; }
.sb-close-dark:hover  { background:rgba(255,255,255,0.08); color:#93c5fd; }
.sb-close-light { background:rgba(59,130,246,0.06); border:1px solid rgba(59,130,246,0.18); border-radius:9px; padding:6px; cursor:pointer; color:#4b6ea8; transition:all .2s; }
.sb-close-light:hover { background:rgba(59,130,246,0.12); color:#1d4ed8; }

.sb-border-dark  { border-bottom:1px solid rgba(99,148,255,0.07); }
.sb-border-light { border-bottom:1px solid rgba(59,130,246,0.1); }
.sb-border-top-dark  { border-top:1px solid rgba(99,148,255,0.07); }
.sb-border-top-light { border-top:1px solid rgba(59,130,246,0.1); }

.sb-nav-scroll::-webkit-scrollbar { width:3px; }
.sb-nav-scroll::-webkit-scrollbar-thumb { background:rgba(59,130,246,0.18); border-radius:10px; }
`;

export default function Sidebar({ onClose, isMobileDrawer = false }) {
  const { isDark } = useTheme();
  const [isPortoOpen, setIsPortoOpen] = useState(false);
  const { activeUser, logout } = useUser();
  const location = useLocation();

  // Gunakan activeUser langsung dari context — reaktif saat switch role
  // Tidak perlu state lokal "user" karena context sudah handle reactivity
  const user = activeUser;

  const handleLogout = () => logout();
  const isActive = (path) => location.pathname === path;

  const portoList = ["BATUBARA","KSP","PIK","INDUSTRI","HMPM","AEBT","MINERAL","HALAL","LABORATORIUM","SERCO","LSI"];
  const dashMap = {
    "customer service":  { path: "/dashboard-cs",         label: "Dashboard CS" },
    "admin keuangan":    { path: "/dashboard-keuangan",    label: "Dashboard Keuangan" },
    "admin portofolio":  { path: "/dashboard-portofolio",  label: "Dashboard Portofolio" },
    "koordinator":       { path: "/dashboard-koordinator", label: "Dashboard Koordinator" },
  };

  if (!user) return null;

  const dash = dashMap[user.peran];
  const d = isDark;
  const T = (darkCls, lightCls) => d ? darkCls : lightCls;
  const navCls = (path) => `sb-nav-item ${T("sb-nav-dark","sb-nav-light")} ${isActive(path) ? "active" : ""}`;
  const navBtnCls = (active) => `sb-nav-item ${T("sb-nav-dark","sb-nav-light")} ${active ? "active" : ""}`;

  return (
    <>
      <style>{STYLES}</style>
      <aside
        className={`sb-root ${T("sb-glass-dark","sb-glass-light")} flex flex-col h-full`}
        style={{ width: 256, transition: "background 0.4s ease, border-color 0.4s ease" }}
      >
        <div className={T("sb-accent-dark","sb-accent-light")} />

        {/* Logo */}
        <div className={`${T("sb-border-dark","sb-border-light")} flex-shrink-0`}
          style={{ padding: isMobileDrawer ? "14px 16px 12px" : "18px 16px 14px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:34, height:34, borderRadius:10, flexShrink:0, background:"linear-gradient(135deg,#1e3a8a,#3b82f6)", boxShadow:"0 0 16px rgba(59,130,246,0.35)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <BarChart2 style={{ width:16, height:16, color:"white" }} />
            </div>
            <div>
              <div className={T("sb-logo-dark","sb-logo-light")}>SIMDOR</div>
              <p className={T("sb-subtitle-dark","sb-subtitle-light")}>MONITORING DATA ORDER</p>
            </div>
          </div>
          {isMobileDrawer && (
            <button className={T("sb-close-dark","sb-close-light")} onClick={onClose}>
              <X style={{ width:15, height:15 }} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="sb-nav-scroll flex-1 overflow-y-auto" style={{ padding:"6px 10px 8px" }}>
          {dash && (
            <div className={T("sb-section-dark","sb-section-light")}>
              <div className="sb-section-label">Menu Utama</div>
              <Link to={dash.path} className={navCls(dash.path)} onClick={isMobileDrawer ? onClose : undefined}>
                {isActive(dash.path) && <span className="sb-active-bar" />}
                <LayoutDashboard className="sb-nav-icon mr-2.5" style={{ width:15, height:15 }} />
                {dash.label}
              </Link>
            </div>
          )}

          <div className={T("sb-section-dark","sb-section-light")}>
            <div className="sb-section-label" style={{ marginTop:10 }}>Data</div>

            {/* Porto accordion */}
            <div className={T("sb-dropdown-dark","sb-dropdown-light")}>
              <button
                onClick={() => setIsPortoOpen(!isPortoOpen)}
                className={`${navBtnCls(isPortoOpen)} justify-between`}
                style={{ width:"100%" }}
              >
                <div style={{ display:"flex", alignItems:"center" }}>
                  <Folder className="sb-nav-icon mr-2.5" style={{ width:15, height:15 }} />
                  {user.peran === "admin portofolio" ? "Orders" : "Portofolio"}
                </div>
                <ChevronDown style={{
                  width:13, height:13,
                  color: d ? "rgba(99,148,255,0.45)" : "rgba(37,99,235,0.4)",
                  transition:"transform .3s ease",
                  transform: isPortoOpen ? "rotate(180deg)" : "rotate(0deg)",
                }} />
              </button>

              <div className={`sb-accordion ${isPortoOpen ? "open" : "closed"}`}>
                <div className="sb-dropdown-scroll">
                  {user.peran === "admin portofolio" ? (
                    <Link to={`/orders/${user.bidang?.toLowerCase()}`} className="sb-sub-link" onClick={isMobileDrawer ? onClose : undefined}>
                      {user.bidang}
                    </Link>
                  ) : portoList.map((item) => (
                    <Link key={item} to={`/orders/${item.toLowerCase()}`} className="sb-sub-link" onClick={isMobileDrawer ? onClose : undefined}>
                      {item}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Dokumen */}
            {(user.peran === "admin keuangan" || user.peran === "admin portofolio") && (
              <Link to="/documents" className={navCls("/documents")} style={{ marginTop:4 }} onClick={isMobileDrawer ? onClose : undefined}>
                {isActive("/documents") && <span className="sb-active-bar" />}
                <FileText className="sb-nav-icon mr-2.5" style={{ width:15, height:15 }} />
                Dokumen
              </Link>
            )}
          </div>

          <div className={T("sb-section-dark","sb-section-light")}>
            <div className="sb-section-label" style={{ marginTop:10 }}>Laporan</div>
            <Link to="/laporan" className={navCls("/laporan")} onClick={isMobileDrawer ? onClose : undefined}>
              {isActive("/laporan") && <span className="sb-active-bar" />}
              <BarChart2 className="sb-nav-icon mr-2.5" style={{ width:15, height:15 }} />
              Laporan
            </Link>
          </div>
        </nav>

        {/* User + logout */}
        <div className={`${T("sb-border-top-dark","sb-border-top-light")} flex-shrink-0`} style={{ padding:"10px 10px 14px" }}>
          <div className={T("sb-user-card-dark","sb-user-card-light")}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div className="sb-user-avatar">{user.nama ? user.nama.charAt(0).toUpperCase() : "U"}</div>
              <div style={{ overflow:"hidden" }}>
                <p className={T("sb-user-name-dark","sb-user-name-light")}>{user.nama || "User"}</p>
                <p className={T("sb-user-role-dark","sb-user-role-light")}>{user.peran}</p>
              </div>
            </div>
          </div>
          <button onClick={handleLogout} className={T("sb-logout-dark","sb-logout-light")}>
            <LogOut style={{ width:15, height:15 }} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}