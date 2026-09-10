import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserPlus,
  ShieldCheck,
  User,
  Mail,
  Lock,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  X,
  Zap,
  Award,
  Check,
} from "lucide-react";
import {
  FormField,
  Input,
  AuthLayout,
} from "../../../components";
import { authService } from "../../../services";
import "../auth.css";

// halaman registrasi akun administrator dengan antarmuka modern split-panel luxury
const RegisterPage = () => {
  // state form input pendaftaran, konfirmasi password, dan status
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confPassword, setConfPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  // redirect ke dashboard jika admin sudah login
  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  // hitung kekuatan password secara real-time
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: "", classname: "" };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 8 && /[0-9]/.test(password)) score += 1;
    if (password.length >= 8 && /[^A-Za-z0-9]/.test(password) && /[A-Z]/.test(password)) score += 1;

    if (score === 1) return { score: 1, label: "Lemah (min. 6 karakter)", classname: "is-weak" };
    if (score === 2) return { score: 2, label: "Sedang (bagus)", classname: "is-medium" };
    return { score: 3, label: "Kuat & Aman", classname: "is-strong" };
  }, [password]);

  // periksa apakah password dan konfirmasi cocok
  const isMatch = useMemo(() => {
    if (!confPassword) return null;
    return password === confPassword;
  }, [password, confPassword]);

  // submit pendaftaran admin baru
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setErrorMsg("Semua field wajib diisi.");
      return;
    }

    // validasi panjang password
    if (password.length < 6) {
      setErrorMsg("Kata sandi minimal 6 karakter.");
      return;
    }

    // validasi konfirmasi password
    if (password !== confPassword) {
      setErrorMsg("Kata sandi dan Konfirmasi Kata Sandi tidak cocok.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      // kirim data registrasi ke authService
      const response = await authService.register({
        name: name.trim(),
        email: email.trim(),
        password,
        confPassword,
      });

      setSuccessMsg(
        response.msg || "Registrasi berhasil! Mengalihkan ke halaman login..."
      );

      // jeda 1.5 detik sebelum redirect ke login
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error("Registrasi gagal:", error);
      setErrorMsg(
        error.message ||
        "Gagal mendaftarkan admin. Periksa kembali data Anda."
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
              Mulai Kelola Bisnis Anda Hari Ini.
            </h1>
            <p className="auth-showcase-subtext">
              Daftarkan akun administrator baru untuk mendapatkan akses penuh ke manajemen katalog, inventaris produk premium, dan pengaturan sistem.
            </p>

            {/* FITUR UNGGULAN */}
            <div className="auth-feature-list">
              <div className="auth-feature-item">
                <div className="auth-feature-icon">
                  <Award size={18} />
                </div>
                <div>
                  <div className="auth-feature-title">Akses Penuh Manajemen</div>
                  <div className="auth-feature-desc">
                    Tambah, ubah, dan pantau produk & kategori seketika.
                  </div>
                </div>
              </div>

              <div className="auth-feature-item">
                <div className="auth-feature-icon">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div className="auth-feature-title">Standar Keamanan Tinggi</div>
                  <div className="auth-feature-desc">
                    Data akun diamankan dengan hashing kata sandi modern.
                  </div>
                </div>
              </div>

              <div className="auth-feature-item">
                <div className="auth-feature-icon">
                  <Zap size={18} />
                </div>
                <div>
                  <div className="auth-feature-title">Sinkronisasi Kilat</div>
                  <div className="auth-feature-desc">
                    Perubahan langsung tercermin pada katalog toko secara live.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL KANAN: FORM REGISTRASI */}
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
              <UserPlus size={13} />
              <span>Registrasi Pengelola Baru</span>
            </div>
            <h2 className="auth-form-title">Buat Akun Admin</h2>
            <p className="auth-form-subtitle">
              Lengkapi data di bawah ini untuk membuat hak akses administrator
            </p>
          </div>

          {/* NOTIFICATION MESSAGES */}
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

          {successMsg && (
            <div className="auth-alert is-success" role="status">
              <CheckCircle2 size={18} className="auth-alert-icon" />
              <div className="auth-alert-content">{successMsg}</div>
            </div>
          )}

          {/* FORM PENDAFTARAN */}
          <form onSubmit={handleRegister} noValidate>
            <FormField label="Nama Lengkap" required className="mb-2">
              <Input
                type="text"
                id="admin-name"
                name="name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Sarah Jenkins"
                iconLeft={<User size={18} />}
                className="auth-input-field"
                required
                disabled={loading || Boolean(successMsg)}
              />
            </FormField>

            <FormField label="Alamat Email" required className="mb-2">
              <Input
                type="email"
                id="admin-register-email"
                name="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@perusahaan.com"
                iconLeft={<Mail size={18} />}
                className="auth-input-field"
                required
                disabled={loading || Boolean(successMsg)}
              />
            </FormField>

            <FormField label="Kata Sandi" required className="mb-1">
              <Input
                type="password"
                id="admin-register-password"
                name="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                iconLeft={<Lock size={18} />}
                className="auth-input-field"
                required
                disabled={loading || Boolean(successMsg)}
              />
            </FormField>

            {/* LIVE PASSWORD STRENGTH METER */}
            {password && (
              <div className="auth-strength-container">
                <div className="auth-strength-bars">
                  <div
                    className={`auth-strength-segment ${passwordStrength.score >= 1 ? passwordStrength.classname : ""
                      }`}
                  />
                  <div
                    className={`auth-strength-segment ${passwordStrength.score >= 2 ? passwordStrength.classname : ""
                      }`}
                  />
                  <div
                    className={`auth-strength-segment ${passwordStrength.score >= 3 ? passwordStrength.classname : ""
                      }`}
                  />
                </div>
                <div className="auth-strength-text">
                  <span>Kekuatan Kata Sandi:</span>
                  <strong style={{ textTransform: "capitalize" }}>
                    {passwordStrength.label}
                  </strong>
                </div>
              </div>
            )}

            <FormField label="Konfirmasi Kata Sandi" required className="mb-3 mt-2">
              <Input
                type="password"
                id="admin-confirm-password"
                name="confPassword"
                autoComplete="new-password"
                value={confPassword}
                onChange={(e) => setConfPassword(e.target.value)}
                placeholder="Ulangi kata sandi di atas"
                iconLeft={<KeyRound size={18} />}
                className="auth-input-field"
                required
                disabled={loading || Boolean(successMsg)}
              />

              {/* MATCH INDICATOR FEEDBACK */}
              {confPassword && (
                <div
                  className={`auth-match-indicator ${isMatch ? "is-match" : "is-mismatch"
                    }`}
                >
                  {isMatch ? (
                    <>
                      <Check size={14} />
                      <span>Kata sandi cocok</span>
                    </>
                  ) : (
                    <>
                      <X size={14} />
                      <span>Kata sandi belum cocok</span>
                    </>
                  )}
                </div>
              )}
            </FormField>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              className="auth-submit-btn mt-3"
              disabled={loading || Boolean(successMsg)}
            >
              {loading ? (
                <>
                  <span className="loader is-inline-block" style={{ width: "16px", height: "16px", borderWidth: "2px" }} />
                  <span>Mendaftarkan Akun...</span>
                </>
              ) : successMsg ? (
                <>
                  <CheckCircle2 size={18} />
                  <span>Registrasi Berhasil!</span>
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>Daftar Sebagai Admin</span>
                </>
              )}
            </button>
          </form>

          {/* FOOTER SWITCH TO LOGIN */}
          <div className="auth-form-footer">
            Sudah memiliki akun pengelola?
            <Link to="/login" className="auth-switch-link">
              Masuk di sini
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
