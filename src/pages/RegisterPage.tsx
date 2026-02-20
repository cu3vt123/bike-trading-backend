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

/* Chỉ Buyer và Seller được tự đăng ký; Inspector/Admin do hệ thống cấp */
const REGISTER_ROLES: Role[] = ["BUYER", "SELLER"];

const ROLE_CONFIG: Record<
  (typeof REGISTER_ROLES)[number],
  { label: string; icon: React.ElementType }
> = {
  BUYER: { label: "Buyer", icon: ShoppingBag },
  SELLER: { label: "Seller", icon: Store },
};

/**
 * Sprint 1 UI-only: mock signup. Chưa gọi backend.
 * Success → auto login + redirect về /
 */
async function mockSignup(payload: {
  role: Role;
  username: string;
  email: string;
  password: string;
}): Promise<{ accessToken: string; refreshToken?: string }> {
  if (!payload.username.trim() || payload.username.trim().length < 2) {
    throw new Error("Username must be at least 2 characters");
  }
  if (payload.password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }
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

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setSubmitting(true);

      const res = await mockSignup({ role, username, email, password });

      setTokens({
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        role,
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
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. rider_01"
                    autoComplete="username"
                    minLength={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email (optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={submitting}
                >
                  {submitting ? "Creating account..." : "Create account"}
                </Button>

                <Button type="button" variant="outline" className="w-full" asChild>
                  <Link to="/">Back to home</Link>
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-primary hover:underline">
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
