import React from "react";

// komponen layout autentikasi (login / register) dengan centering fleksibel dan scroll responsif
const AuthLayout = ({
  children,
  className = "",
  style = {},
}) => {
  return (
    <div
      className={`auth-layout-wrapper is-flex is-align-items-center is-justify-content-center ${className}`}
      style={{
        minHeight: "100vh",
        width: "100%",
        overflowY: "auto",
        backgroundColor: "var(--cream-bg)",
        backgroundImage:
          "radial-gradient(circle at 15% 15%, rgba(176, 141, 87, 0.08) 0%, transparent 45%), radial-gradient(circle at 85% 85%, rgba(176, 141, 87, 0.06) 0%, transparent 45%)",
        padding: "clamp(0.75rem, 2.5vh, 1.75rem) 1rem",
        boxSizing: "border-box",
        ...style,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          margin: "auto",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;