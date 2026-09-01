import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Package,
  Tags,
  UserPlus,
  PackagePlus,
  ArrowRight,
  Settings,
} from "lucide-react";
import { MainLayout, Notification, Tag, Button, Card, Table } from "../../components";
import { dashboardService, authService } from "../../services";

// halaman dashboard panel administrator
const DashboardPage = () => {
  // state data ringkasan agregasi, recent list, dan status loading
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [stats, setStats] = useState({
    totalUsers: 0,
    maleUsers: 0,
    femaleUsers: 0,
    totalProducts: 0,
    totalStock: 0,
    totalCategories: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);

  // mengambil info admin yang sedang login dari authService
  const admin = authService.getAdmin();

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Dashboard", active: true },
  ];

  // mengambil data ringkasan statistik dari api backend
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const response = await dashboardService.getStats();
      const resData = response.data || response;

      if (resData && resData.stats) {
        setStats({
          totalUsers: resData.stats.totalUsers || 0,
          maleUsers: resData.stats.maleUsers || 0,
          femaleUsers: resData.stats.femaleUsers || 0,
          totalProducts: resData.stats.totalProducts || 0,
          totalStock: resData.stats.totalStock || 0,
          totalCategories: resData.stats.totalCategories || 0,
        });
        setRecentUsers(resData.recentUsers || []);
        setRecentProducts(resData.recentProducts || []);
      }
    } catch (error) {
      console.error("Gagal memuat statistik dashboard:", error);
      setErrorMsg("Gagal memuat ringkasan data statistik dari server.");
    } finally {
      setLoading(false);
    }
  };

  // eksekusi pengambilan data statistik saat halaman dashboard pertama kali dimuat
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // format angka menjadi mata uang rupiah (idr)
  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(number || 0);
  };

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

  const userColumns = [
    {
      header: "Pengguna",
      render: (u) => (
        <div className="is-flex is-align-items-center" style={{ gap: "10px" }}>
          {u.avatar ? (
            <figure className="image is-32x32" style={{ borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
              <img
                src={u.avatar.startsWith("http") ? u.avatar : `${API_BASE_URL}${u.avatar.startsWith("/") ? "" : "/"}${u.avatar}`}
                alt={u.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </figure>
          ) : (
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: "var(--cream-bg)",
                border: "1px solid var(--border-soft)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                fontWeight: "700",
                color: "var(--gold-dark)",
                flexShrink: 0,
              }}
            >
              {u.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
          )}
          <div>
            <span className="has-text-weight-semibold is-block" style={{ fontSize: "0.85rem" }}>
              {u.name}
            </span>
            <span className="has-text-grey is-size-7">{u.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Gender",
      accessor: "gender",
      render: (u) => (
        <Tag variant={u.gender === "Laki-laki" ? "info" : "danger"}>
          {u.gender}
        </Tag>
      ),
    },
  ];

  const productColumns = [
    {
      header: "Nama Produk",
      accessor: "name",
      cellClassName: "has-text-weight-semibold",
    },
    {
      header: "Kategori",
      render: (p) => (
        <span className="tag is-light is-rounded is-small">
          {p.category?.name || "Umum"}
        </span>
      ),
    },
    {
      header: "Harga",
      render: (p) => formatRupiah(p.price),
      cellClassName: "has-text-weight-medium",
    },
    {
      header: "Stok",
      render: (p) => (
        <span
          className={`tag is-small ${
            p.stock <= 0
              ? "is-danger is-light"
              : p.stock <= 5
                ? "is-warning is-light"
                : "is-success is-light"
          }`}
        >
          {p.stock} unit
        </span>
      ),
    },
  ];

  return (
    <MainLayout breadcrumbs={breadcrumbs}>
      {/* HEADER BANNER */}
      <div className="card-container mb-5 p-5">
        <div className="columns is-vcentered is-mobile">
          <div className="column">
            <h1 className="page-title mb-1">
              Selamat Datang, {admin?.name || "Administrator"}!
            </h1>
            <p className="subtitle is-6 mb-0">
              Ringkasan performa dan data statistik sistem Anda hari ini dihitung secara server-side.
            </p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <Notification type="danger" onClose={() => setErrorMsg("")} className="mb-4">
          {errorMsg}
        </Notification>
      )}

      {/* 4 STAT CARDS */}
      <div className="columns is-multiline mb-5">
        {/* Total Users Card */}
        <Card
          title="Total Pengguna"
          icon={<Users size={24} color="var(--gold-dark)" />}
          value={stats.totalUsers}
          stats={`${stats.maleUsers} Pria | ${stats.femaleUsers} Wanita`}
          loading={loading}
        />

        {/* Total Products Card */}
        <Card
          title="Total Produk"
          icon={<Package size={24} color="var(--gold-dark)" />}
          value={stats.totalProducts}
          stats={`Total Stok Sistem: ${stats.totalStock} unit`}
          loading={loading}
        />

        {/* Total Categories Card */}
        <Card
          title="Total Kategori"
          icon={<Tags size={24} color="var(--gold-dark)" />}
          value={stats.totalCategories}
          stats="Klasifikasi item terdaftar"
          loading={loading}
        />

        {/* System & Auth Card */}
        <Card
          title="Sistem & Otoritas"
          icon={<Settings size={24} color="var(--gold-dark)" />}
          value="Aktif"
          stats={admin?.email || "Admin Logged In"}
          loading={loading}
        />
      </div>

      {/* QUICK ACTIONS */}
      <div className="card-container mb-5 p-4">
        <div
          className="is-flex is-justify-content-between is-align-items-center is-flex-wrap-wrap"
          style={{ gap: "1rem", justifyContent: "space-between" }}
        >
          <div style={{ flex: "1 1 250px" }}>
            <h2 className="title is-5 mb-1 is-flex is-align-items-center" style={{ gap: "6px" }}>
              <span>Aksi Cepat</span>
            </h2>
            <p className="subtitle is-6 mb-0">Pintasan navigasi untuk mengelola data sistem</p>
          </div>
          <div
            className="is-flex is-align-items-center is-flex-wrap-wrap"
            style={{ gap: "0.5rem", flexShrink: 0 }}
          >
            <Button to="/user-management/tambah" variant="primary" size="small">
              <span className="is-flex is-align-items-center" style={{ gap: "6px" }}>
                <UserPlus size={15} />
                <span>Tambah Pengguna</span>
              </span>
            </Button>
            <Button to="/product-management" variant="outline-luxury" size="small">
              <span className="is-flex is-align-items-center" style={{ gap: "6px" }}>
                <PackagePlus size={15} />
                <span>Kelola Produk</span>
              </span>
            </Button>
            <Button to="/user-management" variant="light" size="small">
              <span className="is-flex is-align-items-center" style={{ gap: "6px" }}>
                <Users size={15} />
                <span>Lihat Semua Pengguna</span>
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* PREVIEW TABLES: USERS & PRODUCTS */}
      <div className="columns is-multiline">
        {/* Recent Users Preview */}
        <div className="column is-12-tablet is-6-desktop">
          <div className="card">
            <header className="card-header is-flex is-justify-content-between is-align-items-center pr-4">
              <p className="card-header-title is-flex is-align-items-center" style={{ gap: "8px" }}>
                <Users size={18} />
                <span>Pengguna Terbaru</span>
              </p>
              <Link to="/user-management" className="is-size-7 has-text-success-dark has-text-weight-bold is-flex is-align-items-center" style={{ gap: "4px" }}>
                <span>Lihat Semua</span>
                <ArrowRight size={14} />
              </Link>
            </header>
            <div className="card-content p-0">
              <Table
                columns={userColumns}
                data={recentUsers}
                loading={loading}
                loadingMessage="Memuat data pengguna..."
                emptyMessage="Belum ada data pengguna."
              />
            </div>
          </div>
        </div>

        {/* Recent Products Preview */}
        <div className="column is-12-tablet is-6-desktop">
          <div className="card">
            <header className="card-header is-flex is-justify-content-between is-align-items-center pr-4">
              <p className="card-header-title is-flex is-align-items-center" style={{ gap: "8px" }}>
                <Package size={18} />
                <span>Produk Terbaru</span>
              </p>
              <Link to="/product-management" className="is-size-7 has-text-success-dark has-text-weight-bold is-flex is-align-items-center" style={{ gap: "4px" }}>
                <span>Lihat Semua</span>
                <ArrowRight size={14} />
              </Link>
            </header>
            <div className="card-content p-0">
              <Table
                columns={productColumns}
                data={recentProducts}
                loading={loading}
                loadingMessage="Memuat data produk..."
                emptyMessage="Belum ada data produk. Silakan tambahkan di menu Produk."
              />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
