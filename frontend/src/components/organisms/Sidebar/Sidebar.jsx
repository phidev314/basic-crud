import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  LogOut,
} from "lucide-react";
import { authService } from "../../../services";

const MENU_ITEMS = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    path: "/user-management",
    label: "User Management",
    icon: Users,
  },
  {
    path: "/product-management",
    label: "Product Management",
    icon: Package,
  },
];

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const admin = authService.getAdmin();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const isActive = (item) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <aside className={`app-sidebar ${isOpen ? "is-active" : ""}`}>
      {/* Brand Header */}
      <div className="sidebar-brand px-4 py-5 mb-2" style={{ borderBottom: "1px solid var(--border-soft)" }}>
        <Link to="/dashboard" className="is-flex is-align-items-center" onClick={onClose} style={{ gap: "10px", textDecoration: "none" }}>
          <div>
            <h2
              className="title is-5 mb-0 brand-title"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "1.35rem",
                fontWeight: "700",
                letterSpacing: "0.5px",
                lineHeight: "1.1",
              }}
            >
              ATELIER
            </h2>
            <p
              className="is-size-7 mb-0"
              style={{
                fontSize: "0.68rem",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                color: "var(--gold-dark)",
                fontWeight: "600",
              }}
            >
              Portal Administrasi
            </p>
          </div>
        </Link>
      </div>

      {/* Menu List */}
      <div className="sidebar-menu px-3 pt-3">
        <p
          className="menu-label is-size-7 has-text-weight-bold px-3 mb-2"
          style={{
            color: "var(--ink-soft)",
            letterSpacing: "1.5px",
            fontSize: "0.7rem",
            textTransform: "uppercase",
          }}
        >
          Menu Utama
        </p>
        <ul className="menu-list">
          {MENU_ITEMS.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;
            return (
              <li key={item.path} className="mb-1">
                <Link
                  to={item.path}
                  onClick={onClose}
                  className={`sidebar-link is-flex is-align-items-center px-3 py-3 ${active ? "is-active-sidebar" : ""
                    }`}
                  style={{
                    borderRadius: "10px",
                    fontWeight: active ? 600 : 500,
                    fontSize: "0.88rem",
                    color: active ? "#ffffff" : "var(--ink)",
                    background: active
                      ? "linear-gradient(135deg, var(--gold-accent), var(--gold-dark))"
                      : "transparent",
                    boxShadow: active
                      ? "0 4px 14px rgba(176, 141, 87, 0.3)"
                      : "none",
                    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  <Icon size={18} className="mr-3" style={{ opacity: active ? 1 : 0.8 }} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Admin Profile & Logout Box */}
      <div className="sidebar-footer p-4 mt-auto">
        <div
          className="admin-card p-3 mb-3"
          style={{
            background: "rgba(176, 141, 87, 0.08)",
            border: "1px solid var(--border-soft)",
            borderRadius: "12px",
          }}
        >
          <div className="is-flex is-align-items-center mb-1" style={{ gap: "10px" }}>
            <div
              className="admin-avatar is-flex is-align-items-center is-justify-content-center"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--gold-accent), var(--gold-dark))",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.9rem",
                flexShrink: 0,
              }}
            >
              {(admin?.name || "A").charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: "hidden", minWidth: 0 }}>
              <p
                className="is-size-7 has-text-weight-bold mb-0 text-truncate"
                style={{ color: "var(--ink)", fontSize: "0.85rem" }}
              >
                {admin?.name || "Administrator"}
              </p>
              <p
                className="is-size-7 text-truncate mb-0"
                style={{ color: "var(--ink-soft)", fontSize: "0.72rem" }}
              >
                {admin?.email || "admin@system.local"}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="button is-fullwidth is-danger is-outlined is-small is-flex is-align-items-center is-justify-content-center"
          style={{ borderRadius: "8px", gap: "6px", fontWeight: "600" }}
        >
          <LogOut size={15} />
          <span>Keluar / Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
