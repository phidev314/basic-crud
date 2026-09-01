import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

/**
 * Custom Breadcrumbs Component
 *
 * @param {Object} props
 * @param {Array<{ label: string, href?: string, active?: boolean, icon?: React.ComponentType | React.ReactNode }>} props.items - breadcrumb items
 * @param {string} [props.className] - className tambahan
 * @param {boolean} [props.showHomeIcon=true] - menampilkan icon home secara default
 * @param {React.ReactNode} [props.separator] - separator icon
 * @param {"card" | "subtle" | "pill"} [props.variant="card"] - style tampilan visual
 */
const Breadcrumbs = ({
  items = [],
  className = "",
  showHomeIcon = true,
  separator = null,
  variant = "card",
}) => {
  if (!items || items.length === 0) return null;

  const renderIcon = (item, index) => {
    if (item.icon) {
      if (React.isValidElement(item.icon)) {
        return <span className="breadcrumb-item-icon">{item.icon}</span>;
      }
      const IconComponent = item.icon;
      return <IconComponent size={14} className="breadcrumb-item-icon" />;
    }

    if (
      showHomeIcon &&
      index === 0 &&
      (item.label?.toLowerCase() === "home" ||
        item.href === "/" ||
        item.href === "/dashboard")
    ) {
      return <Home size={14} className="breadcrumb-item-icon" />;
    }

    return null;
  };

  const defaultSeparator = (
    <ChevronRight size={13} strokeWidth={2.2} className="breadcrumb-separator-icon" />
  );

  const getVariantClass = () => {
    switch (variant) {
      case "subtle":
        return "is-subtle";
      case "pill":
        return "is-pill";
      default:
        return "is-card";
    }
  };

  return (
    <nav
      className={`custom-breadcrumb-nav ${getVariantClass()} ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="custom-breadcrumb-list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isActive = item.active !== undefined ? item.active : isLast;
          const icon = renderIcon(item, index);

          return (
            <React.Fragment key={index}>
              {index > 0 && (
                <li
                  className="custom-breadcrumb-separator"
                  aria-hidden="true"
                >
                  {separator || defaultSeparator}
                </li>
              )}
              <li
                className={`custom-breadcrumb-item ${isActive ? "is-active" : ""}`}
              >
                {isActive ? (
                  <span
                    className="custom-breadcrumb-current"
                    aria-current="page"
                  >
                    {icon}
                    <span className="breadcrumb-text">{item.label}</span>
                  </span>
                ) : (
                  <Link
                    to={item.href || "/"}
                    className="custom-breadcrumb-link"
                  >
                    {icon}
                    <span className="breadcrumb-text">{item.label}</span>
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;

