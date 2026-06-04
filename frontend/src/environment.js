import axios from "axios";

export const api = axios.create({
    baseURL: "https://productr-backend-1qtl.onrender.com",
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

