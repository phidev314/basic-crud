import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MainLayout, UserForm, Notification, Button } from "../../../components";
import { userService } from "../../../services";

const EditUserPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [initialData, setInitialData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [notFound, setNotFound] = useState(false);

  const breadcrumbs = [
    { label: "Home", href: "/user-management" },
    { label: "User Management", href: "/user-management" },
    { label: `Edit Pengguna ${id ? `(#${id})` : ""}`, active: true },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoadingData(true);
        setErrorMsg("");
        const response = await userService.getUserById(id);
        if (response.data) {
          setInitialData({
            name: response.data.name || "",
            email: response.data.email || "",
            gender: response.data.gender || "Laki-laki",
          });
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error("Gagal mengambil data user:", error);
        if (error.status === 404) {
          setNotFound(true);
        } else {
          setErrorMsg(error.message || "Gagal memuat data pengguna dari server.");
        }
      } finally {
        setLoadingData(false);
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id]);

  const handleUpdateUser = async (formData) => {
    try {
      setSaving(true);
      setErrorMsg("");
      await userService.updateUser(id, formData);
      navigate("/user-management");
    } catch (error) {
      console.error("Gagal mengupdate user:", error);
      setErrorMsg(
        error.message || "Gagal memperbarui data pengguna. Silakan coba lagi."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout breadcrumbs={breadcrumbs}>
      <div className="columns is-centered">
        <div className="column is-7-tablet is-6-desktop">
          {loadingData ? (
            <div className="card">
              <div className="card-content has-text-centered py-6">
                <p className="title is-6 has-text-grey">
                  Memuat data pengguna #{id}...
                </p>
              </div>
            </div>
          ) : notFound ? (
            <div className="card">
              <div className="card-content has-text-centered py-6">
                <Notification type="warning" className="mb-4">
                  <p className="title is-5 mb-2">Pengguna Tidak Ditemukan</p>
                  <p className="subtitle is-6 has-text-grey mb-0">
                    Data pengguna dengan ID #{id} tidak ada di sistem.
                  </p>
                </Notification>
                <Button to="/user-management" variant="primary" size="small">
                  Kembali ke Daftar Pengguna
                </Button>
              </div>
            </div>
          ) : (
            <UserForm
              title="Edit Data Pengguna"
              headerVariant="info"
              submitText="Simpan Perubahan"
              initialData={initialData}
              onSubmit={handleUpdateUser}
              cancelTo="/user-management"
              loading={saving}
              errorMsg={errorMsg}
              onCloseError={() => setErrorMsg("")}
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default EditUserPage;
