import React from "react";

const Tag = ({
  children,
  variant = "info",
  isLight = true,
  isRounded = true,
  size,
  className = "",
  ...props
}) => {
  const classNames = [
    "tag",
    variant ? `is-${variant}` : "",
    isLight ? "is-light" : "",
    isRounded ? "is-rounded" : "",
    size ? `is-${size}` : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classNames} {...props}>
      {children}
    </span>
  );
};

export default Tag;
