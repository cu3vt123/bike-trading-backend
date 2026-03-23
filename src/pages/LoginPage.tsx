import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { HERO_SLIDES, HERO_AUTO_SLIDE_MS } from "@/constants/hero";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/useAuthStore";
import { Logo } from "@/components/common/Logo";
import type { Role } from "@/types/auth";
import { authApi } from "@/apis/authApi";
import {
  useSellerSubscriptionStore,
  normalizeSubscriptionPayload,
  type SellerSubscriptionSummary,
} from "@/stores/useSellerSubscriptionStore";
import { useTheme } from "@/app/providers/ThemeProvider";
import { useTranslation } from "react-i18next";
import { Sun, Moon } from "lucide-react";

type LocationState = {
  from?: { pathname?: string; search?: string };
};

const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_API === "true";

async function mockLogin(payload: {
  emailOrUsername: string;
  password: string;
}): Promise<{
  accessToken: string;
  refreshToken?: string;
  role: Role;
  subscription?: SellerSubscriptionSummary;
}> {
  if (!payload.emailOrUsername.trim() || payload.password.trim().length < 3) {
    throw new Error("Invalid credentials");
  }
  const email = payload.emailOrUsername.toLowerCase();
  if (email.includes("seller"))
    return {
      accessToken: `mock_${Date.now()}`,
      role: "SELLER",
      subscription: {
        active: true,
        plan: "BASIC",
        expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
        publishedSlotsUsed: 0,
        publishedSlotsLimit: 7,
        listingDurationDays: 30,
      },
    };
  if (email.includes("inspector")) return { accessToken: `mock_${Date.now()}`, role: "INSPECTOR" };
  if (email.includes("admin")) return { accessToken: `mock_${Date.now()}`, role: "ADMIN" };
  return { accessToken: `mock_${Date.now()}`, role: "BUYER" };
}

function pathOnly(fullPath: string) {
  const q = fullPath.indexOf("?");
  return q >= 0 ? fullPath.slice(0, q) : fullPath;
}

function resolvePostLoginPath(fromPath: string, role: Role) {
  const base = pathOnly(fromPath);
  if (base.startsWith("/seller") && role !== "SELLER") return "/";
  const buyerOnlyPrefixes = [
    "/checkout",
    "/transaction",
    "/finalize",
    "/success",
  ];
  if (
    buyerOnlyPrefixes.some((p) => base.startsWith(p)) &&
    role !== "BUYER"
  ) {
    return "/";
  }
  if (base.startsWith("/inspector") && role !== "INSPECTOR" && role !== "ADMIN") return "/";
  if (base.startsWith("/admin") && role !== "ADMIN") return "/";
  return fromPath;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;

  const setTokens = useAuthStore((s) => s.setTokens);
  const clearTokens = useAuthStore((s) => s.clearTokens);
  const setSellerSubscription = useSellerSubscriptionStore((s) => s.setSubscription);

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const t = setInterval(
      () => setHeroIndex((i) => (i + 1) % HERO_SLIDES.length),
      HERO_AUTO_SLIDE_MS,
    );
    return () => clearInterval(t);
  }, []);

  const fromPath = useMemo(() => {
    const p = state.from?.pathname;
    if (!p || p === "/login") return "/";
    const search = state.from?.search ?? "";
    return `${p}${search}`;
  }, [state.from?.pathname, state.from?.search]);


  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      setSubmitting(true);

      const res = USE_MOCK_AUTH
        ? await mockLogin({ emailOrUsername, password })
        : await authApi.login({ emailOrUsername, password });

      const resolvedRole = (res as { role?: Role }).role ?? "BUYER";
      clearTokens(); // Xóa state cũ + localStorage, tránh role cũ khi đổi tài khoản
      setTokens({
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        role: resolvedRole,
      });

      const sub = normalizeSubscriptionPayload(
        (res as { subscription?: unknown }).subscription,
      );
      if (resolvedRole === "SELLER") {
        setSellerSubscription(sub);
      }

      const target = resolvePostLoginPath(fromPath, resolvedRole);
      // Defer navigate để store update kịp propagate, tránh guard đọc role cũ
      queueMicrotask(() => navigate(target, { replace: true }));
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { message?: string; code?: string } } })
        ?.response?.data;
      const code = data?.code;
      const byCode: Record<string, string> = {
        LOGIN_UNKNOWN_USER: t("auth.loginUnknownUser"),
        LOGIN_WRONG_PASSWORD: t("auth.loginWrongPassword"),
        LOGIN_ACCOUNT_HIDDEN: t("auth.accountHidden"),
        LOGIN_MISSING_IDENTIFIER: t("auth.loginMissingEmail"),
        LOGIN_MISSING_PASSWORD: t("auth.loginMissingPassword"),
      };
      const msg =
        (code && byCode[code]) ||
        (typeof data?.message === "string" && data.message.trim()
          ? data.message.trim()
          : null) ||
        (err instanceof Error && err.message.trim() ? err.message.trim() : null) ||
        t("auth.loginError");
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen text-foreground">
      {/* Hero background */}
      <div className="fixed inset-0 z-0">
        {HERO_SLIDES.map((src, i) => (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === heroIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={src}
              alt=""
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-slate-900/75" />
          </div>
        ))}
      </div>

      {/* Top bar — đổi màu theo theme */}
      <header
        className={
          theme === "dark"
            ? "relative z-10 bg-black/30 backdrop-blur-md"
            : "relative z-10 bg-white/80 backdrop-blur-md border-b border-black/10"
        }
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
            <Logo
              variant="auth"
              showLabel
              alwaysWhite={theme === "dark"}
            />
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
                className={theme === "dark" ? "transition-colors hover:text-white" : "transition-colors hover:text-slate-900"}
              >
                {t("common.explore")}
              </Link>
              <Link
                to="/support"
                className={theme === "dark" ? "transition-colors hover:text-white" : "transition-colors hover:text-slate-900"}
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
        {/* Left: Hero + branding */}
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

        {/* Right: Form — nền và chữ đổi theo theme (light/dark); chữ ShopBike ở header giữ trắng */}
        <div
          className={theme === "dark"
            ? "flex flex-1 items-center justify-center bg-black/50 p-6 text-white backdrop-blur-sm lg:max-w-[440px] lg:flex-shrink-0"
            : "flex flex-1 items-center justify-center bg-background/95 p-6 text-foreground backdrop-blur-sm lg:max-w-[440px] lg:flex-shrink-0"}
        >
          <div className="w-full max-w-[340px]">
            <h2 className={`mb-6 text-lg font-semibold leading-snug sm:text-xl ${theme === "dark" ? "text-white" : "text-foreground"}`}>
              {t("auth.welcomeBack")}{" "}
              <span className="text-primary">{t("auth.you")}</span> {t("auth.with")}{" "}
              <span className="font-bold tracking-wide text-primary">ShopBike</span>
            </h2>
            {error && (
              <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            <form onSubmit={onSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="email" className={`text-sm ${theme === "dark" ? "text-white/80" : "text-foreground"}`}>
                  {t("auth.emailOrUsername")}
                </Label>
                <Input
                  id="email"
                  type="text"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder="e.g. rider_01@shopbike.com"
                  autoComplete="username"
                  className={theme === "dark"
                    ? "h-10 border-white/20 bg-white/10 text-white placeholder:text-white/40 focus-visible:ring-primary"
                    : "h-10"}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className={`text-sm ${theme === "dark" ? "text-white/80" : "text-foreground"}`}>
                  {t("auth.password")}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={theme === "dark"
                    ? "h-10 border-white/20 bg-white/10 text-white placeholder:text-white/40 focus-visible:ring-primary"
                    : "h-10"}
                />
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
              <div className={theme === "dark" ? "border-t border-white/15 pt-3" : "border-t border-border pt-3"}>
                <Button
                  type="button"
                  variant="outline"
                  className={theme === "dark"
                    ? "h-10 w-full border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                    : "h-10 w-full"}
                  asChild
                >
                  <Link to="/register">{t("auth.createAccount")}</Link>
                </Button>
              </div>
            </form>
            <Button
              type="button"
              variant="ghost"
              className={theme === "dark" ? "mt-4 w-full text-white/70 hover:bg-white/10 hover:text-white" : "mt-4 w-full"}
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
