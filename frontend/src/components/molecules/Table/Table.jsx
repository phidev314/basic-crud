import React from "react";

/**
 * Reusable Table Molecule Component
 *
 * @param {Array} columns - Array of column definitions { header, accessor, render, className, headerClassName, cellClassName, align, width, style, headerStyle }
 * @param {Array} data - Array of row data objects
 * @param {string|function} keyField - Row key property or function (row, index) => key
 * @param {boolean} loading - Loading state flag
 * @param {string} loadingMessage - Text displayed while loading
 * @param {string} emptyMessage - Text displayed when data is empty
 * @param {React.ReactNode} emptyIcon - Icon displayed in empty state
 * @param {React.ReactNode} emptyAction - Action button / component for empty state
 * @param {React.ReactNode} emptyState - Full custom empty state override
 * @param {boolean} hoverable - Add is-hoverable class
 * @param {boolean} striped - Add is-striped class
 * @param {boolean} fullwidth - Add is-fullwidth class
 * @param {string} className - Additional CSS class for table element
 * @param {string} containerClassName - Additional CSS class for table-container wrapper
 * @param {React.ReactNode} footer - Footer component or pagination slot
 */
const Table = ({
  columns = [],
  data = [],
  keyField = (row, index) => row?.id ?? index,
  loading = false,
  loadingMessage = "Memuat data...",
  emptyMessage = "Belum ada data.",
  emptyIcon = null,
  emptyAction = null,
  emptyState = null,
  hoverable = true,
  striped = false,
  fullwidth = true,
  className = "table-luxury",
  containerClassName = "",
  footer = null,
}) => {
  const getRowKey = (row, index) => {
    if (typeof keyField === "function") {
      return keyField(row, index);
    }
    return row?.[keyField] ?? index;
  };

  const getAlignClass = (align) => {
    if (align === "center") return "has-text-centered";
    if (align === "right") return "has-text-right";
    if (align === "left") return "has-text-left";
    return "";
  };

  const tableClasses = [
    "table",
    fullwidth ? "is-fullwidth" : "",
    hoverable ? "is-hoverable" : "",
    striped ? "is-striped" : "",
    className,
    "mb-0",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="table-wrapper">
      <div className={`table-container mb-0 ${containerClassName}`}>
        <table className={tableClasses}>
          {columns.length > 0 && (
            <thead>
              <tr>
                {columns.map((col, colIdx) => {
                  const alignClass = getAlignClass(col.align);
                  const headerClass = [
                    alignClass,
                    col.headerClassName,
                    col.className,
                  ]
                    .filter(Boolean)
                    .join(" ");

                  const headerStyle = {
                    ...(col.width ? { width: col.width } : {}),
                    ...(col.headerStyle || {}),
                    ...(col.style || {}),
                  };

                  return (
                    <th key={col.accessor || colIdx} className={headerClass} style={headerStyle}>
                      {col.header}
                    </th>
                  );
                })}
              </tr>
            </thead>
          )}
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={Math.max(columns.length, 1)}
                  className="has-text-centered py-6 has-text-grey"
                >
                  <div className="loader is-inline-block mr-2" />
                  <span>{loadingMessage}</span>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={Math.max(columns.length, 1)}
                  className="has-text-centered py-6"
                >
                  {emptyState ? (
                    emptyState
                  ) : (
                    <div className="is-flex is-flex-direction-column is-align-items-center is-justify-content-center">
                      {emptyIcon && (
                        <div className="mb-2 has-text-grey-light">{emptyIcon}</div>
                      )}
                      <p className="is-4 has-text-grey mb-3">{emptyMessage}</p>
                      {emptyAction && <div>{emptyAction}</div>}
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr key={getRowKey(row, rowIdx)}>
                  {columns.map((col, colIdx) => {
                    const alignClass = getAlignClass(col.align);
                    const cellClass = [
                      alignClass,
                      col.cellClassName,
                      col.className,
                    ]
                      .filter(Boolean)
                      .join(" ");

                    const cellContent = col.render
                      ? col.render(row, rowIdx, col)
                      : col.accessor
                        ? row[col.accessor]
                        : null;

                    return (
                      <td
                        key={col.accessor || colIdx}
                        className={cellClass}
                        style={col.style}
                      >
                        {cellContent}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {footer && <div className="table-footer">{footer}</div>}
    </div>
  );
};

export default Table;
