import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function CartPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">
              {t("cart.title")}
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("cart.roadmapHint")}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-dashed border-border bg-muted/40 px-4 py-6 text-sm text-muted-foreground">
            {t("cart.subtitle")}
          </div>
          <Button asChild variant="outline">
            <Link to="/">{t("cart.backHome")}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

