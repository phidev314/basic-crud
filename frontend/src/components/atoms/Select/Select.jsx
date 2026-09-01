import React from "react";

const Select = ({
  options = [],
  value,
  onChange,
  isFullwidth = true,
  isRounded = false,
  size,
  disabled = false,
  children,
  className = "",
  ...props
}) => {
  const containerClassNames = [
    "select",
    isFullwidth ? "is-fullwidth" : "",
    size ? `is-${size}` : "",
    isRounded ? "is-rounded" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClassNames}>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        {...props}
      >
        {options.length > 0
          ? options.map((opt) => {
              const val = typeof opt === "object" ? opt.value : opt;
              const lbl = typeof opt === "object" ? opt.label : opt;
              return (
                <option key={val} value={val}>
                  {lbl}
                </option>
              );
            })
          : children}
      </select>
    </div>
  );
};

export default Select;
