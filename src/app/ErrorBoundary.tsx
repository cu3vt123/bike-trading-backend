import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  children: ReactNode;
  /** Vùng nhỏ (tab) — không hiện nút reload full app */
  variant?: "page" | "inline";
};

type State = {
  hasError: boolean;
  error: Error | null;
};

/**
 * Tránh trắng toàn trang khi một nhánh UI crash (pattern Error Boundary — Bài 09 hardening).
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      // Chỉ log chi tiết khi dev; production không spam console
      // eslint-disable-next-line no-console -- intentional dev-only diagnostics
      console.error("[ErrorBoundary]", error, info.componentStack);
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const isPage = this.props.variant !== "inline";
      return (
        <div
          className={
            isPage
              ? "mx-auto flex min-h-[40vh] max-w-lg flex-col items-center justify-center gap-4 px-4 py-16 text-center"
              : "rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm"
          }
          role="alert"
        >
          <h2 className="text-lg font-semibold text-foreground">
            {isPage ? "Đã xảy ra lỗi hiển thị" : "Lỗi tại khu vực này"}
          </h2>
          <p className="text-muted-foreground">
            {import.meta.env.DEV
              ? this.state.error.message
              : "Vui lòng tải lại trang hoặc thử lại sau."}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Thử lại
            </Button>
            {isPage && (
              <Button type="button" onClick={() => window.location.assign("/")}>
                Về trang chủ
              </Button>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
