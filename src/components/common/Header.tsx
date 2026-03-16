import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCallback, useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Search, ShoppingCart, Bell, Sun, Moon, Globe, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { Logo } from "@/components/common/Logo";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { syncSellerOrderNotifications } from "@/services/sellerService";
import { useTheme } from "@/app/providers/ThemeProvider";
import { useLanguageStore } from "@/stores/useLanguageStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function scrollToListings() {
  const el = document.getElementById("listings");
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [langOpen, setLangOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.role);
  const clearTokens = useAuthStore((s) => s.clearTokens);
  const items = useNotificationStore((s) => s.items);
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang } = useLanguageStore();
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang === "vi" ? "vi" : "en";
  }, [lang]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    if (langOpen) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [langOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY < 4);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
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


  const onNotifications = useCallback(() => {
    navigate("/notifications");
  }, [navigate]);

  useEffect(() => {
    if (!accessToken || role !== "SELLER") return;
    syncSellerOrderNotifications(t);
    const intervalId = setInterval(() => syncSellerOrderNotifications(t), 10_000);
    return () => clearInterval(intervalId);
  }, [accessToken, role, t]);


  const unreadCount = role ? items.filter((x) => x.role === role && !x.read).length : 0;

  const headerClass = cn(
    "sticky top-0 z-40 border-b backdrop-blur-md transition-colors duration-300",
    isAtTop
      ? "border-transparent bg-transparent shadow-none"
      : "border-border bg-background/90 shadow-sm",
  );

  return (
    <header className={headerClass}>
      <div className="relative mx-auto flex w-full max-w-[100%] items-center py-4 pl-0 pr-0 sm:pl-1 sm:pr-1">
        {/* Trái sát mép: icon kính lúp + thanh search khi mở */}
        <div className="flex min-w-0 flex-1 items-center justify-start gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen((o) => !o)}
            className="flex shrink-0 rounded-lg p-1.5 text-muted-foreground transition-all duration-200 hover:bg-muted/40 hover:text-foreground"
            title={t("header.search")}
            aria-label={t("header.search")}
          >
            <Search className="h-5 w-5" strokeWidth={1.5} />
          </button>
          {searchOpen && (
            <form onSubmit={onSearchSubmit} className="relative min-w-[140px] flex-1 sm:min-w-[200px] sm:max-w-xs">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => {
                  setSearchQuery("");
                  setSearchOpen(false);
                }}
                placeholder={t("common.searchPlaceholder")}
                className="h-9 w-full rounded-lg border border-border bg-background pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring/40"
                aria-label={t("header.searchBikes")}
              />
            </form>
          )}
        </div>

        {/* Giữa: Ngôn ngữ | Hỗ trợ | Logo | Danh sách xe */}
        <nav
          className="absolute left-1/2 flex -translate-x-1/2 items-center gap-3 text-sm text-muted-foreground"
        >
          <div className="relative" ref={langRef}>
            <button
              type="button"
              onClick={() => setLangOpen((o) => !o)}
              className="flex items-center gap-1 rounded-lg py-1.5 pl-2 pr-1.5 font-light tracking-wide text-muted-foreground transition-all duration-200 hover:text-foreground"
              title={t("common.language")}
              aria-label={t("common.language")}
              aria-expanded={langOpen}
            >
              <Globe className="h-4 w-4" strokeWidth={1.5} />
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", langOpen && "rotate-180")} />
            </button>
            {langOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 min-w-[8rem] rounded-lg border border-border bg-popover py-1 shadow-md">
                {(["vi", "en"] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => {
                      setLang(l);
                      setLangOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                      lang === l && "bg-accent/80 font-medium text-accent-foreground",
                    )}
                  >
                    {l === "vi" ? t("common.vietnamese") : t("common.english")}
                  </button>
                ))}
              </div>
            )}
          </div>
          <span className="text-muted-foreground/50">|</span>
          <Link
            to="/support"
            className="min-w-[5.5rem] py-1.5 text-center font-light tracking-wide text-muted-foreground transition-all duration-200 hover:text-foreground sm:min-w-[6rem]"
          >
            {t("common.support")}
          </Link>
          <span className="text-muted-foreground/50">|</span>
          <Link
            to="/"
            className="group flex flex-shrink-0 items-center justify-center transition-opacity hover:opacity-90 [&_img]:transition-transform group-hover:[&_img]:scale-[1.02]"
          >
            <Logo variant="headerStacked" />
          </Link>
          <span className="text-muted-foreground/50">|</span>
          <button
            type="button"
            onClick={onListings}
            className="min-w-[5.5rem] py-1.5 text-center font-light tracking-wide text-muted-foreground transition-all duration-200 hover:text-foreground sm:min-w-[6rem]"
          >
            {t("common.vehicleList")}
          </button>
        </nav>

        {/* Phải sát mép: icon hành động + nút đăng nhập/role */}
        <div className="flex flex-1 items-center justify-end gap-3 text-sm">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? t("header.themeLight") : t("header.themeDark")}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          {/* Buyer: giỏ hàng (dẫn tới danh sách yêu thích) */}
          {role === "BUYER" && (
            <Link
              to="/wishlist"
              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title={t("common.wishlist")}
              aria-label={t("common.wishlist")}
            >
              <ShoppingCart className="h-4 w-4" strokeWidth={1.6} />
            </Link>
          )}

          {!accessToken ? (
            <>
              <Link
                to="/register"
                className="rounded-lg px-3 py-2 font-light tracking-wide text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground"
              >
                {t("common.register")}
              </Link>
              <button
                onClick={onLogin}
                className="rounded-lg border border-border bg-card px-4 py-2 font-light tracking-wide text-foreground backdrop-blur-sm transition-all duration-200 hover:border-ring hover:bg-muted hover:text-foreground"
              >
                {t("common.login")}
              </button>
            </>
          ) : (
            <>
              {role === "SELLER" && (
                <>
                  <button
                    onClick={onSellerDashboard}
                    className="rounded-lg px-3 py-2 font-light tracking-wide text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground"
                  >
                    {t("header.sellerChannel")}
                  </button>
                  <span className="text-muted-foreground/50">|</span>
                </>
              )}
              {role === "ADMIN" && (
                <>
                  <button
                    onClick={() => navigate("/admin")}
                    className="rounded-lg px-3 py-2 font-light tracking-wide text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground"
                  >
                    {t("header.adminChannel")}
                  </button>
                  <span className="text-muted-foreground/50">|</span>
                </>
              )}
              {(role === "INSPECTOR" || role === "ADMIN") && (
                <>
                  <button
                    onClick={onInspectorDashboard}
                    className="rounded-lg px-3 py-2 font-light tracking-wide text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground"
                  >
                    {t("header.inspector")}
                  </button>
                  <span className="text-muted-foreground/50">|</span>
                </>
              )}
              <button
                type="button"
                onClick={onNotifications}
                className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title={t("header.notifications")}
                aria-label={t("header.notifications")}
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
                className="rounded-lg border border-border bg-card px-3 py-2 font-light tracking-wide text-muted-foreground backdrop-blur-sm transition-all duration-200 hover:border-ring hover:bg-muted hover:text-foreground"
              >
                {t("header.profile")}
              </button>
              <button
                onClick={onLogout}
                className="rounded-lg border border-border bg-card px-4 py-2 font-light tracking-wide text-muted-foreground backdrop-blur-sm transition-all duration-200 hover:border-ring hover:bg-muted hover:text-foreground"
              >
                {t("common.logout")}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
