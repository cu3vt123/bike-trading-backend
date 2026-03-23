/** Gói đăng tin: quota đồng thời + mỗi tin hiển thị 30 ngày trên sàn */
export const LISTING_DURATION_DAYS = 30;

export const PLANS = {
  BASIC: {
    id: "BASIC",
    nameKey: "Gói đăng tin Basic",
    maxConcurrentListings: 7,
    priceVnd: 99_000,
    description:
      "Tối đa 7 tin đang hiển thị trên sàn cùng lúc. Mỗi tin tồn tại 30 ngày kể từ khi đăng.",
  },
  VIP: {
    id: "VIP",
    nameKey: "Gói đăng tin VIP",
    maxConcurrentListings: 15,
    priceVnd: 199_000,
    description:
      "Tối đa 15 tin đang hiển thị trên sàn cùng lúc. Mỗi tin tồn tại 30 ngày kể từ khi đăng. Bao gồm quyền gửi tin đi kiểm định: inspector đánh giá xe, sau duyệt tin có nhãn Đã kiểm định (Certified).",
  },
};

export const SUBSCRIPTION_PERIOD_DAYS = 30;
