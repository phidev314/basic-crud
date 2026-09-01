import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/landing/index.jsx";
import DashboardPage from "./pages/dashboard/index.jsx";
import UserManagementPage from "./pages/user-management/index.jsx";
import TambahUserPage from "./pages/user-management/tambah/index.jsx";
import EditUserPage from "./pages/user-management/edit/[id].jsx";
import UserDetailPage from "./pages/user-management/detail/[id].jsx";
import ProductManagementPage from "./pages/product-management/index.jsx";
import TambahProductPage from "./pages/product-management/tambah/index.jsx";
import EditProductPage from "./pages/product-management/edit/[id].jsx";
import LoginPage from "./pages/auth/login/index.jsx";
import RegisterPage from "./pages/auth/register/index.jsx";
import { ProtectedRoute } from "./components";
import { CartProvider } from "./context/CartContext.jsx";

// komponen utama aplikasi (root component)
// mengatur penyedia state global (cartprovider) dan routing react router
function App() {
  return (
    // cartprovider membungkus aplikasi agar state keranjang belanja dapat diakses di seluruh halaman
    <CartProvider>
      <BrowserRouter>
        <Routes>
          {/* PUBLIC ROUTES: KATALOG TOKO & AUTENTIKASI ADMIN */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/shop" element={<LandingPage />} />
          <Route path="/katalog" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* PROTECTED ROUTES: HANYA BISA DIAKSES OLEH ADMIN DENGAN TOKEN */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* USER MANAGEMENT */}
            <Route path="/user-management" element={<UserManagementPage />} />
            <Route path="/user-management/tambah" element={<TambahUserPage />} />
            <Route path="/user-management/edit/:id" element={<EditUserPage />} />
            <Route path="/user-management/detail/:id" element={<UserDetailPage />} />

            {/* PRODUCT MANAGEMENT */}
            <Route path="/product-management" element={<ProductManagementPage />} />
            <Route path="/product-management/tambah" element={<TambahProductPage />} />
            <Route path="/product-management/edit/:id" element={<EditProductPage />} />

            {/* LEGACY REDIRECTS */}
            <Route path="/products" element={<Navigate to="/product-management" replace />} />
            <Route path="/products/tambah" element={<Navigate to="/product-management/tambah" replace />} />
            <Route path="/products/edit/:id" element={<Navigate to="/product-management" replace />} />
            <Route path="/add" element={<Navigate to="/user-management/tambah" replace />} />
            <Route path="/edit/:id" element={<Navigate to="/user-management" replace />} />
          </Route>

          {/* 404 FALLBACK ROUTE */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
