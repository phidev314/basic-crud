import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, ShieldCheck } from "lucide-react";
import {
  FormField,
  Input,
  Button,
  Notification,
  AuthLayout
} from "../../../components";
import { authService } from "../../../services";

// halaman login administrator
const LoginPage = () => {
  // state form login (email, password, dan status request)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
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
    <AuthLayout>
      <div className="card shadow-sm" style={{ borderRadius: "16px", overflow: "hidden" }}>
        <header className="card-header has-background-primary-light" style={{ borderBottom: "1px solid var(--border-soft)" }}>
          <div className="card-header-title is-centered py-3 px-4">
            <div className="has-text-centered">
              <div
                className="is-flex is-align-items-center is-justify-content-center mx-auto mb-1"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "var(--gold-light)",
                  color: "var(--gold-dark)",
                }}
              >
                <ShieldCheck size={22} />
              </div>
              <h1 className="title is-5 has-text-primary mb-1">
                Login Admin
              </h1>
              <p className="subtitle is-6 has-text-grey mb-0">
                Masuk untuk mengelola data sistem
              </p>
            </div>
          </div>
        </header>

        <div className="card-content py-4 px-5">
          {errorMsg && (
            <Notification
              type="danger"
              onClose={() => setErrorMsg("")}
              className="mb-3"
            >
              {errorMsg}
            </Notification>
          )}

          <form onSubmit={handleLogin}>
            <FormField label="Email" required className="mb-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mail.com"
                required
                disabled={loading}
              />
            </FormField>

            <FormField label="Password" required className="mb-3">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </FormField>

            <div className="field mt-4 mb-0">
              <Button
                type="submit"
                variant="primary"
                isFullwidth={true}
                isLoading={loading}
              >
                <span className="is-flex is-size-7 is-align-items-center is-justify-content-center" style={{ gap: "6px" }}>
                  <LogIn size={14} />
                  <span>Masuk ke Dashboard</span>
                </span>
              </Button>
            </div>
          </form>
        </div>

        <footer className="card-footer py-2 has-background-white-ter has-text-centered">
          <p className="is-size-7 has-text-grey" style={{ width: "100%" }}>
            Belum punya akun admin?{" "}
            <Link to="/register" className="has-text-success-dark has-text-weight-semibold">
              Daftar di sini
            </Link>
          </p>
        </footer>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
