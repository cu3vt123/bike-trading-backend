import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

interface GuestRouteProps {
  children: React.ReactNode;
}

/** Chỉ cho guest (chưa login) – Login, Register, ForgotPassword */
export function GuestRoute({ children }: GuestRouteProps) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const location = useLocation() as { state?: { from?: { pathname?: string } } };

  if (accessToken) {
    const to = location.state?.from?.pathname || "/";
    return <Navigate to={to} replace />;
  }
  return <>{children}</>;
}
