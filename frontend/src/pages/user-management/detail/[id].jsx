import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  User,
  Mail,
  Calendar,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  Star,
  ArrowLeft,
  Upload,
  Home,
  Building,
  Store,
  Compass,
} from "lucide-react";
import {
  MainLayout,
  PageHeader,
  Notification,
  Modal,
  Button,
  Tag,
  FormField,
  Input,
  Select,
} from "../../../components";
import { userService, addressService } from "../../../services";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

const ADDRESS_LABEL_OPTIONS = [
  { value: "Rumah", label: "Rumah" },
  { value: "Kantor", label: "Kantor" },
  { value: "Toko", label: "Toko" },
  { value: "Apartemen", label: "Apartemen" },
  { value: "Gudang", label: "Gudang" },
  { value: "Lainnya", label: "Lainnya" },
];

const UserDetailPage = () => {
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, message: "", type: "info" });

  // State untuk modal form alamat (Tambah / Edit)
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    label: "Rumah",
    street: "",
    city: "",
    province: "",
    postalCode: "",
    isPrimary: false,
  });
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressError, setAddressError] = useState("");

  // State untuk modal hapus alamat
  const [deleteAddressModalOpen, setDeleteAddressModalOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [deletingAddressId, setDeletingAddressId] = useState(null);

  // State untuk upload avatar cepat di halaman detail
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef(null);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "User Management", href: "/user-management" },
    { label: user ? user.name : `Pengguna #${id}`, active: true },
  ];

  const getAvatarUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
      return path;
    }
    return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  const showNotification = (message, type = "info") => {
    setNotification({ show: true, message, type });
  };

  const fetchUserDetail = async () => {
    try {
      setLoading(true);
      const response = await userService.getUserById(id);
      setUser(response.data || response);
    } catch (error) {
      console.error("Gagal mengambil data detail user:", error);
      showNotification(
        error.message || "Gagal memuat rincian data pengguna dari server.",
        "danger"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchUserDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Handle upload avatar langsung
  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showNotification("File harus berupa gambar (JPG, PNG, WEBP, GIF)", "danger");
      return;
    }

    try {
      setUploadingAvatar(true);
      await userService.uploadAvatar(id, file);
      showNotification("Foto profil berhasil diperbarui.", "success");
      fetchUserDetail();
    } catch (error) {
      console.error("Gagal mengupload avatar:", error);
      showNotification(error.message || "Gagal mengupload foto profil.", "danger");
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }
    }
  };

  // Open Modal Tambah Alamat
  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({
      label: "Rumah",
      street: "",
      city: "",
      province: "",
      postalCode: "",
      isPrimary: (user?.addresses?.length || 0) === 0, // Otomatis utama jika alamat pertama
    });
    setAddressError("");
    setAddressModalOpen(true);
  };

  // Open Modal Edit Alamat
  const handleOpenEditAddress = (addr) => {
    setEditingAddress(addr);
    setAddressForm({
      label: addr.label || "Rumah",
      street: addr.street || "",
      city: addr.city || "",
      province: addr.province || "",
      postalCode: addr.postalCode || "",
      isPrimary: Boolean(addr.isPrimary),
    });
    setAddressError("");
    setAddressModalOpen(true);
  };

  // Submit Simpan Alamat (Tambah / Edit)
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addressForm.street.trim()) {
      setAddressError("Alamat jalan wajib diisi.");
      return;
    }
    if (!addressForm.city.trim()) {
      setAddressError("Kota / Kabupaten wajib diisi.");
      return;
    }
    if (!addressForm.province.trim()) {
      setAddressError("Provinsi wajib diisi.");
      return;
    }

    try {
      setAddressSaving(true);
      setAddressError("");

      if (editingAddress) {
        // Update alamat
        await addressService.updateAddress(editingAddress.id, addressForm);
        showNotification("Data alamat berhasil diperbarui.", "success");
      } else {
        // Tambah alamat baru
        await addressService.createAddress({
          userId: id,
          ...addressForm,
        });
        showNotification("Alamat baru berhasil ditambahkan.", "success");
      }

      setAddressModalOpen(false);
      fetchUserDetail();
    } catch (error) {
      console.error("Gagal menyimpan alamat:", error);
      setAddressError(error.message || "Gagal menyimpan data alamat.");
    } finally {
      setAddressSaving(false);
    }
  };

  // Set Alamat Sebagai Utama
  const handleSetPrimary = async (addrId) => {
    try {
      await addressService.setPrimaryAddress(addrId);
      showNotification("Alamat berhasil ditetapkan sebagai alamat utama.", "success");
      fetchUserDetail();
    } catch (error) {
      console.error("Gagal mengatur alamat utama:", error);
      showNotification(error.message || "Gagal mengatur alamat utama.", "danger");
    }
  };

  // Open Modal Hapus Alamat
  const handleOpenDeleteAddress = (addr) => {
    setAddressToDelete(addr);
    setDeleteAddressModalOpen(true);
  };

  // Confirm Hapus Alamat
  const handleConfirmDeleteAddress = async () => {
    if (!addressToDelete) return;

    try {
      setDeletingAddressId(addressToDelete.id);
      await addressService.deleteAddress(addressToDelete.id);
      showNotification("Alamat berhasil dihapus.", "success");
      setDeleteAddressModalOpen(false);
      setAddressToDelete(null);
      fetchUserDetail();
    } catch (error) {
      console.error("Gagal menghapus alamat:", error);
      showNotification(error.message || "Gagal menghapus alamat.", "danger");
    } finally {
      setDeletingAddressId(null);
    }
  };

  const getLabelIcon = (label) => {
    switch (label?.toLowerCase()) {
      case "rumah":
        return <Home size={14} />;
      case "kantor":
        return <Building size={14} />;
      case "toko":
        return <Store size={14} />;
      default:
        return <MapPin size={14} />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(dateString));
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <MainLayout breadcrumbs={breadcrumbs}>
        <div className="card-container p-6 has-text-centered">
          <div className="loader is-inline-block mr-2" />
          <span className="has-text-grey">Memuat data rincian pengguna...</span>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout breadcrumbs={breadcrumbs}>
        <div className="card-container p-6 has-text-centered">
          <p className="title is-5 has-text-grey">Pengguna Tidak Ditemukan</p>
          <Button to="/user-management" variant="primary">
            Kembali ke Daftar Pengguna
          </Button>
        </div>
      </MainLayout>
    );
  }

  const addresses = user.addresses || [];

  return (
    <MainLayout breadcrumbs={breadcrumbs}>
      <PageHeader
        title={user.name}
        subtitle="Rincian informasi akun pengguna dan daftar alamat domisili."
        action={
          <div className="buttons are-small">
            <Button to="/user-management" variant="light">
              <span className="is-flex is-align-items-center" style={{ gap: "4px" }}>
                <ArrowLeft size={14} />
                <span>Kembali</span>
              </span>
            </Button>
            <Button to={`/user-management/edit/${user.id}`} variant="secondary">
              <span className="is-flex is-align-items-center" style={{ gap: "4px" }}>
                <Pencil size={14} />
                <span>Edit Data Pengguna</span>
              </span>
            </Button>
          </div>
        }
      />

      {/* NOTIFIKASI */}
      {notification.show && (
        <Notification
          type={notification.type}
          onClose={() => setNotification({ ...notification, show: false })}
          className="mb-4"
        >
          {notification.message}
        </Notification>
      )}

      <div className="columns is-multiline">
        {/* KOLOM KIRI: KARTU PROFIL USER */}
        <div className="column is-4-desktop is-12-tablet">
          <div className="card-container p-0 overflow-hidden mb-4">
            <header
              className="card-header p-4 is-flex is-align-items-center"
              style={{
                background: "linear-gradient(135deg, var(--gold-accent), var(--gold-dark))",
                color: "#ffffff",
              }}
            >
              <User size={20} color="#ffffff" />
              <h2 className="card-header-title p-0 mb-0 has-text-white">Profil Pengguna</h2>
            </header>

            <div className="card-content p-5">
              {/* Foto Profil & Avatar */}
              <div className="is-flex is-flex-direction-column is-align-items-center mb-4 text-center">
                <div
                  style={{
                    width: "110px",
                    height: "110px",
                    borderRadius: "50%",
                    backgroundColor: "var(--cream-bg)",
                    border: "3px solid var(--gold-accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    boxShadow: "var(--shadow-hover)",
                    position: "relative",
                    marginBottom: "1rem",
                  }}
                >
                  {user.avatar ? (
                    <img
                      src={getAvatarUrl(user.avatar)}
                      alt={user.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        backgroundColor: "var(--gold-light)",
                        color: "var(--gold-dark)",
                        fontSize: "2.2rem",
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                </div>

                <h3 className="title is-5 mb-1 has-text-weight-bold">{user.name}</h3>
                <p className="subtitle is-6 has-text-grey mb-3">{user.email}</p>

                {/* Upload Avatar Cepat */}
                <input
                  type="file"
                  ref={avatarInputRef}
                  onChange={handleAvatarFileChange}
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  style={{ display: "none" }}
                  disabled={uploadingAvatar}
                />
                <Button
                  type="button"
                  variant="light"
                  size="small"
                  onClick={() => avatarInputRef.current?.click()}
                  isLoading={uploadingAvatar}
                  disabled={uploadingAvatar}
                >
                  <span className="is-flex is-align-items-center" style={{ gap: "4px" }}>
                    <Upload size={13} />
                    <span>{user.avatar ? "Ganti Foto" : "Upload Foto Profil"}</span>
                  </span>
                </Button>
              </div>

              <hr className="my-4" style={{ backgroundColor: "var(--border-soft)" }} />

              {/* Rincian Atribut Pengguna */}
              <div className="content is-small">
                <div className="is-flex is-align-items-center mb-3" style={{ gap: "10px" }}>
                  <Mail size={16} color="var(--gold-dark)" />
                  <div>
                    <span className="has-text-grey is-size-7 is-block">Email</span>
                    <strong className="has-text-grey-dark">{user.email}</strong>
                  </div>
                </div>

                <div className="is-flex is-align-items-center mb-3" style={{ gap: "10px" }}>
                  <User size={16} color="var(--gold-dark)" />
                  <div>
                    <span className="has-text-grey is-size-7 is-block">Jenis Kelamin</span>
                    <Tag
                      variant={user.gender === "Laki-laki" ? "info" : "danger"}
                      isLight={true}
                      isRounded={true}
                    >
                      {user.gender || "Tidak ditentukan"}
                    </Tag>
                  </div>
                </div>

                <div className="is-flex is-align-items-center mb-3" style={{ gap: "10px" }}>
                  <Calendar size={16} color="var(--gold-dark)" />
                  <div>
                    <span className="has-text-grey is-size-7 is-block">Terdaftar Sejak</span>
                    <span className="has-text-grey-dark">{formatDate(user.createdAt)}</span>
                  </div>
                </div>

                <div className="is-flex is-align-items-center" style={{ gap: "10px" }}>
                  <MapPin size={16} color="var(--gold-dark)" />
                  <div>
                    <span className="has-text-grey is-size-7 is-block">Total Alamat</span>
                    <span className="tag is-primary is-light is-rounded has-text-weight-bold">
                      {addresses.length} Alamat
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: RELASI ENTITY ADDRESSES*/}
        <div className="column is-8-desktop is-12-tablet">
          <div className="card-container p-0 overflow-hidden">
            <header
              className="card-header p-4 is-flex is-justify-content-between is-align-items-center"
              style={{ borderBottom: "1px solid var(--border-soft)" }}
            >
              <div className="is-flex is-align-items-center" style={{ gap: "8px" }}>
                <MapPin size={20} color="var(--gold-dark)" />
                <h2 className="card-header-title p-0 mb-0">Daftar Alamat Pengguna</h2>
              </div>
              <Button variant="primary" size="small" onClick={handleOpenAddAddress}>
                <span className="is-flex is-align-items-center" style={{ gap: "4px" }}>
                  <Plus size={14} />
                  <span>Tambah Alamat</span>
                </span>
              </Button>
            </header>

            <div className="card-content p-5">
              {addresses.length === 0 ? (
                <div className="has-text-centered py-6">
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
                    <Compass size={28} />
                  </div>
                  <p className="title is-6 has-text-grey-dark mb-1">Belum Ada Data Alamat</p>
                  <p
                    className="subtitle is-7 has-text-grey mb-4"
                    style={{ maxWidth: "380px", margin: "0 auto" }}
                  >
                    Pengguna ini belum memiliki data alamat yang tersimpan. Klik tombol di bawah untuk menambahkan alamat pertama.
                  </p>
                  <Button variant="primary" size="small" onClick={handleOpenAddAddress}>
                    <span className="is-flex is-align-items-center" style={{ gap: "4px" }}>
                      <Plus size={14} />
                      <span>Tambah Alamat Pertama</span>
                    </span>
                  </Button>
                </div>
              ) : (
                <div className="is-flex is-flex-direction-column" style={{ gap: "1rem" }}>
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="p-4"
                      style={{
                        backgroundColor: addr.isPrimary ? "rgba(176, 141, 87, 0.07)" : "#ffffff",
                        border: `1px solid ${addr.isPrimary ? "var(--gold-accent)" : "var(--border-soft)"
                          }`,
                        borderRadius: "10px",
                        boxShadow: "var(--shadow-subtle)",
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      }}
                    >
                      <div className="is-flex is-justify-content-between is-align-items-flex-start is-flex-wrap-wrap mb-2" style={{ gap: "0.5rem" }}>
                        <div className="is-flex is-align-items-center" style={{ gap: "8px" }}>
                          <span
                            className="tag is-small is-light"
                            style={{
                              backgroundColor: "var(--cream-bg)",
                              borderColor: "var(--border-soft)",
                              color: "var(--ink)",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              fontWeight: "600",
                            }}
                          >
                            {getLabelIcon(addr.label)}
                            <span>{addr.label || "Alamat"}</span>
                          </span>

                          {addr.isPrimary && (
                            <span
                              className="tag is-small"
                              style={{
                                backgroundColor: "var(--gold-accent)",
                                color: "#ffffff",
                                fontWeight: "600",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "3px",
                              }}
                            >
                              <Star size={11} fill="#ffffff" />
                              <span>Alamat Utama</span>
                            </span>
                          )}
                        </div>

                        {/* Aksi Alamat */}
                        <div className="buttons are-small mb-0">
                          {!addr.isPrimary && (
                            <button
                              type="button"
                              className="button is-small is-ghost p-1 has-text-grey"
                              onClick={() => handleSetPrimary(addr.id)}
                              title="Jadikan Alamat Utama"
                              style={{ fontSize: "0.75rem" }}
                            >
                              <span className="is-flex is-align-items-center" style={{ gap: "3px" }}>
                                <CheckCircle size={13} />
                                <span>Set Utama</span>
                              </span>
                            </button>
                          )}
                          <button
                            type="button"
                            className="button is-small is-light p-2"
                            onClick={() => handleOpenEditAddress(addr)}
                            title="Edit Alamat"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            type="button"
                            className="button is-small is-danger is-outlined p-2"
                            onClick={() => handleOpenDeleteAddress(addr)}
                            title="Hapus Alamat"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Detail Isi Alamat */}
                      <p className="has-text-weight-semibold mb-1" style={{ color: "var(--ink)" }}>
                        {addr.street}
                      </p>
                      <p className="is-size-7 has-text-grey mb-0">
                        {addr.city}, {addr.province}{" "}
                        {addr.postalCode && (
                          <span className="has-text-weight-medium">({addr.postalCode})</span>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL FORM TAMBAH / EDIT ALAMAT */}
      <Modal
        isActive={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        title={editingAddress ? "Edit Data Alamat" : "Tambah Alamat Baru"}
        footer={
          <div className="buttons is-right" style={{ width: "100%" }}>
            <Button
              variant="light"
              onClick={() => setAddressModalOpen(false)}
              disabled={addressSaving}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveAddress}
              isLoading={addressSaving}
              disabled={addressSaving}
            >
              Simpan Alamat
            </Button>
          </div>
        }
      >
        {addressError && (
          <Notification type="danger" onClose={() => setAddressError("")} className="mb-4">
            {addressError}
          </Notification>
        )}

        <form onSubmit={handleSaveAddress}>
          <div className="columns is-multiline">
            <div className="column is-6">
              <FormField label="Label Alamat (Kategori)" required>
                <Select
                  options={ADDRESS_LABEL_OPTIONS}
                  value={addressForm.label}
                  onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                  disabled={addressSaving}
                />
              </FormField>
            </div>

            <div className="column is-6">
              <FormField label="Kode Pos">
                <Input
                  type="text"
                  placeholder="contoh: 12345"
                  value={addressForm.postalCode}
                  onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                  disabled={addressSaving}
                />
              </FormField>
            </div>

            <div className="column is-12">
              <FormField label="Alamat Jalan / Gedung" required>
                <textarea
                  className="textarea"
                  rows={2}
                  placeholder="Jl. Thamrin No. 45, Gedung Menara Lt. 3"
                  value={addressForm.street}
                  onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                  disabled={addressSaving}
                  required
                  style={{
                    borderColor: "var(--border-soft)",
                    borderRadius: "8px",
                    fontSize: "0.9rem",
                  }}
                />
              </FormField>
            </div>

            <div className="column is-6">
              <FormField label="Kota / Kabupaten" required>
                <Input
                  type="text"
                  placeholder="Jakarta Pusat"
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                  disabled={addressSaving}
                  required
                />
              </FormField>
            </div>

            <div className="column is-6">
              <FormField label="Provinsi" required>
                <Input
                  type="text"
                  placeholder="DKI Jakarta"
                  value={addressForm.province}
                  onChange={(e) => setAddressForm({ ...addressForm, province: e.target.value })}
                  disabled={addressSaving}
                  required
                />
              </FormField>
            </div>

            <div className="column is-12">
              <label className="checkbox is-size-7 has-text-weight-semibold" style={{ cursor: "pointer" }}>
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={addressForm.isPrimary}
                  onChange={(e) => setAddressForm({ ...addressForm, isPrimary: e.target.checked })}
                  disabled={addressSaving}
                />
                <span>Jadikan sebagai alamat utama (Primary Address)</span>
              </label>
            </div>
          </div>
        </form>
      </Modal>

      {/* MODAL KONFIRMASI HAPUS ALAMAT */}
      <Modal
        isActive={deleteAddressModalOpen}
        onClose={() => setDeleteAddressModalOpen(false)}
        title="Konfirmasi Hapus Alamat"
        footer={
          <div className="buttons is-right" style={{ width: "100%" }}>
            <Button
              variant="light"
              onClick={() => setDeleteAddressModalOpen(false)}
              disabled={Boolean(deletingAddressId)}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDeleteAddress}
              isLoading={Boolean(deletingAddressId)}
            >
              Ya, Hapus
            </Button>
          </div>
        }
      >
        <div className="content">
          <p className="mb-2">
            Apakah Anda yakin ingin menghapus alamat{" "}
            <strong className="has-text-danger">
              "{addressToDelete?.label}: {addressToDelete?.street}"
            </strong>
            ?
          </p>
          <p className="is-size-7 has-text-grey mb-0">
            Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>
      </Modal>
    </MainLayout>
  );
};

export default UserDetailPage;
