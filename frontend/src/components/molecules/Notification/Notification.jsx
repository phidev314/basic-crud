import React from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";

const Notification = ({
  children,
  type = "info",
  isLight = true,
  onClose,
  className = "",
}) => {
  if (!children) return null;

  const classNames = [
    "notification",
    type ? `is-${type}` : "",
    isLight ? "is-light" : "",
    "is-flex is-align-items-center is-justify-content-between",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle2 size={18} className="mr-2" style={{ flexShrink: 0 }} />;
      case "danger":
        return <AlertCircle size={18} className="mr-2" style={{ flexShrink: 0 }} />;
      case "warning":
        return <AlertTriangle size={18} className="mr-2" style={{ flexShrink: 0 }} />;
      default:
        return <Info size={18} className="mr-2" style={{ flexShrink: 0 }} />;
    }
  };

  return (
    <div className={classNames}>
      <div className="is-flex is-align-items-center" style={{ flex: 1 }}>
        {getIcon()}
        <div>{children}</div>
      </div>
      {onClose && (
        <button
          className="delete ml-3"
          onClick={onClose}
          aria-label="close notification"
          type="button"
          style={{ flexShrink: 0 }}
        />
      )}
    </div>
  );
};

export default Notification;
