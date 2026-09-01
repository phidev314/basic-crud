import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogIn, ShieldCheck } from "lucide-react";
import {
  FormField,
  Input,
  Button,
  Notification,
  AuthLayout
} from "../../../components";
import { authService } from "../../../services";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect jika sudah login
  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg("Email dan password wajib diisi.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      await authService.login({
        email: email.trim(),
        password,
      });

      // Redirect ke halaman sebelumnya jika ada, atau ke /dashboard
      const origin = location.state?.from?.pathname || "/dashboard";
      navigate(origin, { replace: true });
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
                Login Admin
              </h1>
              <p className="subtitle is-6 has-text-grey">
                Masuk untuk mengelola data sistem
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

          <form onSubmit={handleLogin}>
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
                placeholder="••••••••"
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
              >
                <span className="is-flex is-size-7 is-align-items-center is-justify-content-center" style={{ gap: "6px" }}>
                  <LogIn size={14} />
                  <span>Masuk ke Dashboard</span>
                </span>
              </Button>
            </div>
          </form>
        </div>

        <footer className="card-footer py-3 has-background-white-ter has-text-centered">
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
