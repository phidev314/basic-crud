import React from "react";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

/**
 * Table Reusable Component dengan Dukungan Server-Side Sorting
 *
 * @param {Array} columns - definisi kolom { header, accessor, sortable, sortKey, render, className, headerClassName, cellClassName, align, width, style, headerStyle }
 * @param {Array} data - objek data baris tabel
 * @param {string|function} keyField - properti kunci baris atau fungsi (row, index) => key
 * @param {boolean} loading - status penanda proses memuat data (loading)
 * @param {string} loadingMessage - teks yang ditampilkan saat proses memuat data
 * @param {string} emptyMessage - teks yang ditampilkan saat data kosong
 * @param {React.ReactNode} emptyIcon - icon yang ditampilkan saat status data kosong
 * @param {React.ReactNode} emptyAction - tombol aksi / komponen tambahan untuk status data kosong
 * @param {React.ReactNode} emptyState - kustomisasi tampilan penuh untuk status data kosong
 * @param {boolean} hoverable - menambahkan kelas CSS is-hoverable
 * @param {boolean} striped - menambahkan kelas CSS is-striped
 * @param {boolean} fullwidth - menambahkan kelas CSS is-fullwidth
 * @param {string} className - kelas CSS tambahan untuk elemen tabel
 * @param {string} containerClassName - kelas CSS tambahan untuk pembungkus (wrapper) table-container
 * @param {React.ReactNode} footer - komponen footer atau slot pagination
 * @param {string} sortBy - kolom pengurutan aktif saat ini
 * @param {string} sortOrder - arah pengurutan ("ASC" | "DESC")
 * @param {Function} onSort - callback ketika kolom pengurutan diklik (sortKey: string) => void
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
  sortBy = "",
  sortOrder = "DESC",
  onSort = null,
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

  const handleHeaderClick = (col) => {
    if (!col.sortable || !onSort) return;
    const key = col.sortKey || col.accessor;
    if (key) {
      onSort(key);
    }
  };

  return (
    <div className="table-wrapper">
      <div className={`table-container mb-0 ${containerClassName}`}>
        <table className={tableClasses}>
          {columns.length > 0 && (
            <thead>
              <tr>
                {columns.map((col, colIdx) => {
                  const alignClass = getAlignClass(col.align);
                  const isSortable = Boolean(col.sortable && onSort);
                  const sortKey = col.sortKey || col.accessor;
                  const isCurrentSort = isSortable && sortBy === sortKey;

                  const headerClass = [
                    alignClass,
                    col.headerClassName,
                    col.className,
                    isSortable ? "is-clickable is-unselectable" : "",
                  ]
                    .filter(Boolean)
                    .join(" ");

                  const headerStyle = {
                    ...(col.width ? { width: col.width } : {}),
                    ...(col.headerStyle || {}),
                    ...(col.style || {}),
                    cursor: isSortable ? "pointer" : "default",
                  };

                  return (
                    <th
                      key={col.accessor || col.sortKey || colIdx}
                      className={headerClass}
                      style={headerStyle}
                      onClick={() => handleHeaderClick(col)}
                      title={isSortable ? `Klik untuk mengurutkan berdasarkan ${typeof col.header === "string" ? col.header : "kolom ini"}` : undefined}
                    >
                      <div
                        className={`is-flex is-align-items-center ${
                          col.align === "center"
                            ? "is-justify-content-center"
                            : col.align === "right"
                              ? "is-justify-content-flex-end"
                              : "is-justify-content-flex-start"
                        }`}
                        style={{ gap: "6px" }}
                      >
                        <span>{col.header}</span>
                        {isSortable && (
                          <span
                            className="is-inline-flex is-align-items-center"
                            style={{
                              color: isCurrentSort ? "var(--gold-dark)" : "var(--ink-soft)",
                              opacity: isCurrentSort ? 1 : 0.4,
                              transition: "all 0.2s ease",
                            }}
                          >
                            {isCurrentSort ? (
                              sortOrder.toUpperCase() === "ASC" ? (
                                <ArrowUp size={13} strokeWidth={2.5} />
                              ) : (
                                <ArrowDown size={13} strokeWidth={2.5} />
                              )
                            ) : (
                              <ArrowUpDown size={12} strokeWidth={1.8} />
                            )}
                          </span>
                        )}
                      </div>
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
