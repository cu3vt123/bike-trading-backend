import "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    /** Tránh lặp vô hạn khi retry sau refresh token */
    _retry?: boolean;
  }
}
