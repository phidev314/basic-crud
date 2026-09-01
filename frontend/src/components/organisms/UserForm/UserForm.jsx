import React, { useState, useEffect } from "react";
import { Save, X, User } from "lucide-react";
import FormField from "../../molecules/FormField/FormField";
import Notification from "../../molecules/Notification/Notification";
import Input from "../../atoms/Input/Input";
import Select from "../../atoms/Select/Select";
import Button from "../../atoms/Button/Button";

const GENDER_OPTIONS = [
  { value: "Laki-laki", label: "Laki-laki" },
  { value: "Perempuan", label: "Perempuan" },
];

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
}) => {
  const [name, setName] = useState(initialData?.name || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [gender, setGender] = useState(initialData?.gender || "Laki-laki");
  const [validationError, setValidationError] = useState("");

  // Sinkronisasi data awal saat properti initialData dimuat (misal setelah fetch data selesai)
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setEmail(initialData.email || "");
      setGender(initialData.gender || "Laki-laki");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData?.name, initialData?.email, initialData?.gender]);

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
    onSubmit({ name: name.trim(), email: email.trim(), gender });
  };

  const displayedError = validationError || errorMsg;

  return (
    <div className="card-container p-0 overflow-hidden">
      {title && (
        <header className="card-header p-4 is-flex is-align-items-center" style={{ gap: "8px" }}>
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

export default UserForm;
