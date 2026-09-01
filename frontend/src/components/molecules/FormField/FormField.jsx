import React from "react";

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
        <label className="label">
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
