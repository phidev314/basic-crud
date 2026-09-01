import React from "react";

const Input = ({
  type = "text",
  value,
  onChange,
  placeholder = "",
  isRounded = false,
  size,
  disabled = false,
  required = false,
  className = "",
  ...props
}) => {
  const classNames = [
    "input",
    size ? `is-${size}` : "",
    isRounded ? "is-rounded" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <input
      type={type}
      className={classNames}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      {...props}
    />
  );
};

export default Input;
