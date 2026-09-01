import { DataTypes } from "sequelize";
import db from "../config/Database.js";

// definisi skema tabel admins untuk data otentikasi administrator panel
const Admin = db.define(
  "admins",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // memastikan email admin bersifat unik di database
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false, // menyimpan password yang sudah di-hash (bcrypt)
    },
  },
  {
    freezeTableName: true,
  }
);

export default Admin;
