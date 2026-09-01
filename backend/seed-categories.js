import db from "./config/Database.js";
import ProductCategory from "./models/ProductCategoryModel.js";

/**
 * @description - file seeding database
 * @note - untuk menambahkan data categories pada database tanpa hit pada api
 * @note - file ini hanya digunakan sekali saat database baru pertama kali dibuat
 */

const categories = [
  {
    name: "Elektronik",
    description: "Perangkat elektronik, gadget, laptop, komputer, dan perlengkapannya",
  },
  {
    name: "Fashion & Pakaian",
    description: "Pakaian pria, wanita, anak-anak, sepatu, dan aksesoris mode",
  },
  {
    name: "Makanan & Minuman",
    description: "Produk kuliner, makanan kemasan, minuman segar, dan bahan pokok",
  },
  {
    name: "Kesehatan & Kecantikan",
    description: "Produk skincare, kosmetik, vitamin, dan perlengkapan perawatan tubuh",
  },
  {
    name: "Peralatan Rumah Tangga",
    description: "Peralatan dapur, perabot rumah, dekorasi, dan perlengkapan kebersihan",
  },
  {
    name: "Buku & Alat Tulis",
    description: "Buku bacaan, buku pelajaran, alat tulis kantor, dan perlengkapan sekolah",
  },
  {
    name: "Olahraga & Outdoor",
    description: "Peralatan olahraga, pakaian atletik, dan perlengkapan aktivitas outdoor",
  },
  {
    name: "Otomotif & Aksesoris",
    description: "Aksesoris kendaraan, suku cadang, dan perlengkapan perawatan otomotif",
  },
];

const seedCategories = async () => {
  try {
    console.log("Memulai proses seeding kategori produk...");

    await db.authenticate();
    await ProductCategory.sync();

    let createdCount = 0;
    let existingCount = 0;

    for (const cat of categories) {
      const [category, created] = await ProductCategory.findOrCreate({
        where: { name: cat.name },
        defaults: {
          description: cat.description,
        },
      });

      if (created) {
        console.log(`[BARU] Kategori "${category.name}" berhasil ditambahkan.`);
        createdCount++;
      } else {
        console.log(`[SUDAH ADA] Kategori "${category.name}" (ID #${category.id}) sudah terdaftar.`);
        existingCount++;
      }
    }

    console.log("\n==========================================");
    console.log(`Hasil Seeding Kategori:`);
    console.log(`- Berhasil ditambahkan : ${createdCount}`);
    console.log(`- Sudah ada sebelumnya : ${existingCount}`);
    console.log(`- Total kategori       : ${createdCount + existingCount}`);
    console.log("==========================================");
    console.log("Seeding kategori selesai dengan sukses!\n");

    process.exit(0);
  } catch (error) {
    console.error("Gagal melakukan seeding kategori:", error.message);
    process.exit(1);
  }
};

seedCategories();
