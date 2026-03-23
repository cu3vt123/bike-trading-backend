import { useAuthStore } from "@/stores/useAuthStore";
import BuyerProfilePage from "@/pages/BuyerProfilePage";
import SellerProfilePage from "@/pages/SellerProfilePage";
import InspectorDashboardPage from "@/pages/InspectorDashboardPage";

export default function ProfilePage() {
  const role = useAuthStore((s) => s.role);

  if (role === "SELLER") return <SellerProfilePage />;
  if (role === "INSPECTOR" || role === "ADMIN") return <InspectorDashboardPage />;
  return <BuyerProfilePage />;
}
