import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, ShieldCheck } from "lucide-react";
import {
  FormField,
  Input,
  Button,
  Notification,
  AuthLayout
} from "../../../components";
import { authService } from "../../../services";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confPassword, setConfPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  // Redirect jika sudah login
  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setErrorMsg("Semua field wajib diisi.");
      return;
    }

    if (password !== confPassword) {
      setErrorMsg("Password dan Konfirmasi Password tidak cocok.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      const response = await authService.register({
        name: name.trim(),
        email: email.trim(),
        password,
        confPassword,
      });

      setSuccessMsg(
        response.msg || "Registrasi berhasil! Mengalihkan ke halaman login..."
      );

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
    <AuthLayout>
      <div className="card shadow-sm">
        <header className="card-header has-background-primary-light">
          <div className="card-header-title is-centered py-4">
            <div className="has-text-centered">
              <div
                className="is-flex is-align-items-center is-justify-content-center mx-auto mb-2"
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "var(--gold-light)",
                  color: "var(--gold-dark)",
                }}
              >
                <ShieldCheck size={26} />
              </div>
              <h1 className="title is-4 has-text-primary mb-1">
                Registrasi Admin
              </h1>
              <p className="subtitle is-6 has-text-grey">
                Buat akun admin baru untuk mengelola sistem
              </p>
            </div>
          </div>
        </header>

        <div className="card-content py-5">
          {errorMsg && (
            <Notification
              type="danger"
              onClose={() => setErrorMsg("")}
              className="mb-4"
            >
              {errorMsg}
            </Notification>
          )}

          {successMsg && (
            <Notification
              type="success"
              onClose={() => setSuccessMsg("")}
              className="mb-4"
            >
              {successMsg}
            </Notification>
          )}

          <form onSubmit={handleRegister}>
            <FormField label="Nama Lengkap" required>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama lengkap"
                required
                disabled={loading}
              />
            </FormField>

            <FormField label="Email" required>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mail.com"
                required
                disabled={loading}
              />
            </FormField>

            <FormField label="Password" required>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                required
                disabled={loading}
              />
            </FormField>

            <FormField label="Konfirmasi Password" required>
              <Input
                type="password"
                value={confPassword}
                onChange={(e) => setConfPassword(e.target.value)}
                placeholder="Ulangi password"
                required
                disabled={loading}
              />
            </FormField>

            <div className="field mt-5">
              <Button
                type="submit"
                variant="primary"
                isFullwidth={true}
                isLoading={loading}
                disabled={Boolean(successMsg)}
              >
                <span className="is-flex is-size-7 is-align-items-center is-justify-content-center" style={{ gap: "6px" }}>
                  <UserPlus size={14} />
                  <span>Daftar Sebagai Admin</span>
                </span>
              </Button>
            </div>
          </form>
        </div>

        <footer className="card-footer py-3 has-background-white-ter has-text-centered">
          <p className="is-size-7 has-text-grey" style={{ width: "100%" }}>
            Sudah memiliki akun admin?{" "}
            <Link to="/login" className="has-text-success-dark has-text-weight-semibold">
              Masuk di sini
            </Link>
          </p>
        </footer>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
