import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * @description - komponen input atomik dengan dukungan icon prefix dan show/hide password toggle
 * @param {string} type - tipe input (text, password, email, number, dll)
 * @param {boolean} showToggle - menampilkan tombol toggle mata untuk tipe password (default: true)
 * @param {React.ReactNode} iconLeft - icon elemen di sebelah kiri input
 */
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
  showToggle = true,
  iconLeft = null,
  style = {},
  ...props
}) => {
  // state untuk toggle visibilitas karakter password
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordType = type === "password";
  // jika tipe password dan toggle aktif, sesuaikan tipe input sebenarnya (text / password)
  const inputType = isPasswordType && showToggle ? (showPassword ? "text" : "password") : type;

  const classNames = [
    "input",
    size ? `is-${size}` : "",
    isRounded ? "is-rounded" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const combinedStyle = {
    ...(iconLeft ? { paddingLeft: "2.65rem" } : {}),
    ...(isPasswordType && showToggle ? { paddingRight: "2.5rem" } : {}),
    ...style,
  };

  // jika memerlukan wrapper khusus (karena ada iconLeft atau toggle password)
  if (iconLeft || (isPasswordType && showToggle)) {
    return (
      <div className="control auth-input-wrapper" style={{ position: "relative", width: "100%" }}>
        {iconLeft && (
          <span className="auth-input-icon">
            {iconLeft}
          </span>
        )}
        <input
          type={inputType}
          className={classNames}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          style={combinedStyle}
          {...props}
        />
        {isPasswordType && showToggle && (
          <button
            type="button"
            className="auth-password-toggle"
            onClick={() => setShowPassword((prev) => !prev)}
            disabled={disabled}
            tabIndex={-1}
            title={showPassword ? "Sembunyikan password" : "Lihat password"}
            aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    );
  }

  return (
    <input
      type={type}
      className={classNames}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      style={style}
      {...props}
    />
  );
};

export default Input;
