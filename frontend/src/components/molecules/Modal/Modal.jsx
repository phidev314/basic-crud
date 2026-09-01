import React, { useEffect } from "react";

const Modal = ({
  isActive = false,
  onClose,
  title = "Konfirmasi",
  children,
  footer,
  className = "",
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

  if (!isActive) return null;

  return (
    <div className={`modal is-active ${className}`}>
      <div className="modal-background" onClick={onClose}></div>
      <div className="modal-card">
        <header className="modal-card-head">
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

        <section className="modal-card-body">{children}</section>

        {footer && <footer className="modal-card-foot">{footer}</footer>}
      </div>
    </div>
  );
};

export default Modal;
