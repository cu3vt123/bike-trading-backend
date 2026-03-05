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
  BUYER: { label: "Buyer", icon: ShoppingBag, short: "Buy" },
  SELLER: { label: "Seller", icon: Store, short: "Sell" },
  INSPECTOR: { label: "Inspector", icon: ClipboardCheck, short: "Inspect" },
  ADMIN: { label: "Admin", icon: Shield, short: "Admin" },
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
            : "Invalid credentials. Please check your info and try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  const roles: Role[] = ["BUYER", "SELLER", "INSPECTOR", "ADMIN"];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar - no MainLayout to avoid double header */}
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
              to="/support"
              className="text-muted-foreground hover:text-foreground"
            >
              Support
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-56px)] max-w-6xl items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Welcome back</CardTitle>
              <CardDescription>
                Log in to continue your verified marketplace experience.
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
                <Label className="text-sm">Sign in as</Label>
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
                  <Label htmlFor="email">Email / Username</Label>
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
                    <Label htmlFor="password">Password</Label>
                    <Link
                      to="/forgot-password"
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
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
                  {submitting ? "Logging in..." : "Log in"}
                </Button>

                <Button type="button" variant="outline" className="w-full" asChild>
                  <Link to="/">Continue browsing</Link>
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link to="/register" className="font-medium text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
