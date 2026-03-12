import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCallback, useState, useRef, useEffect } from "react";
import { Search, Heart, ShoppingCart, Bell } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { Logo } from "@/components/common/Logo";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { syncSellerOrderNotifications } from "@/services/sellerService";

function scrollToListings() {
  const el = document.getElementById("listings");
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.role);
  const clearTokens = useAuthStore((s) => s.clearTokens);
  const items = useNotificationStore((s) => s.items);
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const onListings = useCallback(() => {
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: "listings" } });
      return;
    }
    scrollToListings();
  }, [location.pathname, navigate]);

  const onSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const q = searchQuery.trim();
      if (q) {
        navigate("/", { state: { searchQuery: q } });
        setSearchQuery("");
        setSearchOpen(false);
      }
    },
    [searchQuery, navigate]
  );

  const onLogin = useCallback(() => {
    navigate("/login", { state: { from: location } });
  }, [navigate, location]);

  const onLogout = useCallback(() => {
    clearTokens();
    navigate("/", { replace: true });
  }, [clearTokens, navigate]);

  const onSellerDashboard = useCallback(() => {
    navigate("/seller");
  }, [navigate]);

  const onProfile = useCallback(() => {
    navigate("/profile");
  }, [navigate]);

  const onInspectorDashboard = useCallback(() => {
    navigate("/inspector");
  }, [navigate]);

  const onCart = useCallback(() => {
    navigate("/cart");
  }, [navigate]);

  const onNotifications = useCallback(() => {
    navigate("/notifications");
  }, [navigate]);

  useEffect(() => {
    if (!accessToken || role !== "SELLER") return;
    syncSellerOrderNotifications();
    const intervalId = setInterval(syncSellerOrderNotifications, 10_000);
    return () => clearInterval(intervalId);
  }, [accessToken, role]);

  const unreadCount = role ? items.filter((x) => x.role === role && !x.read).length : 0;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-transparent shadow-none backdrop-blur-md">
      <div className="relative mx-auto flex w-full max-w-[100%] items-center py-4 pl-0 pr-0 sm:pl-1 sm:pr-1">
        {/* Trái sát mép: icon kính lúp + thanh search khi mở */}
        <div className="flex min-w-0 flex-1 items-center justify-start gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen((o) => !o)}
            className="flex shrink-0 rounded-lg p-1.5 text-white/60 transition-all duration-200 hover:bg-white/5 hover:text-white/90"
            title="Tìm kiếm"
            aria-label="Tìm kiếm"
          >
            <Search className="h-5 w-5" strokeWidth={1.5} />
          </button>
          {searchOpen && (
            <form onSubmit={onSearchSubmit} className="relative min-w-[140px] flex-1 sm:min-w-[200px] sm:max-w-xs">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => {
                  setSearchQuery("");
                  setSearchOpen(false);
                }}
                placeholder="Tìm xe..."
                className="h-9 w-full rounded-lg border border-white/20 bg-white/10 pl-8 pr-3 text-sm text-white placeholder:text-white/50 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/30"
                aria-label="Tìm kiếm xe"
              />
            </form>
          )}
        </div>

        {/* Giữa: Hỗ trợ | Logo | Danh sách xe – hai bên cùng rộng để logo căn giữa đều */}
        <nav className="absolute left-1/2 flex -translate-x-1/2 items-center gap-3 text-sm">
          <Link
            to="/support"
            className="min-w-[5.5rem] py-1.5 text-center font-light tracking-wide text-white/75 transition-all duration-200 hover:text-white/95 sm:min-w-[6rem]"
          >
            Hỗ trợ
          </Link>
          <span className="text-white/40">|</span>
          <Link
            to="/"
            className="group flex flex-shrink-0 items-center justify-center transition-opacity hover:opacity-90 [&_img]:transition-transform group-hover:[&_img]:scale-[1.02]"
          >
            <Logo variant="headerStacked" />
          </Link>
          <span className="text-white/40">|</span>
          <button
            type="button"
            onClick={onListings}
            className="min-w-[5.5rem] py-1.5 text-center font-light tracking-wide text-white/75 transition-all duration-200 hover:text-white/95 sm:min-w-[6rem]"
          >
            Danh sách xe
          </button>
        </nav>

        {/* Phải sát mép: icon hành động + nút đăng nhập/role */}
        <div className="flex flex-1 items-center justify-end gap-3 text-sm">
          {/* Nếu là buyer: yêu thích + giỏ hàng */}
          {role === "BUYER" && (
            <div className="flex items-center gap-2 rounded-full bg-white/5 px-2 py-1">
              <Link
                to="/wishlist"
                className="rounded-full p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                title="Yêu thích"
                aria-label="Yêu thích"
              >
                <Heart className="h-4 w-4" strokeWidth={1.6} />
              </Link>
              <button
                type="button"
                onClick={onCart}
                className="rounded-full p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                title="Giỏ hàng"
                aria-label="Giỏ hàng"
              >
                <ShoppingCart className="h-4 w-4" strokeWidth={1.6} />
              </button>
            </div>
          )}

          {!accessToken ? (
            <>
              <Link
                to="/register"
                className="rounded-lg px-3 py-2 font-light tracking-wide text-white/70 transition-all duration-200 hover:bg-white/5 hover:text-white/95"
              >
                Đăng ký
              </Link>
              <button
                onClick={onLogin}
                className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 font-light tracking-wide text-white/90 backdrop-blur-sm transition-all duration-200 hover:border-white/30 hover:bg-white/10 hover:text-white"
              >
                Đăng nhập
              </button>
            </>
          ) : (
            <>
              {role === "SELLER" && (
                <>
                  <button
                    onClick={onSellerDashboard}
                    className="rounded-lg px-3 py-2 font-light tracking-wide text-white/70 transition-all duration-200 hover:bg-white/5 hover:text-white/95"
                  >
                    Kênh người bán
                  </button>
                  <span className="text-white/40">|</span>
                </>
              )}
              {role === "ADMIN" && (
                <>
                  <button
                    onClick={() => navigate("/admin")}
                    className="rounded-lg px-3 py-2 font-light tracking-wide text-white/70 transition-all duration-200 hover:bg-white/5 hover:text-white/95"
                  >
                    Kênh admin
                  </button>
                  <span className="text-white/40">|</span>
                </>
              )}
              {(role === "INSPECTOR" || role === "ADMIN") && (
                <>
                  <button
                    onClick={onInspectorDashboard}
                    className="rounded-lg px-3 py-2 font-light tracking-wide text-white/70 transition-all duration-200 hover:bg-white/5 hover:text-white/95"
                  >
                    Kiểm định viên
                  </button>
                  <span className="text-white/40">|</span>
                </>
              )}
              <button
                type="button"
                onClick={onNotifications}
                className="relative rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                title="Thông báo"
                aria-label="Thông báo"
              >
                <Bell className="h-4 w-4" strokeWidth={1.6} />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-primary px-1 text-[10px] font-semibold leading-4 text-primary-foreground">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={onProfile}
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 font-light tracking-wide text-white/80 backdrop-blur-sm transition-all duration-200 hover:border-white/25 hover:bg-white/10 hover:text-white/95"
              >
                Hồ sơ
              </button>
              <button
                onClick={onLogout}
                className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 font-light tracking-wide text-white/80 backdrop-blur-sm transition-all duration-200 hover:border-white/25 hover:bg-white/10 hover:text-white/95"
              >
                Đăng xuất
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
