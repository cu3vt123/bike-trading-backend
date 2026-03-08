import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, Store, ClipboardCheck, Shield } from "lucide-react";

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
import { useAuthStore } from "@/stores/useAuthStore";
import { Logo } from "@/components/common/Logo";
import type { Role } from "@/types/auth";
import { cn } from "@/lib/utils";
import { authApi } from "@/apis/authApi";

type LocationState = {
  from?: { pathname?: string };
  presetRole?: Role;
  role?: Role;
};

const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_API === "true";

async function mockLogin(payload: {
  role: Role;
  emailOrUsername: string;
  password: string;
}): Promise<{ accessToken: string; refreshToken?: string }> {
  if (!payload.emailOrUsername.trim() || payload.password.trim().length < 3) {
    throw new Error("Invalid credentials");
  }
  return {
    accessToken: `mock_access_${payload.role}_${Date.now()}`,
    refreshToken: `mock_refresh_${Date.now()}`,
  };
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

const ROLE_CONFIG: Record<
  Role,
  { label: string; icon: React.ElementType; short: string }
> = {
  BUYER: { label: "Người mua", icon: ShoppingBag, short: "Mua" },
  SELLER: { label: "Người bán", icon: Store, short: "Bán" },
  INSPECTOR: { label: "Kiểm định viên", icon: ClipboardCheck, short: "Kiểm định" },
  ADMIN: { label: "Quản trị", icon: Shield, short: "Admin" },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;

  const setTokens = useAuthStore((s) => s.setTokens);

  const initialRole: Role = state.presetRole ?? state.role ?? "BUYER";

  const [role, setRole] = useState<Role>(initialRole);
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        ? await mockLogin({ role, emailOrUsername, password })
        : await authApi.login({ role, emailOrUsername, password });

      const resolvedRole = (res as { role?: Role }).role ?? role;
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

  const roles: Role[] = ["BUYER", "SELLER", "INSPECTOR", "ADMIN"];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar - no MainLayout to avoid double header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/95 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
            <Logo variant="auth" showLabel />
          </Link>

          <nav className="flex items-center gap-4 text-sm">
            <Link
              to="/#listings"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Khám phá
            </Link>
            <Link
              to="/support"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Hỗ trợ
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-56px)] max-w-6xl items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card className="border-border shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Chào bạn trở lại</CardTitle>
              <CardDescription className="mt-1">
                Đăng nhập để tiếp tục trải nghiệm sàn đã xác minh.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* 4-role selector */}
              <div className="space-y-2">
                <Label className="text-sm">Đăng nhập với vai trò</Label>
                <div className="grid grid-cols-2 gap-2">
                  {roles.map((r) => {
                    const config = ROLE_CONFIG[r];
                    const Icon = config.icon;
                    const isSelected = role === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={cn(
                          "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-all",
                          isSelected
                            ? "border-primary bg-primary/10 text-primary shadow-sm"
                            : "border-border hover:border-primary/50 hover:bg-muted",
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{config.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email / Tên đăng nhập</Label>
                  <Input
                    id="email"
                    type="text"
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    placeholder="e.g. rider_01@shopbike.com"
                    autoComplete="username"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Mật khẩu</Label>
                    <Link
                      to="/forgot-password"
                      className="text-xs text-primary hover:underline"
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={submitting}
                >
                  {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
                </Button>

                <Button type="button" variant="outline" className="w-full" asChild>
                  <Link to="/">Tiếp tục xem</Link>
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                Chưa có tài khoản?{" "}
                <Link to="/register" className="font-medium text-primary hover:underline">
                  Đăng ký
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
