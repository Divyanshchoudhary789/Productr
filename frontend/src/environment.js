import axios from "axios";

export const api = axios.create({
    baseURL: "https://productr-backend-1qtl.onrender.com",
    withCredentials: true,
});

