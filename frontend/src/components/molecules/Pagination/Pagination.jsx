import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

/**
 * Reusable Luxury Pagination Component
 *
 * @param {number} currentPage - Halaman aktif saat ini (1-indexed)
 * @param {number} totalPages - Total keseluruhan halaman
 * @param {number} totalItems - Total keseluruhan data
 * @param {number} limit - Jumlah data per halaman
 * @param {Array<number>} limitOptions - Pilihan dropdown limit per halaman
 * @param {Function} onPageChange - Callback ketika halaman berubah (page: number)
 * @param {Function} onLimitChange - Callback ketika limit per halaman berubah (limit: number)
 * @param {string} className - Kelas CSS tambahan
 */
const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  limit = 10,
  limitOptions = [5, 10, 20, 50],
  onPageChange,
  onLimitChange,
  className = "",
}) => {
  const safeCurrentPage = Math.max(1, Math.min(currentPage, totalPages || 1));
  const startItem = totalItems === 0 ? 0 : (safeCurrentPage - 1) * limit + 1;
  const endItem = Math.min(safeCurrentPage * limit, totalItems);

  // Menghitung range halaman dengan cerdas (misal: 1, 2, ..., 7, 8, 9, 10)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(2, safeCurrentPage - 1);
      let end = Math.min(totalPages - 1, safeCurrentPage + 1);

      if (safeCurrentPage <= 3) {
        start = 2;
        end = 4;
      } else if (safeCurrentPage >= totalPages - 2) {
        start = totalPages - 3;
        end = totalPages - 1;
      }

      pages.push(1);
      if (start > 2) {
        pages.push("...");
      }
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (end < totalPages - 1) {
        pages.push("...");
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const handlePageClick = (page) => {
    if (page === "..." || page === safeCurrentPage) return;
    if (onPageChange) onPageChange(page);
  };

  return (
    <div
      className={`is-flex is-justify-content-between is-align-items-center is-flex-wrap-wrap py-3 px-4 ${className}`}
      style={{
        gap: "1rem",
        borderTop: "1px solid var(--border-soft)",
        backgroundColor: "var(--cream-card)",
      }}
    >
      {/* Informasi Baris Data & Limit Selector */}
      <div className="is-flex is-align-items-center is-flex-wrap-wrap" style={{ gap: "0.75rem" }}>
        <span className="is-size-7 has-text-grey">
          Menampilkan <strong className="has-text-grey-dark">{startItem}</strong> -{" "}
          <strong className="has-text-grey-dark">{endItem}</strong> dari{" "}
          <strong className="has-text-grey-dark">{totalItems}</strong> data
        </span>

        {onLimitChange && (
          <div className="is-flex is-align-items-center" style={{ gap: "0.4rem" }}>
            <span className="is-size-7 has-text-grey">| Baris:</span>
            <div className="select is-small">
              <select
                value={limit}
                onChange={(e) => onLimitChange(Number(e.target.value))}
                style={{
                  borderColor: "var(--border-soft)",
                  borderRadius: "6px",
                  fontSize: "0.8rem",
                  paddingRight: "2rem",
                }}
              >
                {limitOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Kontrol Navigasi Tombol Halaman */}
      {totalPages > 1 && (
        <nav
          className="pagination is-small is-rounded is-centered mb-0"
          role="navigation"
          aria-label="pagination"
          style={{ margin: 0 }}
        >
          <ul className="pagination-list is-flex" style={{ gap: "4px" }}>
            {/* First Page */}
            <li>
              <button
                type="button"
                className="pagination-link"
                onClick={() => handlePageClick(1)}
                disabled={safeCurrentPage === 1}
                title="Halaman Pertama"
                style={{
                  minWidth: "30px",
                  height: "30px",
                  padding: "0 6px",
                  borderRadius: "6px",
                  borderColor: "var(--border-soft)",
                  background: safeCurrentPage === 1 ? "#f5f5f5" : "#fff",
                }}
              >
                <ChevronsLeft size={14} />
              </button>
            </li>

            {/* Prev Page */}
            <li>
              <button
                type="button"
                className="pagination-link"
                onClick={() => handlePageClick(safeCurrentPage - 1)}
                disabled={safeCurrentPage === 1}
                title="Halaman Sebelumnya"
                style={{
                  minWidth: "30px",
                  height: "30px",
                  padding: "0 6px",
                  borderRadius: "6px",
                  borderColor: "var(--border-soft)",
                  background: safeCurrentPage === 1 ? "#f5f5f5" : "#fff",
                }}
              >
                <ChevronLeft size={14} />
              </button>
            </li>

            {/* Nomor Halaman */}
            {getPageNumbers().map((page, idx) => (
              <li key={idx}>
                {page === "..." ? (
                  <span
                    className="pagination-ellipsis px-1 has-text-grey"
                    style={{ fontSize: "0.85rem" }}
                  >
                    &hellip;
                  </span>
                ) : (
                  <button
                    type="button"
                    className={`pagination-link ${
                      page === safeCurrentPage ? "is-current" : ""
                    }`}
                    onClick={() => handlePageClick(page)}
                    style={{
                      minWidth: "30px",
                      height: "30px",
                      borderRadius: "6px",
                      fontSize: "0.8rem",
                      fontWeight: page === safeCurrentPage ? "600" : "400",
                      backgroundColor:
                        page === safeCurrentPage ? "var(--gold-accent)" : "#ffffff",
                      borderColor:
                        page === safeCurrentPage
                          ? "var(--gold-accent)"
                          : "var(--border-soft)",
                      color: page === safeCurrentPage ? "#ffffff" : "var(--ink)",
                    }}
                  >
                    {page}
                  </button>
                )}
              </li>
            ))}

            {/* Next Page */}
            <li>
              <button
                type="button"
                className="pagination-link"
                onClick={() => handlePageClick(safeCurrentPage + 1)}
                disabled={safeCurrentPage === totalPages}
                title="Halaman Selanjutnya"
                style={{
                  minWidth: "30px",
                  height: "30px",
                  padding: "0 6px",
                  borderRadius: "6px",
                  borderColor: "var(--border-soft)",
                  background: safeCurrentPage === totalPages ? "#f5f5f5" : "#fff",
                }}
              >
                <ChevronRight size={14} />
              </button>
            </li>

            {/* Last Page */}
            <li>
              <button
                type="button"
                className="pagination-link"
                onClick={() => handlePageClick(totalPages)}
                disabled={safeCurrentPage === totalPages}
                title="Halaman Terakhir"
                style={{
                  minWidth: "30px",
                  height: "30px",
                  padding: "0 6px",
                  borderRadius: "6px",
                  borderColor: "var(--border-soft)",
                  background: safeCurrentPage === totalPages ? "#f5f5f5" : "#fff",
                }}
              >
                <ChevronsRight size={14} />
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default Pagination;
