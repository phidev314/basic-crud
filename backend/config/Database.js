import { Sequelize } from "sequelize";
import mysql2 from "mysql2";
import dotenv from "dotenv";

dotenv.config(); // untuk membaca file .env dan environment variables di dalamnya

// mengambil variabel konfigurasi database dari environment (.env)
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;
const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;

const isSSL =
  process.env.DB_SSL === "true" ||
  process.env.DB_SSL === "1" ||
  dbPort === 4000;

// inisialisasi instance sequelize orm untuk koneksi ke database mysql
const db = new Sequelize(dbName, dbUser, dbPass, {
  host: dbHost,
  port: dbPort,
  dialect: "mysql",
  dialectModule: mysql2, // memberitahu Vercel bundler untuk menyertakan modul mysql2
  dialectOptions: isSSL
    ? {
        ssl: {
          minVersion: "TLSv1.2",
          rejectUnauthorized: false,
        },
      }
    : {},
});

export default db;
