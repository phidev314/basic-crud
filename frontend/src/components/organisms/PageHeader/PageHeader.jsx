import React from "react";

const PageHeader = ({ title, subtitle, action, className = "" }) => {
  return (
    <div className={`card-container mb-4 p-4 ${className}`}>
      <div
        className="is-flex is-justify-content-between is-align-items-center is-flex-wrap-wrap"
        style={{ gap: "0.75rem" }}
      >
        <div style={{ flex: "1 1 200px" }}>
          <h1 className="title is-4 mb-1">{title}</h1>
          {subtitle && (
            <p className="subtitle is-6 has-text-grey mb-0">{subtitle}</p>
          )}
        </div>
        {action && (
          <div className="page-header-action" style={{ flexShrink: 0 }}>
            {action}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
