import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShoppingBag, Store } from "lucide-react";

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
import type { Role } from "@/types/auth";
import { cn } from "@/lib/utils";
import { registerFormSchema, type RegisterFormValues } from "@/lib/authSchemas";
import { useRegisterMutation } from "@/hooks/useAuthMutations";

const REGISTER_ROLES: Role[] = ["BUYER", "SELLER"];

const ROLE_CONFIG: Record<
  (typeof REGISTER_ROLES)[number],
  { labelKey: string; icon: React.ElementType }
> = {
  BUYER: { labelKey: "auth.roleBuyer", icon: ShoppingBag },
  SELLER: { labelKey: "auth.roleSeller", icon: Store },
};

const USERNAME_MIN = 2;
const USERNAME_MAX = 30;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 64;
const EMAIL_MAX = 100;

export default function RegisterPage() {
  const { t } = useTranslation();
  const registerMutation = useRegisterMutation();
  const [apiError, setApiError] = useState<string | null>(null);

  const schema = useMemo(() => registerFormSchema(t), [t]);
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: "BUYER",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    setApiError(null);
    registerMutation.mutate(
      {
        role: data.role,
        username: data.username || undefined,
        email: data.email.trim(),
        password: data.password,
      },
      {
        onError: (err: unknown) => {
          setApiError(
            err instanceof Error ? err.message : t("auth.signupFailed"),
          );
        },
      },
    );
  });

  const submitting = registerMutation.isPending;
  const roles = REGISTER_ROLES;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
            <Logo variant="auth" showLabel />
          </Link>

          <nav className="flex items-center gap-4 text-sm">
            <Link
              to="/#listings"
              className="text-muted-foreground hover:text-foreground"
            >
              {t("common.explore")}
            </Link>
            <Link
              to="/login"
              className="text-muted-foreground hover:text-foreground"
            >
              {t("common.login")}
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-56px)] max-w-6xl items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>{t("auth.registerTitle")}</CardTitle>
              <CardDescription>{t("auth.registerSubtitle")}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {apiError && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {apiError}
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm">{t("auth.registerAs")}</Label>
                <Controller
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <div className="grid grid-cols-2 gap-2">
                      {roles.map((r) => {
                        const config = ROLE_CONFIG[r];
                        const Icon = config.icon;
                        const isSelected = field.value === r;
                        return (
                          <button
                            key={r}
                            type="button"
                            onClick={() => field.onChange(r)}
                            className={cn(
                              "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-colors",
                              isSelected
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-input hover:bg-accent hover:text-accent-foreground",
                            )}
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                            <span className="truncate">{t(config.labelKey)}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                />
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">{t("auth.usernameLabel")}</Label>
                  <Input
                    id="username"
                    type="text"
                    {...form.register("username")}
                    placeholder={t("auth.usernamePlaceholder")}
                    autoComplete="username"
                    minLength={USERNAME_MIN}
                    maxLength={USERNAME_MAX}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("auth.usernameHint", { min: USERNAME_MIN, max: USERNAME_MAX })}
                  </p>
                  {form.formState.errors.username && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.username.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t("auth.emailLabel")}</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register("email")}
                    placeholder={t("auth.emailPlaceholder")}
                    autoComplete="email"
                    maxLength={EMAIL_MAX}
                  />
                  {form.formState.errors.email && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">{t("auth.passwordLabel")}</Label>
                  <Input
                    id="password"
                    type="password"
                    {...form.register("password")}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    minLength={PASSWORD_MIN}
                    maxLength={PASSWORD_MAX}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("auth.passwordHint", { min: PASSWORD_MIN, max: PASSWORD_MAX })}
                  </p>
                  {form.formState.errors.password && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t("auth.confirmPasswordLabel")}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...form.register("confirmPassword")}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    maxLength={PASSWORD_MAX}
                  />
                  {form.formState.errors.confirmPassword && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? t("auth.registerSubmitting") : t("auth.registerSubmit")}
                </Button>

                <Button type="button" variant="outline" className="w-full" asChild>
                  <Link to="/">{t("auth.backHome")}</Link>
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                {t("auth.haveAccount")}{" "}
                <Link
                  to="/login"
                  className="font-medium text-primary hover:underline"
                >
                  {t("auth.loginLink")}
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
