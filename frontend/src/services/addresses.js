import { http } from "./api";

// Service fungsi untuk API Alamat (Address)
export const addressService = {
  // Mengambil daftar alamat (bisa filter berdasarkan userId)
  getAddresses: (userId) => {
    const params = userId ? { userId } : {};
    return http.get("/addresses", params);
  },

  // Mengambil data alamat berdasarkan ID
  getAddressById: (id) => {
    return http.get(`/addresses/${id}`);
  },

  // Menambahkan alamat baru (untuk userId tertentu)
  createAddress: (addressData) => {
    return http.post("/addresses", addressData);
  },

  // Memperbarui data alamat
  updateAddress: (id, addressData) => {
    return http.put(`/addresses/${id}`, addressData);
  },

  // Menjadikan alamat sebagai alamat utama
  setPrimaryAddress: (id) => {
    return http.patch(`/addresses/${id}/primary`);
  },

  // Menghapus alamat
  deleteAddress: (id) => {
    return http.delete(`/addresses/${id}`);
  },
};

export default addressService;
