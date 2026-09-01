import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  Package,
  RotateCcw,
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
} from "../../components";
import { productService } from "../../services";
import { useDebounce } from "../../hooks";

const ProductManagementPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [notification, setNotification] = useState({ show: false, message: "", type: "info" });

  // Debounce search query dengan delay 400ms
  const debouncedSearch = useDebounce(search, 400);

  // Delete Modal States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const breadcrumbs = [
    { label: "Home", href: "/dashboard" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Product Management", active: true },
  ];

  // Fetch Categories
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

  // Fetch Products berdasarkan debouncedSearch dan selectedCategory
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (selectedCategory) params.categoryId = selectedCategory;

      const response = await productService.getProducts(params);
      if (response.data && Array.isArray(response.data.data)) {
        setProducts(response.data.data);
      } else if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Gagal memuat produk:", error);
      showNotification(error.message || "Gagal memuat data produk.", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Trigger pencarian otomatis saat debouncedSearch atau selectedCategory berubah
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, selectedCategory]);

  const showNotification = (message, type = "info") => {
    setNotification({ show: true, message, type });
  };

  const handleSearchReset = () => {
    setSearch("");
    setSelectedCategory("");
  };

  // Delete Action
  const openDeleteModal = (product) => {
    setDeletingProduct(product);
    setIsDeleteModalOpen(true);
  };

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
      width: "60px",
      render: (_, index) => index + 1,
    },
    {
      header: "Nama Produk",
      accessor: "name",
      render: (item) => (
        <div>
          <p className="has-text-weight-semibold mb-0">{item.name}</p>
          {item.description && (
            <p className="is-size-7 has-text-grey text-truncate" style={{ maxWidth: "300px" }}>
              {item.description}
            </p>
          )}
        </div>
      ),
    },
    {
      header: "Kategori",
      render: (item) => (
        <span className="tag is-primary is-light">
          {item.category?.name || "Umum"}
        </span>
      ),
    },
    {
      header: "Harga Satuan",
      render: (item) => formatRupiah(item.price),
      cellClassName: "has-text-weight-semibold",
    },
    {
      header: "Stok",
      render: (item) => (
        <span
          className={`tag is-small ${item.stock <= 5
            ? "is-danger is-light"
            : item.stock <= 20
              ? "is-warning is-light"
              : "is-success is-light"
            }`}
        >
          {item.stock} unit
        </span>
      ),
    },
    {
      header: "Aksi",
      align: "center",
      width: "160px",
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

  const isFiltered = Boolean(debouncedSearch.trim() || selectedCategory);

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
          ? "Tidak ada produk yang sesuai dengan kriteria filter atau kata kunci pencarian Anda. Silakan coba kata kunci lain atau reset filter."
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
        subtitle="Kelola katalog produk, harga, stok, dan kategori sistem."
        action={
          <Button to="/product-management/tambah" variant="primary" isRounded={true}>
            <span className="is-flex is-align-items-center" style={{ gap: "4px" }}>
              <Plus size={16} />
              <span>Tambah Produk</span>
            </span>
          </Button>
        }
      />

      {notification.show && (
        <Notification
          type={notification.type}
          onClose={() => setNotification({ ...notification, show: false })}
          className="mb-4"
        >
          {notification.message}
        </Notification>
      )}

      {/* FILTER & SEARCH BAR */}
      <div className="card-container mb-4 p-4">
        <div className="is-flex is-justify-content-between is-align-items-center is-flex-wrap-wrap"
          style={{ gap: "1rem", justifyContent: "space-between" }}>
          <div className="column is-6">
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onReset={handleSearchReset}
              placeholder="Cari produk berdasarkan nama atau deskripsi..."
            />
          </div>
          <div className="column is-4">
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
                    value: cat.id,
                    label: cat.name,
                  })),
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* PRODUCT TABLE */}
      <div className="card-container p-0">
        <Table
          columns={productColumns}
          data={products}
          keyField="id"
          loading={loading}
          loadingMessage="Memuat katalog produk..."
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
          footer={
            !loading && products.length > 0 ? (
              <footer className="card-footer px-4 py-3">
                <span className="is-size-7 has-text-grey">
                  Menampilkan {products.length} dari {products.length} produk
                </span>
              </footer>
            ) : null
          }
        />
      </div>

      {/* MODAL DELETE CONFIRMATION */}
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
