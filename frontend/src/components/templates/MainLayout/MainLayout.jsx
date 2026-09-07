import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Sparkles } from "lucide-react";
import Sidebar from "../../organisms/Sidebar/Sidebar";
import Breadcrumbs from "../../molecules/Breadcrumbs/Breadcrumbs";

const MainLayout = ({
  breadcrumbs = [],
  showSidebar = true,
  children,
  className = "",
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!showSidebar) {
    return (
      <div className="layout-wrapper" style={{ minHeight: "100vh" }}>
        <div className={`container py-4 px-3 ${className}`}>
          {breadcrumbs.length > 0 && (
            <Breadcrumbs items={breadcrumbs} className="mb-4" />
          )}
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      {/* Backdrop overlay for mobile drawer */}
      <div
        className={`sidebar-overlay ${isSidebarOpen ? "is-active" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Main Persistent Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="app-main-content">
        {/* Mobile Topbar with Hamburger */}
        <header className="mobile-topbar is-align-items-center is-justify-content-between px-3 py-2">
          <button
            type="button"
            className="button is-small is-light is-flex is-align-items-center is-justify-content-center"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle Sidebar Menu"
            style={{ borderRadius: "8px", width: "36px", height: "36px" }}
          >
            <Menu size={19} />
          </button>

          <Link to="/dashboard" className="is-flex is-align-items-center" style={{ gap: "8px", textDecoration: "none" }}>
            <span
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "7px",
                background: "linear-gradient(135deg, var(--gold-accent), var(--gold-dark))",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
              }}
            >
              <Sparkles size={16} />
            </span>
            <span
              className="brand-title is-size-6 has-text-weight-bold"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "1.2rem",
                color: "var(--ink)",
                letterSpacing: "0.5px",
              }}
            >
              ATELIER
            </span>
          </Link>

          <div style={{ width: "36px" }}></div>
        </header>

        {/* Content Body */}
        <main className={`main-content-body py-4 px-3 px-5-desktop ${className}`}>
          {breadcrumbs.length > 0 && (
            <Breadcrumbs items={breadcrumbs} className="mb-4" />
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
