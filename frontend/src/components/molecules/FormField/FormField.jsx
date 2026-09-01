import React from "react";

// komponen pembungkus field formulir dengan label, validasi error, dan teks bantuan
const FormField = ({
  label,
  children,
  error,
  helpText,
  required = false,
  className = "",
}) => {
  return (
    <div className={`field ${className}`}>
      {label && (
        <label className="label mb-1" style={{ fontSize: "0.85rem", fontWeight: "600" }}>
          {label}
          {required && <span className="has-text-danger ml-1">*</span>}
        </label>
      )}
      <div className="control">{children}</div>
      {error && <p className="help is-danger">{error}</p>}
      {!error && helpText && <p className="help has-text-grey">{helpText}</p>}
    </div>
  );
};

export default FormField;
