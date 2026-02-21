import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import BuyerProfilePage from "@/pages/BuyerProfilePage";
import SellerProfilePage from "@/pages/SellerProfilePage";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const role = useAuthStore((s) => s.role);

  if (role === "SELLER") return <SellerProfilePage />;
  if (role === "INSPECTOR" || role === "ADMIN") {
    return (
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardContent className="py-12 text-center">
            <h1 className="text-xl font-semibold">{role} Profile</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {role} dashboard coming in Sprint 2.
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link to="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  return <BuyerProfilePage />;
}
