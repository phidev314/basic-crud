import React from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { authService } from "../../../services";

// middleware komponen pelindung rute (route guard)
// memastikan halaman hanya dapat diakses oleh user/admin yang sudah memiliki token otentikasi
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();

  // jika belum login, redirect ke halaman login dan simpan state asal lokasi
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // jika sudah terotentikasi, render komponen anak atau nested route outlet
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
