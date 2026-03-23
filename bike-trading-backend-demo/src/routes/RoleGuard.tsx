import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import type { Role } from "@/types/auth";

type Props = {
  allow: Role[];
};

export default function RoleGuard({ allow }: Props) {
  const location = useLocation();
  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.role);

  // chưa login -> đá về login
  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // login rồi nhưng sai role -> đá về home (hoặc trang 403 sau này)
  if (!role || !allow.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
