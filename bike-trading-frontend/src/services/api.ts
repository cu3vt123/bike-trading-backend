import axios from "axios";

// Kiểu dữ liệu Bike
export interface Bike {
    id?: number;
    name: string;
    type: string;
    weight: number;
    material: string;
    brake: string;
    price: number;
    image: string;
    featured?: boolean;
    bestseller?: boolean;
}

const API_URL = import.meta.env.VITE_API_URL;
const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Gọi API lấy danh sách tất cả xe
export const getBikes = async (): Promise<Bike[]> => {
    try {
        const { data } = await api.get<Bike[]>("/");
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// Lấy chi tiết 1 xe theo id
export const getBikeById = async (id: number): Promise<Bike> => {
    try {
        const { data } = await api.get<Bike>(`/${id}`);
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// Tạo mới 1 xe
export const createBike = async (bikeData: Bike): Promise<Bike> => {
    try {
        const { data } = await api.post<Bike>("/", bikeData);
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// Cập nhật 1 xe
export const updateBike = async (id: number, bikeData: Bike): Promise<Bike> => {
    try {
        const { data } = await api.put<Bike>(`/${id}`, bikeData);
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// Xoá 1 xe
export const deleteBike = async (id: number): Promise<void> => {
    try {
        await api.delete(`/${id}`);
    } catch (error) {
        console.error(error);
        throw error;
    }
};