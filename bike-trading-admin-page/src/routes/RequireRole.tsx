import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import type { Role } from "@/types/auth";

type Props = {
  allow: Role[]; // ["BUYER"] hoặc ["SELLER"]
};

export default function RequireRole({ allow }: Props) {
  const location = useLocation();
  const { accessToken, role } = useAuthStore();

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!role || !allow.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
