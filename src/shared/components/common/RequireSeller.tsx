import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

export function RequireSeller() {
  const location = useLocation();
  const { accessToken, role, _hasHydrated } = useAuthStore();

  if (!_hasHydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (role !== "SELLER") {
    return <Navigate to="/403" state={{ from: location }} replace />;
  }
  return <Outlet />;
}
