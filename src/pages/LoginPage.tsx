import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { HERO_SLIDES, HERO_AUTO_SLIDE_MS } from "@/constants/hero";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/common/Logo";
import { useTheme } from "@/app/providers/ThemeProvider";
import { useTranslation } from "react-i18next";
import { Sun, Moon } from "lucide-react";

import { loginFormSchema, type LoginFormValues } from "@/lib/authSchemas";
import { useLoginMutation } from "@/hooks/useAuthMutations";

export default function LoginPage() {
  const loginMutation = useLoginMutation();
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const schema = useMemo(() => loginFormSchema(t), [t]);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { emailOrUsername: "", password: "" },
  });

  const [apiError, setApiError] = useState<string | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setHeroIndex((i) => (i + 1) % HERO_SLIDES.length),
      HERO_AUTO_SLIDE_MS,
    );
    return () => clearInterval(id);
  }, []);

  const onSubmit = form.handleSubmit((data) => {
    setApiError(null);
    loginMutation.mutate(
      {
        emailOrUsername: data.emailOrUsername,
        password: data.password,
      },
      {
        onError: (err: unknown) => {
          const res = (err as { response?: { data?: { message?: string; code?: string } } })
            ?.response?.data;
          const code = res?.code;
          const byCode: Record<string, string> = {
            LOGIN_UNKNOWN_USER: t("auth.loginUnknownUser"),
            LOGIN_WRONG_PASSWORD: t("auth.loginWrongPassword"),
            LOGIN_ACCOUNT_HIDDEN: t("auth.accountHidden"),
            LOGIN_MISSING_IDENTIFIER: t("auth.loginMissingEmail"),
            LOGIN_MISSING_PASSWORD: t("auth.loginMissingPassword"),
          };
          const msg =
            (code && byCode[code]) ||
            (typeof res?.message === "string" && res.message.trim()
              ? res.message.trim()
              : null) ||
            (err instanceof Error && err.message.trim() ? err.message.trim() : null) ||
            t("auth.loginError");
          setApiError(msg);
        },
      },
    );
  });

  const submitting = loginMutation.isPending;

  return (
    <div className="relative min-h-screen text-foreground">
      <div className="fixed inset-0 z-0">
        {HERO_SLIDES.map((src, i) => (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === heroIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <img src={src} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-slate-900/75" />
          </div>
        ))}
      </div>

      <header
        className={
          theme === "dark"
            ? "relative z-10 bg-black/30 backdrop-blur-md"
            : "relative z-10 border-b border-black/10 bg-white/80 backdrop-blur-md"
        }
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
            <Logo variant="auth" showLabel alwaysWhite={theme === "dark"} />
          </Link>

          <div className="flex items-center gap-3">
            <nav
              className={
                theme === "dark"
                  ? "flex items-center gap-4 text-sm text-white/90"
                  : "flex items-center gap-4 text-sm text-slate-700"
              }
            >
              <Link
                to="/#listings"
                className={
                  theme === "dark"
                    ? "transition-colors hover:text-white"
                    : "transition-colors hover:text-slate-900"
                }
              >
                {t("common.explore")}
              </Link>
              <Link
                to="/support"
                className={
                  theme === "dark"
                    ? "transition-colors hover:text-white"
                    : "transition-colors hover:text-slate-900"
                }
              >
                {t("common.support")}
              </Link>
            </nav>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={
                theme === "dark"
                  ? "h-8 w-8 rounded-full border border-white/15 bg-white/10 text-white/90 hover:bg-white/20 hover:text-white"
                  : "h-8 w-8 rounded-full border border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
              }
              onClick={toggleTheme}
              aria-label={theme === "dark" ? t("header.themeLight") : t("header.themeDark")}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex min-h-[calc(100vh-56px)] flex-col lg:flex-row">
        <div className="hidden flex-[1.1] items-center justify-center p-8 lg:flex">
          <div className="max-w-md text-center">
            <Link to="/" className="inline-block">
              <Logo variant="hero" />
            </Link>
            <p className="mt-6 text-lg font-bold leading-snug text-white sm:text-xl">
              {t("auth.heroTaglinePrefix")}
              <span className="text-primary">{t("auth.you")}</span>
              {t("auth.heroTaglineSuffix")}
            </p>
          </div>
        </div>

        <div
          className={
            theme === "dark"
              ? "flex flex-1 items-center justify-center bg-black/50 p-6 text-white backdrop-blur-sm lg:max-w-[440px] lg:flex-shrink-0"
              : "flex flex-1 items-center justify-center bg-background/95 p-6 text-foreground backdrop-blur-sm lg:max-w-[440px] lg:flex-shrink-0"
          }
        >
          <div className="w-full max-w-[340px]">
            <h2
              className={`mb-6 text-lg font-semibold leading-snug sm:text-xl ${theme === "dark" ? "text-white" : "text-foreground"}`}
            >
              {t("auth.welcomeBack")}{" "}
              <span className="text-primary">{t("auth.you")}</span> {t("auth.with")}{" "}
              <span className="font-bold tracking-wide text-primary">ShopBike</span>
            </h2>
            {apiError && (
              <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {apiError}
              </div>
            )}
            <form onSubmit={onSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className={`text-sm ${theme === "dark" ? "text-white/80" : "text-foreground"}`}
                >
                  {t("auth.emailOrUsername")}
                </Label>
                <Input
                  id="email"
                  type="text"
                  {...form.register("emailOrUsername")}
                  placeholder="e.g. rider_01@shopbike.com"
                  autoComplete="username"
                  className={
                    theme === "dark"
                      ? "h-10 border-white/20 bg-white/10 text-white placeholder:text-white/40 focus-visible:ring-primary"
                      : "h-10"
                  }
                />
                {form.formState.errors.emailOrUsername && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.emailOrUsername.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="password"
                  className={`text-sm ${theme === "dark" ? "text-white/80" : "text-foreground"}`}
                >
                  {t("auth.password")}
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...form.register("password")}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={
                    theme === "dark"
                      ? "h-10 border-white/20 bg-white/10 text-white placeholder:text-white/40 focus-visible:ring-primary"
                      : "h-10"
                  }
                />
                {form.formState.errors.password && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="h-10 w-full" disabled={submitting}>
                {submitting ? t("common.loggingIn") : t("common.login")}
              </Button>
              <Link
                to="/forgot-password"
                className="block text-center text-sm text-primary hover:underline"
              >
                {t("auth.forgotPassword")}
              </Link>
              <div
                className={
                  theme === "dark"
                    ? "border-t border-white/15 pt-3"
                    : "border-t border-border pt-3"
                }
              >
                <Button
                  type="button"
                  variant="outline"
                  className={
                    theme === "dark"
                      ? "h-10 w-full border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                      : "h-10 w-full"
                  }
                  asChild
                >
                  <Link to="/register">{t("auth.createAccount")}</Link>
                </Button>
              </div>
            </form>
            <Button
              type="button"
              variant="ghost"
              className={
                theme === "dark"
                  ? "mt-4 w-full text-white/70 hover:bg-white/10 hover:text-white"
                  : "mt-4 w-full"
              }
              asChild
            >
              <Link to="/">{t("auth.continueBrowsing")}</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
