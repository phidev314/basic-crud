import { http } from "./api";

// Service fungsi untuk API User
export const userService = {
  // Mengambil seluruh data user
  getUsers: () => {
    return http.get("/users");
  },

  // Mengambil data user berdasarkan ID
  getUserById: (id) => {
    return http.get(`/users/${id}`);
  },

  // Menambahkan user baru
  createUser: (userData) => {
    return http.post("/users", userData);
  },

  // Memperbarui data user
  updateUser: (id, userData) => {
    return http.patch(`/users/${id}`, userData);
  },

  // Menghapus user
  deleteUser: (id) => {
    return http.delete(`/users/${id}`);
  },
};

export default userService;
