import { DataTypes } from "sequelize";
import db from "../config/Database.js";

// definisi skema tabel roles untuk RBAC (Role-Based Access Control)
const Role = db.define(
  "roles",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: "Nama role tidak boleh kosong" },
      },
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

export default Role;
