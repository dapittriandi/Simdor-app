import { useLocation, Link } from "react-router-dom";
import { LayoutDashboard, Folder, FileText, BarChart2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "./ThemeContext";

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');

.bnav-root { font-family:'DM Sans',sans-serif; }

.bnav-dark {
  background: rgba(6,10,22,0.9);
  backdrop-filter: blur(28px) saturate(160%);
  -webkit-backdrop-filter: blur(28px) saturate(160%);
  border-top: 1px solid rgba(99,148,255,0.1);
  box-shadow: 0 -4px 32px rgba(0,0,0,0.5);
}
.bnav-light {
  background: rgba(236,244,255,0.92);
  backdrop-filter: blur(28px) saturate(180%);
  -webkit-backdrop-filter: blur(28px) saturate(180%);
  border-top: 1px solid rgba(59,130,246,0.14);
  box-shadow: 0 -4px 24px rgba(59,130,246,0.08);
}

@keyframes bnavIn { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
.bnav-mounted { animation: bnavIn 0.45s cubic-bezier(0.22,1,0.36,1) forwards; }

.bnav-accent-dark  { height:1.5px; background:linear-gradient(90deg,transparent,rgba(37,99,235,0.4) 30%,rgba(96,165,250,0.55) 50%,rgba(37,99,235,0.4) 70%,transparent); }
.bnav-accent-light { height:1.5px; background:linear-gradient(90deg,transparent,rgba(59,130,246,0.25) 30%,rgba(59,130,246,0.4) 50%,rgba(59,130,246,0.25) 70%,transparent); }

.bnav-item {
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  gap:3px; flex:1; padding:8px 4px 6px;
  text-decoration:none; position:relative;
  transition: color 0.2s ease;
  -webkit-tap-highlight-color: transparent;
  cursor:pointer; background:none; border:none;
}
.bnav-item:active { transform:scale(0.93); }

.bnav-item-dark       { color:rgba(99,148,255,0.4); }
.bnav-item-dark.bnav-active  { color:#60a5fa; }
.bnav-item-light      { color:rgba(37,99,235,0.4); }
.bnav-item-light.bnav-active { color:#1d4ed8; }

.bnav-label { font-size:9.5px; font-weight:500; letter-spacing:.02em; }

.bnav-icon-wrap {
  width:32px; height:32px; border-radius:10px;
  display:flex; align-items:center; justify-content:center;
  transition: background .22s, box-shadow .22s; position:relative;
}

.bnav-item-dark.bnav-active  .bnav-icon-wrap { background:rgba(37,99,235,0.2);  box-shadow:0 0 16px rgba(59,130,246,0.2); }
.bnav-item-light.bnav-active .bnav-icon-wrap { background:rgba(219,234,254,0.8); box-shadow:0 0 12px rgba(59,130,246,0.1); }

.bnav-dot-dark  { position:absolute; bottom:-3px; left:50%; transform:translateX(-50%); width:4px; height:4px; border-radius:50%; background:#60a5fa; box-shadow:0 0 6px rgba(96,165,250,0.8); animation:dotPop .3s cubic-bezier(0.22,1,0.36,1) forwards; }
.bnav-dot-light { position:absolute; bottom:-3px; left:50%; transform:translateX(-50%); width:4px; height:4px; border-radius:50%; background:#2563eb; box-shadow:0 0 5px rgba(37,99,235,0.5); animation:dotPop .3s cubic-bezier(0.22,1,0.36,1) forwards; }
@keyframes dotPop { from{transform:translateX(-50%) scale(0);opacity:0} to{transform:translateX(-50%) scale(1);opacity:1} }

.bnav-item::after { content:''; position:absolute; inset:4px; border-radius:12px; background:rgba(59,130,246,0.08); opacity:0; transform:scale(0.7); transition:opacity .15s,transform .15s; }
.bnav-item:active::after { opacity:1; transform:scale(1); }
`;

export default function BottomNav() {
  const { isDark } = useTheme();
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  const userData = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => { setMounted(true); }, []);

  const dashMap = {
    "customer service":  "/dashboard-cs",
    "admin keuangan":    "/dashboard-keuangan",
    "admin portofolio":  "/dashboard-portofolio",
    "koordinator":       "/dashboard-koordinator",
  };
  const dashPath = dashMap[userData.peran] || "/dashboard-cs";

  const isActive = (path, matchPrefix) => {
    if (matchPrefix) return location.pathname.startsWith(matchPrefix);
    return location.pathname === path;
  };

  const showDokumen = userData.peran === "admin keuangan" || userData.peran === "admin portofolio";

  const navItems = [
    { path: dashPath, icon: <LayoutDashboard style={{ width:18, height:18 }} />, label: "Dashboard" },
    { path: `/orders/${userData.bidang?.toLowerCase() || ""}`, matchPrefix: "/orders", icon: <Folder style={{ width:18, height:18 }} />, label: userData.peran === "admin portofolio" ? "Orders" : "Porto" },
    showDokumen && { path: "/documents", icon: <FileText style={{ width:18, height:18 }} />, label: "Dokumen" },
    { path: "/laporan", icon: <BarChart2 style={{ width:18, height:18 }} />, label: "Laporan" },
    { path: "/profile", icon: <User style={{ width:18, height:18 }} />, label: "Profil" },
  ].filter(Boolean);

  const d = isDark;

  return (
    <>
      <style>{STYLES}</style>
      <nav
        className={`bnav-root ${d ? "bnav-dark" : "bnav-light"} ${mounted ? "bnav-mounted" : "opacity-0"}`}
        style={{
          transition: "background 0.4s ease, border-color 0.4s ease",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div className={d ? "bnav-accent-dark" : "bnav-accent-light"} />
        <div style={{ display:"flex", alignItems:"stretch" }}>
          {navItems.map((item) => {
            const active = isActive(item.path, item.matchPrefix);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`bnav-item ${d ? "bnav-item-dark" : "bnav-item-light"} ${active ? "bnav-active" : ""}`}
              >
                <div className="bnav-icon-wrap">
                  {item.icon}
                  {active && <span className={d ? "bnav-dot-dark" : "bnav-dot-light"} />}
                </div>
                <span className="bnav-label">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}