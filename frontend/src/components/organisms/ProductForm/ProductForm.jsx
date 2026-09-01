import React, { useState, useEffect } from "react";
import { Save, X, Package } from "lucide-react";
import FormField from "../../molecules/FormField/FormField";
import Notification from "../../molecules/Notification/Notification";
import Input from "../../atoms/Input/Input";
import Select from "../../atoms/Select/Select";
import Button from "../../atoms/Button/Button";
import { productService } from "../../../services";

const ProductForm = ({
  initialData,
  onSubmit,
  onCancel,
  cancelTo = "/product-management",
  submitText = "Simpan Produk",
  title = "Form Produk",
  headerVariant = "primary",
  loading = false,
  errorMsg = "",
  onCloseError,
}) => {
  const [name, setName] = useState(initialData?.name || "");
  const [price, setPrice] = useState(
    initialData?.price !== undefined ? String(initialData.price) : ""
  );
  const [stock, setStock] = useState(
    initialData?.stock !== undefined ? String(initialData.stock) : "0"
  );
  const [categoryId, setCategoryId] = useState(
    initialData?.categoryId ? String(initialData.categoryId) : ""
  );
  const [description, setDescription] = useState(initialData?.description || "");
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [validationError, setValidationError] = useState("");

  // Fetch categories from backend
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const res = await productService.getCategories();
        if (Array.isArray(res.data)) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error("Gagal mengambil data kategori:", err);
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  // Sinkronisasi data awal saat edit mode
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setPrice(initialData.price !== undefined ? String(initialData.price) : "");
      setStock(initialData.stock !== undefined ? String(initialData.stock) : "0");
      setCategoryId(initialData.categoryId ? String(initialData.categoryId) : "");
      setDescription(initialData.description || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    initialData?.name,
    initialData?.price,
    initialData?.stock,
    initialData?.categoryId,
    initialData?.description,
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setValidationError("Nama produk wajib diisi.");
      return;
    }
    if (!price || isNaN(price) || Number(price) < 0) {
      setValidationError("Harga produk harus berupa angka positif.");
      return;
    }
    if (stock === "" || isNaN(stock) || Number(stock) < 0) {
      setValidationError("Jumlah stok tidak boleh bernilai negatif.");
      return;
    }

    setValidationError("");
    onSubmit({
      name: name.trim(),
      price: Number(price),
      stock: Math.max(0, parseInt(stock, 10) || 0),
      categoryId: categoryId ? Number(categoryId) : null,
      description: description.trim() || null,
    });
  };

  const displayedError = validationError || errorMsg;

  const categoryOptions = [
    { value: "", label: loadingCategories ? "Memuat kategori..." : "-- Pilih Kategori (Opsional) --" },
    ...categories.map((cat) => ({
      value: String(cat.id),
      label: cat.name,
    })),
  ];

  return (
    <div className="card-container p-0 overflow-hidden">
      {title && (
        <header className="card-header p-4 is-flex is-align-items-center" style={{ gap: "8px" }}>
          <Package size={20} color="var(--gold-dark)" />
          <h2 className="card-header-title p-0 mb-0">{title}</h2>
        </header>
      )}

      <div className="card-content p-5">
        {displayedError && (
          <Notification
            type="danger"
            onClose={() => {
              setValidationError("");
              if (onCloseError) onCloseError();
            }}
            className="mb-4"
          >
            {displayedError}
          </Notification>
        )}

        <form onSubmit={handleSubmit}>
          <FormField label="Nama Produk" required>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama produk..."
              required
              disabled={loading}
            />
          </FormField>

          <div className="columns mb-0">
            <div className="column is-6">
              <FormField label="Harga Satuan (Rp)" required>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="contoh: 50000"
                  min="0"
                  step="any"
                  required
                  disabled={loading}
                />
              </FormField>
            </div>
            <div className="column is-6">
              <FormField label="Jumlah Stok" required>
                <Input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="contoh: 15"
                  min="0"
                  required
                  disabled={loading}
                />
              </FormField>
            </div>
          </div>

          <FormField label="Kategori Produk">
            <Select
              options={categoryOptions}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={loading || loadingCategories}
            />
          </FormField>

          <FormField label="Deskripsi Produk (Opsional)">
            <textarea
              className="textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Keterangan singkat mengenai produk ini..."
              rows="3"
              disabled={loading}
            />
          </FormField>

          <hr className="my-4" />

          <div
            className="is-flex is-justify-content-flex-end is-flex-wrap-wrap form-action-buttons"
            style={{ gap: "0.5rem" }}
          >
            {onCancel ? (
              <Button
                type="button"
                variant="light"
                onClick={onCancel}
                disabled={loading}
              >
                <span className="is-flex is-align-items-center" style={{ gap: "4px" }}>
                  <X size={15} />
                  <span>Batal</span>
                </span>
              </Button>
            ) : (
              <Button
                to={cancelTo}
                variant="light"
                disabled={loading}
              >
                <span className="is-flex is-align-items-center" style={{ gap: "4px" }}>
                  <X size={15} />
                  <span>Batal</span>
                </span>
              </Button>
            )}

            <Button
              type="submit"
              variant={headerVariant === "info" ? "info" : "primary"}
              isLoading={loading}
            >
              <span className="is-flex is-align-items-center" style={{ gap: "4px" }}>
                <Save size={15} />
                <span>{submitText}</span>
              </span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
