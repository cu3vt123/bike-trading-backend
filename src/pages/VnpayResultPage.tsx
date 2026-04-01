import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Trang này mở sau khi VNPAY redirect về backend /payment/vnpay-return,
 * rồi backend redirect tiếp tới đây với query ?gate=return&ok=1|0&...
 */
function mapReasonToKey(reason: string | null): string | null {
  if (!reason) return null;
  const r = reason.toLowerCase();
  if (r === "checksum") return "vnpayResult.reasonExplainChecksum";
  if (r === "config") return "vnpayResult.reasonExplainConfig";
  return "vnpayResult.reasonExplainUnknown";
}

export default function VnpayResultPage() {
  const { t } = useTranslation();
  const [search] = useSearchParams();
  const ok = search.get("ok") === "1";
  const gate = search.get("gate") ?? "";
  const orderCode = search.get("orderCode") ?? "";
  const listingId = search.get("listingId") ?? "";
  const orderId = search.get("orderId") ?? "";
  const responseCode = search.get("vnp_ResponseCode") ?? "";
  const txnStatus = search.get("vnp_TransactionStatus") ?? "";
  const reason = search.get("reason");

  const reasonExplainKey = mapReasonToKey(reason);
  const hasTechnicalDetails =
    Boolean(orderCode || responseCode || txnStatus || reason);

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            {ok ? t("vnpayResult.successTitleUser") : t("vnpayResult.failTitleUser")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p className="text-muted-foreground leading-relaxed">
            {ok ? t("vnpayResult.successLead") : t("vnpayResult.failLead")}
          </p>

          {!ok && reasonExplainKey && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-foreground">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                {t("vnpayResult.whatHappened")}
              </p>
              <p className="mt-2 text-sm leading-relaxed">{t(reasonExplainKey)}</p>
            </div>
          )}

          {ok && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("vnpayResult.successIpnHint")}
            </p>
          )}

          {hasTechnicalDetails && (
            <details className="rounded-md border border-border bg-muted/40 text-left">
              <summary className="cursor-pointer select-none px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground">
                {t("vnpayResult.detailsToggle")}
              </summary>
              <ul className="space-y-1.5 border-t border-border px-3 py-3 font-mono text-[11px] text-muted-foreground">
                {orderCode ? (
                  <li>
                    <span className="text-foreground/70">{t("vnpayResult.labelOrderRef")}</span>{" "}
                    {orderCode}
                  </li>
                ) : null}
                {responseCode ? (
                  <li>
                    <span className="text-foreground/70">{t("vnpayResult.labelResponseCode")}</span>{" "}
                    {responseCode}
                    {responseCode === "00" && ok ? ` (${t("vnpayResult.code00ok")})` : null}
                  </li>
                ) : null}
                {txnStatus ? (
                  <li>
                    <span className="text-foreground/70">{t("vnpayResult.labelTxnStatus")}</span>{" "}
                    {txnStatus}
                  </li>
                ) : null}
                {reason ? (
                  <li>
                    <span className="text-foreground/70">{t("vnpayResult.labelInternalReason")}</span>{" "}
                    {reason}
                  </li>
                ) : null}
              </ul>
            </details>
          )}

          {gate === "buyer" && listingId ? (
            <Button asChild className="w-full">
              <Link
                to={
                  orderId
                    ? `/transaction/${listingId}?orderId=${encodeURIComponent(orderId)}`
                    : `/transaction/${listingId}`
                }
                state={{
                  orderId,
                  paymentMethod: { type: "VNPAY_SANDBOX" as const, ref: orderCode },
                }}
              >
                {ok
                  ? t("vnpayResult.continueOrder")
                  : t("vnpayResult.continueOrderRetryPayment")}
              </Link>
            </Button>
          ) : null}
          <Button asChild variant="outline" className="w-full">
            <Link to="/payment/vnpay-demo">{t("vnpayResult.backDemo")}</Link>
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link to="/">{t("vnpayResult.home")}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
