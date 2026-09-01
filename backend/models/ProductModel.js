import { DataTypes } from "sequelize";
import db from "../config/Database.js";
import ProductCategory from "./ProductCategoryModel.js";

const Product = db.define(
  "products",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Nama produk tidak boleh kosong" },
      },
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        isNumeric: { msg: "Harga harus berupa angka numerik" },
        min: { args: [0], msg: "Harga tidak boleh bernilai negatif" },
      },
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: { msg: "Stok harus berupa bilangan bulat" },
        min: { args: [0], msg: "Stok tidak boleh bernilai negatif" },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: ProductCategory,
        key: "id",
      },
    },
  },
  {
    freezeTableName: true,
  }
);

// Definisi Relasi (Association)
ProductCategory.hasMany(Product, {
  foreignKey: "categoryId",
  as: "products",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

Product.belongsTo(ProductCategory, {
  foreignKey: "categoryId",
  as: "category",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

export default Product;
