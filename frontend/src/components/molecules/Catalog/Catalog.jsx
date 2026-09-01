import React from "react";
import { Package, ShoppingBag, Check } from "lucide-react";

const Catalog = ({
  product,
  onAddToCart,
  isJustAdded = false,
  imageUrl,
  formatPrice,
  className = "",
  style = {},
}) => {
  if (!product) return null;

  const isOutOfStock = product.stock <= 0;

  const defaultFormatPrice = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  const priceFormatter = formatPrice || defaultFormatPrice;

  return (
    <div
      className={`product-card ${className}`}
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "14px",
        border: "1px solid var(--border-soft)",
        boxShadow: "var(--shadow-subtle)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        ...style,
      }}
    >
      {/* Gambar Produk */}
      <div
        style={{
          position: "relative",
          width: "100%",
          paddingTop: "75%",
          backgroundColor: "var(--cream-bg)",
          overflow: "hidden",
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.4s ease",
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Package size={38} color="var(--ink-soft)" />
          </div>
        )}

        {/* Badge Kategori */}
        <span
          className="tag is-small"
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            backgroundColor: "rgba(255, 253, 248, 0.9)",
            backdropFilter: "blur(4px)",
            color: "var(--ink)",
            fontWeight: "600",
            fontSize: "0.68rem",
            border: "1px solid var(--border-soft)",
          }}
        >
          {product.category?.name || "Katalog"}
        </span>

        {/* Badge Sisa Stok */}
        <span
          className={`tag is-small ${
            isOutOfStock
              ? "is-danger"
              : product.stock <= 5
              ? "is-warning"
              : "is-success is-light"
          }`}
          style={{
            position: "absolute",
            bottom: "10px",
            right: "10px",
            fontSize: "0.65rem",
            fontWeight: "600",
          }}
        >
          {isOutOfStock ? "Habis" : `Stok: ${product.stock}`}
        </span>
      </div>

      {/* Informasi Produk */}
      <div
        className="p-4 is-flex is-flex-direction-column"
        style={{ flex: 1, justifyContent: "space-between" }}
      >
        <div>
          <h3
            className="title is-6 mb-1 text-truncate"
            style={{
              color: "var(--ink)",
              fontWeight: "600",
              fontSize: "0.95rem",
            }}
            title={product.name}
          >
            {product.name}
          </h3>

          {product.description && (
            <p
              className="is-size-7 has-text-grey mb-3 text-truncate"
              style={{ maxWidth: "100%", lineHeight: "1.4" }}
            >
              {product.description}
            </p>
          )}
        </div>

        <div className="pt-2" style={{ borderTop: "1px solid var(--cream-bg)" }}>
          <div className="is-flex is-justify-content-between is-align-items-center mb-3">
            <div>
              <span
                className="is-size-7 has-text-grey is-block"
                style={{ fontSize: "0.7rem" }}
              >
                Harga:
              </span>
              <span
                className="has-text-weight-bold is-size-6"
                style={{ color: "var(--gold-dark)" }}
              >
                {priceFormatter(product.price)}
              </span>
            </div>
          </div>

          {/* Tombol Tambah ke Keranjang */}
          {onAddToCart && (
            <button
              type="button"
              className={`button is-fullwidth is-small ${
                isJustAdded ? "is-success" : "is-primary"
              }`}
              onClick={() => onAddToCart(product)}
              disabled={isOutOfStock}
              style={{
                borderRadius: "8px",
                fontWeight: "600",
                gap: "6px",
                transition: "all 0.2s ease",
              }}
            >
              {isJustAdded ? (
                <>
                  <Check size={14} />
                  <span>Ditambahkan!</span>
                </>
              ) : isOutOfStock ? (
                <span>Stok Habis</span>
              ) : (
                <>
                  <ShoppingBag size={14} />
                  <span>+ Keranjang</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Catalog;
