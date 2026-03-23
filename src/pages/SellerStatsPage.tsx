import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SellerStatsPage() {
  const stats = {
    totalSales: 4250,
    totalSalesChangePct: 12,
    activeListings: 3,
    completedDeals: 12,
    avgSaleValue: 354,
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">All Stats</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your selling performance overview.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/profile">← Về hồ sơ</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Completed Deals</span>
              <div className="h-9 w-9 rounded-lg bg-primary/10" />
            </div>
            <div className="mt-3 text-2xl font-bold">{stats.completedDeals}</div>
            <p className="mt-1 text-sm text-muted-foreground">Total sold</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <div className="text-sm font-semibold">Average Sale Value</div>
            <div className="mt-3 text-2xl font-bold">${stats.avgSaleValue}</div>
            <p className="mt-1 text-sm text-muted-foreground">
              Per transaction
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
