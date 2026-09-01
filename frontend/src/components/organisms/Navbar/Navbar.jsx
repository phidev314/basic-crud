import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut, ShieldCheck } from "lucide-react";
import { authService } from "../../../services";
import Button from "../../atoms/Button/Button";

const Navbar = ({ className = "" }) => {
  const [isActive, setIsActive] = useState(false);
  const navigate = useNavigate();
  const admin = authService.getAdmin();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <nav
      className={`navbar is-white has-shadow mb-4 ${className}`}
      role="navigation"
      aria-label="main navigation"
    >
      <div className="container px-3">
        <div className="navbar-brand">
          <Link
            to="/dashboard"
            className="navbar-item has-text-weight-bold is-size-5 has-text-primary is-flex is-align-items-center"
            style={{ gap: "8px" }}
          >
            <ShieldCheck size={22} />
            <span>Admin Panel</span>
          </Link>

          <button
            type="button"
            className={`navbar-burger burger ${isActive ? "is-active" : ""}`}
            aria-label="menu"
            aria-expanded={isActive ? "true" : "false"}
            onClick={() => setIsActive(!isActive)}
          >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </button>
        </div>

        <div className={`navbar-menu ${isActive ? "is-active" : ""}`}>
          <div className="navbar-start">
            <Link to="/dashboard" className="navbar-item">
              Dashboard
            </Link>
            <Link to="/user-management" className="navbar-item">
              User Management
            </Link>
            <Link to="/product-management" className="navbar-item">
              Product Management
            </Link>
          </div>

          <div className="navbar-end">
            <div className="navbar-item">
              {admin && (
                <span className="tag is-primary is-light is-medium mr-3 is-flex is-align-items-center" style={{ gap: "6px" }}>
                  <User size={14} />
                  <span>{admin.name || admin.email}</span>
                </span>
              )}
              <Button
                variant="danger"
                isOutlined={true}
                size="small"
                onClick={handleLogout}
              >
                <span className="is-flex is-align-items-center" style={{ gap: "4px" }}>
                  <LogOut size={14} />
                  <span>Logout</span>
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
