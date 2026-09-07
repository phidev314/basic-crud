import React from "react";

// komponen layout autentikasi (login / register) dengan ambient glow dan fleksibilitas responsive split
const AuthLayout = ({
  children,
  className = "",
  style = {},
  maxWidth = "1040px",
}) => {
  return (
    <div
      className={`auth-page-container ${className}`}
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--cream-bg, #F7F2E9)",
        backgroundImage:
          "radial-gradient(circle at 15% 15%, rgba(176, 141, 87, 0.08) 0%, transparent 45%), radial-gradient(circle at 85% 85%, rgba(176, 141, 87, 0.06) 0%, transparent 45%)",
        position: "relative",
        overflowX: "hidden",
        padding: "clamp(1rem, 3vh, 2.5rem) 1rem",
        boxSizing: "border-box",
        ...style,
      }}
    >
      {/* Ambient background glow elements */}
      <div className="auth-ambient-orb-1" aria-hidden="true" />
      <div className="auth-ambient-orb-2" aria-hidden="true" />

      <div
        style={{
          width: "100%",
          maxWidth: maxWidth,
          margin: "auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;