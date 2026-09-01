import { DataTypes } from "sequelize";
import db from "../config/Database.js";

// definisi skema tabel product_categories untuk pengelompokan kategori produk
const ProductCategory = db.define(
  "product_categories",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Nama kategori tidak boleh kosong" },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

export default ProductCategory;
