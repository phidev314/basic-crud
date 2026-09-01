import { http } from "./api";

export const dashboardService = {
  // Mengambil agregasi statistik dashboard (total user, gender count, total produk, stok, item terbaru)
  getStats: () => {
    return http.get("/dashboard/stats");
  },
};

export default dashboardService;
