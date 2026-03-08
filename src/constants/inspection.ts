/**
 * Nhãn tiếng Việt thống nhất cho báo cáo kiểm định (trang chi tiết xe, đơn hàng, dialog).
 */
export const INSPECTION_ROW_LABELS = {
  frameIntegrity: "Độ nguyên khung",
  drivetrainHealth: "Tình trạng hệ truyền động",
  brakingSystem: "Hệ thống phanh",
} as const;

export const INSPECTION_OVERALL_LABEL = "Điểm tổng thể";

export type InspectionReportShape = {
  frameIntegrity: { score: number; label: string };
  drivetrainHealth: { score: number; label: string };
  brakingSystem: { score: number; label: string };
};
