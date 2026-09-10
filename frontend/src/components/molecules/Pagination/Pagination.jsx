import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
} from "lucide-react";
import "./Pagination.css";

/**
 * Reusable Luxury Atelier Pagination Component
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
  const normalizedTotalPages = Math.max(1, totalPages || 1);
  const safeCurrentPage = Math.max(1, Math.min(currentPage, normalizedTotalPages));
  const startItem = totalItems === 0 ? 0 : (safeCurrentPage - 1) * limit + 1;
  const endItem = Math.min(safeCurrentPage * limit, totalItems);

  // Menghitung deretan nomor halaman dengan smart ellipsis (contoh: 1, 2, ..., 7, 8, 9, 10)
  const getPageNumbers = () => {
    if (normalizedTotalPages <= 1) return [1];

    const pages = [];
    const maxVisible = 5;

    if (normalizedTotalPages <= maxVisible + 2) {
      for (let i = 1; i <= normalizedTotalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(2, safeCurrentPage - 1);
      let end = Math.min(normalizedTotalPages - 1, safeCurrentPage + 1);

      if (safeCurrentPage <= 3) {
        start = 2;
        end = 4;
      } else if (safeCurrentPage >= normalizedTotalPages - 2) {
        start = normalizedTotalPages - 3;
        end = normalizedTotalPages - 1;
      }

      pages.push(1);
      if (start > 2) {
        pages.push("...");
      }
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (end < normalizedTotalPages - 1) {
        pages.push("...");
      }
      pages.push(normalizedTotalPages);
    }

    return pages;
  };

  const handlePageClick = (page) => {
    if (
      page === "..." ||
      page === safeCurrentPage ||
      page < 1 ||
      page > normalizedTotalPages
    ) {
      return;
    }
    if (onPageChange) {
      onPageChange(page);
    }
  };

  return (
    <div className={`luxury-pagination ${className}`}>
      {/* Informasi Baris Data & Limit Selector */}
      <div className="pagination-info-group">
        <span className="pagination-count">
          Menampilkan <strong>{startItem}</strong>–<strong>{endItem}</strong> dari{" "}
          <strong>{totalItems}</strong> data
        </span>

        {onLimitChange && (
          <>
            <span className="pagination-divider" aria-hidden="true" />
            <div className="pagination-limit-group">
              <label
                htmlFor="pagination-limit-select"
                className="pagination-limit-label"
              >
                Baris:
              </label>
              <div className="pagination-select-wrapper">
                <select
                  id="pagination-limit-select"
                  value={limit}
                  onChange={(e) => onLimitChange(Number(e.target.value))}
                  className="pagination-select"
                  aria-label="Jumlah baris per halaman"
                >
                  {limitOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <span className="pagination-select-icon">
                  <ChevronDown size={14} />
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Kontrol Navigasi Tombol Halaman */}
      <nav
        className="pagination-nav"
        role="navigation"
        aria-label="Navigasi halaman"
      >
        <ul className="pagination-list">
          {/* Halaman Pertama */}
          <li>
            <button
              type="button"
              className="pagination-btn"
              onClick={() => handlePageClick(1)}
              disabled={safeCurrentPage <= 1 || totalItems === 0}
              title="Halaman Pertama"
              aria-label="Halaman Pertama"
            >
              <ChevronsLeft size={15} />
            </button>
          </li>

          {/* Halaman Sebelumnya */}
          <li>
            <button
              type="button"
              className="pagination-btn"
              onClick={() => handlePageClick(safeCurrentPage - 1)}
              disabled={safeCurrentPage <= 1 || totalItems === 0}
              title="Halaman Sebelumnya"
              aria-label="Halaman Sebelumnya"
            >
              <ChevronLeft size={15} />
            </button>
          </li>

          {/* Nomor Halaman */}
          {getPageNumbers().map((page, idx) => (
            <li key={idx}>
              {page === "..." ? (
                <span className="pagination-ellipsis" aria-hidden="true">
                  &hellip;
                </span>
              ) : (
                <button
                  type="button"
                  className={`pagination-btn ${
                    page === safeCurrentPage ? "is-active" : ""
                  }`}
                  onClick={() => handlePageClick(page)}
                  disabled={totalItems === 0}
                  title={`Halaman ${page}`}
                  aria-label={`Halaman ${page}`}
                  aria-current={page === safeCurrentPage ? "page" : undefined}
                >
                  {page}
                </button>
              )}
            </li>
          ))}

          {/* Halaman Selanjutnya */}
          <li>
            <button
              type="button"
              className="pagination-btn"
              onClick={() => handlePageClick(safeCurrentPage + 1)}
              disabled={
                safeCurrentPage >= normalizedTotalPages || totalItems === 0
              }
              title="Halaman Selanjutnya"
              aria-label="Halaman Selanjutnya"
            >
              <ChevronRight size={15} />
            </button>
          </li>

          {/* Halaman Terakhir */}
          <li>
            <button
              type="button"
              className="pagination-btn"
              onClick={() => handlePageClick(normalizedTotalPages)}
              disabled={
                safeCurrentPage >= normalizedTotalPages || totalItems === 0
              }
              title="Halaman Terakhir"
              aria-label="Halaman Terakhir"
            >
              <ChevronsRight size={15} />
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Pagination;
