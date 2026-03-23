// src/services/api.js
import axios from "axios";

// ------------------------------
// BASE URL từ .env
// ------------------------------
const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api",
});

// Nếu backend trả JWT, có thể set interceptor
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token"); // lưu token khi login
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// ------------------------------
// AUTH
// ------------------------------
export const login = async ({ username, password }) => {
    const res = await API.post("/auth/login", { username, password });
    return res.data; // { token, user }
};

export const signup = async (data) => {
    const res = await API.post("/auth/signup", data);
    return res.data;
};

export const getMe = async () => {
    const res = await API.get("/auth/me");
    return res.data;
};

// ------------------------------
// BIKES (Marketplace)
// ------------------------------
export const getBikes = async () => {
    const res = await API.get("/bikes");
    return res.data;
};

export const getBikeById = async (id) => {
    const res = await API.get(`/bikes/${id}`);
    return res.data;
};

// ------------------------------
// ORDERS (Buyer)
// ------------------------------
export const getOrders = async () => {
    const res = await API.get("/buyer/orders");
    return res.data;
};

export const getOrderById = async (id) => {
    const res = await API.get(`/buyer/orders/${id}`);
    return res.data;
};

export const createOrderVNPAY = async (orderData) => {
    const res = await API.post("/buyer/orders/vnpay-checkout", orderData);
    return res.data; // trả về paymentUrl
};

export const completeOrder = async (orderId) => {
    const res = await API.put(`/buyer/orders/${orderId}/complete`);
    return res.data;
};

export const cancelOrder = async (orderId) => {
    const res = await API.put(`/buyer/orders/${orderId}/cancel`);
    return res.data;
};

// ------------------------------
// BRANDS
// ------------------------------
export const getBrands = async () => {
    const res = await API.get("/brands");
    return res.data;
};