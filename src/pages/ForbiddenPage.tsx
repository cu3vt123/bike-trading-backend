import { Link } from "react-router-dom";
import { ShieldX } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <ShieldX className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">403 Không có quyền truy cập</CardTitle>
          <CardDescription>
            Bạn không có quyền truy cập trang này. Vai trò tài khoản có thể không
            cho phép thao tác này.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button asChild className="w-full">
            <Link to="/">Về trang chủ</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/login">Đăng nhập với vai trò khác</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
