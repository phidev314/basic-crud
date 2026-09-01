import axios from "axios";

// base url konfigurasi backend api
const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

// membuat instance axios dengan konfigurasi default
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000, // 10 detik timeout
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// request interceptor: menambahkan auth token otomatis jika tersedia & support formdata
api.interceptors.request.use(
    (config) => {
        const token =
            localStorage.getItem("token") || sessionStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // jika request data bertipe formdata, biarkan browser menyetel content-type multipart/form-data
        if (config.data instanceof FormData) {
            delete config.headers["Content-Type"];
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// response interceptor: menstandarkan penanganan response dan error
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // format pesan error dari response server jika tersedia
        const customError = {
            status: error.response?.status,
            data: error.response?.data,
            message:
                error.response?.data?.msg ||
                error.response?.data?.message ||
                error.message ||
                "Terjadi kesalahan pada server",
        };

        // penanganan khusus status 401 (unauthorized)
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            sessionStorage.removeItem("token");
        }

        return Promise.reject(customError);
    }
);

// wrapper method untuk mempermudah pemanggilan http requests
export const http = {
    // get: mengambil data
    get: (url, params = {}, config = {}) => {
        return api.get(url, { params, ...config });
    },

    // post: menambahkan data baru
    post: (url, data = {}, config = {}) => {
        return api.post(url, data, config);
    },

    // put: memperbarui seluruh data
    put: (url, data = {}, config = {}) => {
        return api.put(url, data, config);
    },

    // patch: memperbarui sebagian data
    patch: (url, data = {}, config = {}) => {
        return api.patch(url, data, config);
    },

    // delete: menghapus data
    delete: (url, config = {}) => {
        return api.delete(url, config);
    },

    // custom request
    request: (config = {}) => {
        return api.request(config);
    },
};

// export instance api sebagai default dan named export
export default api;
