import React from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { authService } from "../../../services";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    // Redirect ke halaman /login dan simpan URL sebelumnya untuk redirect kembali
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
