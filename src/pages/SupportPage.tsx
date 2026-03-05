import { Link } from "react-router-dom";
import { HelpCircle, Mail, MessageCircle, FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SupportPage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Support & FAQ</h1>
        <p className="mt-1 text-muted-foreground">
          Find answers or contact the ShopBike support team.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <HelpCircle className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg">Frequently asked questions</CardTitle>
            <CardDescription>Answers about buying and selling sport bikes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="font-semibold">How to buy safely?</div>
              <p className="mt-1 text-sm text-muted-foreground">
                All listings on ShopBike are inspected before publication. You can view the detailed inspection report on the product page.
              </p>
            </div>
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="font-semibold">Deposit and payment process?</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose a bike → Checkout → Pay deposit → Transaction confirmed within 24h → Pay balance and receive bike.
              </p>
            </div>
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="font-semibold">What do sellers need to do to list?</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Register a Seller account → Create listing with photos and description → Submit for inspection → Inspector approves → Listing appears on marketplace.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <MessageCircle className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg">Contact support</CardTitle>
            <CardDescription>Live chat will be available when Backend is integrated.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
              <div>
                <div className="font-semibold">Email</div>
                <a
                  href="mailto:support@shopbike.example.com"
                  className="text-sm text-primary hover:underline"
                >
                  support@shopbike.example.com
                </a>
                <p className="mt-1 text-xs text-muted-foreground">
                  Response within 24–48 business hours.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <FileText className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
              <div>
                <div className="font-semibold">Documentation</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Visit the <Link to="/" className="text-primary hover:underline">home page</Link> and{" "}
                  <Link to="/profile" className="text-primary hover:underline">Profile</Link> for more on the process.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button asChild variant="outline">
          <Link to="/">← Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
