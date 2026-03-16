/**
 * Kiểm tra ngày hết hạn thẻ (MM/YY hoặc MM/YYYY).
 * - Tháng: 01–12
 * - Năm: YY hoặc YYYY, không được ở quá khứ (so với tháng/năm hiện tại).
 * Trả về errorKey để component dùng t(errorKey) cho i18n.
 */
export function validateExpiry(value: string): { valid: boolean; errorKey?: string } {
  const trimmed = value.trim().replace(/\s/g, "");
  if (!trimmed) return { valid: false, errorKey: "auth.errExpRequired" };

  const match = trimmed.match(/^(\d{1,2})\s*\/\s*(\d{2,4})$/);
  if (!match) return { valid: false, errorKey: "auth.errExpFormat" };

  const month = parseInt(match[1], 10);
  const year = parseInt(match[2], 10);

  if (month < 1 || month > 12) return { valid: false, errorKey: "auth.errExpMonth" };

  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;

  if (match[2].length <= 2) {
    if (year < 0 || year > 99) return { valid: false, errorKey: "auth.errExpYear" };
    if (year < currentYear) return { valid: false, errorKey: "auth.errExpExpired" };
    if (year === currentYear && month < currentMonth)
      return { valid: false, errorKey: "auth.errExpExpired" };
  } else {
    const fullYear = year < 100 ? 2000 + year : year;
    if (fullYear < now.getFullYear()) return { valid: false, errorKey: "auth.errExpExpired" };
    if (fullYear === now.getFullYear() && month < currentMonth)
      return { valid: false, errorKey: "auth.errExpExpired" };
  }

  return { valid: true };
}
