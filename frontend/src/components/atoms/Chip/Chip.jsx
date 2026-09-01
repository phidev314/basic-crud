import React from "react";

const Chip = ({
  children,
  label,
  isActive = false,
  onClick,
  icon: Icon,
  count,
  size = "small",
  disabled = false,
  className = "",
  style = {},
  ...props
}) => {
  const content = children || label;

  const baseStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    borderRadius: "20px",
    fontWeight: isActive ? "600" : "500",
    fontSize: size === "small" ? "0.8rem" : "0.875rem",
    padding: size === "small" ? "0.35rem 0.95rem" : "0.5rem 1.25rem",
    whiteSpace: "nowrap",
    flexShrink: 0,
    cursor: disabled ? "not-allowed" : onClick ? "pointer" : "default",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    border: "1px solid",
    borderColor: isActive ? "var(--gold-accent)" : "var(--border-soft)",
    backgroundColor: isActive ? "var(--gold-accent)" : "#ffffff",
    color: isActive ? "#ffffff" : "var(--ink)",
    boxShadow: isActive ? "0 4px 12px rgba(176, 141, 87, 0.25)" : "none",
    userSelect: "none",
    opacity: disabled ? 0.6 : 1,
    ...style,
  };

  const Component = onClick ? "button" : "div";

  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`chip-component ${isActive ? "is-active" : ""} ${className}`}
      style={baseStyle}
      {...props}
    >
      {Icon && (
        <span className="is-flex is-align-items-center">
          <Icon size={size === "small" ? 14 : 16} />
        </span>
      )}
      <span>{content}</span>
      {count !== undefined && count !== null && (
        <span
          style={{
            fontSize: "0.7rem",
            fontWeight: "700",
            borderRadius: "10px",
            padding: "1px 6px",
            backgroundColor: isActive
              ? "rgba(255, 255, 255, 0.25)"
              : "var(--cream-bg)",
            color: isActive ? "#ffffff" : "var(--ink-soft)",
            marginLeft: "2px",
          }}
        >
          {count}
        </span>
      )}
    </Component>
  );
};

export default Chip;
