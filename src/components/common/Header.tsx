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
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold">
            S
          </span>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-slate-900">ShopBike</div>
            <div className="text-xs text-slate-500">
              Verified &amp; Inspected
            </div>
          </div>
        </Link>

        <nav className="flex items-center gap-3">
          <button
            onClick={onExplore}
            className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Explore
          </button>

          {!!accessToken && role === "BUYER" && (
            <Link
              to="/wishlist"
              className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Wishlist
            </Link>
          )}

          <Link
            to="/support"
            className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Support
          </Link>

          {/* ✅ Login rồi thì hiện Profile (Buyer/Seller đều có) */}
          {!!accessToken && (
            <button
              onClick={onProfile}
              className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Profile
            </button>
          )}

          {/* ✅ SELLER mới thấy Dashboard */}
          {!!accessToken && role === "SELLER" && (
            <button
              onClick={onSellerDashboard}
              className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Seller dashboard
            </button>
          )}

          {/* ✅ INSPECTOR / ADMIN thấy Inspector Dashboard */}
          {!!accessToken && (role === "INSPECTOR" || role === "ADMIN") && (
            <button
              onClick={onInspectorDashboard}
              className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Inspector
            </button>
          )}

          {!accessToken ? (
            <>
              <Link
                to="/register"
                className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Sign up
              </Link>
              <button
                onClick={onLogin}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Login
              </button>
            </>
          ) : (
            <button
              onClick={onLogout}
              className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
