import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LogIn,
  ShieldCheck,
  Mail,
  Lock,
  ArrowLeft,
  Sparkles,
  Package,
  AlertCircle,
  X,
  Layers,
  HelpCircle,
} from "lucide-react";
import {
  FormField,
  Input,
  AuthLayout,
} from "../../../components";
import { authService } from "../../../services";
import "../auth.css";

// halaman login administrator dengan antarmuka modern split-panel luxury
const LoginPage = () => {
  // state form login (email, password, status request, remember me, dan modal help)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showHelpModal, setShowHelpModal] = useState(false);
  const navigate = useNavigate();

  // redirect ke dashboard jika admin sudah login
  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  // submit form autentikasi login admin
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg("Email dan password wajib diisi.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      // kirim request login ke authService
      await authService.login(email.trim(), password);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login gagal:", error);
      setErrorMsg(
        error.message ||
        "Gagal masuk. Periksa kembali email dan password Anda."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout maxWidth="1040px">
      <div className="auth-split-card">
        {/* PANEL KIRI: HERO SHOWCASE BRANDING */}
        <div className="auth-showcase-panel">
          <div className="auth-showcase-pattern" />

          <div className="auth-showcase-content">
            {/* BRAND LOGO */}
            <Link to="/" className="auth-showcase-brand">
              <div>
                <h2 className="auth-brand-title">ATELIER</h2>
                <span className="auth-brand-tagline">Portal Administrasi</span>
              </div>
            </Link>

            {/* HEADLINE */}
            <h1 className="auth-showcase-heading">
              Kelola Toko & Inventaris dengan Presisi.
            </h1>
            <p className="auth-showcase-subtext">
              Platform terpadu untuk monitoring produk, transaksi katalog, dan manajemen data sistem secara aman dan efisien.
            </p>

            {/* FITUR UNGGULAN */}
            <div className="auth-feature-list">
              <div className="auth-feature-item">
                <div className="auth-feature-icon">
                  <Package size={18} />
                </div>
                <div>
                  <div className="auth-feature-title">Katalog & Stok Real-Time</div>
                  <div className="auth-feature-desc">
                    Sinkronisasi produk, harga, dan kategori tanpa jeda.
                  </div>
                </div>
              </div>

              <div className="auth-feature-item">
                <div className="auth-feature-icon">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div className="auth-feature-title">Keamanan Terenkripsi</div>
                  <div className="auth-feature-desc">
                    Akses terlindungi dengan enkripsi token dan verifikasi sesi.
                  </div>
                </div>
              </div>

              <div className="auth-feature-item">
                <div className="auth-feature-icon">
                  <Layers size={18} />
                </div>
                <div>
                  <div className="auth-feature-title">Manajemen Fleksibel</div>
                  <div className="auth-feature-desc">
                    Kontrol penuh data inventaris dan pengguna di satu tempat.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL KANAN: FORM LOGIN */}
        <div className="auth-form-panel">
          {/* TOP BACK TO SHOP LINK */}
          <div className="auth-top-nav">
            <Link to="/" className="auth-back-link">
              <ArrowLeft size={14} />
              <span>Kembali ke Katalog</span>
            </Link>
          </div>

          {/* FORM HEADER */}
          <div className="auth-form-header">
            <div className="auth-form-badge">
              <ShieldCheck size={13} />
              <span>Akses Khusus Pengelola</span>
            </div>
            <h2 className="auth-form-title">Selamat Datang</h2>
            <p className="auth-form-subtitle">
              Masuk dengan akun administrator untuk mengakses dashboard
            </p>
          </div>

          {/* ERROR ALERT NOTIFICATION */}
          {errorMsg && (
            <div className="auth-alert is-danger" role="alert">
              <AlertCircle size={18} className="auth-alert-icon" />
              <div className="auth-alert-content">{errorMsg}</div>
              <button
                type="button"
                className="auth-alert-close"
                onClick={() => setErrorMsg("")}
                aria-label="Tutup pesan error"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* LOGIN FORM */}
          <form onSubmit={handleLogin} noValidate>
            <FormField label="Email Administrator" required className="mb-3">
              <Input
                type="email"
                id="admin-email"
                name="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@perusahaan.com"
                iconLeft={<Mail size={18} />}
                className="auth-input-field"
                required
                disabled={loading}
              />
            </FormField>

            <FormField label="Kata Sandi" required className="mb-2">
              <Input
                type="password"
                id="admin-password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi"
                iconLeft={<Lock size={18} />}
                className="auth-input-field"
                required
                disabled={loading}
              />
            </FormField>

            {/* OPTIONS BAR: REMEMBER ME & FORGOT PASSWORD */}
            <div className="auth-options-bar">
              <label className="auth-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                <span>Ingat saya</span>
              </label>

              <button
                type="button"
                className="auth-forgot-link"
                onClick={() => setShowHelpModal(true)}
              >
                Lupa kata sandi?
              </button>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loader is-inline-block" style={{ width: "16px", height: "16px", borderWidth: "2px" }} />
                  <span>Memverifikasi Akun...</span>
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Masuk ke Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* FOOTER SWITCH TO REGISTER */}
          <div className="auth-form-footer">
            Belum memiliki akun pengelola?
            <Link to="/register" className="auth-switch-link">
              Daftar di sini
            </Link>
          </div>
        </div>
      </div>

      {/* MODAL BANTUAN LUPA PASSWORD */}
      {showHelpModal && (
        <div className="auth-modal-overlay" onClick={() => setShowHelpModal(false)}>
          <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="is-flex is-justify-content-space-between is-align-items-center mb-3">
              <div className="is-flex is-align-items-center" style={{ gap: "8px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "var(--gold-light)",
                    color: "var(--gold-dark)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <HelpCircle size={20} />
                </div>
                <h3 className="title is-5 mb-0" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                  Pemulihan Akun Admin
                </h3>
              </div>
              <button
                type="button"
                className="delete"
                onClick={() => setShowHelpModal(false)}
                aria-label="Tutup"
              />
            </div>
            <p className="is-size-7 has-text-grey mb-3">
              Demi keamanan sistem internal, reset kata sandi akun administrator dikelola langsung oleh Super Admin atau Database Administrator.
            </p>
            <div
              className="p-3 mb-4"
              style={{
                background: "rgba(176, 141, 87, 0.08)",
                borderRadius: "8px",
                border: "1px solid var(--border-soft)",
                fontSize: "0.82rem",
              }}
            >
              <div className="has-text-weight-semibold mb-1" style={{ color: "var(--gold-dark)" }}>
                Langkah Rekomendasi:
              </div>
              <ul style={{ paddingLeft: "1.2rem", margin: 0, color: "var(--ink)" }}>
                <li>Hubungi Super Administrator instansi Anda.</li>
                <li>Atau lakukan registrasi akun baru untuk pengujian lokal.</li>
              </ul>
            </div>
            <button
              type="button"
              className="button is-primary is-fullwidth btn-luxury"
              onClick={() => setShowHelpModal(false)}
            >
              Mengerti & Kembali
            </button>
          </div>
        </div>
      )}
    </AuthLayout>
  );
};

export default LoginPage;
