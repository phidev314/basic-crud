import { Op } from "sequelize";
import db from "./config/Database.js";
import Role from "./models/RoleModel.js";

/**
 * @description - File seeding data roles database
 * @note - Menyiapkan 2 jenis role utama: admin dan user
 */

const roles = [
  {
    name: "admin",
    description: "Administrator dengan akses penuh sistem dan manajemen data",
  },
  {
    name: "user",
    description: "Pengguna reguler / pelanggan aplikasi",
  },
];

const seedRoles = async () => {
  try {
    console.log("Memulai proses seeding roles...");

    await db.authenticate();
    await Role.sync();

    let createdCount = 0;
    let existingCount = 0;

    for (const roleItem of roles) {
      const [role, created] = await Role.findOrCreate({
        where: { name: roleItem.name },
        defaults: {
          description: roleItem.description,
        },
      });

      if (created) {
        console.log(`[BARU] Role "${role.name}" berhasil ditambahkan.`);
        createdCount++;
      } else {
        console.log(`[SUDAH ADA] Role "${role.name}" (ID #${role.id}) sudah terdaftar.`);
        existingCount++;
      }
    }

    // Bersihkan role lain jika ada di luar admin dan user (seperti finance lama)
    const deletedCount = await Role.destroy({
      where: {
        name: {
          [Op.notIn]: ["admin", "user"],
        },
      },
    });

    if (deletedCount > 0) {
      console.log(`[DIBERSIHKAN] ${deletedCount} role di luar 'admin' dan 'user' berhasil dihapus.`);
    }

    console.log("\n==========================================");
    console.log(`Hasil Seeding Roles:`);
    console.log(`- Berhasil ditambahkan : ${createdCount}`);
    console.log(`- Sudah ada sebelumnya : ${existingCount}`);
    console.log(`- Total roles aktif    : ${createdCount + existingCount}`);
    console.log("==========================================");
    console.log("Seeding roles selesai dengan sukses!\n");

    process.exit(0);
  } catch (error) {
    console.error("Gagal melakukan seeding roles:", error.message);
    process.exit(1);
  }
};

seedRoles();
