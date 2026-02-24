import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { useAuthStore } from "@/stores/useAuthStore";
import type { Role } from "@/types/auth";
import { cn } from "@/lib/utils";
import { authApi } from "@/apis/authApi";

/* Chỉ Buyer và Seller được tự đăng ký; Inspector/Admin do hệ thống cấp */
const REGISTER_ROLES: Role[] = ["BUYER", "SELLER"];

const ROLE_CONFIG: Record<
  (typeof REGISTER_ROLES)[number],
  { label: string; icon: React.ElementType }
> = {
  BUYER: { label: "Buyer", icon: ShoppingBag },
  SELLER: { label: "Seller", icon: Store },
};

const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_API === "true";

/** Business rules: giới hạn đăng ký (phải khớp Backend) */
const LIMITS = {
  USERNAME_MIN: 2,
  USERNAME_MAX: 30,
  USERNAME_PATTERN: /^[a-zA-Z0-9_]+$/,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 64,
  EMAIL_MAX: 100,
} as const;

function validateRegister(data: {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}): string | null {
  const u = data.username.trim();
  if (u.length < LIMITS.USERNAME_MIN) {
    return `Username phải từ ${LIMITS.USERNAME_MIN}–${LIMITS.USERNAME_MAX} ký tự.`;
  }
  if (u.length > LIMITS.USERNAME_MAX) {
    return `Username tối đa ${LIMITS.USERNAME_MAX} ký tự.`;
  }
  if (!LIMITS.USERNAME_PATTERN.test(u)) {
    return "Username chỉ được dùng chữ cái, số và dấu gạch dưới (_).";
  }
  if (data.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      return "Email không hợp lệ.";
    }
    if (data.email.length > LIMITS.EMAIL_MAX) {
      return `Email tối đa ${LIMITS.EMAIL_MAX} ký tự.`;
    }
  }
  if (data.password.length < LIMITS.PASSWORD_MIN) {
    return `Mật khẩu phải từ ${LIMITS.PASSWORD_MIN}–${LIMITS.PASSWORD_MAX} ký tự.`;
  }
  if (data.password.length > LIMITS.PASSWORD_MAX) {
    return `Mật khẩu tối đa ${LIMITS.PASSWORD_MAX} ký tự.`;
  }
  if (data.password !== data.confirmPassword) {
    return "Mật khẩu xác nhận không khớp.";
  }
  return null;
}

async function mockSignup(payload: {
  role: Role;
  username: string;
  email: string;
  password: string;
}): Promise<{ accessToken: string; refreshToken?: string }> {
  // validation đã chạy trong onSubmit trước khi gọi
  return {
    accessToken: `mock_access_${payload.role}_${Date.now()}`,
    refreshToken: `mock_refresh_${Date.now()}`,
  };
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const setTokens = useAuthStore((s) => s.setTokens);

  const [role, setRole] = useState<Role>("BUYER");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const validationError = validateRegister({
      username,
      email,
      password,
      confirmPassword,
    });
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);

      const res = USE_MOCK_AUTH
        ? await mockSignup({ role, username, email, password })
        : await authApi.signup({
            role: role as "BUYER" | "SELLER",
            username,
            email: email || undefined,
            password,
          });

      const resolvedRole = (res as { role?: Role }).role ?? role;
      setTokens({
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        role: resolvedRole,
      });

      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Signup failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const roles = REGISTER_ROLES;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
              S
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold">ShopBike</div>
              <div className="text-xs text-muted-foreground">
                Verified &amp; Inspected
              </div>
            </div>
          </Link>

          <nav className="flex items-center gap-4 text-sm">
            <Link
              to="/#listings"
              className="text-muted-foreground hover:text-foreground"
            >
              Explore
            </Link>
            <Link
              to="/login"
              className="text-muted-foreground hover:text-foreground"
            >
              Log in
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-56px)] max-w-6xl items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Create account</CardTitle>
              <CardDescription>
                Choose your role and fill in your details to get started.
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
                <Label className="text-sm">Register as</Label>
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
                          "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-colors",
                          isSelected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-input hover:bg-accent hover:text-accent-foreground",
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
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. rider_01"
                    autoComplete="username"
                    minLength={LIMITS.USERNAME_MIN}
                    maxLength={LIMITS.USERNAME_MAX}
                  />
                  <p className="text-xs text-muted-foreground">
                    {LIMITS.USERNAME_MIN}–{LIMITS.USERNAME_MAX} ký tự, chỉ chữ, số và dấu _
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email (tùy chọn)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    maxLength={LIMITS.EMAIL_MAX}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mật khẩu *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    minLength={LIMITS.PASSWORD_MIN}
                    maxLength={LIMITS.PASSWORD_MAX}
                  />
                  <p className="text-xs text-muted-foreground">
                    {LIMITS.PASSWORD_MIN}–{LIMITS.PASSWORD_MAX} ký tự
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    maxLength={LIMITS.PASSWORD_MAX}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Creating account..." : "Create account"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  asChild
                >
                  <Link to="/">Back to home</Link>
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-primary hover:underline"
                >
                  Log in
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
