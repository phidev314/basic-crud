import axios from "axios";

// Base URL konfigurasi backend API
const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL;

// Membuat instance axios dengan konfigurasi default
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000, // 10 detik timeout
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// Request Interceptor: Menambahkan auth token otomatis jika tersedia
api.interceptors.request.use(
    (config) => {
        const token =
            localStorage.getItem("token") || sessionStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Menstandarkan penanganan response dan error
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Format pesan error dari response server jika tersedia
        const customError = {
            status: error.response?.status,
            data: error.response?.data,
            message:
                error.response?.data?.msg ||
                error.response?.data?.message ||
                error.message ||
                "Terjadi kesalahan pada server",
        };

        // Penanganan khusus status 401 (Unauthorized)
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            sessionStorage.removeItem("token");
        }

        return Promise.reject(customError);
    }
);

// Wrapper method untuk mempermudah pemanggilan HTTP requests
export const http = {
    // GET: Mengambil data
    get: (url, params = {}, config = {}) => {
        return api.get(url, { params, ...config });
    },

    // POST: Menambahkan data baru
    post: (url, data = {}, config = {}) => {
        return api.post(url, data, config);
    },

    // PUT: Memperbarui seluruh data
    put: (url, data = {}, config = {}) => {
        return api.put(url, data, config);
    },

    // PATCH: Memperbarui sebagian data
    patch: (url, data = {}, config = {}) => {
        return api.patch(url, data, config);
    },

    // DELETE: Menghapus data
    delete: (url, config = {}) => {
        return api.delete(url, config);
    },

    // Custom request
    request: (config = {}) => {
        return api.request(config);
    },
};

// Export instance api sebagai default dan named export
export default api;
