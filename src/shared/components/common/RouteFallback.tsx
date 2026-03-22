import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";

/** Fallback cho React.lazy + Suspense — cảm giác tải rõ ràng hơn "Loading..." */
export function RouteFallback() {
  const { t } = useTranslation();
  return (
    <div
      className="flex min-h-[30vh] flex-col items-center justify-center gap-3 py-16"
      aria-busy="true"
      aria-label={t("common.loadingPage")}
    >
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
    </div>
  );
}
