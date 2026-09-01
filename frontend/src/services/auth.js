import { http } from "./api";

// Service fungsi untuk Otentikasi Admin
export const authService = {
  // login admin
  login: async (credentials, passwordParam) => {
    const payload =
      typeof credentials === "object" && credentials !== null
        ? credentials
        : { email: credentials, password: passwordParam };
    const response = await http.post("/auth/login", payload);
    if (response.data?.token) {
      localStorage.setItem("token", response.data.token);
      if (response.data?.admin) {
        localStorage.setItem("admin", JSON.stringify(response.data.admin));
      }
    }
    return response.data;
  },

  // Register admin baru
  register: async (adminData) => {
    const response = await http.post("/auth/register", adminData);
    return response.data;
  },

  // Logout admin
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("admin");
  },

  // Mengambil profile admin yang sedang login
  getProfile: async () => {
    const response = await http.get("/auth/me");
    return response.data;
  },

  // Memeriksa apakah admin sedang login (token tersedia)
  isAuthenticated: () => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    return Boolean(token);
  },

  // Mendapatkan data admin dari localStorage
  getAdmin: () => {
    const adminStr =
      localStorage.getItem("admin") || sessionStorage.getItem("admin");
    if (!adminStr) return null;
    try {
      return JSON.parse(adminStr);
    } catch {
      return null;
    }
  },
};

export default authService;
