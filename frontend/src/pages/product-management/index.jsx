import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  Package,
  RotateCcw,
  PlusCircle,
  MinusCircle,
} from "lucide-react";
import {
  MainLayout,
  PageHeader,
  SearchBar,
  Notification,
  Modal,
  Button,
  Table,
  Select,
  Pagination,
  FormField,
  Input,
} from "../../components";
import { productService } from "../../services";
import { useDebounce } from "../../hooks";

const STOCK_STATUS_OPTIONS = [
  { value: "", label: "Semua Status Stok" },
  { value: "in_stock", label: "Stok Tersedia (> 5)" },
  { value: "low_stock", label: "Stok Menipis (1 - 5)" },
  { value: "out_of_stock", label: "Stok Habis (0)" },
];

// halaman manajemen produk (crud produk, filter server-side, penyesuaian stok cepat)
const ProductManagementPage = () => {
  // state data produk & kategori
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // parameter filter server-side (pencarian, kategori, status stok)
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [stockStatus, setStockStatus] = useState("");

  // parameter pagination server-side (halaman aktif, limit per halaman, total halaman, total data)
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // parameter pengurutan data (sorting) server-side
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("DESC");

  // notifikasi toast
  const [notification, setNotification] = useState({ show: false, message: "", type: "info" });

  // state modal hapus produk
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // state modal penyesuaian stok cepat (penambahan / pengurangan stok server-side)
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockTargetProduct, setStockTargetProduct] = useState(null);
  const [stockAdjustmentType, setStockAdjustmentType] = useState("add"); // "add" | "subtract"
  const [stockAdjustmentAmount, setStockAdjustmentAmount] = useState(1);
  const [stockSubmitting, setStockSubmitting] = useState(false);

  // tunda eksekusi input pencarian selama 400ms untuk menghemat request ke server
  const debouncedSearch = useDebounce(search, 400);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Product Management", active: true },
  ];

  // mengambil daftar seluruh kategori produk untuk dropdown filter
  const fetchCategories = async () => {
    try {
      const response = await productService.getCategories();
      if (Array.isArray(response.data)) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Gagal memuat kategori:", error);
    }
  };

  // mengambil data produk dari backend dengan parameter server-side (page, limit, search, kategori, status stok, sorting)
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        sortBy,
        order: sortOrder,
      };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (selectedCategory) params.categoryId = selectedCategory;
      if (stockStatus) params.stockStatus = stockStatus;

      const response = await productService.getProducts(params);
      const resData = response.data || response;

      if (resData && Array.isArray(resData.data)) {
        setProducts(resData.data);
        setTotalItems(resData.totalItems || resData.data.length);
        setTotalPages(resData.totalPages || 1);
      } else if (Array.isArray(resData)) {
        setProducts(resData);
        setTotalItems(resData.length);
        setTotalPages(1);
      } else {
        setProducts([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Gagal memuat produk:", error);
      showNotification(error.message || "Gagal memuat data produk dari server.", "danger");
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, selectedCategory, stockStatus, sortBy, sortOrder]);

  // muat kategori saat awal halaman dibuka
  useEffect(() => {
    fetchCategories();
  }, []);

  // reset ke halaman 1 saat filter atau kata kunci pencarian berubah
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedCategory, stockStatus]);

  // eksekusi pengambilan data produk setiap kali parameter query berubah
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const showNotification = (message, type = "info") => {
    setNotification({ show: true, message, type });
  };

  const handleSearchReset = () => {
    setSearch("");
    setSelectedCategory("");
    setStockStatus("");
    setPage(1);
  };

  const handleSort = (key) => {
    if (sortBy === key) {
      // toggle asc <-> desc
      setSortOrder((prev) => (prev.toUpperCase() === "ASC" ? "DESC" : "ASC"));
    } else {
      setSortBy(key);
      setSortOrder("ASC");
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  // buka modal hapus
  const openDeleteModal = (product) => {
    setDeletingProduct(product);
    setIsDeleteModalOpen(true);
  };

  // konfirmasi hapus produk
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    try {
      setDeleting(true);
      await productService.deleteProduct(deletingProduct.id);
      showNotification(`Produk "${deletingProduct.name}" berhasil dihapus.`, "success");
      setIsDeleteModalOpen(false);
      setDeletingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error("Gagal menghapus produk:", error);
      showNotification(error.message || "Gagal menghapus produk.", "danger");
    } finally {
      setDeleting(false);
    }
  };

  // buka modal penyesuaian stok (penambahan / pengurangan)
  const openStockModal = (product, initialType = "add") => {
    setStockTargetProduct(product);
    setStockAdjustmentType(initialType);
    setStockAdjustmentAmount(1);
    setIsStockModalOpen(true);
  };

  // submit penyesuaian stok sisi server (+ / -)
  const handleConfirmStockAdjustment = async (e) => {
    e.preventDefault();
    if (!stockTargetProduct) return;

    const amount = parseInt(stockAdjustmentAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      showNotification("Jumlah penyesuaian stok harus berupa angka positif minimal 1.", "danger");
      return;
    }

    if (stockAdjustmentType === "subtract" && stockTargetProduct.stock < amount) {
      showNotification(
        `Stok saat ini (${stockTargetProduct.stock} unit) tidak mencukupi untuk dikurangi sebanyak ${amount} unit.`,
        "danger"
      );
      return;
    }

    try {
      setStockSubmitting(true);
      const res = await productService.adjustStock(stockTargetProduct.id, {
        type: stockAdjustmentType,
        amount,
      });

      const updatedMsg =
        res.data?.msg ||
        `Stok produk "${stockTargetProduct.name}" berhasil ${
          stockAdjustmentType === "add" ? "ditambahkan" : "dikurangi"
        }.`;

      showNotification(updatedMsg, "success");
      setIsStockModalOpen(false);
      setStockTargetProduct(null);
      fetchProducts();
    } catch (error) {
      console.error("Gagal memperbarui stok:", error);
      showNotification(error.message || "Gagal memperbarui stok di server.", "danger");
    } finally {
      setStockSubmitting(false);
    }
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(number || 0);
  };

  const productColumns = [
    {
      header: "No",
      align: "center",
      width: "55px",
      render: (_, index) => (page - 1) * limit + index + 1,
    },
    {
      header: "Nama Produk",
      accessor: "name",
      sortable: true,
      sortKey: "name",
      render: (item) => {
        const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";
        const getImageUrl = (path) => {
          if (!path) return null;
          if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
          return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
        };
        const imgUrl = getImageUrl(item.imageUrl);

        return (
          <div className="is-flex is-align-items-center" style={{ gap: "12px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "8px",
                backgroundColor: "var(--gold-light)",
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
                <Package size={20} color="var(--gold-dark)" />
              )}
            </div>
            <div>
              <p className="has-text-weight-semibold mb-0" style={{ color: "var(--ink)" }}>
                {item.name}
              </p>
              {item.description && (
                <p className="is-size-7 has-text-grey text-truncate" style={{ maxWidth: "240px" }}>
                  {item.description}
                </p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      header: "Kategori",
      accessor: "categoryId",
      sortable: true,
      sortKey: "category",
      render: (item) => (
        <span className="tag is-primary is-light is-rounded has-text-weight-medium">
          {item.category?.name || "Umum"}
        </span>
      ),
    },
    {
      header: "Harga Satuan",
      accessor: "price",
      sortable: true,
      sortKey: "price",
      render: (item) => formatRupiah(item.price),
      cellClassName: "has-text-weight-semibold",
    },
    {
      header: "Stok Produk",
      accessor: "stock",
      sortable: true,
      sortKey: "stock",
      render: (item) => (
        <div className="is-flex is-align-items-center" style={{ gap: "6px" }}>
          <span
            className={`tag is-small ${
              item.stock <= 0
                ? "is-danger is-light"
                : item.stock <= 5
                  ? "is-warning is-light"
                  : "is-success is-light"
            }`}
            style={{ fontWeight: "600" }}
          >
            {item.stock} unit
          </span>

          {/* Tombol Cepat Penyesuaian Stok (+ / -) */}
          <button
            type="button"
            className="button is-small is-ghost p-0 has-text-success"
            onClick={() => openStockModal(item, "add")}
            title="Tambah Stok Produk (+)"
            style={{ height: "auto" }}
          >
            <PlusCircle size={15} />
          </button>
          <button
            type="button"
            className="button is-small is-ghost p-0 has-text-danger"
            onClick={() => openStockModal(item, "subtract")}
            disabled={item.stock <= 0}
            title={item.stock <= 0 ? "Stok sudah 0" : "Kurangi Stok Produk (-)"}
            style={{ height: "auto" }}
          >
            <MinusCircle size={15} />
          </button>
        </div>
      ),
    },
    {
      header: "Aksi",
      align: "center",
      width: "140px",
      render: (item) => (
        <div className="buttons is-centered are-small">
          <Link
            to={`/product-management/edit/${item.id}`}
            className="button is-info is-outlined is-small action-btn is-flex is-align-items-center"
            title="Edit Produk"
            style={{ gap: "4px" }}
          >
            <Pencil size={13} />
          </Link>
          <button
            type="button"
            onClick={() => openDeleteModal(item)}
            className="button is-danger is-outlined is-small action-btn is-flex is-align-items-center"
            title="Hapus Produk"
            style={{ gap: "4px" }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  const isFiltered = Boolean(debouncedSearch.trim() || selectedCategory || stockStatus);

  const emptyState = (
    <div className="has-text-centered">
      <div
        className="is-inline-flex is-align-items-center is-justify-content-center mb-3"
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          backgroundColor: "var(--gold-light)",
          color: "var(--gold-dark)",
        }}
      >
        <Package size={28} />
      </div>
      <p className="title is-5 has-text-grey-dark mb-1">
        {isFiltered
          ? "Tidak Ditemukan Produk yang Cocok"
          : "Belum Ada Data Produk"}
      </p>
      <p
        className="subtitle is-6 has-text-grey mb-4"
        style={{ maxWidth: "420px", margin: "0 auto" }}
      >
        {isFiltered
          ? "Tidak ada produk yang sesuai dengan kriteria filter atau kata kunci pencarian Anda pada server. Silakan coba kata kunci lain atau reset filter."
          : "Mulai kelola katalog produk Anda dengan menambahkan produk baru ke dalam sistem sekarang."}
      </p>
      <div className="buttons is-centered are-small">
        {isFiltered ? (
          <Button
            variant="light"
            size="small"
            onClick={handleSearchReset}
          >
            <span className="is-flex is-align-items-center" style={{ gap: "6px" }}>
              <RotateCcw size={14} />
              <span>Reset Filter & Pencarian</span>
            </span>
          </Button>
        ) : (
          <Button
            to="/product-management/tambah"
            variant="primary"
            size="small"
          >
            <span className="is-flex is-align-items-center" style={{ gap: "4px" }}>
              <Plus size={15} />
              <span>Tambah Produk Pertama</span>
            </span>
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <MainLayout breadcrumbs={breadcrumbs}>
      <PageHeader
        title="Manajemen Produk"
        subtitle="Kelola katalog produk, harga, stok, dan kategori sistem dengan filter & sorting server-side."
        action={
          <Button to="/product-management/tambah" variant="primary" isRounded={true}>
            <span className="is-flex is-align-items-center" style={{ gap: "4px" }}>
              <Plus size={16} />
              <span>Tambah Produk</span>
            </span>
          </Button>
        }
      />

      {/* NOTIFICATION */}
      {notification.show && (
        <Notification
          type={notification.type}
          onClose={() => setNotification({ ...notification, show: false })}
          className="mb-4"
        >
          {notification.message}
        </Notification>
      )}

      {/* FILTER, SEARCH & SORTING BAR (SERVER-SIDE) */}
      <div className="card-container mb-4 p-4">
        <div className="columns is-multiline is-vcentered mb-0">
          {/* SEARCH INPUT */}
          <div className="column is-12-mobile is-5-tablet is-5-desktop">
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onReset={handleSearchReset}
              placeholder="Cari nama produk atau deskripsi..."
            />
          </div>

          {/* FILTER KATEGORI */}
          <div className="column is-6-mobile is-3-tablet is-3-desktop">
            <div className="is-flex is-align-items-center">
              <span className="mr-2 has-text-weight-medium is-size-7 has-text-grey is-uppercase">
                Kategori:
              </span>
              <Select
                isFullwidth={true}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                options={[
                  { value: "", label: "Semua Kategori" },
                  ...categories.map((cat) => ({
                    value: String(cat.id),
                    label: cat.name,
                  })),
                ]}
              />
            </div>
          </div>

          {/* FILTER STATUS STOK */}
          <div className="column is-6-mobile is-4-tablet is-4-desktop">
            <div className="is-flex is-align-items-center">
              <span className="mr-2 has-text-weight-medium is-size-7 has-text-grey is-uppercase">
                Stok:
              </span>
              <Select
                isFullwidth={true}
                value={stockStatus}
                onChange={(e) => setStockStatus(e.target.value)}
                options={STOCK_STATUS_OPTIONS}
              />
            </div>
          </div>
        </div>

        {/* STATUS FILTER AKTIF & RESET BUTTON */}
        {isFiltered && (
          <div className="is-flex is-justify-content-space-between is-align-items-center pt-2 mt-2" style={{ borderTop: "1px dashed var(--border-soft)", display: "flex", justifyContent: "space-between" }}>
            <span className="is-size-7 has-text-grey">
              Filter aktif:{" "}
              {debouncedSearch ? `Pencarian "${debouncedSearch}"` : ""}
              {selectedCategory ? ` • Kategori: ${categories.find((c) => String(c.id) === String(selectedCategory))?.name || selectedCategory}` : ""}
              {stockStatus ? ` • ${STOCK_STATUS_OPTIONS.find((s) => s.value === stockStatus)?.label}` : ""}
            </span>
            <button
              type="button"
              className="button is-small is-ghost has-text-grey p-0"
              onClick={handleSearchReset}
              style={{ fontSize: "0.75rem" }}
            >
              <RotateCcw size={12} className="mr-1" />
              Reset Semua Filter
            </button>
          </div>
        )}
      </div>

      {/* PRODUCT TABLE DENGAN SERVER-SIDE SORTING & PAGINATION */}
      <div className="card-container p-0 overflow-hidden">
        <Table
          columns={productColumns}
          data={products}
          keyField="id"
          loading={loading}
          loadingMessage="Memuat katalog produk dari server..."
          emptyMessage={
            isFiltered
              ? "Tidak ditemukan produk yang sesuai dengan filter pencarian."
              : "Belum ada produk ditemukan."
          }
          emptyIcon={<Package size={36} color="var(--ink-soft)" />}
          emptyAction={
            !isFiltered ? (
              <Button
                to="/product-management/tambah"
                variant="primary"
                size="small"
              >
                <span className="is-flex is-align-items-center" style={{ gap: "4px" }}>
                  <Plus size={15} />
                  <span>Tambah Produk Pertama</span>
                </span>
              </Button>
            ) : null
          }
          emptyState={emptyState}
          hoverable={true}
          striped={false}
          fullwidth={true}
          className="table-luxury"
          containerClassName=""
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          footer={
            !loading && totalItems > 0 ? (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={totalItems}
                limit={limit}
                limitOptions={[5, 10, 20, 50]}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
              />
            ) : null
          }
        />
      </div>

      {/* MODAL PENYESUAIAN STOK (PENAMBAHAN & PENGURANGAN SISI SERVER) */}
      <Modal
        isActive={isStockModalOpen}
        onClose={() => {
          setIsStockModalOpen(false);
          setStockTargetProduct(null);
        }}
        title={`Penyesuaian Stok: ${stockTargetProduct?.name || "Produk"}`}
        footer={
          <div className="buttons is-right" style={{ width: "100%" }}>
            <Button
              variant="light"
              onClick={() => {
                setIsStockModalOpen(false);
                setStockTargetProduct(null);
              }}
              disabled={stockSubmitting}
            >
              Batal
            </Button>
            <Button
              variant={stockAdjustmentType === "add" ? "primary" : "danger"}
              onClick={handleConfirmStockAdjustment}
              isLoading={stockSubmitting}
            >
              {stockAdjustmentType === "add" ? "Tambah Stok" : "Kurangi Stok"}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleConfirmStockAdjustment}>
          <div className="content mb-4">
            <p className="is-size-7 has-text-grey mb-2">
              Sistem akan menjalankan operasi aritmatika penambahan atau pengurangan stok produk secara server-side pada database.
            </p>
            <div
              className="p-3 is-flex is-justify-content-between is-align-items-center mb-3"
              style={{
                backgroundColor: "var(--cream-bg)",
                borderRadius: "8px",
                border: "1px solid var(--border-soft)",
              }}
            >
              <span className="is-size-7 has-text-grey-dark">Stok Saat Ini:</span>
              <strong className="is-size-6" style={{ color: "var(--ink)" }}>
                {stockTargetProduct?.stock || 0} unit
              </strong>
            </div>

            <div className="columns is-multiline">
              <div className="column is-6">
                <FormField label="Jenis Operasi" required>
                  <Select
                    value={stockAdjustmentType}
                    onChange={(e) => setStockAdjustmentType(e.target.value)}
                    options={[
                      { value: "add", label: "➕ Tambah Stok (Penambahan)" },
                      { value: "subtract", label: "➖ Kurangi Stok (Pengurangan)" },
                    ]}
                  />
                </FormField>
              </div>

              <div className="column is-6">
                <FormField label="Jumlah Unit" required>
                  <Input
                    type="number"
                    min="1"
                    value={stockAdjustmentAmount}
                    onChange={(e) => setStockAdjustmentAmount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    required
                  />
                </FormField>
              </div>
            </div>

            {/* ESTIMASI STOK AKHIR */}
            <div
              className="p-3 has-text-centered"
              style={{
                backgroundColor:
                  stockAdjustmentType === "add"
                    ? "rgba(72, 199, 142, 0.1)"
                    : "rgba(241, 70, 104, 0.1)",
                borderRadius: "8px",
                border: `1px solid ${
                  stockAdjustmentType === "add" ? "#48c78e" : "#f14668"
                }`,
              }}
            >
              <span className="is-size-7 has-text-grey-dark is-block">Estimasi Stok Akhir:</span>
              <strong
                className="is-size-5"
                style={{
                  color: stockAdjustmentType === "add" ? "#257953" : "#cc0f35",
                }}
              >
                {stockAdjustmentType === "add"
                  ? (stockTargetProduct?.stock || 0) + Number(stockAdjustmentAmount)
                  : Math.max(0, (stockTargetProduct?.stock || 0) - Number(stockAdjustmentAmount))}{" "}
                unit
              </strong>
            </div>
          </div>
        </form>
      </Modal>

      {/* KONFIRMASI MODAL DELETE */}
      <Modal
        isActive={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingProduct(null);
        }}
        title="Konfirmasi Hapus Produk"
        footer={
          <div className="buttons is-right" style={{ width: "100%" }}>
            <Button
              variant="light"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeletingProduct(null);
              }}
              disabled={deleting}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              isLoading={deleting}
            >
              Ya, Hapus
            </Button>
          </div>
        }
      >
        <div className="content">
          <p className="mb-2">
            Apakah Anda yakin ingin menghapus produk{" "}
            <strong className="has-text-danger">
              "{deletingProduct?.name}"
            </strong>
            ?
          </p>
          <p className="is-size-7 has-text-grey mb-0">
            Tindakan ini permanen dan data yang telah dihapus tidak dapat dipulihkan kembali.
          </p>
        </div>
      </Modal>
    </MainLayout>
  );
};

export default ProductManagementPage;
