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
      className="flex h-screen overflow-hidden"
      style={{
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
          position: "fixed", inset: 0, zIndex: 9997,
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
          position: "fixed", top: 0, left: 0, bottom: 0,
          width: 260, zIndex: 9998,
          transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1)",
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
        }}
        className="md:hidden"
      >
        <Sidebar onClose={() => setSidebarOpen(false)} isMobileDrawer />
      </div>

      {/* ── Main Column ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header onHamburger={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-auto relative">
          {/* Ambient glows */}
          <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
            {isDark ? (
              <>
                <div style={{
                  position: "absolute", top: "-10%", left: "20%",
                  width: 500, height: 500, borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(37,99,235,0.09) 0%, transparent 70%)",
                  filter: "blur(60px)",
                }} />
                <div style={{
                  position: "absolute", bottom: "5%", right: "5%",
                  width: 380, height: 380, borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(79,70,229,0.07) 0%, transparent 70%)",
                  filter: "blur(60px)",
                }} />
              </>
            ) : (
              <>
                <div style={{
                  position: "absolute", top: "-10%", left: "20%",
                  width: 500, height: 500, borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)",
                  filter: "blur(60px)",
                }} />
                <div style={{
                  position: "absolute", bottom: "5%", right: "5%",
                  width: 380, height: 380, borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)",
                  filter: "blur(60px)",
                }} />
              </>
            )}
          </div>

          <div className="relative z-10">{children}</div>
        </main>

        {/* ── Mobile Bottom Nav ── */}
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