/**
 * Kiểm tra ngày hết hạn thẻ (MM/YY hoặc MM/YYYY).
 * - Tháng: 01–12
 * - Năm: YY hoặc YYYY, không được ở quá khứ (so với tháng/năm hiện tại).
 */
export function validateExpiry(value: string): { valid: boolean; message?: string } {
  const trimmed = value.trim().replace(/\s/g, "");
  if (!trimmed) return { valid: false, message: "Vui lòng nhập ngày hết hạn (MM/YY)" };

  const match = trimmed.match(/^(\d{1,2})\s*\/\s*(\d{2,4})$/);
  if (!match) return { valid: false, message: "Định dạng: MM/YY (ví dụ 12/28)" };

  let month = parseInt(match[1], 10);
  let year = parseInt(match[2], 10);

  if (month < 1 || month > 12) return { valid: false, message: "Tháng phải từ 01 đến 12" };

  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;

  if (match[2].length <= 2) {
    if (year < 0 || year > 99) return { valid: false, message: "Năm không hợp lệ" };
    if (year < currentYear) return { valid: false, message: "Thẻ đã hết hạn" };
    if (year === currentYear && month < currentMonth)
      return { valid: false, message: "Thẻ đã hết hạn" };
  } else {
    const fullYear = year < 100 ? 2000 + year : year;
    if (fullYear < now.getFullYear()) return { valid: false, message: "Thẻ đã hết hạn" };
    if (fullYear === now.getFullYear() && month < currentMonth)
      return { valid: false, message: "Thẻ đã hết hạn" };
  }

  return { valid: true };
}
