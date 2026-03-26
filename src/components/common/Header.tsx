import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCallback, useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  Search,
  ShoppingCart,
  Bell,
  Sun,
  Moon,
  Globe,
  ChevronDown,
  Store,
  Package,
  Shield,
  ClipboardCheck,
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useLogout } from "@/hooks/useLogout";
import { Logo } from "@/components/common/Logo";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { syncSellerOrderNotifications } from "@/services/sellerService";
import { syncAdminOrderNotifications } from "@/services/adminService";
import { useTheme } from "@/app/providers/ThemeProvider";
import { useLanguageStore } from "@/stores/useLanguageStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function scrollToListings() {
  const el = document.getElementById("listings");
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

const channelIconBtn =
  "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:h-7 sm:w-7";

function NavSep() {
  return (
    <span className="shrink-0 select-none px-0.5 text-muted-foreground/45 sm:px-1" aria-hidden>
      |
    </span>
  );
}

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [langOpen, setLangOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const langBtnRef = useRef<HTMLButtonElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const [langMenuPos, setLangMenuPos] = useState({ top: 0, left: 0, minWidth: 0 });

  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.role);
  const logout = useLogout();
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

  useLayoutEffect(() => {
    if (!langOpen || !langBtnRef.current) return;
    const r = langBtnRef.current.getBoundingClientRect();
    setLangMenuPos({
      top: r.bottom + 6,
      left: r.left,
      minWidth: Math.max(r.width, 148),
    });
  }, [langOpen]);


  useEffect(() => {
    if (!langOpen) return;
    const close = () => setLangOpen(false);
    const onDoc = (e: MouseEvent) => {
      const node = e.target as Node;
      if (langBtnRef.current?.contains(node)) return;
      if (langMenuRef.current?.contains(node)) return;
      setLangOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [langOpen]);

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
    logout();
  }, [logout]);

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
    if (!accessToken) return;
    if (role === "SELLER") {
      syncSellerOrderNotifications(t);
      const intervalId = setInterval(() => syncSellerOrderNotifications(t), 10_000);
      return () => clearInterval(intervalId);
    }
    if (role === "ADMIN") {
      syncAdminOrderNotifications(t);
      const intervalId = setInterval(() => syncAdminOrderNotifications(t), 10_000);
      return () => clearInterval(intervalId);
    }
  }, [accessToken, role, t]);


  const unreadCount = role ? items.filter((x) => x.role === role && !x.read).length : 0;

  const headerClass = cn(
    "sticky top-0 z-40 border-b transition-[background-color,backdrop-filter,border-color,box-shadow] duration-300",
    isAtTop
      ? "border-transparent bg-transparent shadow-none backdrop-blur-none"
      : "border-border/25 bg-background/[0.06] shadow-sm backdrop-blur-xl dark:bg-background/[0.08]",
  );

  return (
    <header className={headerClass}>
      {/* Grid 3 cột: trái (tìm) | giữa (VI/EN | Hỗ trợ | Logo | Danh sách | sáng/tối) | phải (wishlist, đăng nhập…) */}
      <div className="mx-auto grid min-h-9 w-full max-w-[100%] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-1 overflow-x-auto whitespace-nowrap px-2 py-1 sm:min-h-10 sm:gap-x-2 sm:px-3 md:min-h-11 lg:px-4 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30">
        {/* Trái: tìm kiếm — ô nhập trượt ra (max-width) */}
        <div className="flex min-w-0 items-center justify-start">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
            }}
            onClick={() => setSearchOpen((o) => !o)}
            className="flex shrink-0 rounded-md p-0.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground sm:p-1"
            title={t("header.search")}
            aria-label={t("header.search")}
            aria-expanded={searchOpen}
          >
            <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.5} />
          </button>
          <div
            className={cn(
              "flex min-w-0 items-center overflow-hidden transition-[max-width,opacity] duration-300 ease-out will-change-[max-width]",
              searchOpen ? "max-w-[min(100vw-8rem,15rem)] opacity-100 sm:max-w-[15rem]" : "max-w-0 opacity-0",
            )}
            aria-hidden={!searchOpen}
          >
            <NavSep />
            <form onSubmit={onSearchSubmit} className="relative w-[9rem] shrink-0 sm:w-52">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground sm:h-3.5 sm:w-3.5" />
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                tabIndex={searchOpen ? 0 : -1}
                onBlur={() => {
                  setSearchQuery("");
                  setSearchOpen(false);
                }}
                placeholder={t("common.searchPlaceholder")}
                className="h-6 w-full rounded-md border border-border bg-background pl-7 pr-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring/40 sm:h-7 sm:text-sm"
                aria-label={t("header.searchBikes")}
              />
            </form>
          </div>
        </div>

        {/* Giữa: VI/EN | Hỗ trợ | Logo | Danh sách xe | sáng/tối — không | đầu/cuối khung */}
        <nav className="pointer-events-none flex items-center justify-center gap-0 text-xs text-muted-foreground sm:text-sm">
          <div className="pointer-events-auto relative shrink-0">
            <button
              ref={langBtnRef}
              type="button"
              onClick={() => setLangOpen((o) => !o)}
              className="flex items-center gap-1 rounded-md px-1.5 py-1 font-normal text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground sm:gap-1.5 sm:px-2"
              title={t("common.language")}
              aria-label={t("common.language")}
              aria-expanded={langOpen}
              aria-haspopup="listbox"
            >
              <Globe className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" strokeWidth={1.5} aria-hidden />
              <span className="text-[11px] font-medium tabular-nums text-foreground sm:text-xs">
                {lang === "vi" ? "VI" : "EN"}
              </span>
              <ChevronDown
                className={cn("h-3 w-3 shrink-0 transition-transform sm:h-3.5 sm:w-3.5", langOpen && "rotate-180")}
                aria-hidden
              />
            </button>
            {typeof document !== "undefined" &&
              langOpen &&
              createPortal(
                <div
                  ref={langMenuRef}
                  className="fixed z-[100] rounded-lg border border-border bg-popover py-1 shadow-lg"
                  style={{
                    top: langMenuPos.top,
                    left: langMenuPos.left,
                    minWidth: langMenuPos.minWidth,
                  }}
                  role="listbox"
                >
                  {(["vi", "en"] as const).map((l) => (
                    <button
                      key={l}
                      type="button"
                      role="option"
                      aria-selected={lang === l}
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
                </div>,
                document.body,
              )}
          </div>
          <NavSep />
          <Link
            to="/support"
            className="pointer-events-auto whitespace-nowrap rounded-md px-1 py-0.5 font-normal transition-colors hover:bg-muted/60 hover:text-foreground sm:px-1.5"
          >
            {t("common.support")}
          </Link>
          <NavSep />
          <Link
            to="/"
            className="pointer-events-auto flex shrink-0 items-center opacity-95 transition-opacity hover:opacity-100"
            aria-label="ShopBike"
          >
            <Logo variant="headerCenter" />
          </Link>
          <NavSep />
          <button
            type="button"
            onClick={onListings}
            className="pointer-events-auto whitespace-nowrap rounded-md px-1 py-0.5 font-normal transition-colors hover:bg-muted/60 hover:text-foreground sm:px-1.5"
          >
            {t("common.vehicleList")}
          </button>
          <NavSep />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="pointer-events-auto h-6 w-6 shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground sm:h-7 sm:w-7"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? t("header.themeLight") : t("header.themeDark")}
          >
            {theme === "dark" ? (
              <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            ) : (
              <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            )}
          </Button>
        </nav>

        {/* Phải: wishlist, đăng nhập… */}
        <div className="flex min-w-0 items-center justify-end">
          {role === "BUYER" && (
            <>
              <Link
                to="/wishlist"
                className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:p-2"
                title={t("common.wishlist")}
                aria-label={t("common.wishlist")}
              >
                <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.6} />
              </Link>
              <NavSep />
            </>
          )}

          {!accessToken ? (
            <>
              <Link
                to="/register"
                className="rounded-md px-2 py-1 text-xs font-normal text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:px-2.5 sm:text-sm"
              >
                {t("common.register")}
              </Link>
              <NavSep />
              <button
                onClick={onLogin}
                className="rounded-md border border-border/80 bg-card px-2.5 py-0.5 text-xs font-normal text-foreground transition-colors hover:bg-muted sm:px-3 sm:text-sm"
              >
                {t("common.login")}
              </button>
            </>
          ) : (
            <>
              {role === "SELLER" && (
                <>
                  <button
                    type="button"
                    onClick={onSellerDashboard}
                    className={channelIconBtn}
                    title={t("header.sellerChannel")}
                    aria-label={t("header.sellerChannel")}
                  >
                    <Store className="h-4 w-4" strokeWidth={1.6} />
                  </button>
                  <NavSep />
                  <Link
                    to="/seller/packages"
                    className={channelIconBtn}
                    title={t("seller.navPackages")}
                    aria-label={t("seller.navPackages")}
                  >
                    <Package className="h-4 w-4" strokeWidth={1.6} />
                  </Link>
                  <NavSep />
                </>
              )}
              {role === "ADMIN" && (
                <>
                  <button
                    type="button"
                    onClick={() => navigate("/admin")}
                    className={channelIconBtn}
                    title={t("header.adminChannel")}
                    aria-label={t("header.adminChannel")}
                  >
                    <Shield className="h-4 w-4" strokeWidth={1.6} />
                  </button>
                  <NavSep />
                </>
              )}
              {(role === "INSPECTOR" || role === "ADMIN") && (
                <>
                  <button
                    type="button"
                    onClick={onInspectorDashboard}
                    className={channelIconBtn}
                    title={t("header.inspector")}
                    aria-label={t("header.inspector")}
                  >
                    <ClipboardCheck className="h-4 w-4" strokeWidth={1.6} />
                  </button>
                  <NavSep />
                </>
              )}
              <button
                type="button"
                onClick={onNotifications}
                className="relative rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:p-1.5"
                title={t("header.notifications")}
                aria-label={t("header.notifications")}
              >
                <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.6} />
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 min-w-[1rem] rounded-full bg-primary px-0.5 text-[9px] font-semibold leading-3 text-primary-foreground sm:text-[10px]">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              <NavSep />
              <button
                onClick={onProfile}
                className="rounded-md px-2 py-0.5 text-xs font-normal text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:text-sm"
              >
                {t("header.profile")}
              </button>
              <NavSep />
              <button
                onClick={onLogout}
                className="rounded-md px-2 py-0.5 text-xs font-normal text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:text-sm"
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
