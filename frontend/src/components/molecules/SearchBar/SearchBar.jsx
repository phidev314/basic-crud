import React from "react";
import { Search, X } from "lucide-react";
import Input from "../../atoms/Input/Input";

const SearchBar = ({
  value = "",
  onChange,
  onReset,
  onSubmit,
  placeholder = "Cari...",
  className = "",
}) => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (onSubmit) onSubmit(e);
      }}
      className={`field ${className}`}
    >
      <div className="control has-icons-left" style={{ position: "relative" }}>
        <Input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{
            paddingLeft: "2.6rem",
            paddingRight: value && onReset ? "2.6rem" : "1rem",
          }}
        />
        <span
          className="icon is-small is-left"
          style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--ink-soft)",
            pointerEvents: "none",
          }}
        >
          <Search size={16} />
        </span>
        {value && onReset && (
          <button
            type="button"
            className="button is-small is-ghost"
            style={{
              position: "absolute",
              right: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 5,
              padding: "4px",
              height: "auto",
              color: "var(--ink-soft)",
            }}
            onClick={onReset}
            aria-label="Clear search"
          >
            <X size={15} />
          </button>
        )}
      </div>
    </form>
  );
};

export default SearchBar;
