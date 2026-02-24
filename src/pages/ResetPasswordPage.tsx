import React, { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { KeyRound, ArrowLeft } from "lucide-react";

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
import { authApi } from "@/apis/authApi";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === "true";

const PASSWORD_MIN = 8;
const PASSWORD_MAX = 64;
const PASSWORD_UPPERCASE = /[A-Z]/;
const PASSWORD_SPECIAL = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

function validatePassword(password: string): string | null {
  if (password.length < PASSWORD_MIN) {
    return `Mật khẩu phải từ ${PASSWORD_MIN}–${PASSWORD_MAX} ký tự.`;
  }
  if (password.length > PASSWORD_MAX) {
    return `Mật khẩu tối đa ${PASSWORD_MAX} ký tự.`;
  }
  if (!PASSWORD_UPPERCASE.test(password)) {
    return "Mật khẩu phải có ít nhất 1 chữ in hoa.";
  }
  if (!PASSWORD_SPECIAL.test(password)) {
    return "Mật khẩu phải có ít nhất 1 ký tự đặc biệt.";
  }
  return null;
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tokenFromUrl = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const token = tokenFromUrl?.trim();
    if (!token) {
      setError("Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.");
      return;
    }

    const pwdErr = validatePassword(password);
    if (pwdErr) {
      setError(pwdErr);
      return;
    }
    if (password !== confirmPassword) {
      setError("Xác nhận mật khẩu không khớp.");
      return;
    }

    try {
      setSubmitting(true);
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 600));
        setSuccess(true);
        return;
      }
      await authApi.resetPassword({ token, newPassword: password });
      setSuccess(true);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Link có thể đã hết hạn. Vui lòng yêu cầu link mới.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
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
                <div className="text-xs text-muted-foreground">Verified &amp; Inspected</div>
              </div>
            </Link>
          </div>
        </header>

        <main className="mx-auto flex min-h-[calc(100vh-56px)] max-w-6xl items-center justify-center px-4 py-10">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <KeyRound className="h-6 w-6" />
              </div>
              <CardTitle>Đặt mật khẩu mới thành công</CardTitle>
              <CardDescription>Bạn có thể đăng nhập bằng mật khẩu mới.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => navigate("/login", { replace: true })}>
                Đăng nhập ngay
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!tokenFromUrl) {
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
                <div className="text-xs text-muted-foreground">Verified &amp; Inspected</div>
              </div>
            </Link>
          </div>
        </header>

        <main className="mx-auto flex min-h-[calc(100vh-56px)] max-w-6xl items-center justify-center px-4 py-10">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Link không hợp lệ</CardTitle>
              <CardDescription>
                Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu link mới từ
                trang Quên mật khẩu.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/forgot-password">Yêu cầu link mới</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

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
              <div className="text-xs text-muted-foreground">Verified &amp; Inspected</div>
            </div>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/login" className="text-muted-foreground hover:text-foreground">
              Đăng nhập
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-56px)] max-w-6xl items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Đặt mật khẩu mới</CardTitle>
              <CardDescription>
                Nhập mật khẩu mới cho tài khoản của bạn. Mật khẩu cần 8–64 ký tự, có ít nhất 1 chữ
                in hoa và 1 ký tự đặc biệt.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Mật khẩu mới</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Xác nhận mật khẩu</Label>
                  <Input
                    id="confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Đang xử lý..." : "Đặt mật khẩu mới"}
                </Button>

                <Button variant="outline" className="w-full" asChild>
                  <Link to="/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại đăng nhập
                  </Link>
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
