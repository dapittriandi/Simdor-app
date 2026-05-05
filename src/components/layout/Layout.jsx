import { useState } from "react";
import { ThemeProvider, useTheme } from "./ThemeContext";
import Sidebar from "./Sidebar";
import Header from "./Header";
import BottomNav from "./BottomNav";

function LayoutInner({ children }) {
  const { isDark } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        height: "100dvh", // gunakan dvh agar konsisten di mobile
        overflow: "hidden",
        background: isDark ? "#080d1a" : "#f0f4ff",
        transition: "background 0.4s ease",
      }}
    >
      {/* ── Desktop Sidebar ── */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* ── Mobile Drawer Backdrop ── */}
      <div
        onClick={() => setSidebarOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9997,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(4px)",
          transition: "opacity 0.3s ease",
          opacity: sidebarOpen ? 1 : 0,
          pointerEvents: sidebarOpen ? "auto" : "none",
        }}
        className="md:hidden"
      />

      {/* ── Mobile Drawer Panel ── */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: 260,
          zIndex: 9998,
          transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1)",
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
        }}
        className="md:hidden"
      >
        <Sidebar onClose={() => setSidebarOpen(false)} isMobileDrawer />
      </div>

      {/* ── Main Column ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minWidth: 0,
          // Pastikan kolom utama tidak melampaui tinggi layar
          height: "100%",
        }}
      >
        {/* ── Header: FIXED di mobile, sticky di desktop ── */}
        <div
          style={{
            flexShrink: 0,
            // Di mobile, header bersifat fixed — sudah dihandle di Header.jsx via sticky top-0 z-[9990]
            // Kita pastikan tidak ada shift
            position: "relative",
            zIndex: 100,
          }}
        >
          <Header onHamburger={() => setSidebarOpen(true)} />
        </div>

        {/* ── Scrollable Content Area ── */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            // Di mobile, beri padding-bottom supaya konten tidak tertutup BottomNav
            // 64px BottomNav + 16px safe area buffer
            paddingBottom: "calc(64px + env(safe-area-inset-bottom, 16px))",
            position: "relative",
            // Scroll hanya di area main ini, bukan di body/window
            WebkitOverflowScrolling: "touch",
          }}
          // Hapus class md:hidden di atas agar padding tidak berlaku di desktop
          className="md:pb-0"
        >
          {/* Ambient glows */}
          <div
            style={{
              pointerEvents: "none",
              position: "fixed",
              inset: 0,
              zIndex: 0,
              overflow: "hidden",
            }}
          >
            {isDark ? (
              <>
                <div
                  style={{
                    position: "absolute",
                    top: "-10%",
                    left: "20%",
                    width: 500,
                    height: 500,
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle, rgba(37,99,235,0.09) 0%, transparent 70%)",
                    filter: "blur(60px)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "5%",
                    right: "5%",
                    width: 380,
                    height: 380,
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle, rgba(79,70,229,0.07) 0%, transparent 70%)",
                    filter: "blur(60px)",
                  }}
                />
              </>
            ) : (
              <>
                <div
                  style={{
                    position: "absolute",
                    top: "-10%",
                    left: "20%",
                    width: 500,
                    height: 500,
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)",
                    filter: "blur(60px)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "5%",
                    right: "5%",
                    width: 380,
                    height: 380,
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)",
                    filter: "blur(60px)",
                  }}
                />
              </>
            )}
          </div>

          <div style={{ position: "relative", zIndex: 10 }}>{children}</div>
        </main>

        {/* ── Mobile Bottom Nav: FIXED di bawah layar ── */}
        <div className="md:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}

export default function Layout({ children }) {
  return (
    <ThemeProvider>
      <LayoutInner>{children}</LayoutInner>
    </ThemeProvider>
  );
}