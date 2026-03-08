import { Link } from "react-router-dom";
import { HelpCircle, Mail, MessageCircle, FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SupportPage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Hỗ trợ & Câu hỏi thường gặp</h1>
        <p className="mt-1 text-muted-foreground">
          Tìm câu trả lời hoặc liên hệ đội hỗ trợ ShopBike.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <HelpCircle className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg">Câu hỏi thường gặp</CardTitle>
            <CardDescription>Câu trả lời về mua bán xe thể thao.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="font-semibold">Mua xe an toàn như thế nào?</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Mọi tin đăng trên ShopBike đều được kiểm định trước khi xuất bản. Bạn có thể xem báo cáo kiểm định chi tiết trên trang sản phẩm.
              </p>
            </div>
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="font-semibold">Quy trình đặt cọc và thanh toán?</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Chọn xe → Thanh toán → Đặt cọc → Giao dịch xác nhận trong 24h → Thanh toán số dư và nhận xe.
              </p>
            </div>
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="font-semibold">Người bán cần làm gì để đăng tin?</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Đăng ký tài khoản Người bán → Tạo tin với ảnh và mô tả → Gửi kiểm định → Kiểm định viên duyệt → Tin hiển thị trên sàn.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <MessageCircle className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg">Liên hệ hỗ trợ</CardTitle>
            <CardDescription>Chat trực tuyến sẽ có khi tích hợp Backend.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
              <div>
                <div className="font-semibold">Email</div>
                <a
                  href="mailto:support@shopbike.example.com"
                  className="text-sm text-primary hover:underline"
                >
                  support@shopbike.example.com
                </a>
                <p className="mt-1 text-xs text-muted-foreground">
                  Phản hồi trong 24–48 giờ làm việc.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <FileText className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
              <div>
                <div className="font-semibold">Tài liệu</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Xem <Link to="/" className="text-primary hover:underline">trang chủ</Link> và{" "}
                  <Link to="/profile" className="text-primary hover:underline">Hồ sơ</Link> để biết thêm về quy trình.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button asChild variant="outline">
          <Link to="/">← Về trang chủ</Link>
        </Button>
      </div>
    </div>
  );
}
