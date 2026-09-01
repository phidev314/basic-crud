import { DataTypes } from "sequelize";
import db from "../config/Database.js";
import User from "./UserModel.js";

// definisi skema tabel addresses untuk menyimpan data alamat pengguna
const Address = db.define(
  "addresses",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    label: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Rumah", // label alamat seperti: rumah, kantor, toko, dll
    },
    street: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Alamat jalan tidak boleh kosong" },
      },
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Kota / Kabupaten tidak boleh kosong" },
      },
    },
    province: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Provinsi tidak boleh kosong" },
      },
    },
    postalCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // menandai apakah ini alamat utama/default pengiriman
    },
  },
  {
    freezeTableName: true,
  }
);

// definisi relasi 1-to-n (one-to-many): satu user dapat memiliki banyak address
User.hasMany(Address, {
  foreignKey: "userId",
  as: "addresses",
  onDelete: "CASCADE", // jika user dihapus, semua alamat miliknya otomatis ikut terhapus
  onUpdate: "CASCADE",
});

// relasi n-to-1 (many-to-one): setiap address merujuk ke satu user
Address.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

export default Address;
