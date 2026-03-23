import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

export default function RequireInspector() {
  const location = useLocation();
  const { accessToken, role } = useAuthStore();

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role !== "INSPECTOR" && role !== "ADMIN") {
    return <Navigate to="/403" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
