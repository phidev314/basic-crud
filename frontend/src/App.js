import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardPage from "./pages/dashboard/index.jsx";
import UserManagementPage from "./pages/user-management/index.jsx";
import TambahUserPage from "./pages/user-management/tambah/index.jsx";
import EditUserPage from "./pages/user-management/edit/[id].jsx";
import ProductManagementPage from "./pages/product-management/index.jsx";
import TambahProductPage from "./pages/product-management/tambah/index.jsx";
import EditProductPage from "./pages/product-management/edit/[id].jsx";
import LoginPage from "./pages/auth/login/index.jsx";
import RegisterPage from "./pages/auth/register/index.jsx";
import { ProtectedRoute } from "./components";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Application Routes (Hanya Admin yang Login) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* User Management */}
          <Route path="/user-management" element={<UserManagementPage />} />
          <Route path="/user-management/tambah" element={<TambahUserPage />} />
          <Route path="/user-management/edit/:id" element={<EditUserPage />} />

          {/* Product Management */}
          <Route path="/product-management" element={<ProductManagementPage />} />
          <Route path="/product-management/tambah" element={<TambahProductPage />} />
          <Route path="/product-management/edit/:id" element={<EditProductPage />} />

          {/* Legacy / Alias Routes */}
          <Route path="/products" element={<Navigate to="/product-management" replace />} />
          <Route path="/products/tambah" element={<Navigate to="/product-management/tambah" replace />} />
          <Route path="/products/edit/:id" element={<Navigate to="/product-management" replace />} />
          <Route path="/add" element={<Navigate to="/user-management/tambah" replace />} />
          <Route path="/edit/:id" element={<Navigate to="/user-management" replace />} />
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
