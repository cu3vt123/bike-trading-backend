// src/services/api.ts
import axios from "axios";

// ------------------------------
// TYPES
// ------------------------------
type LoginData = {
    username: string;
    password: string;
};

type SignupData = {
    email?: string;
    username?: string;
    password: string;
};

type OrderData = any; // tạm thời (sau này có thể define rõ)

// ------------------------------
// BASE URL từ .env
// ------------------------------
const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api",
});

// ------------------------------
// INTERCEPTOR (JWT)
// ------------------------------
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ------------------------------
// AUTH
// ------------------------------
export const login = async ({ username, password }: LoginData) => {
    const res = await API.post("/auth/login", { username, password });
    return res.data; // { token, user }
};

export const signup = async (data: SignupData) => {
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

export const getBikeById = async (id: string) => {
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

export const getOrderById = async (id: string) => {
    const res = await API.get(`/buyer/orders/${id}`);
    return res.data;
};

export const createOrderVNPAY = async (orderData: OrderData) => {
    const res = await API.post("/buyer/orders/vnpay-checkout", orderData);
    return res.data;
};

export const completeOrder = async (orderId: string) => {
    const res = await API.put(`/buyer/orders/${orderId}/complete`);
    return res.data;
};

export const cancelOrder = async (orderId: string) => {
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