import { DataTypes } from "sequelize";
import db from "../config/Database.js";

// definisi skema tabel users menggunakan sequelize
const User = db.define(
  "users",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Nama pengguna tidak boleh kosong" },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: { msg: "Format email tidak valid" },
        notEmpty: { msg: "Email tidak boleh kosong" },
      },
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Laki-laki",
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true, // menyimpan path file avatar/foto profil
    },
  },
  {
    freezeTableName: true, // mencegah sequelize mengubah nama tabel menjadi jamak (plural)
  }
);

export default User;
