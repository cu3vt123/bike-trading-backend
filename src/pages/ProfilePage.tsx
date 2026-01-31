// src/pages/ProfilePage.tsx
import { useAuthStore } from "@/stores/useAuthStore";
import BuyerProfilePage from "@/pages/BuyerProfilePage";
import SellerProfilePage from "@/pages/SellerProfilePage";

export default function ProfilePage() {
  const role = useAuthStore((s) => s.role);

  if (role === "SELLER") return <SellerProfilePage />;
  return <BuyerProfilePage />; // default BUYER
}
