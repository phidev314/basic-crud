import React, { useState, useEffect, useRef } from "react";
import { Save, X, Package, Upload, Trash2 } from "lucide-react";
import FormField from "../../molecules/FormField/FormField";
import Notification from "../../molecules/Notification/Notification";
import Input from "../../atoms/Input/Input";
import Select from "../../atoms/Select/Select";
import Button from "../../atoms/Button/Button";
import { productService } from "../../../services";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

// komponen formulir produk: menangani input data, dropdown kategori, upload & preview gambar produk
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
  // state field input produk
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

  // state upload file gambar produk dan preview lokal
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const fileInputRef = useRef(null);

  // helper untuk mendapatkan path foto produk lengkap
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
      return path;
    }
    return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  // mengambil daftar kategori untuk pilihan dropdown form
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
      if (initialData.imageUrl) {
        setImagePreview(getImageUrl(initialData.imageUrl));
      } else {
        setImagePreview(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    initialData?.name,
    initialData?.price,
    initialData?.stock,
    initialData?.categoryId,
    initialData?.description,
    initialData?.imageUrl,
  ]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setValidationError("File yang dipilih harus berupa gambar (JPG, PNG, WEBP, GIF).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setValidationError("Ukuran file foto maksimal 5MB.");
      return;
    }

    setValidationError("");
    setImageFile(file);
    setRemoveImage(false);

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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

    // Menggunakan FormData untuk support upload file foto produk
    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("price", Number(price));
    formData.append("stock", Math.max(0, parseInt(stock, 10) || 0));
    if (categoryId) {
      formData.append("categoryId", Number(categoryId));
    }
    if (description.trim()) {
      formData.append("description", description.trim());
    }

    if (imageFile) {
      formData.append("image", imageFile);
    } else if (removeImage) {
      formData.append("imageUrl", "");
    }

    onSubmit(formData);
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
        <header className="card-header p-4 is-flex is-align-items-center" style={{ gap: "8px", borderBottom: "1px solid var(--border-soft)" }}>
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
          {/* UPLOAD FOTO PRODUK */}
          <div
            className="mb-5 p-4"
            style={{
              backgroundColor: "rgba(176, 141, 87, 0.05)",
              borderRadius: "12px",
              border: "1px dashed var(--border-soft)",
            }}
          >
            <label className="label is-size-7 has-text-grey is-uppercase mb-3">
              Foto Produk (Opsional)
            </label>
            <div className="is-flex is-align-items-center is-flex-wrap-wrap" style={{ gap: "1.25rem" }}>
              {/* Preview Foto Produk */}
              <div
                style={{
                  width: "90px",
                  height: "90px",
                  borderRadius: "10px",
                  backgroundColor: "var(--cream-bg)",
                  border: "2px solid var(--gold-accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  boxShadow: "var(--shadow-subtle)",
                  flexShrink: 0,
                }}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview Produk"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <Package size={36} color="var(--ink-soft)" />
                )}
              </div>

              {/* Upload Controls */}
              <div className="is-flex is-flex-direction-column" style={{ gap: "0.5rem" }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  style={{ display: "none" }}
                  disabled={loading}
                />
                <div className="is-flex is-align-items-center" style={{ gap: "0.5rem" }}>
                  <Button
                    type="button"
                    variant="light"
                    size="small"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                  >
                    <span className="is-flex is-align-items-center" style={{ gap: "6px" }}>
                      <Upload size={14} />
                      <span>{imagePreview ? "Ganti Foto Produk" : "Pilih Foto Produk"}</span>
                    </span>
                  </Button>

                  {imagePreview && (
                    <Button
                      type="button"
                      variant="danger"
                      isOutlined={true}
                      size="small"
                      onClick={handleRemoveImage}
                      disabled={loading}
                      title="Hapus foto produk"
                    >
                      <span className="is-flex is-align-items-center" style={{ gap: "4px" }}>
                        <Trash2 size={13} />
                        <span>Hapus</span>
                      </span>
                    </Button>
                  )}
                </div>
                <span className="is-size-7 has-text-grey">
                  Format gambar: JPG, PNG, WEBP, atau GIF (Maksimal 5MB).
                </span>
              </div>
            </div>
          </div>

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
              style={{
                borderColor: "var(--border-soft)",
                borderRadius: "8px",
                fontSize: "0.9rem",
              }}
            />
          </FormField>

          <hr className="my-4" style={{ backgroundColor: "var(--border-soft)" }} />

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
