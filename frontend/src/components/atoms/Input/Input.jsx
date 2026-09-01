import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * @description - komponen input atomik dengan dukungan show/hide password toggle
 * @param {string} type - tipe input (text, password, email, number, dll)
 * @param {boolean} showToggle - menampilkan tombol toggle mata untuk tipe password (default: true)
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

  // jika tipe password dengan tombol toggle, bungkus dengan wrapper relative dan icon button
  if (isPasswordType && showToggle) {
    return (
      <div className="control" style={{ position: "relative", width: "100%" }}>
        <input
          type={inputType}
          className={classNames}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          style={{ paddingRight: "2.5rem" }}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          disabled={disabled}
          tabIndex={-1}
          style={{
            position: "absolute",
            right: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: disabled ? "not-allowed" : "pointer",
            color: "var(--ink-soft, #7a7a7a)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
          }}
          title={showPassword ? "Sembunyikan password" : "Lihat password"}
          aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
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
      {...props}
    />
  );
};

export default Input;
