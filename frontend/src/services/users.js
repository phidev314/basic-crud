import { http } from "./api";

// Service fungsi untuk API User
export const userService = {
  // Mengambil seluruh data user dengan parameter search, pagination, dsb.
  getUsers: (params = {}) => {
    return http.get("/users", params);
  },

  // Mengambil data user berdasarkan ID (termasuk relasi addresses)
  getUserById: (id) => {
    return http.get(`/users/${id}`);
  },

  // Menambahkan user baru (bisa JSON atau FormData)
  createUser: (userData) => {
    return http.post("/users", userData);
  },

  // Memperbarui data user (bisa JSON atau FormData)
  updateUser: (id, userData) => {
    return http.patch(`/users/${id}`, userData);
  },

  // Khusus upload foto avatar user
  uploadAvatar: (id, file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return http.post(`/users/${id}/avatar`, formData);
  },

  // Menghapus user
  deleteUser: (id) => {
    return http.delete(`/users/${id}`);
  },
};

export default userService;
