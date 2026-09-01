import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout, UserForm } from "../../../components";
import { userService } from "../../../services";

const TambahUserPage = () => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "User Management", href: "/user-management" },
    { label: "Tambah Pengguna", active: true },
  ];

  const handleSaveUser = async (formData) => {
    try {
      setLoading(true);
      setErrorMsg("");
      await userService.createUser(formData);
      navigate("/user-management");
    } catch (error) {
      console.error("Gagal menambahkan user:", error);
      setErrorMsg(
        error.message ||
          "Gagal menyimpan data pengguna. Periksa koneksi backend Anda."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout breadcrumbs={breadcrumbs}>
      <div className="columns is-centered">
        <div className="column is-7-tablet is-6-desktop">
          <UserForm
            title="Tambah Pengguna Baru"
            headerVariant="primary"
            submitText="Simpan Pengguna"
            onSubmit={handleSaveUser}
            cancelTo="/user-management"
            loading={loading}
            errorMsg={errorMsg}
            onCloseError={() => setErrorMsg("")}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default TambahUserPage;
