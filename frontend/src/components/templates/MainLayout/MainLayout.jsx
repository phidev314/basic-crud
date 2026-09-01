import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, ShieldCheck } from "lucide-react";
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
        <header className="mobile-topbar is-align-items-center is-justify-content-between">
          <button
            type="button"
            className="button is-small is-light is-flex is-align-items-center is-justify-content-center"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle Sidebar Menu"
            style={{ borderRadius: "6px", width: "36px", height: "36px" }}
          >
            <Menu size={20} />
          </button>

          <Link to="/dashboard" className="is-flex is-align-items-center">
            <ShieldCheck size={20} className="mr-2" color="var(--gold-accent)" />
            <span className="brand-title is-size-5 has-text-weight-bold" style={{ color: "var(--gold-dark)" }}>
              Admin Panel
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
