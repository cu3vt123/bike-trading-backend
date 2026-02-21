import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/useAuthStore";

const MOCK_ORDERS = [
  { id: "ORD-2048", bike: "Trek Marlin 5", date: "Oct 24, 2023", amount: 450, status: "IN_TRANSACTION" as const },
  { id: "ORD-1092", bike: "Specialized Allez", date: "Sep 10, 2023", amount: 400, status: "COMPLETED" as const },
  { id: "ORD-1102", bike: "Cannondale Helmet", date: "Aug 05, 2023", amount: 120, status: "COMPLETED" as const },
];

export default function BuyerProfilePage() {
  const clearTokens = useAuthStore((s) => s.clearTokens);

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="grid gap-6 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
                  A
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">Alex Rider</div>
                  <div className="truncate text-xs text-muted-foreground">
                    alex.rider@example.com
                  </div>
                </div>
              </div>

              <Badge className="mt-4">Verified Buyer</Badge>

              <nav className="mt-5 space-y-2">
                <Button
                  className="w-full justify-start"
                  size="sm"
                  onClick={() => document.getElementById("personal-info")?.scrollIntoView({ behavior: "smooth" })}
                >
                  Personal Info
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                  onClick={() => document.getElementById("orders-section")?.scrollIntoView({ behavior: "smooth" })}
                >
                  My Orders
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  Saved Bikes
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  Settings
                </Button>
              </nav>

              <Button
                variant="outline"
                className="mt-6 w-full"
                onClick={() => clearTokens()}
              >
                Logout
              </Button>
            </CardContent>
          </Card>
        </aside>

        <section className="space-y-4 lg:col-span-9">
          <div>
            <h1 className="text-2xl font-bold">Personal Information</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your personal details and account settings.
            </p>
          </div>

          <Card id="personal-info">
            <CardContent className="pt-6">
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <div className="text-sm font-semibold text-primary">
                  Privacy Protection Active
                </div>
                <p className="mt-1 text-xs text-primary/80">
                  Your contact details are protected until the transaction is confirmed.
                </p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground">Full Name</div>
                  <div className="mt-1 rounded-lg border bg-muted/50 px-4 py-3 text-sm">
                    Alex Rider
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-muted-foreground">Email Address</div>
                  <div className="mt-1 rounded-lg border bg-muted/50 px-4 py-3 text-sm">
                    alex.rider@example.com
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-xs font-semibold text-muted-foreground">Phone Number</div>
                  <div className="mt-1 rounded-lg border bg-muted/50 px-4 py-3 text-sm">
                    +84 9xx xxx xxx
                  </div>
                </div>
              </div>

              <div id="orders-section" className="mt-6 flex items-center justify-between">
                <span className="text-sm font-semibold">Recent Orders</span>
                <Button variant="link" size="sm" className="text-primary" asChild>
                  <a href="#orders-section">View All Orders</a>
                </Button>
              </div>

              <div className="mt-3 overflow-hidden rounded-lg border">
                <div className="grid grid-cols-12 bg-muted/50 px-4 py-3 text-xs font-semibold text-muted-foreground">
                  <div className="col-span-5">Bike Details</div>
                  <div className="col-span-3">Date</div>
                  <div className="col-span-2">Amount</div>
                  <div className="col-span-2 text-right">Status</div>
                </div>

                {MOCK_ORDERS.map((o) => (
                  <div
                    key={o.id}
                    className="grid grid-cols-12 items-center border-t px-4 py-3 text-sm"
                  >
                    <div className="col-span-5">
                      <div className="font-semibold">{o.bike}</div>
                      <div className="text-xs text-muted-foreground">ID: {o.id}</div>
                    </div>
                    <div className="col-span-3 text-muted-foreground">{o.date}</div>
                    <div className="col-span-2 font-semibold">${o.amount.toFixed(2)}</div>
                    <div className="col-span-2 flex justify-end">
                      <Badge variant={o.status === "IN_TRANSACTION" ? "secondary" : "default"}>
                        {o.status === "IN_TRANSACTION" ? "In Transaction" : "Completed"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                Sprint 1 UI • Orders are mock data.
              </p>

              <Button asChild variant="link" className="mt-4">
                <Link to="/">← Back to Home</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
