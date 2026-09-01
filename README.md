# Full-Stack CRUD Application (User & Product Management)

Aplikasi Web Full-Stack modern untuk manajemen data pengguna (*User Management*) dan produk (*Product Management*) dengan sistem autentikasi **Admin terpisah (JWT & Bcrypt)** yang dibangun menggunakan **Node.js, Express, Sequelize, & MySQL** di sisi Backend serta **React 19, Bulma CSS, Lucide Icons, dan Atomic Design Pattern** di sisi Frontend.

---

## Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Tech Stack](#tech-stack)
- [Struktur Direktori](#struktur-direktori)
- [Arsitektur Komponen (Atomic Design)](#arsitektur-komponen-atomic-design)
- [Panduan Instalasi & Menjalankan](#panduan-instalasi--menjalankan)
  - [1. Prasyarat](#1-prasyarat)
  - [2. Konfigurasi Database](#2-konfigurasi-database)
  - [3. Menjalankan Backend](#3-menjalankan-backend)
  - [4. Menjalankan Frontend](#4-menjalankan-frontend)
- [Halaman & Routing Frontend](#halaman--routing-frontend)
- [API Endpoints (Backend)](#api-endpoints-backend)

---

## Fitur Utama

- **Dashboard & Ringkasan Statistik**: Menampilkan 4 kartu statistik utama (Total Pengguna, Total Produk, Total Kategori, dan Status Sesi), quick actions, serta tabel preview pengguna & produk terbaru.
- **Persistent Sidebar Navigation**: Sidebar modern responsif dengan menu Dashboard, User Management, Product Management, dan Logout.
- **Autentikasi Admin Terpisah**: Model `Admin` terpisah dari data `Users` dengan endpoint Register, Login, dan Profile (`/auth/me`).
- **Keamanan Password (Bcrypt)**: Password admin di-hash secara aman menggunakan `bcryptjs` (salt 10) sebelum disimpan ke database.
- **Sesi Login JWT (JSON Web Token)**: Autentikasi berbasis token JWT yang tersimpan di `localStorage` dan dikirim via header `Authorization: Bearer <token>`.
- **Product & Category Management (Full CRUD)**:
  - Halaman Daftar Produk dengan Pagination, Filter Kategori, dan Live Search.
  - Halaman Khusus **Tambah Produk** (`/products/tambah`) dan **Edit Produk** (`/products/edit/:id`).
  - Relasi Sequelize antara Produk dan Kategori Produk (`Product.belongsTo(ProductCategory)`).
- **Proteksi API Route**: Endpoint manipulasi data (`POST`, `PATCH`, `DELETE` pada `/users`, `/products`, dan `/categories`) dilindungi oleh middleware `verifyToken`.
- **Protected Routes & Auto Redirect**: Rute dashboard frontend hanya bisa diakses oleh admin yang telah login; jika belum login, otomatis dialihkan ke `/login`.
- **Atomic Design Pattern & Lucide Icons**: Komponen modular (*Atoms, Molecules, Organisms, Templates*) dan icon vektor SVG modern dari `lucide-react`.

---

## Tech Stack

### **Backend**
| Teknologi | Kegunaan |
|---|---|
| **Node.js** | JavaScript Runtime environment |
| **Express.js** | Web framework untuk REST API |
| **Sequelize** | ORM (Object-Relational Mapping) untuk SQL |
| **MySQL2** | Driver database MySQL |
| **bcryptjs** | Hashing password admin |
| **jsonwebtoken** | Pembuatan dan verifikasi token autentikasi JWT |
| **dotenv** | Manajemen environment variables |
| **CORS** | Middleware Cross-Origin Resource Sharing |
| **Nodemon** | Auto-reload server saat development |

### **Frontend**
| Teknologi | Kegunaan |
|---|---|
| **React 19** | Library UI modern berbasis komponen |
| **Bulma CSS** | CSS Framework berbasis Flexbox yang ringan |
| **Lucide React** | Koleksi icon vektor SVG modern |
| **React Router DOM (v7)** | Client-side routing & Protected Routes |
| **Axios** | HTTP Client dengan interceptor token JWT |

---

## Struktur Direktori

```text
FullStack-Small-Project-tutorials/
├── backend/
│   ├── config/
│   │   └── Database.js          # Konfigurasi koneksi MySQL via Sequelize
│   ├── controllers/
│   │   ├── AuthController.js    # Logika Register, Login, & GetMe Admin
│   │   ├── UserController.js    # Logika CRUD User
│   │   ├── ProductController.js # Logika CRUD Product (Pagination, Search, Filter)
│   │   └── ProductCategoryController.js # Logika CRUD Category
│   ├── middleware/
│   │   └── AuthMiddleware.js    # Middleware verifikasi token JWT
│   ├── models/
│   │   ├── AdminModel.js        # Schema model Admin (tabel admins)
│   │   ├── UserModel.js         # Schema model User (tabel users)
│   │   ├── ProductModel.js      # Schema model Product (tabel products)
│   │   └── ProductCategoryModel.js # Schema model Category (tabel product_categories)
│   ├── routes/
│   │   ├── AuthRoute.js         # Rute API /auth/*
│   │   ├── UserRoute.js         # Rute API /users
│   │   ├── ProductRoute.js      # Rute API /products
│   │   └── ProductCategoryRoute.js # Rute API /categories
│   ├── reset-db.js              # Script reset/clearing database
│   ├── .env                     # Konfigurasi JWT & Database Backend
│   ├── .env.example
│   ├── index.js                 # Entrypoint server Express (Port 8000)
│   └── package.json
│
├── frontend/
│   ├── public/                  # Static assets & HTML template
│   ├── src/
│   │   ├── components/          # Reusable UI Components (Atomic Design)
│   │   │   ├── atoms/           # Button, Input, Select, Tag
│   │   │   ├── molecules/       # Breadcrumbs, FormField, Modal, Notification, SearchBar
│   │   │   ├── organisms/       # Navbar, Sidebar, PageHeader, ProtectedRoute, UserForm, ProductForm, UserTable
│   │   │   ├── templates/       # MainLayout
│   │   │   └── index.js         # Barrel export komponen
│   │   ├── pages/               # Halaman Aplikasi
│   │   │   ├── auth/
│   │   │   │   ├── login/       # Halaman Login Admin
│   │   │   │   └── register/    # Halaman Registrasi Admin Baru
│   │   │   ├── dashboard/       # Halaman Dashboard & Ringkasan Statistik
│   │   │   ├── user-management/ # Halaman Daftar, Tambah & Edit Pengguna
│   │   │   └── products/        # Halaman Daftar, Tambah & Edit Produk
│   │   ├── services/            # API & Service Layer
│   │   │   ├── api.js           # Axios instance & token interceptors
│   │   │   ├── auth.js          # Service login, register, logout, session
│   │   │   ├── users.js         # Service CRUD user
│   │   │   ├── products.js      # Service CRUD product & category
│   │   │   └── index.js
│   │   ├── App.js               # Konfigurasi routing & ProtectedRoute
│   │   └── index.js             # Entrypoint React
│   ├── .env                     # Konfigurasi API Base URL Frontend
│   ├── .env.example
│   └── package.json
│
├── .gitignore                   # Git ignore file
└── README.md                    # Dokumentasi utama proyek
```

---

## Halaman & Routing Frontend

| Rute URL | Tipe Akses | Komponen Halaman | Deskripsi |
|---|---|---|---|
| `/login` | Public | `pages/auth/login/index.jsx` | Form login akun Admin |
| `/register` | Public | `pages/auth/register/index.jsx` | Form pendaftaran akun Admin baru |
| `/` | Protected | Redirect ke `/dashboard` | Mengarahkan user yang telah login ke Dashboard |
| `/dashboard` | Protected | `pages/dashboard/index.jsx` | Ringkasan statistik sistem, quick actions, dan preview tabel |
| `/user-management` | Protected | `pages/user-management/index.jsx` | Tabel daftar user dengan live search dan modal delete |
| `/user-management/tambah` | Protected | `pages/user-management/tambah/index.jsx` | Form input tambah pengguna baru |
| `/user-management/edit/:id` | Protected | `pages/user-management/edit/[id].jsx` | Form edit data pengguna berdasarkan ID |
| `/products` | Protected | `pages/products/index.jsx` | Tabel katalog produk, live search, filter kategori, dan modal delete |
| `/products/tambah` | Protected | `pages/products/tambah/index.jsx` | Form input tambah produk baru |
| `/products/edit/:id` | Protected | `pages/products/edit/[id].jsx` | Form edit data produk berdasarkan ID |

---

## API Endpoints (Backend)

Base URL: `http://localhost:8000`

### 1. Endpoint Autentikasi Admin

| Method | Endpoint | Akses | Deskripsi | Request Body (JSON) |
|---|---|---|---|---|
| `POST` | `/auth/register` | Public | Registrasi akun Admin baru | `{ "name": "Admin", "email": "admin@mail.com", "password": "secret", "confPassword": "secret" }` |
| `POST` | `/auth/login` | Public | Login Admin & menerima token JWT | `{ "email": "admin@mail.com", "password": "secret" }` |
| `GET` | `/auth/me` | Protected | Mendapatkan profil Admin login saat ini | Header `Authorization: Bearer <token>` |

---

### 2. Endpoint Data Pengguna (Users)

| Method | Endpoint | Akses | Deskripsi | Request Body (JSON) |
|---|---|---|---|---|
| `GET` | `/users` | Public | Mengambil seluruh data user | - |
| `GET` | `/users/:id` | Public | Mengambil data user berdasarkan ID | - |
| `POST` | `/users` | **Protected** | Menambahkan user baru | `{ "name": "string", "email": "string", "gender": "Laki-laki/Perempuan" }` |
| `PATCH` | `/users/:id` | **Protected** | Mengubah data user berdasarkan ID | `{ "name": "string", "email": "string", "gender": "Laki-laki/Perempuan" }` |
| `DELETE` | `/users/:id` | **Protected** | Menghapus data user berdasarkan ID | - |

---

### 3. Endpoint Produk (Products)

| Method | Endpoint | Akses | Query Params | Request Body (JSON) |
|---|---|---|---|---|
| `GET` | `/products` | Public | `search`, `categoryId`, `minPrice`, `maxPrice`, `page`, `limit`, `sortBy`, `order` | - |
| `GET` | `/products/:id` | Public | - | - |
| `POST` | `/products` | **Protected** | - | `{ "name": "string", "price": 10000, "stock": 50, "description": "string", "categoryId": 1 }` |
| `PATCH` | `/products/:id` | **Protected** | - | `{ "name": "string", "price": 15000, "stock": 40, "categoryId": 2 }` |
| `DELETE` | `/products/:id` | **Protected** | - | - |

---

### 4. Endpoint Kategori Produk (Categories)

| Method | Endpoint | Akses | Deskripsi | Request Body (JSON) |
|---|---|---|---|---|
| `GET` | `/categories` | Public | Mengambil daftar seluruh kategori | - |
| `GET` | `/categories/:id` | Public | Mengambil kategori beserta daftar produk di dalamnya | - |
| `POST` | `/categories` | **Protected** | Menambahkan kategori baru | `{ "name": "string", "description": "string" }` |
| `PATCH` | `/categories/:id` | **Protected** | Mengubah kategori | `{ "name": "string", "description": "string" }` |
| `DELETE` | `/categories/:id` | **Protected** | Menghapus kategori | - |
