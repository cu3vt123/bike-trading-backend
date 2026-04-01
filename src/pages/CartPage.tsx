import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CartPage() {
  const title = "Giỏ hàng";
  const subtitle =
    "Bạn sẽ có thể thêm xe vào giỏ trong các bản cập nhật sau. Hiện tại, hãy thanh toán trực tiếp từ từng tin đăng.";
  const backLabel = "← Về trang chủ";

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">
              {title}
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              {isEn
                ? "Cart experience (multi-bike checkout) is on the roadmap."
                : "Trải nghiệm giỏ hàng (thanh toán nhiều xe cùng lúc) đang được phát triển."}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-dashed border-border bg-muted/40 px-4 py-6 text-sm text-muted-foreground">
            {subtitle}
          </div>
          <Button asChild variant="outline">
            <Link to="/">{backLabel}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

