import React, { useState, useEffect, useMemo } from "react";
import { Pencil, Trash2, UserPlus, Users, RotateCcw } from "lucide-react";
import {
  MainLayout,
  PageHeader,
  SearchBar,
  Notification,
  Table,
  Tag,
  Button,
  Modal,
} from "../../components";
import { userService } from "../../services";
import { useDebounce } from "../../hooks";

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Debounce search query dengan delay 400ms
  const debouncedSearch = useDebounce(searchQuery, 400);

  const breadcrumbs = [
    { label: "Home", href: "/user-management" },
    { label: "User Management", active: true },
  ];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers();
      setUsers(response.data || []);
      setMessage(null);
    } catch (error) {
      console.error("Gagal mengambil data user:", error);
      setMessage({
        type: "danger",
        text: error.message || "Gagal memuat data pengguna dari server.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Membuka modal konfirmasi hapus
  const handleOpenDeleteModal = (id, name) => {
    setUserToDelete({ id, name });
    setShowDeleteModal(true);
  };

  // Menutup modal konfirmasi hapus
  const handleCloseDeleteModal = () => {
    if (deletingId) return; // Cegah penutupan saat proses penghapusan berlangsung
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  // Eksekusi penghapusan user setelah konfirmasi di modal
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      setDeletingId(userToDelete.id);
      await userService.deleteUser(userToDelete.id);
      setMessage({
        type: "success",
        text: `Pengguna "${userToDelete.name}" berhasil dihapus.`,
      });
      setShowDeleteModal(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      console.error("Gagal menghapus user:", error);
      setMessage({
        type: "danger",
        text: error.message || "Gagal menghapus pengguna. Silakan coba lagi.",
      });
      setShowDeleteModal(false);
      setUserToDelete(null);
    } finally {
      setDeletingId(null);
    }
  };

  // Filter data berdasarkan debouncedSearch
  const filteredUsers = useMemo(() => {
    if (!debouncedSearch.trim()) return users;
    const query = debouncedSearch.toLowerCase();
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
    );
  }, [users, debouncedSearch]);

  const userColumns = [
    {
      header: "No",
      align: "center",
      width: "60px",
      render: (_, index) => index + 1,
    },
    {
      header: "Nama",
      accessor: "name",
      cellClassName: "has-text-weight-semibold",
    },
    {
      header: "Email",
      accessor: "email",
      render: (user) => (
        <a href={`mailto:${user.email}`} className="has-text-link">
          {user.email}
        </a>
      ),
    },
    {
      header: "Jenis Kelamin",
      accessor: "gender",
      align: "center",
      render: (user) => (
        <Tag
          variant={user.gender === "Laki-laki" ? "info" : "danger"}
          isLight={true}
          isRounded={true}
        >
          {user.gender || "Tidak ditentukan"}
        </Tag>
      ),
    },
    {
      header: "Aksi",
      align: "center",
      width: "160px",
      render: (user) => (
        <div className="buttons is-centered are-small">
          <Button
            to={`/user-management/edit/${user.id}`}
            variant="info"
            isOutlined={true}
            size="small"
          >
            <span className="is-flex is-align-items-center" style={{ gap: "4px" }}>
              <Pencil size={13} />
            </span>
          </Button>
          <Button
            type="button"
            variant="danger"
            isOutlined={true}
            size="small"
            onClick={() => handleOpenDeleteModal(user.id, user.name)}
            disabled={deletingId === user.id}
            isLoading={deletingId === user.id}
          >
            <span className="is-flex is-align-items-center" style={{ gap: "4px" }}>
              <Trash2 size={13} />
            </span>
          </Button>
        </div>
      ),
    },
  ];

  const isFiltered = Boolean(debouncedSearch.trim());

  const emptyState = (
    <div className="has-text-centered">
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
        <Users size={28} />
      </div>
      <p className="title is-5 has-text-grey-dark mb-1">
        {isFiltered
          ? "Tidak Ditemukan Pengguna yang Cocok"
          : "Belum Ada Data Pengguna"}
      </p>
      <p
        className="subtitle is-6 has-text-grey mb-4"
        style={{ maxWidth: "420px", margin: "0 auto" }}
      >
        {isFiltered
          ? `Tidak ada pengguna yang cocok dengan kata kunci "${debouncedSearch}". Silakan coba kata kunci lain atau reset pencarian.`
          : "Mulai kelola pengguna sistem Anda dengan menambahkan pengguna baru sekarang."}
      </p>
      <div className="buttons is-centered are-small">
        {isFiltered ? (
          <Button
            variant="light"
            size="small"
            onClick={() => setSearchQuery("")}
          >
            <span className="is-flex is-align-items-center" style={{ gap: "6px" }}>
              <RotateCcw size={14} />
              <span>Reset Pencarian</span>
            </span>
          </Button>
        ) : (
          <Button
            to="/user-management/tambah"
            variant="primary"
            size="small"
          >
            <span className="is-flex is-align-items-center" style={{ gap: "4px" }}>
              <UserPlus size={15} />
              <span>Tambah Pengguna Pertama</span>
            </span>
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <MainLayout breadcrumbs={breadcrumbs}>
      {/* Header Organism */}
      <PageHeader
        title="User Management"
        subtitle="Kelola daftar pengguna sistem, tambah baru, perbarui data, atau hapus."
        action={
          <Button
            to="/user-management/tambah"
            variant="primary"
            isRounded={true}
          >
            <span className="is-flex is-align-items-center" style={{ gap: "4px" }}>
              <span>+ Tambah Pengguna</span>
            </span>
          </Button>
        }
      />

      {/* Search Bar Molecule */}
      <SearchBar
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onReset={() => setSearchQuery("")}
        placeholder="Cari berdasarkan nama atau email..."
        className="mb-4"
      />

      {/* Notification Molecule */}
      {message && (
        <Notification
          type={message.type}
          onClose={() => setMessage(null)}
          className="mb-4"
        >
          {message.text}
        </Notification>
      )}

      {/* Table Molecule */}
      <div className="card-container p-0">
        <Table
          columns={userColumns}
          data={filteredUsers}
          keyField="id"
          loading={loading}
          loadingMessage="Memuat data pengguna..."
          emptyMessage={
            isFiltered
              ? `Tidak ditemukan pengguna yang cocok dengan "${debouncedSearch}".`
              : "Belum ada data pengguna."
          }
          emptyIcon={<Users size={36} color="var(--ink-soft)" />}
          emptyAction={
            !isFiltered ? (
              <Button to="/user-management/tambah" variant="primary" size="small">
                <span className="is-flex is-align-items-center" style={{ gap: "4px" }}>
                  <UserPlus size={15} />
                  <span>Tambah Pengguna Pertama</span>
                </span>
              </Button>
            ) : null
          }
          emptyState={emptyState}
          hoverable={true}
          striped={false}
          fullwidth={true}
          className="table-luxury"
          containerClassName=""
          footer={
            !loading && filteredUsers.length > 0 ? (
              <footer className="card-footer px-4 py-3">
                <span className="is-size-7 has-text-grey">
                  Menampilkan {filteredUsers.length} dari {users.length} pengguna
                </span>
              </footer>
            ) : null
          }
        />
      </div>

      {/* Reusable Delete Confirmation Modal */}
      <Modal
        isActive={showDeleteModal}
        onClose={handleCloseDeleteModal}
        title="Konfirmasi Hapus Pengguna"
        footer={
          <div className="buttons is-right" style={{ width: "100%" }}>
            <Button
              variant="light"
              onClick={handleCloseDeleteModal}
              disabled={Boolean(deletingId)}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              isLoading={Boolean(deletingId)}
            >
              Ya, Hapus
            </Button>
          </div>
        }
      >
        <div className="content">
          <p className="mb-2">
            Apakah Anda yakin ingin menghapus pengguna{" "}
            <strong className="has-text-danger">
              "{userToDelete?.name}"
            </strong>
            ?
          </p>
          <p className="is-size-7 has-text-grey mb-0">
            Tindakan ini permanen dan data yang telah dihapus tidak dapat dipulihkan kembali.
          </p>
        </div>
      </Modal>
    </MainLayout>
  );
};

export default UserManagementPage;
