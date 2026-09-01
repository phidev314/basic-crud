import React, { useEffect } from "react";

const Modal = ({
  isActive = false,
  onClose,
  title = "Konfirmasi",
  children,
  footer,
  className = "",
  size = "medium",
  cardStyle = {},
}) => {
  // Menutup modal jika tombol Escape ditekan
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isActive && onClose) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, onClose]);

  // Kunci scroll halaman utama saat modal aktif
  useEffect(() => {
    if (isActive) {
      document.documentElement.classList.add("is-clipped");
      document.body.classList.add("is-clipped");
      return () => {
        document.documentElement.classList.remove("is-clipped");
        document.body.classList.remove("is-clipped");
      };
    }
  }, [isActive]);

  if (!isActive) return null;

  const getMaxWidth = () => {
    switch (size) {
      case "small":
        return "460px";
      case "large":
        return "880px";
      case "xlarge":
        return "1040px";
      case "medium":
      default:
        return "640px";
    }
  };

  return (
    <div
      className={`modal is-active ${className}`}
      style={{
        zIndex: 1000,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className="modal-background" onClick={onClose} style={{ zIndex: 1000 }}></div>
      <div
        className="modal-card"
        style={{
          maxWidth: getMaxWidth(),
          width: "95%",
          maxHeight: "90vh",
          margin: "0 auto",
          zIndex: 1001,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          ...cardStyle,
        }}
      >
        <header className="modal-card-head" style={{ flexShrink: 0 }}>
          <p className="modal-card-title">{title}</p>
          {onClose && (
            <button
              type="button"
              className="delete"
              aria-label="close"
              onClick={onClose}
            ></button>
          )}
        </header>

        <section
          className="modal-card-body"
          style={{
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            flex: "1 1 auto",
            minHeight: 0,
            overscrollBehavior: "contain",
          }}
        >
          {children}
        </section>

        {footer && (
          <footer className="modal-card-foot" style={{ flexShrink: 0 }}>
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
};

export default Modal;
