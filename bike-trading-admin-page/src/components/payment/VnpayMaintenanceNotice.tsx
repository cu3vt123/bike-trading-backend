import { Construction } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

/** Thông báo tạm ngưng cổng VNPay — logic API giữ nguyên, chỉ ẩn luồng UI. */
export function VnpayMaintenanceNotice({ className }: Props) {
  const { t } = useTranslation();
  return (
    <div
      role="status"
      className={cn(
        "rounded-xl border border-amber-500/45 bg-amber-500/10 p-4 text-sm",
        className,
      )}
    >
      <div className="flex gap-3">
        <Construction
          className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400"
          aria-hidden
        />
        <div>
          <p className="font-semibold text-foreground">
            {t("payment.vnpayMaintenanceTitle")}
          </p>
          <p className="mt-1 text-muted-foreground">
            {t("payment.vnpayMaintenanceDesc")}
          </p>
        </div>
      </div>
    </div>
  );
}
