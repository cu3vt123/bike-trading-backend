import { useTranslation } from "react-i18next";
import { BicycleLoadingBlock } from "@/components/common/BicycleLoader";

/** Fallback cho React.lazy + Suspense — cảm giác tải rõ ràng hơn "Loading..." */
export function RouteFallback() {
  const { t } = useTranslation();
  return (
    <div
      className="flex min-h-[30vh] flex-col items-center justify-center gap-3 py-16"
      aria-busy="true"
      aria-label={t("common.loadingPage")}
    >
      <BicycleLoadingBlock message={t("common.loading")} size="lg" />
    </div>
  );
}
