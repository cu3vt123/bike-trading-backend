import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { useAuthStore } from "@/stores/useAuthStore";

function scrollToListings() {
  const el = document.getElementById("listings");
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.role);
  const clearTokens = useAuthStore((s) => s.clearTokens);

  const onExplore = useCallback(() => {
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: "listings" } });
      return;
    }
    scrollToListings();
  }, [location.pathname, navigate]);

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

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          to="/"
          className="group flex items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground text-base font-bold shadow-sm transition-transform group-hover:scale-105">
            S
          </span>
          <div className="leading-tight">
            <div className="text-sm font-bold text-slate-900">ShopBike</div>
            <div className="text-xs text-slate-500">
              Verified &amp; Inspected
            </div>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center gap-1 sm:gap-2">
          <button
            onClick={onExplore}
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            Explore
          </button>

          {!!accessToken && role === "BUYER" && (
            <Link
              to="/wishlist"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              Wishlist
            </Link>
          )}

          <Link
            to="/support"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            Support
          </Link>

          {!!accessToken && (
            <button
              onClick={onProfile}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50"
            >
              Profile
            </button>
          )}

          {!!accessToken && role === "SELLER" && (
            <button
              onClick={onSellerDashboard}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50"
            >
              Seller dashboard
            </button>
          )}

          {!!accessToken && (role === "INSPECTOR" || role === "ADMIN") && (
            <button
              onClick={onInspectorDashboard}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50"
            >
              Inspector
            </button>
          )}

          {!accessToken ? (
            <>
              <Link
                to="/register"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                Sign up
              </Link>
              <button
                onClick={onLogin}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow"
              >
                Login
              </button>
            </>
          ) : (
            <button
              onClick={onLogout}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50"
            >
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
