import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Pencil,
  Trash2,
  UserPlus,
  Users,
  RotateCcw,
  Eye,
  User,
  MapPin,
} from "lucide-react";
import {
  MainLayout,
  PageHeader,
  SearchBar,
  Notification,
  Table,
  Tag,
  Button,
  Modal,
  Pagination,
  Select,
} from "../../components";
import { userService } from "../../services";
import { useDebounce } from "../../hooks";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

const GENDER_FILTER_OPTIONS = [
  { value: "", label: "Semua Gender" },
  { value: "Laki-laki", label: "Laki-laki" },
  { value: "Perempuan", label: "Perempuan" },
];

// halaman manajemen pengguna (crud user, filter gender, search server-side, & relasi alamat)
const UserManagementPage = () => {
  // state data pengguna dan loading
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // parameter filter server-side (kata kunci pencarian & filter jenis kelamin)
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("");

  // parameter pagination server-side (halaman aktif, limit data, total halaman, total data)
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // parameter sorting server-side
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("DESC");

  // notifikasi toast & modal hapus
  const [notification, setNotification] = useState({ show: false, message: "", type: "info" });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // debounce search query 400ms agar efisien dan tidak spam request ke backend
  const debouncedSearch = useDebounce(searchQuery, 400);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "User Management", active: true },
  ];

  // helper untuk mendapatkan url gambar avatar user
  const getAvatarUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
      return path;
    }
    return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  // mengambil data pengguna dari server (server-side pagination, filter gender, debounce search, sorting)
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        sortBy,
        order: sortOrder,
      };
      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }
      if (genderFilter) {
        params.gender = genderFilter;
      }

      const response = await userService.getUsers(params);
      const resData = response.data || response;

      if (resData && Array.isArray(resData.data)) {
        setUsers(resData.data);
        setTotalItems(resData.totalItems || resData.data.length);
        setTotalPages(resData.totalPages || 1);
      } else if (Array.isArray(resData)) {
        setUsers(resData);
        setTotalItems(resData.length);
        setTotalPages(1);
      } else {
        setUsers([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Gagal mengambil data user:", error);
      setNotification({
        show: true,
        type: "danger",
        message: error.message || "Gagal memuat data pengguna dari server.",
      });
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, genderFilter, sortBy, sortOrder]);

  // reset ke halaman 1 saat keyword pencarian atau filter gender berubah
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, genderFilter]);

  // eksekusi pengambilan data user setiap kali dependensi query berubah
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenDeleteModal = (id, name) => {
    setUserToDelete({ id, name });
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    if (deletingId) return;
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      setDeletingId(userToDelete.id);
      await userService.deleteUser(userToDelete.id);
      setNotification({
        show: true,
        type: "success",
        message: `Pengguna "${userToDelete.name}" berhasil dihapus.`,
      });
      setShowDeleteModal(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      console.error("Gagal menghapus user:", error);
      setNotification({
        show: true,
        type: "danger",
        message: error.message || "Gagal menghapus pengguna. Silakan coba lagi.",
      });
      setShowDeleteModal(false);
      setUserToDelete(null);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder((prev) => (prev.toUpperCase() === "ASC" ? "DESC" : "ASC"));
    } else {
      setSortBy(key);
      setSortOrder("ASC");
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleSearchReset = () => {
    setSearchQuery("");
    setGenderFilter("");
    setPage(1);
  };

  const userColumns = [
    {
      header: "No",
      align: "center",
      width: "55px",
      render: (_, index) => (page - 1) * limit + index + 1,
    },
    {
      header: "Pengguna",
      accessor: "name",
      sortable: true,
      sortKey: "name",
      render: (user) => {
        const avatarUrl = getAvatarUrl(user.avatar);
        return (
          <div className="is-flex is-align-items-center" style={{ gap: "12px" }}>
            {/* Foto Profil Thumbnail */}
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                backgroundColor: "var(--gold-light)",
                color: "var(--gold-dark)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "0.85rem",
                overflow: "hidden",
                border: "1.5px solid var(--border-soft)",
                flexShrink: 0,
              }}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span>{user.name ? user.name.charAt(0).toUpperCase() : <User size={16} />}</span>
              )}
            </div>

            <div>
              <Link
                to={`/user-management/detail/${user.id}`}
                className="has-text-weight-semibold has-text-dark is-block"
                style={{ lineHeight: "1.2" }}
              >
                {user.name}
              </Link>
              <a
                href={`mailto:${user.email}`}
                className="is-size-7 has-text-grey"
                style={{ textDecoration: "none" }}
              >
                {user.email}
              </a>
            </div>
          </div>
        );
      },
    },
    {
      header: "Jenis Kelamin",
      accessor: "gender",
      sortable: true,
      sortKey: "gender",
      align: "center",
      width: "140px",
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
      header: "Alamat Tersimpan",
      align: "center",
      width: "160px",
      render: (user) => {
        const count = user.addresses?.length || 0;
        const primaryAddr = user.addresses?.find((a) => a.isPrimary) || user.addresses?.[0];

        return (
          <div className="is-flex is-flex-direction-column is-align-items-center">
            <span
              className={`tag is-small is-rounded ${count > 0 ? "is-primary is-light" : "is-light"
                }`}
              style={{ fontWeight: "600" }}
            >
              <MapPin size={11} className="mr-1" />
              {count} Alamat
            </span>
            {primaryAddr && (
              <span
                className="is-size-7 has-text-grey mt-1 text-truncate"
                style={{ maxWidth: "140px" }}
                title={`${primaryAddr.city}, ${primaryAddr.province}`}
              >
                {primaryAddr.city}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Aksi",
      align: "center",
      width: "170px",
      render: (user) => (
        <div className="buttons is-centered are-small">
          {/* TOMBOL DETAIL USER */}
          <Link
            to={`/user-management/detail/${user.id}`}
            className="button is-primary is-outlined is-small"
            title="Lihat Detail & Kelola Alamat"
          >
            <Eye size={13} />
          </Link>

          {/* TOMBOL EDIT USER */}
          <Link
            to={`/user-management/edit/${user.id}`}
            className="button is-small is-info is-outlined"
            title="Edit Pengguna"
          >
            <Pencil size={13} />
          </Link>

          {/* TOMBOL HAPUS USER */}
          <Button
            type="button"
            variant="danger"
            isOutlined={true}
            size="small"
            onClick={() => handleOpenDeleteModal(user.id, user.name)}
            disabled={deletingId === user.id}
            isLoading={deletingId === user.id}
            title="Hapus Pengguna"
          >
            <Trash2 size={13} />
          </Button>
        </div>
      ),
    },
  ];

  const isFiltered = Boolean(debouncedSearch.trim() || genderFilter);

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
          ? `Tidak ada pengguna yang cocok dengan kriteria filter pencarian Anda pada server. Silakan coba kata kunci lain atau reset pencarian.`
          : "Mulai kelola pengguna sistem Anda dengan menambahkan pengguna baru sekarang."}
      </p>
      <div className="buttons is-centered are-small">
        {isFiltered ? (
          <Button
            variant="light"
            size="small"
            onClick={handleSearchReset}
          >
            <span className="is-flex is-align-items-center" style={{ gap: "6px" }}>
              <RotateCcw size={14} />
              <span>Reset Pencarian & Filter</span>
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
      <PageHeader
        title="User Management"
        subtitle="Kelola daftar pengguna sistem, foto profil, dan relasi alamat dengan filter & sorting server-side."
        action={
          <Button
            to="/user-management/tambah"
            variant="primary"
            isRounded={true}
          >
            <span className="is-flex is-align-items-center" style={{ gap: "4px" }}>
              <UserPlus size={16} />
              <span>+ Tambah Pengguna</span>
            </span>
          </Button>
        }
      />

      {/* FILTER, SEARCH & GENDER BAR (SERVER-SIDE) */}
      <div className="card-container mb-4 p-4">
        <div className="columns is-multiline is-vcentered mb-0">
          <div className="column is-12-mobile is-8-tablet">
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onReset={handleSearchReset}
              placeholder="Cari berdasarkan nama atau email pengguna..."
            />
          </div>

          <div className="column is-12-mobile is-4-tablet">
            <div className="is-flex is-align-items-center">
              <span className="mr-2 has-text-weight-medium is-size-7 has-text-grey is-uppercase">
                Gender:
              </span>
              <Select
                isFullwidth={true}
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                options={GENDER_FILTER_OPTIONS}
              />
            </div>
          </div>
        </div>

        {/* STATUS FILTER AKTIF */}
        {isFiltered && (
          <div className="is-flex is-justify-content-space-between is-align-items-center pt-2 mt-2" style={{ borderTop: "1px dashed var(--border-soft)", display: "flex", justifyContent: "space-between" }}>
            <span className="is-size-7 has-text-grey">
              Filter aktif:{" "}
              {debouncedSearch ? `Pencarian "${debouncedSearch}"` : ""}
              {genderFilter ? ` • Jenis Kelamin: ${genderFilter}` : ""}
            </span>
            <button
              type="button"
              className="button is-small is-ghost has-text-grey p-0"
              onClick={handleSearchReset}
              style={{ fontSize: "0.75rem" }}
            >
              <RotateCcw size={12} className="mr-1" />
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* NOTIFICATION */}
      {notification.show && (
        <Notification
          type={notification.type}
          onClose={() => setNotification({ ...notification, show: false })}
          className="mb-4"
        >
          {notification.message}
        </Notification>
      )}

      {/* USER TABLE DENGAN SERVER-SIDE SORTING & PAGINATION */}
      <div className="card-container p-0 overflow-hidden">
        <Table
          columns={userColumns}
          data={users}
          keyField="id"
          loading={loading}
          loadingMessage="Memuat data pengguna dari server..."
          emptyMessage={
            isFiltered
              ? `Tidak ditemukan pengguna yang cocok dengan kriteria filter.`
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
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          footer={
            !loading && totalItems > 0 ? (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={totalItems}
                limit={limit}
                limitOptions={[5, 10, 20, 50]}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
              />
            ) : null
          }
        />
      </div>

      {/* KONFIRMASI MODAL DELETE */}
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
            Tindakan ini permanen. Semua data alamat yang berelasi dengan pengguna ini juga akan dihapus.
          </p>
        </div>
      </Modal>
    </MainLayout>
  );
};

export default UserManagementPage;
