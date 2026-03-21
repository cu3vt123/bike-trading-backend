import { isAxiosError } from "axios";

/**
 * Lấy thông báo lỗi có nghĩa từ response API (thay vì chỉ "Something went wrong").
 * Khớp pattern backend: `{ message: string }` hoặc axios default.
 */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    if (typeof data?.message === "string" && data.message.trim()) {
      return data.message.trim();
    }
    if (err.code === "ECONNABORTED" || err.message?.toLowerCase().includes("timeout")) {
      return "Hết thời gian chờ máy chủ. Vui lòng thử lại.";
    }
    if (!err.response) {
      return "Không kết nối được máy chủ. Kiểm tra mạng hoặc API đang chạy.";
    }
    if (err.response.status === 404) {
      return "Không tìm thấy dữ liệu (404).";
    }
    if (err.response.status === 403) {
      return "Bạn không có quyền thực hiện thao tác này (403).";
    }
    if (err.response.status >= 500) {
      return "Máy chủ đang gặp sự cố. Vui lòng thử lại sau.";
    }
  }
  if (err instanceof Error && err.message.trim()) {
    return err.message.trim();
  }
  return fallback;
}
