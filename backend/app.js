import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import os from "os";
import db from "./config/Database.js";

// import model agar relasi tabel (associations) terdaftar ke sequelize
import Role from "./models/RoleModel.js";
import "./models/UserModel.js";
import "./models/AddressModel.js";
import "./models/ProductCategoryModel.js";
import "./models/ProductModel.js";

// import file route untuk masing-masing modul
import UserRoute from "./routes/UserRoute.js";
import AddressRoute from "./routes/AddressRoute.js";
import AuthRoute from "./routes/AuthRoute.js";
import ProductRoute from "./routes/ProductRoute.js";
import ProductCategoryRoute from "./routes/ProductCategoryRoute.js";
import DashboardRoute from "./routes/DashboardRoute.js";

dotenv.config(); // untuk membaca file .env dan environment variables di dalamnya

const app = express();
const PORT = process.env.PORT || 8000;

// fungsi untuk memastikan default role tersedia di database (hanya 2 jenis: admin & user)
const seedDefaultRoles = async () => {
  const defaultRoles = [
    { name: "admin", description: "Administrator dengan akses penuh" },
    { name: "user", description: "Pengguna reguler / pelanggan" },
  ];

  for (const roleData of defaultRoles) {
    const existing = await Role.findOne({ where: { name: roleData.name } });
    if (!existing) {
      await Role.create(roleData);
    }
  }
};

// sync db (alter: true memastikan kolom baru dan relasi tabel otomatis disinkronkan ke mysql)
(async () => {
  try {
    await db.sync({ alter: true });
    await seedDefaultRoles();
    console.log("Database synchronized successfully with associations & default roles.");
  } catch (error) {
    console.error("Database connection error:", error.message);
  }
})();

// middleware global express
app.use(cors()); // mengizinkan permintaan lintas domain (cors) dari frontend
app.use(express.json()); // membaca payload request berformat json
app.use(express.urlencoded({ extended: true })); // membaca form-data url encoded

// menyajikan folder uploads sebagai file statis untuk akses gambar foto profil & produk
const uploadsStaticDir = process.env.VERCEL
  ? path.join(os.tmpdir(), "uploads")
  : path.resolve("uploads");
app.use("/uploads", express.static(uploadsStaticDir));

// endpoint kesehatan / root untuk pengecekan status server
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Healthy",
    timestamp: new Date().toISOString(),
  });
});

// mendaftarkan endpoint routes ke aplikasi express
app.use(AuthRoute);
app.use(DashboardRoute);
app.use(UserRoute);
app.use(AddressRoute);
app.use(ProductRoute);
app.use(ProductCategoryRoute);

// menjalankan server backend pada port yang ditentukan (hanya saat berjalan mandiri/lokal)
if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`Server up and running on port ${PORT}...`));
}

export default app;
