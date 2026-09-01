import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  Package,
  Sparkles,
  ShieldCheck,
  Truck,
  LogIn,
  SlidersHorizontal,
  MapPin,
} from "lucide-react";
import { productService } from "../../services";
import { useCart } from "../../context/CartContext";
import { useDebounce } from "../../hooks";
import {
  CartDrawer,
  CheckoutModal,
  SearchBar,
  Select,
  Chip,
  Catalog,
} from "../../components";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

// halaman publik / toko online (katalog produk & interaksi keranjang belanja)
const LandingPage = () => {
  // mengambil method keranjang dari CartContext
  const { addToCart, totalItems, openCart } = useCart();

  // state untuk data katalog, kategori, filter pencarian, filter kategori, dan sorting
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("DESC");
  const [addedId, setAddedId] = useState(null);

  // debounce input pencarian untuk menunda request api selama 350ms
  const debouncedSearch = useDebounce(search, 350);

  // helper untuk memformat path gambar lokal menjadi url lengkap ke server backend
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
      return path;
    }
    return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  // format angka ke format mata uang rupiah (idr)
  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(number || 0);
  };

  // mengambil daftar kategori produk saat pertama kali halaman dimuat
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await productService.getCategories();
        if (Array.isArray(res.data)) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error("Gagal memuat kategori:", err);
      }
    };
    fetchCategories();
  }, []);

  // mengambil daftar produk dari api backend berdasarkan filter pencarian, kategori, dan sorting
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = {
          sortBy,
          order,
          limit: 24,
        };
        if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
        if (selectedCategory) params.categoryId = selectedCategory;

        const res = await productService.getProducts(params);
        const dataList = res.data?.data || res.data || [];
        setProducts(Array.isArray(dataList) ? dataList : []);
      } catch (err) {
        console.error("Gagal memuat produk:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [debouncedSearch, selectedCategory, sortBy, order]);

  // menangani penambahan produk ke keranjang belanja dan menampilkan feedback visual
  const handleAddToCart = (product) => {
    const success = addToCart(product, 1);
    if (success) {
      setAddedId(product.id);
      setTimeout(() => {
        setAddedId(null);
      }, 1200);
    }
  };

  // menangani perubahan opsi sorting
  const handleSortChange = (value) => {
    if (value === "price_asc") {
      setSortBy("price");
      setOrder("ASC");
    } else if (value === "price_desc") {
      setSortBy("price");
      setOrder("DESC");
    } else if (value === "name_asc") {
      setSortBy("name");
      setOrder("ASC");
    } else if (value === "name_desc") {
      setSortBy("name");
      setOrder("DESC");
    } else {
      setSortBy("createdAt");
      setOrder("DESC");
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--cream-bg)", color: "var(--ink)" }}>
      {/* NAVBAR PUBLIK */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backgroundColor: "rgba(255, 253, 248, 0.92)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid var(--border-soft)",
          boxShadow: "var(--shadow-subtle)",
        }}
      >
        <div
          className="is-flex is-justify-content-space-between is-justify-content-between is-align-items-center py-3 px-4"
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* LOGO / BRAND */}
          <Link
            to="/"
            className="is-flex is-align-items-center"
            style={{ gap: "8px", textDecoration: "none", color: "var(--ink)", display: "flex", alignItems: "center" }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, var(--gold-accent), var(--gold-dark))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                boxShadow: "0 4px 12px rgba(176, 141, 87, 0.3)",
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "1.4rem",
                  fontWeight: "700",
                  letterSpacing: "0.5px",
                  lineHeight: "1.1",
                  display: "block",
                  color: "var(--ink)",
                }}
              >
                ATELIER
              </span>
              <span
                style={{
                  fontSize: "0.65rem",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  color: "var(--gold-dark)",
                  fontWeight: "600",
                  display: "block",
                }}
              >
                Katalog Produk
              </span>
            </div>
          </Link>

          {/* ACTION MENU (KERANJANG & LOGIN ADMIN) */}
          <div className="is-flex is-align-items-center" style={{ gap: "0.75rem" }}>
            {/* TOMBOL KERANJANG */}
            <button
              type="button"
              className="button is-white"
              onClick={openCart}
              style={{
                border: "1px solid var(--border-soft)",
                borderRadius: "20px",
                padding: "0.4rem 1rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#ffffff",
                boxShadow: "var(--shadow-subtle)",
              }}
            >
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <ShoppingBag size={18} color="var(--gold-dark)" />
                {totalItems > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-8px",
                      right: "-10px",
                      backgroundColor: "var(--gold-accent)",
                      color: "#ffffff",
                      fontSize: "0.65rem",
                      fontWeight: "bold",
                      borderRadius: "50%",
                      width: "18px",
                      height: "18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="is-size-7 has-text-weight-semibold" style={{ color: "var(--ink)" }}>
                Keranjang
              </span>
            </button>

            {/* TOMBOL LOGIN / DASHBOARD */}
            <Link
              to="/dashboard"
              className="button is-small is-rounded"
              style={{
                backgroundColor: "var(--ink)",
                color: "#ffffff",
                fontWeight: "500",
                fontSize: "0.8rem",
                padding: "0.4rem 0.9rem",
              }}
            >
              <span className="is-flex is-align-items-center" style={{ gap: "6px" }}>
                <LogIn size={13} />
                <span>Panel Admin</span>
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section
        style={{
          background: "linear-gradient(180deg, #FFFDF8 0%, var(--cream-bg) 100%)",
          padding: "3.5rem 1rem 2.5rem",
          borderBottom: "1px solid var(--border-soft)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
          <div
            className="is-inline-flex is-align-items-center mb-3 px-3 py-1"
            style={{
              backgroundColor: "var(--gold-light)",
              borderRadius: "20px",
              border: "1px solid rgba(176, 141, 87, 0.3)",
              gap: "6px",
            }}
          >
            <Sparkles size={14} color="var(--gold-dark)" />
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: "600",
                color: "var(--gold-dark)",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              Koleksi Eksklusif Terbaru 2026
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(2rem, 4.5vw, 3.2rem)",
              fontWeight: "700",
              lineHeight: "1.15",
              color: "var(--ink)",
              marginBottom: "1rem",
            }}
          >
            Pilihan Produk Unggulan & Berkualitas Tinggi
          </h1>

          <p
            className="subtitle is-6 mb-5 has-text-grey"
            style={{ maxWidth: "600px", margin: "0 auto 1.5rem", lineHeight: "1.6" }}
          >
            Jelajahi berbagai pilihan katalog produk kami, tambahkan ke keranjang dengan cepat, dan lakukan checkout langsung ke alamat tersimpan Anda.
          </p>

          {/* SEARCH BOX */}
          <div
            style={{
              maxWidth: "540px",
              margin: "0 auto",
            }}
          >
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onReset={() => setSearch("")}
              placeholder="Cari nama produk atau deskripsi..."
            />
          </div>

          {/* STAT BADGES */}
          <div
            className="is-flex is-justify-content-center is-flex-wrap-wrap mt-5"
            style={{ gap: "1.5rem" }}
          >
            <div className="is-flex is-align-items-center" style={{ gap: "6px", fontSize: "0.8rem", color: "var(--ink-soft)" }}>
              <ShieldCheck size={16} color="var(--gold-dark)" />
              <span>100% Produk Terjamin</span>
            </div>
            <div className="is-flex is-align-items-center" style={{ gap: "6px", fontSize: "0.8rem", color: "var(--ink-soft)" }}>
              <Truck size={16} color="var(--gold-dark)" />
              <span>Pengiriman Cepat & Gratis</span>
            </div>
            <div className="is-flex is-align-items-center" style={{ gap: "6px", fontSize: "0.8rem", color: "var(--ink-soft)" }}>
              <MapPin size={16} color="var(--gold-dark)" />
              <span>Checkout Alamat Multi-User</span>
            </div>
          </div>
        </div>
      </section>

      {/* KATALOG PRODUK SECTION */}
      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "2.5rem 1rem 4rem" }}>
        {/* TOOLBAR FILTER & SORT CARD */}
        <div
          className="mb-5"
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            border: "1px solid var(--border-soft)",
            boxShadow: "var(--shadow-subtle)",
            padding: "1.25rem 1.5rem",
          }}
        >
          {/* TOP ROW: SECTION TITLE, COUNT & SORT */}
          <div
            className="is-flex is-justify-content-space-between is-justify-content-between is-align-items-center is-flex-wrap-wrap pb-3"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1rem",
              borderBottom: "1px solid var(--border-soft)",
            }}
          >
            <div>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  color: "var(--ink)",
                  margin: 0,
                  lineHeight: "1.2",
                }}
              >
                Koleksi Produk
              </h2>
              <p className="mb-0" style={{ fontSize: "0.8rem", color: "var(--ink-soft)" }}>
                {loading
                  ? "Memuat katalog..."
                  : `${products.length} produk ditemukan`}
                {search ? ` untuk "${search}"` : ""}
                {selectedCategory
                  ? ` • Kategori ${categories.find((c) => String(c.id) === String(selectedCategory))?.name || ""}`
                  : ""}
              </p>
            </div>

            {/* SORT SELECTOR */}
            <div
              className="is-flex is-align-items-center"
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <SlidersHorizontal size={15} color="var(--gold-dark)" />
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "var(--ink-soft)",
                  fontWeight: "600",
                  whiteSpace: "nowrap",
                }}
              >
                Urutkan:
              </span>
              <Select
                size="small"
                isFullwidth={false}
                value={
                  sortBy === "price"
                    ? order === "ASC"
                      ? "price_asc"
                      : "price_desc"
                    : sortBy === "name"
                      ? order === "ASC"
                        ? "name_asc"
                        : "name_desc"
                      : "latest"
                }
                onChange={(e) => handleSortChange(e.target.value)}
                options={[
                  { value: "latest", label: "Terbaru (Default)" },
                  { value: "price_asc", label: "Harga: Rendah ke Tinggi" },
                  { value: "price_desc", label: "Harga: Tinggi ke Rendah" },
                  { value: "name_asc", label: "Nama: A - Z" },
                  { value: "name_desc", label: "Nama: Z - A" },
                ]}
              />
            </div>
          </div>

          {/* BOTTOM ROW: CATEGORY PILLS SCROLLABLE */}
          <div
            className="pt-3"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              overflowX: "auto",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <Chip
              isActive={selectedCategory === ""}
              onClick={() => setSelectedCategory("")}
            >
              Semua Kategori
            </Chip>
            {categories.map((cat) => (
              <Chip
                key={cat.id}
                isActive={selectedCategory === String(cat.id)}
                onClick={() => setSelectedCategory(String(cat.id))}
              >
                {cat.name}
              </Chip>
            ))}
          </div>
        </div>

        {/* GRID PRODUK */}
        {loading ? (
          <div className="has-text-centered py-6">
            <div className="loader is-inline-block mr-2" />
            <p className="is-size-6 has-text-grey mt-2">Memuat etalase produk...</p>
          </div>
        ) : products.length === 0 ? (
          <div
            className="has-text-centered py-6 p-5"
            style={{
              backgroundColor: "var(--cream-card)",
              borderRadius: "12px",
              border: "1px dashed var(--border-soft)",
            }}
          >
            <Package size={44} color="var(--ink-soft)" className="mb-2" />
            <p className="title is-5 has-text-grey-dark mb-1">Tidak Ada Produk yang Sesuai</p>
            <p className="subtitle is-6 has-text-grey mb-3">
              Coba reset filter atau kata kunci pencarian Anda.
            </p>
            <button
              type="button"
              className="button is-small is-light"
              onClick={() => {
                setSearch("");
                setSelectedCategory("");
              }}
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="columns is-multiline is-mobile">
            {products.map((product) => (
              <div
                key={product.id}
                className="column is-6-mobile is-4-tablet is-3-desktop"
              >
                <Catalog
                  product={product}
                  imageUrl={getImageUrl(product.imageUrl)}
                  onAddToCart={handleAddToCart}
                  isJustAdded={addedId === product.id}
                  formatPrice={formatRupiah}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: "1px solid var(--border-soft)",
          backgroundColor: "#ffffff",
          padding: "2.5rem 1rem",
        }}
      >
        <div
          className="is-flex is-justify-content-between is-align-items-center is-flex-wrap-wrap"
          style={{ maxWidth: "1280px", margin: "0 auto", gap: "1rem" }}
        >
          <div>
            <span
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "1.2rem",
                fontWeight: "700",
                color: "var(--ink)",
              }}
            >
              ATELIER LUXURY STORE
            </span>
            <p className="is-size-7 has-text-grey mb-0">
              Platform e-commerce & katalog produk modern dengan integrasi alamat multi-user.
            </p>
          </div>

          <div className="is-flex is-align-items-center" style={{ gap: "1rem" }}>
            <Link to="/login" className="is-size-7 has-text-grey hover-gold">
              Login Admin
            </Link>
            <Link to="/dashboard" className="is-size-7 has-text-grey hover-gold">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>

      {/* GLOBAL CART DRAWER & CHECKOUT MODAL */}
      <CartDrawer />
      <CheckoutModal />
    </div>
  );
};

export default LandingPage;
