import db from "./config/Database.js";
import Role from "./models/RoleModel.js";
import "./models/UserModel.js";
import "./models/AddressModel.js";
import "./models/ProductCategoryModel.js";
import "./models/ProductModel.js";

// script sequelize untuk membersihkan & membuat ulang semua tabel (drop & re-create)
(async () => {
  try {
    console.log("Sedang membersihkan database via Sequelize...");

    // Nonaktifkan foreign key checks sementara agar drop table lama berjalan lancar
    await db.query("SET FOREIGN_KEY_CHECKS = 0");

    // Hapus tabel admins lama jika masih ada
    await db.query("DROP TABLE IF EXISTS admins");
    console.log("Tabel lama 'admins' berhasil dihapus jika ada.");

    // force: true akan menjalankan DROP TABLE IF EXISTS lalu membuat ulang tabel baru yang kosong
    await db.sync({ force: true });

    // Aktifkan kembali foreign key checks
    await db.query("SET FOREIGN_KEY_CHECKS = 1");

    console.log("Database berhasil dibersihkan dan di-reset bersih!");

    // Seeding roles default (hanya 2 jenis: admin & user)
    console.log("Sedang melakukan seeding default roles...");
    const defaultRoles = [
      { name: "admin", description: "Administrator dengan akses penuh" },
      { name: "user", description: "Pengguna reguler / pelanggan" },
    ];

    for (const roleData of defaultRoles) {
      await Role.create(roleData);
    }
    console.log("Default roles (admin, user) berhasil dibuat.");

    process.exit(0);
  } catch (error) {
    console.error("Gagal membersihkan database:", error.message);
    try {
      await db.query("SET FOREIGN_KEY_CHECKS = 1");
    } catch (_) {}
    process.exit(1);
  }
})();

