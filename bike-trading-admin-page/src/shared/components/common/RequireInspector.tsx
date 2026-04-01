import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { BicycleLoader } from "@/components/common/BicycleLoader";

export function RequireInspector() {
  const location = useLocation();
  const { accessToken, role, _hasHydrated } = useAuthStore();

  if (!_hasHydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <BicycleLoader size="md" />
      </div>
    );
  }
  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (role !== "INSPECTOR" && role !== "ADMIN") {
    return <Navigate to="/403" state={{ from: location }} replace />;
  }
  return <Outlet />;
}
