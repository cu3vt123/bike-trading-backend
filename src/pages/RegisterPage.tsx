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
import { Logo } from "@/components/common/Logo";
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
  /** Mật khẩu: ít nhất 1 chữ in hoa, 1 ký tự đặc biệt */
  PASSWORD_UPPERCASE: /[A-Z]/,
  PASSWORD_SPECIAL: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
} as const;

function validateRegister(data: {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}): string | null {
  const u = data.username.trim();
  if (u.length < LIMITS.USERNAME_MIN) {
    return `Username must be ${LIMITS.USERNAME_MIN}–${LIMITS.USERNAME_MAX} characters.`;
  }
  if (u.length > LIMITS.USERNAME_MAX) {
    return `Username must be at most ${LIMITS.USERNAME_MAX} characters.`;
  }
  if (!LIMITS.USERNAME_PATTERN.test(u)) {
    return "Username can only contain letters, numbers and underscores (_).";
  }
  const e = data.email.trim();
  if (!e) return "Email is required.";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(e)) return "Invalid email.";
  if (data.email.length > LIMITS.EMAIL_MAX) {
    return `Email must be at most ${LIMITS.EMAIL_MAX} characters.`;
  }
  if (data.password.length < LIMITS.PASSWORD_MIN) {
    return `Password must be ${LIMITS.PASSWORD_MIN}–${LIMITS.PASSWORD_MAX} characters.`;
  }
  if (data.password.length > LIMITS.PASSWORD_MAX) {
    return `Password must be at most ${LIMITS.PASSWORD_MAX} characters.`;
  }
  if (!LIMITS.PASSWORD_UPPERCASE.test(data.password)) {
    return "Password must have at least 1 uppercase letter.";
  }
  if (!LIMITS.PASSWORD_SPECIAL.test(data.password)) {
    return "Password must have at least 1 special character (!@#$%^&*...).";
  }
  if (data.password !== data.confirmPassword) {
    return "Passwords do not match.";
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
            username: username || undefined,
            email: email.trim(),
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
          <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
            <Logo variant="auth" showLabel />
          </Link>

          <nav className="flex items-center gap-4 text-sm">
            <Link
              to="/#listings"
              className="text-muted-foreground hover:text-foreground"
            >
              Khám phá
            </Link>
            <Link
              to="/login"
              className="text-muted-foreground hover:text-foreground"
            >
              Đăng nhập
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-56px)] max-w-6xl items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Tạo tài khoản</CardTitle>
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
                    {LIMITS.USERNAME_MIN}–{LIMITS.USERNAME_MAX} characters, letters, numbers and _
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    maxLength={LIMITS.EMAIL_MAX}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
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
                    {LIMITS.PASSWORD_MIN}–{LIMITS.PASSWORD_MAX} characters, at least 1 uppercase and 1 special char
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password *</Label>
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
                  {submitting ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  asChild
                >
                  <Link to="/">Về trang chủ</Link>
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                Đã có tài khoản?{" "}
                <Link
                  to="/login"
                  className="font-medium text-primary hover:underline"
                >
                  Đăng nhập
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
