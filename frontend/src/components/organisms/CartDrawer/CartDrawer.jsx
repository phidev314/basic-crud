import React, { useEffect } from "react";
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Package,
} from "lucide-react";
import { useCart } from "../../../context/CartContext";
import Button from "../../atoms/Button/Button";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

// komponen drawer keranjang belanja (slide-over cart panel)
const CartDrawer = () => {
  // mengambil state dan fungsi manipulasi keranjang dari CartContext
  const {
    items,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    totalPrice,
    openCheckout,
  } = useCart();

  // kunci scroll halaman web saat drawer keranjang sedang terbuka
  useEffect(() => {
    if (isCartOpen) {
      document.documentElement.classList.add("is-clipped");
      document.body.classList.add("is-clipped");
      return () => {
        document.documentElement.classList.remove("is-clipped");
        document.body.classList.remove("is-clipped");
      };
    }
  }, [isCartOpen]);

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
      return path;
    }
    return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  if (!isCartOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={closeCart}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(46, 42, 36, 0.5)",
          backdropFilter: "blur(4px)",
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Drawer Content */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "460px",
          height: "100%",
          backgroundColor: "var(--cream-card)",
          boxShadow: "-10px 0 40px rgba(46, 42, 36, 0.15)",
          display: "flex",
          flexDirection: "column",
          zIndex: 10000,
          animation: "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Header Drawer */}
        <header
          className="p-4 is-flex is-justify-content-between is-align-items-center"
          style={{
            borderBottom: "1px solid var(--border-soft)",
            backgroundColor: "#ffffff",
          }}
        >
          <div className="is-flex is-align-items-center" style={{ gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "var(--gold-light)",
                color: "var(--gold-dark)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShoppingBag size={18} />
            </div>
            <div>
              <h2 className="title is-6 mb-0 has-text-weight-bold" style={{ color: "var(--ink)" }}>
                Keranjang Belanja
              </h2>
              <span className="is-size-7 has-text-grey">{totalItems} item dipilih</span>
            </div>
          </div>

          <button
            type="button"
            className="delete is-medium"
            onClick={closeCart}
            aria-label="close"
          />
        </header>

        {/* List Item Keranjang */}
        <div
          className="p-4"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overscrollBehavior: "contain",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {items.length === 0 ? (
            <div className="has-text-centered py-6 my-auto">
              <div
                className="is-inline-flex is-align-items-center is-justify-content-center mb-3"
                style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "50%",
                  backgroundColor: "var(--cream-bg)",
                  color: "var(--gold-dark)",
                }}
              >
                <ShoppingBag size={32} />
              </div>
              <p className="title is-6 has-text-grey-dark mb-1">Keranjang Masih Kosong</p>
              <p className="subtitle is-7 has-text-grey mb-4" style={{ maxWidth: "260px", margin: "0 auto" }}>
                Pilih produk pilihan Anda dari katalog dan tambahkan ke keranjang untuk melakukan pemesanan.
              </p>
              <Button variant="primary" size="small" onClick={closeCart}>
                Mulai Belanja Sekarang
              </Button>
            </div>
          ) : (
            items.map((item) => {
              const imgUrl = getImageUrl(item.imageUrl);
              return (
                <div
                  key={item.id}
                  className="p-3 is-flex"
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "10px",
                    border: "1px solid var(--border-soft)",
                    boxShadow: "var(--shadow-subtle)",
                    gap: "12px",
                  }}
                >
                  {/* Foto Produk */}
                  <div
                    style={{
                      width: "65px",
                      height: "65px",
                      borderRadius: "8px",
                      backgroundColor: "var(--cream-bg)",
                      border: "1px solid var(--border-soft)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={item.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <Package size={24} color="var(--ink-soft)" />
                    )}
                  </div>

                  {/* Info Item */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="is-flex is-justify-content-between is-align-items-flex-start">
                      <div>
                        <span className="tag is-small is-light mb-1" style={{ fontSize: "0.68rem" }}>
                          {item.category}
                        </span>
                        <h4
                          className="has-text-weight-semibold is-size-7 mb-0 text-truncate"
                          style={{ color: "var(--ink)", maxWidth: "190px" }}
                          title={item.name}
                        >
                          {item.name}
                        </h4>
                      </div>

                      {/* Tombol Hapus */}
                      <button
                        type="button"
                        className="button is-small is-ghost p-1 has-text-danger"
                        onClick={() => removeFromCart(item.id)}
                        title="Hapus dari keranjang"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="is-flex is-justify-content-between is-align-items-center mt-2">
                      <span className="has-text-weight-bold is-size-7" style={{ color: "var(--gold-dark)" }}>
                        {formatRupiah(item.price)}
                      </span>

                      {/* Kontrol Kuantitas */}
                      <div
                        className="is-flex is-align-items-center"
                        style={{
                          border: "1px solid var(--border-soft)",
                          borderRadius: "6px",
                          overflow: "hidden",
                          backgroundColor: "var(--cream-bg)",
                        }}
                      >
                        <button
                          type="button"
                          className="button is-small is-ghost p-1"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          style={{ height: "24px", width: "24px" }}
                          title="Kurangi"
                        >
                          <Minus size={12} />
                        </button>
                        <span
                          className="px-2 is-size-7 has-text-weight-bold has-text-centered"
                          style={{ minWidth: "24px", lineHeight: "24px" }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className="button is-small is-ghost p-1"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          style={{ height: "24px", width: "24px" }}
                          title={item.quantity >= item.stock ? "Maksimal stok tercapai" : "Tambah"}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Ringkasan & Checkout Button */}
        {items.length > 0 && (
          <footer
            className="p-4"
            style={{
              borderTop: "1px solid var(--border-soft)",
              backgroundColor: "#ffffff",
            }}
          >
            <div className="is-flex is-justify-content-between is-align-items-center mb-2">
              <span className="is-size-7 has-text-grey">Subtotal ({totalItems} item):</span>
              <span className="is-size-6 has-text-weight-bold" style={{ color: "var(--ink)" }}>
                {formatRupiah(totalPrice)}
              </span>
            </div>

            <div className="is-flex is-justify-content-between is-align-items-center mb-3">
              <span className="is-size-7 has-text-grey">Estimasi Pengiriman:</span>
              <span className="tag is-success is-light is-small has-text-weight-bold">
                Gratis Ongkir
              </span>
            </div>

            <hr className="my-2" style={{ backgroundColor: "var(--border-soft)" }} />

            <div className="is-flex is-justify-content-between is-align-items-center mb-4">
              <span className="has-text-weight-semibold" style={{ color: "var(--ink)" }}>
                Total Pembayaran:
              </span>
              <span className="title is-5 mb-0 has-text-weight-bold" style={{ color: "var(--gold-dark)" }}>
                {formatRupiah(totalPrice)}
              </span>
            </div>

            <div className="is-flex is-flex-direction-column" style={{ gap: "0.5rem" }}>
              <Button
                variant="primary"
                isFullwidth={true}
                onClick={openCheckout}
              >
                <span className="is-flex is-align-items-center is-justify-content-center" style={{ gap: "6px" }}>
                  <span>Lanjut ke Checkout</span>
                  <ArrowRight size={16} />
                </span>
              </Button>

              <button
                type="button"
                className="button is-small is-ghost has-text-grey"
                onClick={clearCart}
              >
                Kosongkan Keranjang
              </button>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
