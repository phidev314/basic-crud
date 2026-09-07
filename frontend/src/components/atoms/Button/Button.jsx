import React from "react";
import { Link } from "react-router-dom";

const Button = ({
  children,
  variant = "primary",
  size,
  isOutlined = false,
  isRounded = false,
  isLoading = false,
  isFullwidth = false,
  disabled = false,
  type = "button",
  onClick,
  to,
  className = "",
  ...props
}) => {
  const getVariantClass = (v) => {
    if (!v) return "is-primary";
    if (v === "outline-luxury") return "btn-outline-luxury";
    if (v === "luxury") return "btn-luxury is-primary";
    return `is-${v}`;
  };

  const classNames = [
    "button",
    getVariantClass(variant),
    size ? `is-${size}` : "is-size-7",
    isOutlined ? "is-outlined" : "",
    isRounded ? "is-rounded" : "",
    isLoading ? "is-loading" : "",
    isFullwidth ? "is-fullwidth" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (to) {
    return (
      <Link to={to} className={classNames} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classNames}
      onClick={onClick}
      disabled={disabled || isLoading}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
