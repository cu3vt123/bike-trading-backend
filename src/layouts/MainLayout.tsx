// src/layouts/MainLayout.tsx
import { Outlet, useLocation, useNavigate } from "react-router-dom";
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-black/5 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-black/50">
          © {new Date().getFullYear()} ShopBike
        </div>
      </footer>
    </div>
  );
}
