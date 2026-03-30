import { QRCodeSVG } from "qrcode.react";
import { useTranslation } from "react-i18next";
import { BicycleLoadingBlock } from "@/components/common/BicycleLoader";

export type QrPaymentDisplay = {
  qrContent: string;
  paymentReference: string;
  amountVnd: number;
  provider: "VNPAY";
};

type Props = {
  data: QrPaymentDisplay | null;
  loading?: boolean;
};

export function QrPaymentPanel({ data, loading }: Props) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 p-6">
        <BicycleLoadingBlock message={t("checkout.qrLoading")} size="sm" />
      </div>
    );
  }

  if (!data?.qrContent) return null;

  const amount =
    typeof data.amountVnd === "number" && !Number.isNaN(data.amountVnd)
      ? data.amountVnd
      : 0;

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
      <p className="text-center text-xs font-semibold text-foreground">
        {t("checkout.qrVnpayLabel")}
      </p>
      <p className="mt-1 text-center text-[11px] text-muted-foreground">
        {t("checkout.qrAmount", { amount: amount.toLocaleString("vi-VN") })}
      </p>
      <div className="mt-3 flex justify-center rounded-lg bg-white p-3 dark:bg-card">
        <QRCodeSVG value={data.qrContent} size={192} level="M" includeMargin />
      </div>
      <p className="mt-2 text-center font-mono text-[11px] text-muted-foreground">
        {t("checkout.qrReference")}: {data.paymentReference}
      </p>
      <p className="mt-2 text-center text-[11px] text-muted-foreground whitespace-pre-line">
        {t("checkout.qrVnpayHelp")}
      </p>
    </div>
  );
}
