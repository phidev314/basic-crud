import db from "./config/Database.js";
import "./models/UserModel.js";
import "./models/AdminModel.js";
import "./models/ProductCategoryModel.js";
import "./models/ProductModel.js";

// script sequelize untuk membersihkan & membuat ulang semua tabel (drop & re-create)
(async () => {
  try {
    console.log("Sedang membersihkan database via Sequelize...");
    // force: true akan menjalankan DROP TABLE IF EXISTS lalu membuat ulang tabel baru yang kosong
    await db.sync({ force: true });
    console.log("Database berhasil dibersihkan dan di-reset bersih!");
    process.exit(0);
  } catch (error) {
    console.error("Gagal membersihkan database:", error.message);
    process.exit(1);
  }
})();
