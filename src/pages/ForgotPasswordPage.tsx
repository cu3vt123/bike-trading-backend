import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";

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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setError("Vui lòng nhập email đăng ký.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setError("Email không hợp lệ.");
      return;
    }

    try {
      setSubmitting(true);
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 800));
        setSuccess(true);
        return;
      }
      await authApi.forgotPassword(trimmed);
      setSuccess(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Đã xảy ra lỗi. Vui lòng thử lại sau.";
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
                <Mail className="h-6 w-6" />
              </div>
              <CardTitle>Kiểm tra email của bạn</CardTitle>
              <CardDescription>
                Nếu tài khoản với email <strong>{email}</strong> tồn tại, bạn sẽ nhận được
                hướng dẫn đặt lại mật khẩu.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                Chưa nhận được email? Kiểm tra thư mục spam hoặc thử lại sau vài phút.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Quay lại đăng nhập
                </Link>
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
            <Link to="/#listings" className="text-muted-foreground hover:text-foreground">
              Explore
            </Link>
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
              <CardTitle>Quên mật khẩu</CardTitle>
              <CardDescription>
                Nhập email đăng ký tài khoản. Chúng tôi sẽ gửi link đặt lại mật khẩu.
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
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    autoComplete="email"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Đang gửi..." : "Gửi link đặt lại mật khẩu"}
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
