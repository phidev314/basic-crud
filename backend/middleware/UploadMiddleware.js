import multer from "multer";
import path from "path";
import fs from "fs";

// memastikan direktori uploads/users dan uploads/products tersedia
const userUploadDir = path.resolve("uploads/users");
if (!fs.existsSync(userUploadDir)) {
  fs.mkdirSync(userUploadDir, { recursive: true });
}

const productUploadDir = path.resolve("uploads/products");
if (!fs.existsSync(productUploadDir)) {
  fs.mkdirSync(productUploadDir, { recursive: true });
}

// konfigurasi penyimpanan disk multer untuk avatar user
const userStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, userUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  },
});

// konfigurasi penyimpanan disk multer untuk gambar produk
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, productUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `product-${uniqueSuffix}${ext}`);
  },
});

// filter tipe file gambar
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Tipe file tidak didukung. Harap upload file gambar dengan format JPG, JPEG, PNG, WEBP, atau GIF."
      ),
      false
    );
  }
};

// middleware multer untuk upload avatar user
export const uploadUserAvatar = multer({
  storage: userStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // maksimal 5mb
  },
  fileFilter: fileFilter,
});

// middleware multer untuk upload foto produk
export const uploadProductImage = multer({
  storage: productStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // maksimal 5mb
  },
  fileFilter: fileFilter,
});

// middleware penangan error multer
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ msg: "Ukuran file terlalu besar. Maksimal 5MB." });
    }
    return res.status(400).json({ msg: `Upload error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ msg: err.message || "Gagal mengupload file" });
  }
  next();
};
