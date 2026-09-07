import React from "react";

const PageHeader = ({ title, subtitle, action, badge, className = "" }) => {
  return (
    <div
      className={`card-container mb-4 p-4 ${className}`}
      style={{
        borderRadius: "14px",
        border: "1px solid var(--border-soft)",
        backgroundColor: "var(--cream-card)",
        boxShadow: "var(--shadow-subtle)",
      }}
    >
      <div
        className="is-flex is-justify-content-between is-align-items-center is-flex-wrap-wrap"
        style={{ gap: "1rem" }}
      >
        <div style={{ flex: "1 1 240px" }}>
          {badge && (
            <span
              className="tag is-small mb-1"
              style={{
                backgroundColor: "var(--gold-light)",
                color: "var(--gold-dark)",
                fontWeight: "600",
                fontSize: "0.68rem",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              {badge}
            </span>
          )}
          <h1
            className="title is-4 mb-1"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "1.65rem",
              fontWeight: "700",
              color: "var(--ink)",
              letterSpacing: "0.3px",
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="subtitle is-6 mb-0" style={{ color: "var(--ink-soft)", fontSize: "0.85rem" }}>
              {subtitle}
            </p>
          )}
        </div>
        {action && (
          <div className="page-header-action is-flex is-align-items-center" style={{ flexShrink: 0, gap: "0.5rem" }}>
            {action}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
