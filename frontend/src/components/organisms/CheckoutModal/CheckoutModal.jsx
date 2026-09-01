import React, { useState, useEffect } from "react";
import {
  CreditCard,
  MapPin,
  User,
  Plus,
  CheckCircle2,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  X,
} from "lucide-react";
import { useCart } from "../../../context/CartContext";
import { userService, addressService, productService } from "../../../services";
import Modal from "../../molecules/Modal/Modal";
import Notification from "../../molecules/Notification/Notification";
import Button from "../../atoms/Button/Button";
import FormField from "../../molecules/FormField/FormField";
import Input from "../../atoms/Input/Input";
import Select from "../../atoms/Select/Select";

const ADDRESS_LABEL_OPTIONS = [
  { value: "Rumah", label: "Rumah" },
  { value: "Kantor", label: "Kantor" },
  { value: "Toko", label: "Toko" },
  { value: "Apartemen", label: "Apartemen" },
  { value: "Lainnya", label: "Lainnya" },
];

// komponen modal checkout: menangani alur transaksi pembeli, pemilihan pengguna & alamat, dan pembuatan pesanan
const CheckoutModal = () => {
  const {
    items,
    totalPrice,
    isCheckoutOpen,
    closeCheckout,
    clearCart,
  } = useCart();

  // state pengguna & alamat
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [userAddresses, setUserAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState("");

  // state untuk form penambahan alamat baru langsung saat modal checkout aktif
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "Rumah",
    street: "",
    city: "",
    province: "",
    postalCode: "",
  });
  const [savingAddress, setSavingAddress] = useState(false);

  // state proses transaksi checkout & invoice/receipt
  const [notes, setNotes] = useState("");
  const [processingOrder, setProcessingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [orderReceipt, setOrderReceipt] = useState(null);

  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  // mengambil daftar pengguna terdaftar ketika modal checkout dibuka
  useEffect(() => {
    if (isCheckoutOpen) {
      const loadUsers = async () => {
        try {
          setLoadingUsers(true);
          const res = await userService.getUsers({ limit: 100 });
          const userList = res.data?.data || res.data || [];
          setUsers(userList);
          if (userList.length > 0) {
            setSelectedUserId((prev) => prev || String(userList[0].id));
          }
        } catch (e) {
          console.error("Gagal memuat pengguna:", e);
        } finally {
          setLoadingUsers(false);
        }
      };
      loadUsers();
    }
  }, [isCheckoutOpen]);

  // mengambil daftar alamat yang dimiliki oleh user yang dipilih (selectedUserId)
  useEffect(() => {
    if (selectedUserId) {
      const loadAddresses = async () => {
        try {
          setLoadingAddresses(true);
          const res = await addressService.getAddresses(selectedUserId);
          const addrs = res.data || [];
          setUserAddresses(addrs);

          // pilih alamat utama (isPrimary) sebagai default jika tersedia
          const primary = addrs.find((a) => a.isPrimary) || addrs[0];
          if (primary) {
            setSelectedAddressId(String(primary.id));
          } else {
            setSelectedAddressId("");
          }
        } catch (e) {
          console.error("Gagal memuat alamat user:", e);
        } finally {
          setLoadingAddresses(false);
        }
      };
      loadAddresses();
    } else {
      setUserAddresses([]);
      setSelectedAddressId("");
    }
  }, [selectedUserId]);

  // menambahkan alamat baru secara langsung di dalam modal checkout
  const handleSaveNewAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.street.trim() || !newAddress.city.trim() || !newAddress.province.trim()) {
      setCheckoutError("Lengkapi data jalan, kota, dan provinsi alamat baru.");
      return;
    }

    try {
      setSavingAddress(true);
      setCheckoutError("");
      const res = await addressService.createAddress({
        userId: Number(selectedUserId),
        ...newAddress,
        isPrimary: userAddresses.length === 0,
      });

      const created = res.data?.data || res.data;
      setUserAddresses((prev) => [created, ...prev]);
      setSelectedAddressId(String(created.id));
      setIsAddingAddress(false);
      setNewAddress({ label: "Rumah", street: "", city: "", province: "", postalCode: "" });
    } catch (err) {
      console.error("Gagal menambah alamat:", err);
      setCheckoutError(err.message || "Gagal menyimpan alamat baru.");
    } finally {
      setSavingAddress(false);
    }
  };

  // memproses checkout pesanan: kirim payload userId, addressId, dan daftar item ke backend API
  const handleProcessCheckout = async () => {
    if (!selectedUserId) {
      setCheckoutError("Pilih akun pengguna yang memesan.");
      return;
    }

    if (!selectedAddressId) {
      setCheckoutError("Pilih alamat pengiriman yang tersedia atau tambahkan alamat baru.");
      return;
    }

    if (items.length === 0) {
      setCheckoutError("Keranjang belanja kosong.");
      return;
    }

    try {
      setProcessingOrder(true);
      setCheckoutError("");

      const payload = {
        userId: Number(selectedUserId),
        addressId: Number(selectedAddressId),
        items: items.map((i) => ({
          productId: i.id,
          quantity: i.quantity,
        })),
        notes: notes.trim(),
      };

      const res = await productService.checkoutOrder(payload);
      const receiptData = res.data?.data || res.data;

      // tampilkan invoice pesanan dan kosongkan isi keranjang belanja
      setOrderReceipt(receiptData);
      clearCart();
    } catch (err) {
      console.error("Gagal melakukan checkout:", err);
      setCheckoutError(err.message || "Gagal memproses transaksi checkout.");
    } finally {
      setProcessingOrder(false);
    }
  };

  const handleCloseAll = () => {
    setOrderReceipt(null);
    setIsAddingAddress(false);
    setCheckoutError("");
    closeCheckout();
  };

  if (!isCheckoutOpen) return null;

  const selectedUserObj = users.find((u) => String(u.id) === String(selectedUserId));

  // Tampilan Invoice / Struk Pesanan Berhasil
  if (orderReceipt) {
    return (
      <Modal
        isActive={true}
        onClose={handleCloseAll}
        title="Konfirmasi Pesanan Berhasil"
        size="medium"
        footer={
          <div
            className="is-flex is-justify-content-between is-align-items-center"
            style={{ width: "100%" }}
          >
            <span className="is-size-7 has-text-grey">
              Status: <span className="has-text-success has-text-weight-bold">Pesanan Diterima</span>
            </span>
            <Button variant="primary" onClick={handleCloseAll}>
              <span className="is-flex is-align-items-center" style={{ gap: "6px" }}>
                <span>Selesai & Lanjut Belanja</span>
                <ArrowRight size={14} />
              </span>
            </Button>
          </div>
        }
      >
        <div className="py-2">
          {/* Success Banner */}
          <div className="has-text-centered mb-4">
            <div
              className="is-inline-flex is-align-items-center is-justify-content-center mb-2"
              style={{
                width: "58px",
                height: "58px",
                borderRadius: "50%",
                backgroundColor: "rgba(72, 199, 142, 0.15)",
                color: "#48c78e",
              }}
            >
              <CheckCircle2 size={32} />
            </div>
            <h3
              className="title is-5 mb-1"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "1.4rem",
                fontWeight: "700",
                color: "var(--ink)",
              }}
            >
              Pesanan Berhasil Dibuat!
            </h3>
            <p className="is-size-7 has-text-grey mb-2">
              Terima kasih telah berbelanja di Atelier Katalog.
            </p>
            <div
              className="is-inline-block px-3 py-1"
              style={{
                backgroundColor: "var(--cream-bg)",
                borderRadius: "20px",
                border: "1px solid var(--border-soft)",
                fontSize: "0.78rem",
              }}
            >
              <span className="has-text-grey">No. Transaksi: </span>
              <strong style={{ color: "var(--gold-dark)", fontFamily: "monospace" }}>
                {orderReceipt.orderId}
              </strong>
            </div>
          </div>

          {/* Struk Rincian Pesanan Card */}
          <div
            className="p-4 mb-2"
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              border: "1px solid var(--border-soft)",
              boxShadow: "var(--shadow-subtle)",
              fontSize: "0.85rem",
            }}
          >
            {/* Info Pemesan & Alamat */}
            <div className="columns is-multiline is-mobile mb-2">
              <div className="column is-6-tablet is-12-mobile">
                <span className="is-size-7 has-text-grey is-block mb-1">
                  👤 Pemesan:
                </span>
                <strong className="is-block has-text-dark" style={{ fontSize: "0.85rem" }}>
                  {orderReceipt.customer?.name}
                </strong>
                <span className="is-size-7 has-text-grey">
                  {orderReceipt.customer?.email}
                </span>
              </div>
              <div className="column is-6-tablet is-12-mobile">
                <span className="is-size-7 has-text-grey is-block mb-1">
                  📍 Alamat Pengiriman:
                </span>
                <span className="tag is-small is-light mb-1" style={{ fontSize: "0.68rem" }}>
                  {orderReceipt.shippingAddress?.label || "Alamat"}
                </span>
                <p className="is-size-7 mb-0 has-text-grey-dark" style={{ lineHeight: "1.3" }}>
                  {orderReceipt.shippingAddress?.street}, {orderReceipt.shippingAddress?.city},{" "}
                  {orderReceipt.shippingAddress?.province}{" "}
                  {orderReceipt.shippingAddress?.postalCode ? `(${orderReceipt.shippingAddress?.postalCode})` : ""}
                </p>
              </div>
            </div>

            <hr className="my-3" style={{ backgroundColor: "var(--border-soft)" }} />

            {/* Rincian Produk */}
            <div className="mb-3">
              <span className="is-size-7 has-text-weight-bold has-text-grey-dark is-block mb-2">
                Rincian Produk
              </span>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.4rem",
                }}
              >
                {orderReceipt.items?.map((it, idx) => (
                  <div
                    key={idx}
                    className="is-flex is-justify-content-between is-align-items-center is-size-7 py-1"
                    style={{ borderBottom: "1px dashed var(--border-soft)" }}
                  >
                    <div>
                      <span className="has-text-weight-medium has-text-dark">
                        {it.name}
                      </span>
                      <span className="has-text-grey ml-1">x{it.quantity}</span>
                    </div>
                    <span className="has-text-weight-semibold">
                      {formatRupiah(it.total || it.price * it.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <hr className="my-2" style={{ backgroundColor: "var(--border-soft)" }} />

            {/* Total Bayar */}
            <div className="is-flex is-justify-content-between is-align-items-center pt-1">
              <span className="has-text-weight-bold" style={{ fontSize: "0.9rem" }}>
                Total Bayar:
              </span>
              <span
                className="has-text-weight-bold is-size-5"
                style={{ color: "var(--gold-dark)" }}
              >
                {formatRupiah(orderReceipt.grandTotal)}
              </span>
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isActive={true}
      onClose={handleCloseAll}
      title="Checkout Pesanan & Pengiriman"
      size="large"
      footer={
        <div
          className="is-flex is-justify-content-space-between is-justify-content-between is-align-items-center is-flex-wrap-wrap"
          style={{ width: "100%", gap: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <div>
            <span className="is-size-7 has-text-grey is-block">Total Pembayaran:</span>
            <span
              className="title is-6 mb-0 has-text-weight-bold"
              style={{ color: "var(--gold-dark)", fontSize: "1.1rem" }}
            >
              {formatRupiah(totalPrice)}
            </span>
          </div>

          <div className="buttons mb-0">
            <Button variant="light" onClick={handleCloseAll} disabled={processingOrder}>
              Batal
            </Button>
            <Button
              variant="primary"
              onClick={handleProcessCheckout}
              isLoading={processingOrder}
              disabled={processingOrder || items.length === 0 || !selectedAddressId}
            >
              <span className="is-flex is-align-items-center" style={{ gap: "6px" }}>
                <CreditCard size={15} />
                <span>Konfirmasi & Buat Pesanan</span>
              </span>
            </Button>
          </div>
        </div>
      }
    >
      {checkoutError && (
        <Notification type="danger" onClose={() => setCheckoutError("")} className="mb-4">
          {checkoutError}
        </Notification>
      )}

      <div className="columns is-multiline">
        {/* KOLOM KIRI: FORM CHECKOUT (USER, ALAMAT & CATATAN) */}
        <div className="column is-7-tablet is-12-mobile">
          {/* STEP 1: PILIH AKUN PEMESAN */}
          <div
            className="p-4 mb-4"
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              border: "1px solid var(--border-soft)",
              boxShadow: "var(--shadow-subtle)",
            }}
          >
            <div className="is-flex is-align-items-center mb-3" style={{ gap: "8px" }}>
              <span
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  backgroundColor: "var(--gold-accent)",
                  color: "#ffffff",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                1
              </span>
              <span className="has-text-weight-bold is-size-7 has-text-dark is-uppercase" style={{ letterSpacing: "0.5px" }}>
                Pilih Akun Pemesan
              </span>
            </div>

            <Select
              isFullwidth={true}
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              disabled={loadingUsers || processingOrder}
              options={
                loadingUsers
                  ? [{ value: "", label: "Memuat daftar pengguna..." }]
                  : [
                    { value: "", label: "-- Pilih Akun Pengguna --" },
                    ...users.map((u) => ({
                      value: String(u.id),
                      label: `${u.name} (${u.email})`,
                    })),
                  ]
              }
            />

            {selectedUserObj && (
              <div
                className="mt-2 p-2 is-flex is-align-items-center"
                style={{
                  backgroundColor: "var(--cream-bg)",
                  borderRadius: "8px",
                  gap: "8px",
                  fontSize: "0.78rem",
                }}
              >
                <User size={14} color="var(--gold-dark)" />
                <span className="has-text-grey-dark">
                  Pesanan akan didaftarkan atas nama <strong>{selectedUserObj.name}</strong> ({selectedUserObj.email})
                </span>
              </div>
            )}
          </div>

          {/* STEP 2: PILIH ALAMAT PENGIRIMAN */}
          <div
            className="p-4 mb-4"
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              border: "1px solid var(--border-soft)",
              boxShadow: "var(--shadow-subtle)",
            }}
          >
            <div className="is-flex is-justify-content-between is-align-items-center mb-3">
              <div className="is-flex is-align-items-center" style={{ gap: "8px" }}>
                <span
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    backgroundColor: "var(--gold-accent)",
                    color: "#ffffff",
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  2
                </span>
                <span className="has-text-weight-bold is-size-7 has-text-dark is-uppercase" style={{ letterSpacing: "0.5px" }}>
                  Alamat Pengiriman
                </span>
              </div>

              {!isAddingAddress && selectedUserId && (
                <button
                  type="button"
                  className="button is-small is-ghost p-0 has-text-weight-semibold"
                  onClick={() => setIsAddingAddress(true)}
                  style={{ fontSize: "0.78rem", color: "var(--gold-dark)" }}
                >
                  <Plus size={13} className="mr-1" />
                  Alamat Baru
                </button>
              )}
            </div>

            {loadingAddresses ? (
              <div className="p-4 has-text-centered">
                <div className="loader is-inline-block mr-2" />
                <span className="is-size-7 has-text-grey">Memuat daftar alamat pengguna...</span>
              </div>
            ) : isAddingAddress ? (
              /* FORM TAMBAH ALAMAT CEPAT */
              <div
                className="p-3 mb-2"
                style={{
                  backgroundColor: "rgba(176, 141, 87, 0.05)",
                  borderRadius: "10px",
                  border: "1px solid var(--gold-accent)",
                }}
              >
                <div className="is-flex is-justify-content-between is-align-items-center mb-3 pb-2" style={{ borderBottom: "1px solid var(--border-soft)" }}>
                  <div className="is-flex is-align-items-center" style={{ gap: "6px" }}>
                    <MapPin size={14} color="var(--gold-dark)" />
                    <strong className="is-size-7 has-text-dark">Form Alamat Baru</strong>
                  </div>
                  <button
                    type="button"
                    className="button is-small is-ghost p-1"
                    onClick={() => setIsAddingAddress(false)}
                    style={{ height: "auto", color: "var(--ink-soft)" }}
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="columns is-multiline is-mobile">
                  <div className="column is-6-tablet is-12-mobile">
                    <FormField label="Label Alamat">
                      <Select
                        options={ADDRESS_LABEL_OPTIONS}
                        value={newAddress.label}
                        onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                        disabled={savingAddress}
                      />
                    </FormField>
                  </div>
                  <div className="column is-6-tablet is-12-mobile">
                    <FormField label="Kode Pos">
                      <Input
                        type="text"
                        placeholder="Contoh: 10110"
                        value={newAddress.postalCode}
                        onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                        disabled={savingAddress}
                      />
                    </FormField>
                  </div>
                  <div className="column is-12">
                    <FormField label="Alamat Lengkap / Jalan" required>
                      <Input
                        type="text"
                        placeholder="Nama jalan, nomor rumah, RT/RW..."
                        value={newAddress.street}
                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                        disabled={savingAddress}
                        required
                      />
                    </FormField>
                  </div>
                  <div className="column is-6-tablet is-12-mobile">
                    <FormField label="Kota / Kabupaten" required>
                      <Input
                        type="text"
                        placeholder="Contoh: Jakarta Pusat"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        disabled={savingAddress}
                        required
                      />
                    </FormField>
                  </div>
                  <div className="column is-6-tablet is-12-mobile">
                    <FormField label="Provinsi" required>
                      <Input
                        type="text"
                        placeholder="Contoh: DKI Jakarta"
                        value={newAddress.province}
                        onChange={(e) => setNewAddress({ ...newAddress, province: e.target.value })}
                        disabled={savingAddress}
                        required
                      />
                    </FormField>
                  </div>
                </div>

                <div className="is-flex is-justify-content-flex-end mt-2" style={{ gap: "0.5rem" }}>
                  <Button
                    type="button"
                    variant="light"
                    size="small"
                    onClick={() => setIsAddingAddress(false)}
                    disabled={savingAddress}
                  >
                    Batal
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="small"
                    onClick={handleSaveNewAddress}
                    isLoading={savingAddress}
                  >
                    Simpan Alamat
                  </Button>
                </div>
              </div>
            ) : userAddresses.length === 0 ? (
              <div
                className="p-4 has-text-centered"
                style={{
                  backgroundColor: "var(--cream-bg)",
                  borderRadius: "10px",
                  border: "1px dashed var(--border-soft)",
                }}
              >
                <p className="is-size-7 has-text-grey mb-3">
                  Akun pengguna ini belum memiliki data alamat tersimpan.
                </p>
                <Button
                  type="button"
                  variant="primary"
                  size="small"
                  onClick={() => setIsAddingAddress(true)}
                >
                  <Plus size={13} className="mr-1" />
                  Tambah Alamat Sekarang
                </Button>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.6rem",
                }}
              >
                {userAddresses.map((addr) => {
                  const isSelected = String(addr.id) === String(selectedAddressId);
                  return (
                    <label
                      key={addr.id}
                      className="p-3 is-flex is-align-items-flex-start is-clickable"
                      style={{
                        backgroundColor: isSelected ? "rgba(176, 141, 87, 0.08)" : "#ffffff",
                        border: `1.5px solid ${isSelected ? "var(--gold-accent)" : "var(--border-soft)"
                          }`,
                        borderRadius: "10px",
                        gap: "10px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <input
                        type="radio"
                        name="checkoutAddress"
                        value={String(addr.id)}
                        checked={isSelected}
                        onChange={() => setSelectedAddressId(String(addr.id))}
                        className="mt-1"
                        style={{ accentColor: "var(--gold-accent)" }}
                      />
                      <div style={{ flex: 1 }}>
                        <div className="is-flex is-align-items-center mb-1" style={{ gap: "6px" }}>
                          <span
                            className="tag is-small"
                            style={{
                              backgroundColor: isSelected ? "var(--gold-accent)" : "var(--cream-bg)",
                              color: isSelected ? "#ffffff" : "var(--ink)",
                              fontWeight: "600",
                              fontSize: "0.68rem",
                            }}
                          >
                            {addr.label || "Alamat"}
                          </span>
                          {addr.isPrimary && (
                            <span
                              className="tag is-small is-warning is-light"
                              style={{ fontSize: "0.65rem", fontWeight: "600" }}
                            >
                              Utama
                            </span>
                          )}
                        </div>
                        <p className="is-size-7 mb-0 has-text-weight-medium has-text-dark">
                          {addr.street}
                        </p>
                        <p className="is-size-7 mb-0 has-text-grey" style={{ fontSize: "0.75rem" }}>
                          {addr.city}, {addr.province} {addr.postalCode ? `(${addr.postalCode})` : ""}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* STEP 3: CATATAN PENGIRIMAN */}
          <div
            className="p-4"
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              border: "1px solid var(--border-soft)",
              boxShadow: "var(--shadow-subtle)",
            }}
          >
            <div className="is-flex is-align-items-center mb-2" style={{ gap: "8px" }}>
              <span
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  backgroundColor: "var(--gold-accent)",
                  color: "#ffffff",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                3
              </span>
              <span className="has-text-weight-bold is-size-7 has-text-dark is-uppercase" style={{ letterSpacing: "0.5px" }}>
                Catatan Pengiriman (Opsional)
              </span>
            </div>
            <textarea
              className="textarea"
              rows={2}
              placeholder="Contoh: Titipkan ke resepsionis atau hubungi sebelum antar..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={processingOrder}
              style={{
                borderColor: "var(--border-soft)",
                borderRadius: "8px",
                fontSize: "0.82rem",
                boxShadow: "none",
              }}
            />
          </div>
        </div>

        {/* KOLOM KANAN: RINGKASAN KERANJANG */}
        <div className="column is-5-tablet is-12-mobile">
          <div
            className="p-4"
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "14px",
              border: "1px solid var(--border-soft)",
              boxShadow: "var(--shadow-subtle)",
              position: "sticky",
              top: 0,
            }}
          >
            {/* Header Ringkasan */}
            <div
              className="is-flex is-justify-content-between is-align-items-center mb-3 pb-2"
              style={{ borderBottom: "1px solid var(--border-soft)" }}
            >
              <div className="is-flex is-align-items-center" style={{ gap: "8px" }}>
                <ShoppingBag size={18} color="var(--gold-dark)" />
                <h4
                  className="title is-6 mb-0"
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: "1.15rem",
                    fontWeight: "700",
                    color: "var(--ink)",
                  }}
                >
                  Ringkasan Belanja
                </h4>
              </div>
              <span
                className="tag is-small is-rounded"
                style={{
                  backgroundColor: "var(--cream-bg)",
                  color: "var(--ink-soft)",
                  fontWeight: "600",
                  fontSize: "0.72rem",
                }}
              >
                {items.length} Produk
              </span>
            </div>

            {/* List Item Keranjang */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                marginBottom: "1rem",
              }}
            >
              {items.map((item) => (
                <div
                  key={item.id}
                  className="is-flex is-justify-content-between is-align-items-center is-size-7 py-2"
                  style={{ borderBottom: "1px dashed var(--border-soft)" }}
                >
                  <div style={{ maxWidth: "65%" }}>
                    <span className="has-text-weight-semibold has-text-dark is-block text-truncate" title={item.name}>
                      {item.name}
                    </span>
                    <span className="has-text-grey" style={{ fontSize: "0.72rem" }}>
                      {item.quantity} × {formatRupiah(item.price)}
                    </span>
                  </div>
                  <span className="has-text-weight-bold has-text-right" style={{ color: "var(--gold-dark)" }}>
                    {formatRupiah(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Subtotal & Biaya */}
            <div className="is-flex is-justify-content-between is-size-7 mb-2 has-text-grey">
              <span>Subtotal Produk:</span>
              <span className="has-text-weight-semibold has-text-dark">{formatRupiah(totalPrice)}</span>
            </div>

            <div className="is-flex is-justify-content-between is-size-7 mb-3 has-text-grey">
              <span>Biaya Pengiriman:</span>
              <span className="tag is-success is-light is-small py-0 px-2 has-text-weight-bold">
                Gratis
              </span>
            </div>

            <hr className="my-2" style={{ backgroundColor: "var(--border-soft)" }} />

            {/* Total Akhir */}
            <div className="is-flex is-justify-content-between is-align-items-center mb-3">
              <span className="has-text-weight-bold" style={{ fontSize: "0.9rem", color: "var(--ink)" }}>
                Total Bayar:
              </span>
              <span
                className="has-text-weight-bold is-size-5"
                style={{ color: "var(--gold-dark)" }}
              >
                {formatRupiah(totalPrice)}
              </span>
            </div>

            {/* Jaminan Trust Badge */}
            <div
              className="p-2 is-flex is-align-items-center"
              style={{
                backgroundColor: "var(--cream-bg)",
                borderRadius: "8px",
                gap: "6px",
                fontSize: "0.72rem",
                color: "var(--ink-soft)",
              }}
            >
              <ShieldCheck size={14} color="var(--gold-dark)" />
              <span>Transaksi aman & pengiriman langsung diproses.</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CheckoutModal;
