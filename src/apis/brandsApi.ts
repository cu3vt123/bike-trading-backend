import apiClient from "@/lib/apiClient";
import { API_PATHS } from "@/lib/apiConfig";

export type Brand = {
  id: string;
  name: string;
  slug?: string;
};

export const brandsApi = {
  /** Public: danh sách brands active (cho seller form) */
  getList: (): Promise<Brand[]> =>
    apiClient
      .get(API_PATHS.BRANDS.LIST)
      .then((r) => r.data?.data ?? r.data ?? []),
};
