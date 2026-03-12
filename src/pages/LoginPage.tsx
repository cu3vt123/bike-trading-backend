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

type LocationState = {
  from?: { pathname?: string };
};

const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_API === "true";

async function mockLogin(payload: {
  emailOrUsername: string;
  password: string;
}): Promise<{ accessToken: string; refreshToken?: string; role: Role }> {
  if (!payload.emailOrUsername.trim() || payload.password.trim().length < 3) {
    throw new Error("Invalid credentials");
  }
  const email = payload.emailOrUsername.toLowerCase();
  if (email.includes("seller")) return { accessToken: `mock_${Date.now()}`, role: "SELLER" };
  if (email.includes("inspector")) return { accessToken: `mock_${Date.now()}`, role: "INSPECTOR" };
  if (email.includes("admin")) return { accessToken: `mock_${Date.now()}`, role: "ADMIN" };
  return { accessToken: `mock_${Date.now()}`, role: "BUYER" };
}

function resolvePostLoginPath(fromPath: string, role: Role) {
  if (fromPath.startsWith("/seller") && role !== "SELLER") return "/";
  const buyerOnlyPrefixes = [
    "/checkout",
    "/transaction",
    "/finalize",
    "/success",
  ];
  if (
    buyerOnlyPrefixes.some((p) => fromPath.startsWith(p)) &&
    role !== "BUYER"
  ) {
    return "/";
  }
  if (fromPath.startsWith("/inspector") && role !== "INSPECTOR" && role !== "ADMIN") return "/";
  if (fromPath.startsWith("/admin") && role !== "ADMIN") return "/";
  return fromPath;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;

  const setTokens = useAuthStore((s) => s.setTokens);

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setHeroIndex((i) => (i + 1) % HERO_SLIDES.length),
      HERO_AUTO_SLIDE_MS,
    );
    return () => clearInterval(t);
  }, []);

  const fromPath = useMemo(() => {
    const p = state.from?.pathname;
    return p && p !== "/login" ? p : "/";
  }, [state.from?.pathname]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      setSubmitting(true);

      const res = USE_MOCK_AUTH
        ? await mockLogin({ emailOrUsername, password })
        : await authApi.login({ emailOrUsername, password });

      const resolvedRole = (res as { role?: Role }).role ?? "BUYER";
      setTokens({
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        role: resolvedRole,
      });

      const target = resolvePostLoginPath(fromPath, resolvedRole);
      navigate(target, { replace: true });
    } catch (err: any) {
      const backendMsg = err?.response?.data?.message;
      const msg =
        typeof backendMsg === "string"
          ? backendMsg
          : err instanceof Error
            ? err.message
            : "Sai thông tin đăng nhập. Vui lòng kiểm tra và thử lại.";
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

      {/* Top bar */}
      <header className="relative z-10 border-b border-white/10 bg-black/30 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
            <Logo variant="auth" showLabel />
          </Link>

          <nav className="flex items-center gap-4 text-sm text-white/90">
            <Link to="/#listings" className="transition-colors hover:text-white">
              Khám phá
            </Link>
            <Link to="/support" className="transition-colors hover:text-white">
              Hỗ trợ
            </Link>
          </nav>
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
              Để <span className="font-bold tracking-wide text-primary">ShopBike</span> đồng hành
              cùng <span className="text-primary">Bạn</span> bắt đầu chuyến đi mới
            </p>
          </div>
        </div>

        {/* Right: Form */}
        <div className="flex flex-1 items-center justify-center bg-black/50 p-6 backdrop-blur-sm lg:max-w-[440px] lg:flex-shrink-0">
          <div className="w-full max-w-[340px]">
            <h2 className="mb-6 text-lg font-semibold leading-snug text-foreground sm:text-xl">
              Chào mừng trở lại, hành trình mới đang đợi{" "}
              <span className="text-primary">Bạn</span> cùng với{" "}
              <span className="font-bold tracking-wide text-primary">ShopBike</span>
            </h2>
            {error && (
              <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            <form onSubmit={onSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm">
                  Email / Tên đăng nhập
                </Label>
                <Input
                  id="email"
                  type="text"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder="e.g. rider_01@shopbike.com"
                  autoComplete="username"
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm">
                  Mật khẩu
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="h-10"
                />
              </div>
              <Button type="submit" className="h-10 w-full" disabled={submitting}>
                {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
              <Link
                to="/forgot-password"
                className="block text-center text-sm text-primary hover:underline"
              >
                Quên mật khẩu?
              </Link>
              <div className="border-t border-border pt-3">
                <Button type="button" variant="outline" className="h-10 w-full" asChild>
                  <Link to="/register">Tạo tài khoản mới</Link>
                </Button>
              </div>
            </form>
            <Button type="button" variant="ghost" className="mt-4 w-full" asChild>
              <Link to="/">Tiếp tục xem</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
