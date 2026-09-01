import React, { useState, useEffect, useRef } from "react";
import { Save, X, User, Upload, Trash2, MapPin } from "lucide-react";
import FormField from "../../molecules/FormField/FormField";
import Notification from "../../molecules/Notification/Notification";
import Input from "../../atoms/Input/Input";
import Select from "../../atoms/Select/Select";
import Button from "../../atoms/Button/Button";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

const GENDER_OPTIONS = [
  { value: "Laki-laki", label: "Laki-laki" },
  { value: "Perempuan", label: "Perempuan" },
];

const ADDRESS_LABEL_OPTIONS = [
  { value: "Rumah", label: "Rumah" },
  { value: "Kantor", label: "Kantor" },
  { value: "Toko", label: "Toko" },
  { value: "Apartemen", label: "Apartemen" },
  { value: "Lainnya", label: "Lainnya" },
];

// komponen formulir pengguna: menangani input data, validasi, preview file avatar, dan opsi alamat awal
const UserForm = ({
  initialData,
  onSubmit,
  onCancel,
  cancelTo = "/user-management",
  submitText = "Simpan Pengguna",
  title = "Form Pengguna",
  headerVariant = "primary",
  loading = false,
  errorMsg = "",
  onCloseError,
  isEdit = false,
}) => {
  // state data profil pengguna (nama, email, jenis kelamin)
  const [name, setName] = useState(initialData?.name || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [gender, setGender] = useState(initialData?.gender || "Laki-laki");

  // state upload file gambar avatar dan preview lokal
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);

  // state opsi input alamat awal saat pembuatan pengguna baru
  const [includeAddress, setIncludeAddress] = useState(false);
  const [addressLabel, setAddressLabel] = useState("Rumah");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const [validationError, setValidationError] = useState("");
  const fileInputRef = useRef(null);

  // helper untuk mendapatkan path avatar lengkap
  const getAvatarUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
      return path;
    }
    return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  // Sinkronisasi initialData
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setEmail(initialData.email || "");
      setGender(initialData.gender || "Laki-laki");
      if (initialData.avatar) {
        setAvatarPreview(getAvatarUrl(initialData.avatar));
      } else {
        setAvatarPreview(null);
      }
    }
  }, [initialData]);

  // Handle upload file gambar
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi tipe file
    if (!file.type.startsWith("image/")) {
      setValidationError("File yang dipilih harus berupa gambar (JPG, PNG, WEBP, GIF).");
      return;
    }

    // Validasi ukuran file (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setValidationError("Ukuran file foto maksimal 5MB.");
      return;
    }

    setValidationError("");
    setAvatarFile(file);
    setRemoveAvatar(false);

    // Preview
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setRemoveAvatar(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setValidationError("Nama lengkap wajib diisi.");
      return;
    }
    if (!email.trim()) {
      setValidationError("Alamat email wajib diisi.");
      return;
    }
    setValidationError("");

    // Menggunakan FormData untuk mengirim file dan data text
    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("email", email.trim());
    formData.append("gender", gender);

    if (avatarFile) {
      formData.append("avatar", avatarFile);
    } else if (removeAvatar) {
      formData.append("avatar", "");
    }

    // Jika alamat awal diisi
    if (!isEdit && includeAddress) {
      if (street.trim() && city.trim() && province.trim()) {
        formData.append("addressLabel", addressLabel);
        formData.append("street", street.trim());
        formData.append("city", city.trim());
        formData.append("province", province.trim());
        if (postalCode.trim()) {
          formData.append("postalCode", postalCode.trim());
        }
      }
    }

    onSubmit(formData);
  };

  const displayedError = validationError || errorMsg;

  return (
    <div className="card-container p-0 overflow-hidden">
      {title && (
        <header
          className="card-header p-4 is-flex is-align-items-center"
          style={{ gap: "8px", borderBottom: "1px solid var(--border-soft)" }}
        >
          <User size={20} color="var(--gold-dark)" />
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
          {/* UPLOAD FOTO PROFIL SECTION */}
          <div className="mb-5 p-4" style={{ backgroundColor: "rgba(176, 141, 87, 0.05)", borderRadius: "12px", border: "1px dashed var(--border-soft)" }}>
            <label className="label is-size-7 has-text-grey is-uppercase mb-3">
              Foto Profil Pengguna (Opsional)
            </label>
            <div className="is-flex is-align-items-center is-flex-wrap-wrap" style={{ gap: "1.25rem" }}>
              {/* Preview Avatar */}
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
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
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Preview Avatar"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <User size={36} color="var(--ink-soft)" />
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
                      <span>{avatarPreview ? "Ganti Foto" : "Pilih Foto Profil"}</span>
                    </span>
                  </Button>

                  {avatarPreview && (
                    <Button
                      type="button"
                      variant="danger"
                      isOutlined={true}
                      size="small"
                      onClick={handleRemoveAvatar}
                      disabled={loading}
                      title="Hapus foto profil"
                    >
                      <span className="is-flex is-align-items-center" style={{ gap: "4px" }}>
                        <Trash2 size={13} />
                        <span>Hapus</span>
                      </span>
                    </Button>
                  )}
                </div>
                <span className="is-size-7 has-text-grey">
                  Format gambar: JPG, PNG, WEBP, atau GIF (Maks. 5MB).
                </span>
              </div>
            </div>
          </div>

          <FormField label="Nama Lengkap" required>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama lengkap..."
              required
              disabled={loading}
            />
          </FormField>

          <FormField label="Alamat Email" required>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contoh: user@mail.com"
              required
              disabled={loading}
            />
          </FormField>

          <FormField label="Jenis Kelamin">
            <Select
              options={GENDER_OPTIONS}
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              disabled={loading}
            />
          </FormField>

          {/* OPSI ALAMAT AWAL SAAT CREATE */}
          {!isEdit && (
            <div className="mt-4 pt-3" style={{ borderTop: "1px solid var(--border-soft)" }}>
              <div className="field mb-3">
                <label className="checkbox is-size-7 has-text-weight-semibold" style={{ cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={includeAddress}
                    onChange={(e) => setIncludeAddress(e.target.checked)}
                    disabled={loading}
                  />
                  <span>+ Sertakan Alamat Domisili Awal (Opsional)</span>
                </label>
              </div>

              {includeAddress && (
                <div
                  className="p-4 mb-3"
                  style={{
                    backgroundColor: "rgba(176, 141, 87, 0.04)",
                    borderRadius: "8px",
                    border: "1px solid var(--border-soft)",
                  }}
                >
                  <div className="is-flex is-align-items-center mb-3" style={{ gap: "6px" }}>
                    <MapPin size={16} color="var(--gold-dark)" />
                    <span className="is-size-7 has-text-weight-bold has-text-grey-dark is-uppercase">
                      Informasi Alamat Awal
                    </span>
                  </div>

                  <div className="columns is-multiline is-mobile">
                    <div className="column is-4-tablet is-12-mobile">
                      <FormField label="Label Alamat">
                        <Select
                          options={ADDRESS_LABEL_OPTIONS}
                          value={addressLabel}
                          onChange={(e) => setAddressLabel(e.target.value)}
                          disabled={loading}
                        />
                      </FormField>
                    </div>

                    <div className="column is-8-tablet is-12-mobile">
                      <FormField label="Alamat Lengkap / Jalan">
                        <Input
                          type="text"
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          placeholder="Jl. Mawar No. 12 RT 01 / RW 02"
                          disabled={loading}
                        />
                      </FormField>
                    </div>

                    <div className="column is-4-tablet is-12-mobile">
                      <FormField label="Kota / Kabupaten">
                        <Input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Jakarta Selatan"
                          disabled={loading}
                        />
                      </FormField>
                    </div>

                    <div className="column is-4-tablet is-12-mobile">
                      <FormField label="Provinsi">
                        <Input
                          type="text"
                          value={province}
                          onChange={(e) => setProvince(e.target.value)}
                          placeholder="DKI Jakarta"
                          disabled={loading}
                        />
                      </FormField>
                    </div>

                    <div className="column is-4-tablet is-12-mobile">
                      <FormField label="Kode Pos">
                        <Input
                          type="text"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          placeholder="12345"
                          disabled={loading}
                        />
                      </FormField>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

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

export default UserForm;
