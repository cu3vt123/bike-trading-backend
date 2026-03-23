import { useAuthStore } from "@/stores/useAuthStore";
import { Navigate, useLocation } from "react-router-dom";

export default function GuestGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const location = useLocation() as any;

  if (accessToken) {
    const to = location.state?.from?.pathname || "/";
    return <Navigate to={to} replace />;
  }
  return <>{children}</>;
}
