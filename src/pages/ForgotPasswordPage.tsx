import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ArrowLeft } from "lucide-react";

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
  forgotPasswordFormSchema,
  type ForgotPasswordFormValues,
} from "@/lib/authSchemas";
import { useForgotPasswordMutation } from "@/hooks/useAuthMutations";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [success, setSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const forgotMutation = useForgotPasswordMutation();

  const schema = useMemo(() => forgotPasswordFormSchema(t), [t]);
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = form.handleSubmit((data) => {
    forgotMutation.mutate(data.email.trim(), {
      onSuccess: () => {
        setSubmittedEmail(data.email.trim());
        setSuccess(true);
      },
      onError: (err: unknown) => {
        form.setError("root", {
          message:
            err instanceof Error ? err.message : t("auth.forgotGenericError"),
        });
      },
    });
  });

  const submitting = forgotMutation.isPending;

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
                <Mail className="h-6 w-6" />
              </div>
              <CardTitle>{t("auth.checkEmailTitle")}</CardTitle>
              <CardDescription>
                <Trans
                  i18nKey="auth.checkEmailDesc"
                  values={{ email: submittedEmail }}
                  components={{ 1: <strong /> }}
                />
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                {t("auth.noEmailHint")}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t("auth.backToLogin")}
                </Link>
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
            <Link to="/#listings" className="text-muted-foreground hover:text-foreground">
              {t("common.explore")}
            </Link>
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
              <CardTitle>{t("auth.forgotTitle")}</CardTitle>
              <CardDescription>{t("auth.forgotSubtitle")}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {(form.formState.errors.root || form.formState.errors.email) && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {form.formState.errors.email?.message ??
                    form.formState.errors.root?.message}
                </div>
              )}

              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register("email")}
                    placeholder="email@example.com"
                    autoComplete="email"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? t("auth.forgotSending") : t("auth.forgotSendLink")}
                </Button>

                <Button variant="outline" className="w-full" asChild>
                  <Link to="/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t("auth.backToLogin")}
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
