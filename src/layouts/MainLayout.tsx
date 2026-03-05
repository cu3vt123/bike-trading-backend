// src/layouts/MainLayout.tsx
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "@/components/common/Header";

type LayoutNavState = {
  scrollTo?: string; // vd: "listings"
};

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const state = (location.state ?? {}) as LayoutNavState;

    if (!state.scrollTo) return;

    // delay nhẹ để page render xong rồi mới scroll
    const t = window.setTimeout(() => {
      const el = document.getElementById(state.scrollTo!);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });

      // clear state để không bị scroll lại khi refresh/back
      navigate(location.pathname, { replace: true, state: null });
    }, 0);

    return () => window.clearTimeout(t);
  }, [location.pathname, location.state, navigate]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="mx-auto flex-1 w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6">
          <span className="text-sm text-slate-500">
            © {new Date().getFullYear()} ShopBike — Verified &amp; Inspected Marketplace
          </span>
          <div className="flex gap-6 text-sm">
            <Link to="/support" className="text-slate-500 transition-colors hover:text-primary">
              Support
            </Link>
            <Link to="/#listings" className="text-slate-500 transition-colors hover:text-primary">
              Browse Bikes
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
