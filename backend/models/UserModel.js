import { DataTypes } from "sequelize";
import db from "../config/Database.js";
import Role from "./RoleModel.js";

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
      unique: true,
      validate: {
        isEmail: { msg: "Format email tidak valid" },
        notEmpty: { msg: "Email tidak boleh kosong" },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true, // opsional jika user dibuat manual tanpa akses login, atau wajib saat registrasi
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
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Role,
        key: "id",
      },
    },
  },
  {
    freezeTableName: true, // mencegah sequelize mengubah nama tabel menjadi jamak (plural)
  }
);

// Definisi relasi User dan Role
User.belongsTo(Role, { foreignKey: "roleId", as: "role" });
Role.hasMany(User, { foreignKey: "roleId", as: "users" });

export default User;
