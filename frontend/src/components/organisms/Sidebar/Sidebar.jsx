import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  LogOut,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { authService } from "../../../services";

const MENU_ITEMS = [
  {
    path: "/",
    label: "Lihat Toko (Katalog)",
    icon: ShoppingBag,
    exact: true,
  },
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
      <div className="sidebar-brand px-4 py-5 mb-3">
        <Link to="/dashboard" className="is-flex is-align-items-center" onClick={onClose}>
          <span
            className="brand-badge mr-2 is-flex is-align-items-center is-justify-content-center"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: "var(--gold-accent)",
              color: "#fff",
            }}
          >
            <ShieldCheck size={20} />
          </span>
          <div>
            <h2 className="title is-5 mb-0 brand-title" style={{ letterSpacing: "1px" }}>
              Admin Panel
            </h2>
            <p className="is-size-7 has-text-grey">Management System</p>
          </div>
        </Link>
      </div>

      {/* Menu List */}
      <div className="sidebar-menu px-3">
        <p className="menu-label is-size-7 has-text-weight-bold px-3 mb-2" style={{ color: "var(--ink-soft)", letterSpacing: "1.5px" }}>
          MAIN MENU
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
                  className={`sidebar-link is-flex is-align-items-center px-3 py-3 ${
                    active ? "is-active-sidebar" : ""
                  }`}
                  style={{
                    borderRadius: "8px",
                    fontWeight: active ? 600 : 500,
                    color: active ? "#ffffff" : "var(--ink)",
                    backgroundColor: active ? "var(--gold-accent)" : "transparent",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Icon size={19} className="mr-3" />
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
            borderRadius: "10px",
          }}
        >
          <div className="is-flex is-align-items-center mb-2">
            <div
              className="admin-avatar is-flex is-align-items-center is-justify-content-center mr-2"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "var(--gold-accent)",
                color: "#fff",
                fontWeight: 700,
              }}
            >
              {(admin?.name || "A").charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: "hidden" }}>
              <p className="is-size-6 has-text-weight-bold mb-0 text-truncate" style={{ color: "var(--ink)" }}>
                {admin?.name || "Administrator"}
              </p>
              <p className="is-size-7 has-text-grey text-truncate mb-0">
                {admin?.email || "admin@system.local"}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="button is-fullwidth is-danger is-outlined is-small is-flex is-align-items-center is-justify-content-center"
          style={{ borderRadius: "8px", gap: "6px" }}
        >
          <LogOut size={16} />
          <span>Keluar / Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
