import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(); // untuk membaca file .env dan environment variables di dalamnya

const JWT_SECRET = process.env.JWT_SECRET;

// tujuan middleware ini untuk melindungi route agar hanya bisa diakses oleh user yang sudah login
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]; // setiap request perlu memiliki otorisasi bearer token
  const token = authHeader && authHeader.split(" ")[1]; // untuk memisahkan header dan token

  // validasi jika otorisasi tidak diberikan
  if (!token) {
    return res.status(401).json({
      msg: "Akses ditolak: Token autentikasi tidak ditemukan. Silakan login terlebih dahulu.",
    });
  }

  // verifikasi masa berlaku token
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    // validasi jika token tidak valid
    if (err) {
      return res.status(403).json({
        msg: "Sesi Anda telah berakhir atau token tidak valid. Silakan login kembali.",
      });
    }
    // menyimpan informasi user yang login ke dalam req.user dan req.admin (untuk backward compatibility)
    req.user = decoded;
    req.admin = decoded;
    next();
  });
};

// middleware untuk membatasi akses berdasarkan role pengguna (RBAC)
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        msg: "Akses ditolak: Informasi hak akses (role) tidak valid.",
      });
    }

    const userRole = typeof req.user.role === "string" ? req.user.role : req.user.role?.name;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        msg: `Akses ditolak: Role '${userRole}' tidak memiliki izin untuk tindakan ini.`,
      });
    }

    next();
  };
};

