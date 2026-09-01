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
import { userService, productService, authService } from "../../services";

const DashboardPage = () => {
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

  const admin = authService.getAdmin();

  const breadcrumbs = [
    { label: "Home", href: "/dashboard" },
    { label: "Dashboard", active: true },
  ];

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      // Fetch users, products, and categories secara paralel
      const [usersRes, productsRes, categoriesRes] = await Promise.all([
        userService.getUsers().catch(() => ({ data: [] })),
        productService.getProducts({ limit: 5 }).catch(() => ({ data: [] })),
        productService.getCategories().catch(() => ({ data: [] })),
      ]);

      const usersList = Array.isArray(usersRes.data) ? usersRes.data : [];
      const maleCount = usersList.filter((u) => u.gender === "Laki-laki").length;
      const femaleCount = usersList.filter((u) => u.gender === "Perempuan").length;

      // Products data
      let productsList = [];
      let totalProdCount = 0;
      if (productsRes.data && Array.isArray(productsRes.data.data)) {
        productsList = productsRes.data.data;
        totalProdCount = productsRes.data.totalItems || productsList.length;
      } else if (Array.isArray(productsRes.data)) {
        productsList = productsRes.data;
        totalProdCount = productsList.length;
      }

      const totalStockSum = productsList.reduce(
        (sum, item) => sum + (Number(item.stock) || 0),
        0
      );

      const categoriesList = Array.isArray(categoriesRes.data)
        ? categoriesRes.data
        : [];

      setStats({
        totalUsers: usersList.length,
        maleUsers: maleCount,
        femaleUsers: femaleCount,
        totalProducts: totalProdCount,
        totalStock: totalStockSum,
        totalCategories: categoriesList.length,
      });

      setRecentUsers(usersList.slice(0, 5));
      setRecentProducts(productsList.slice(0, 5));
    } catch (error) {
      console.error("Gagal memuat statistik dashboard:", error);
      setErrorMsg("Gagal memuat ringkasan data statistik dari server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(number || 0);
  };

  const userColumns = [
    {
      header: "Nama",
      accessor: "name",
      cellClassName: "has-text-weight-semibold",
    },
    {
      header: "Email",
      accessor: "email",
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
        <span className="tag is-success is-light is-small">
          {p.stock} unit
        </span>
      ),
    },
  ];

  return (
    <MainLayout breadcrumbs={breadcrumbs}>
      {/* Header Banner */}
      <div className="card-container mb-5 p-5">
        <div className="columns is-vcentered is-mobile">
          <div className="column">
            <h1 className="page-title mb-1">
              Selamat Datang, {admin?.name || "Administrator"}!
            </h1>
            <p className="subtitle is-6 mb-0">
              Ringkasan performa dan data statistik sistem Anda hari ini.
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
          stats={`Estimasi Stok: ${stats.totalStock} unit`}
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
