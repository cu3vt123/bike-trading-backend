// src/pages/LoginPage.tsx
import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import type { Role } from "@/types/auth";

type LocationState = {
  from?: { pathname?: string };
  // mới (HomePage dùng presetRole)
  presetRole?: Role;
  // cũ (backward compatible)
  role?: Role;
};

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Sprint 1 UI-only:
 * - Chưa gọi backend
 * - Login sẽ set token giả để test flow UI
 */
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
  // Seller area chỉ SELLER vào
  if (fromPath.startsWith("/seller") && role !== "SELLER") return "/";

  // Buyer purchase flow chỉ BUYER vào
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

  return fromPath;
}

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

      const res = await mockLogin({ role, emailOrUsername, password });

      setTokens({
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        role,
      });

      const target = resolvePostLoginPath(fromPath, role);
      navigate(target, { replace: true });
    } catch {
      setError("Invalid credentials. Please check your info and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top bar (không dùng MainLayout để tránh 2 header/logo) */}
      <header className="sticky top-0 z-10 border-b border-black/5 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-600 text-white">
              <span className="text-sm font-bold">S</span>
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold">ShopBike</div>
              <div className="text-[11px] text-slate-500">
                Verified &amp; Inspected
              </div>
            </div>
          </Link>

          <nav className="flex items-center gap-4 text-sm">
            <Link
              to="/#listings"
              className="text-slate-600 hover:text-slate-900"
            >
              Explore
            </Link>
            <Link to="/support" className="text-slate-600 hover:text-slate-900">
              Support
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-56px)] max-w-6xl items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="text-center">
              <h1 className="text-xl font-semibold">Welcome back</h1>
              <p className="mt-1 text-sm text-slate-500">
                Log in to continue your verified marketplace experience.
              </p>
            </div>

            {error && (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            {/* Role segmented */}
            <div className="mt-5 rounded-2xl bg-slate-100 p-1">
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => setRole("BUYER")}
                  className={cx(
                    "rounded-xl px-3 py-2 text-sm font-semibold transition",
                    role === "BUYER"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900",
                  )}
                >
                  Buyer
                </button>
                <button
                  type="button"
                  onClick={() => setRole("SELLER")}
                  className={cx(
                    "rounded-xl px-3 py-2 text-sm font-semibold transition",
                    role === "SELLER"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900",
                  )}
                >
                  Seller
                </button>
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              Roles are selected at login; your permissions depend on your
              account.
            </p>

            <form onSubmit={onSubmit} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-700">
                  Email/Username
                </label>
                <input
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder="e.g. rider_01@shopbike.com"
                  className="mt-1 h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none ring-emerald-200 focus:ring-4"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-700">
                    Password
                  </label>
                  <span className="text-xs font-semibold text-slate-400">
                    Forgot password? (Sprint 1)
                  </span>
                </div>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1 h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none ring-emerald-200 focus:ring-4"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={cx(
                  "h-11 w-full rounded-2xl font-semibold text-white transition",
                  submitting
                    ? "bg-emerald-300"
                    : "bg-emerald-600 hover:bg-emerald-700",
                )}
              >
                {submitting ? "Logging in..." : "Log in"}
              </button>

              <Link
                to="/"
                className="grid h-11 w-full place-items-center rounded-2xl border border-black/10 bg-white text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                Continue browsing
              </Link>
            </form>

            <div className="mt-6 text-center text-sm text-slate-600">
              Don&apos;t have an account?{" "}
              <span className="font-semibold text-slate-400">(Sprint 1)</span>
              <div className="mt-1 text-[11px] text-slate-400">
                Choose your role first.
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-400">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms</span>
            <span>•</span>
            <span>Cookies</span>
          </div>
        </div>
      </main>
    </div>
  );
}
