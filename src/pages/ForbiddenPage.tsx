import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShieldX } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/stores/useAuthStore";

export default function ForbiddenPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const clearTokens = useAuthStore((s) => s.clearTokens);

  function handleLoginWithOtherAccount() {
    clearTokens();
    // Truyền path gốc user muốn vào (vd: /seller), không phải /403
    const intendedPath = (location.state as { from?: { pathname?: string } })?.from?.pathname ?? "/";
    navigate("/login", { replace: true, state: { from: { pathname: intendedPath } } });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <ShieldX className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">{t("forbidden.title")}</CardTitle>
          <CardDescription>
            {t("forbidden.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button asChild className="w-full">
            <Link to="/">{t("forbidden.goHome")}</Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleLoginWithOtherAccount}
          >
            {t("auth.loginWithOther")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
