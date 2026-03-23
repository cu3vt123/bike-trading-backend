import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * URL backend cho module /payment (KHÔNG có /api ở cuối).
 * Chỉ chứa origin — không chứa hash secret.
 */
const PAYMENT_API_ORIGIN =
  (import.meta.env.VITE_PAYMENT_API_ORIGIN as string) || "http://localhost:8081";

export default function VnpayDemoPage() {
  const { t } = useTranslation();
  const [amount, setAmount] = useState("100000");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<string | null>(null);

  async function handlePay() {
    setError(null);
    setLastResponse(null);
    const n = parseInt(amount.replace(/\D/g, ""), 10);
    if (!Number.isFinite(n) || n <= 0) {
      setError(t("vnpayDemo.invalidAmount"));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${PAYMENT_API_ORIGIN}/payment/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amount: n }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok || !data.paymentUrl) {
        setError(
          typeof data.error === "string" ? data.error : t("vnpayDemo.createFailed"),
        );
        setLastResponse(JSON.stringify(data, null, 2));
        return;
      }
      setLastResponse(JSON.stringify(data, null, 2));
      /** Chuyển trình duyệt sang cổng VNPAY Sandbox (URL do backend ký sẵn) */
      window.location.href = data.paymentUrl as string;
    } catch (e) {
      setError(e instanceof Error ? e.message : t("vnpayDemo.networkError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>{t("vnpayDemo.title")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("vnpayDemo.subtitle")}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">{t("vnpayDemo.amountLabel")}</Label>
            <Input
              id="amount"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="100000"
            />
            <p className="text-xs text-muted-foreground">{t("vnpayDemo.amountHint")}</p>
          </div>
          {error && (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <Button type="button" className="w-full" disabled={loading} onClick={handlePay}>
            {loading ? t("vnpayDemo.loading") : t("vnpayDemo.payButton")}
          </Button>
          {lastResponse && !loading && (
            <pre className="max-h-48 overflow-auto rounded-md bg-muted p-3 text-xs">{lastResponse}</pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
