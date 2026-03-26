import React, { useMemo, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/common/Logo";
import {
  resetPasswordFormSchema,
  type ResetPasswordFormValues,
} from "@/lib/authSchemas";
import { useResetPasswordMutation } from "@/hooks/useAuthMutations";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tokenFromUrl = searchParams.get("token");
  const { t } = useTranslation();
  const [success, setSuccess] = useState(false);
  const resetMutation = useResetPasswordMutation();

  const schema = useMemo(() => resetPasswordFormSchema(t), [t]);
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = form.handleSubmit((data) => {
    const token = tokenFromUrl?.trim();
    if (!token) {
      form.setError("root", { message: t("auth.errResetLinkInvalid") });
      return;
    }
    resetMutation.mutate(
      { token, newPassword: data.password },
      {
        onSuccess: () => setSuccess(true),
        onError: (err: unknown) => {
          form.setError("root", {
            message:
              err instanceof Error ? err.message : t("auth.errResetLinkExpired"),
          });
        },
      },
    );
  });

  const submitting = resetMutation.isPending;

  if (success) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
            <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
              <Logo variant="auth" showLabel />
            </Link>
          </div>
        </header>

        <main className="mx-auto flex min-h-[calc(100vh-56px)] max-w-6xl items-center justify-center px-4 py-10">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <KeyRound className="h-6 w-6" />
              </div>
              <CardTitle>{t("auth.resetSuccessTitle")}</CardTitle>
              <CardDescription>{t("auth.resetSuccessDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => navigate("/login", { replace: true })}>
                {t("auth.resetLoginNow")}
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!tokenFromUrl) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
            <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
              <Logo variant="auth" showLabel />
            </Link>
          </div>
        </header>

        <main className="mx-auto flex min-h-[calc(100vh-56px)] max-w-6xl items-center justify-center px-4 py-10">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>{t("auth.resetInvalidTitle")}</CardTitle>
              <CardDescription>{t("auth.resetInvalidDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/forgot-password">{t("auth.resetRequestNew")}</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
            <Logo variant="auth" showLabel />
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/login" className="text-muted-foreground hover:text-foreground">
              {t("common.login")}
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-56px)] max-w-6xl items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>{t("auth.resetFormTitle")}</CardTitle>
              <CardDescription>{t("auth.resetFormSubtitle")}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {(form.formState.errors.root || form.formState.errors.password) && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {form.formState.errors.root?.message ??
                    form.formState.errors.password?.message ??
                    form.formState.errors.confirmPassword?.message}
                </div>
              )}

              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">{t("auth.newPasswordLabel")}</Label>
                  <Input
                    id="password"
                    type="password"
                    {...form.register("password")}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">{t("auth.confirmPasswordLabelReset")}</Label>
                  <Input
                    id="confirm"
                    type="password"
                    {...form.register("confirmPassword")}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? t("auth.resetSubmitting") : t("auth.resetSubmit")}
                </Button>

                <Button variant="outline" className="w-full" asChild>
                  <Link to="/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t("auth.resetBackToLogin")}
                  </Link>
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
