import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config(); // untuk membaca file .env dan environment variables di dalamnya

// mengambil variabel konfigurasi database dari environment (.env)
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;
const dbHost = process.env.DB_HOST;

// inisialisasi instance sequelize orm untuk koneksi ke database mysql
const db = new Sequelize(dbName, dbUser, dbPass, {
  host: dbHost,
  dialect: "mysql",
});

export default db;
