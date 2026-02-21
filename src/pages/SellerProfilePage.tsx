import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type PaymentItem =
  | { type: "VISA" | "MASTERCARD"; label: string; sub: string; tag?: string }
  | { type: "MOMO"; label: string; sub: string; tag?: string };

export default function SellerProfilePage() {
  const navigate = useNavigate();
  const clearTokens = useAuthStore((s) => s.clearTokens);

  const seller = {
    fullName: "Alex Rivera",
    email: "alex.rivera@example.com",
    avatarUrl:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=60",
    memberSince: "September 2021",
  };

  const stats = {
    totalSales: 4250,
    totalSalesChangePct: 12,
    activeListings: 3,
  };

  const paymentMethods: PaymentItem[] = [
    { type: "VISA", label: "Visa ending in 4422", sub: "Expires 12/26", tag: "DEFAULT" },
    { type: "MOMO", label: "MoMo Wallet", sub: "Connected" },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="grid gap-6 lg:grid-cols-12">
        <aside className="lg:col-span-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <img
                  src={seller.avatarUrl}
                  alt={seller.fullName}
                  className="h-16 w-16 rounded-xl object-cover"
                />
                <div className="min-w-0">
                  <div className="truncate text-lg font-semibold">{seller.fullName}</div>
                  <div className="truncate text-sm text-muted-foreground">{seller.email}</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge>Seller</Badge>
                    <Badge variant="secondary">Verified</Badge>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                Member since {seller.memberSince}
              </p>

              <div className="mt-5 space-y-2">
                <Button
                  variant="outline"
                  className="w-full border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
                  onClick={() => alert("Sprint 1 UI only")}
                >
                  Edit Profile
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    clearTokens();
                    navigate("/", { replace: true });
                  }}
                >
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </aside>

        <section className="space-y-6 lg:col-span-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Seller Hub</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage your inventory, listings and payouts.
              </p>
            </div>
            <Button variant="link" size="sm" className="text-primary" onClick={() => alert("Sprint 1 UI only")}>
              View All Stats →
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Total Sales</span>
                  <div className="h-9 w-9 rounded-lg bg-primary/10" />
                </div>
                <div className="mt-3 text-2xl font-bold">
                  ${stats.totalSales.toLocaleString()}
                </div>
                <p className="mt-1 text-sm text-primary">+{stats.totalSalesChangePct}% this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Active Listings</span>
                  <div className="h-9 w-9 rounded-lg bg-primary/10" />
                </div>
                <div className="mt-3 text-2xl font-bold">{stats.activeListings}</div>
                <p className="mt-1 text-sm text-muted-foreground">Bikes for sale</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Payment Methods</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
                  onClick={() => alert("Sprint 1 UI only")}
                >
                  + Add New
                </Button>
              </div>

              <div className="mt-4 space-y-3">
                {paymentMethods.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg border px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold ${
                          p.type === "MOMO" ? "bg-rose-100 text-rose-700" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {p.type === "MOMO" ? "MoMo" : p.type}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          {p.label}
                          {p.tag && (
                            <Badge variant="secondary" className="text-[10px]">
                              {p.tag}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">{p.sub}</div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => alert("Sprint 1 UI only")}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
