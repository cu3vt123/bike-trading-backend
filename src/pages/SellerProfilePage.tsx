import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { validateExpiry } from "@/lib/validateExpiry";

type PaymentItem = {
  id: string;
  type: "VISA" | "MASTERCARD";
  label: string;
  sub: string;
  tag?: "DEFAULT";
};

const INITIAL_PAYMENTS: PaymentItem[] = [
  { id: "pm-1", type: "VISA", label: "Visa ending in 4422", sub: "Expires 12/26", tag: "DEFAULT" },
  { id: "pm-2", type: "MASTERCARD", label: "Mastercard ending in 4444", sub: "Expires 12/26" },
];

export default function SellerProfilePage() {
  const navigate = useNavigate();
  const clearTokens = useAuthStore((s) => s.clearTokens);

  const [seller, setSeller] = useState({
    fullName: "Alex Rivera",
    email: "alex.rivera@example.com",
    avatarUrl:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=60",
    memberSince: "September 2021",
  });

  const [paymentMethods, setPaymentMethods] = useState<PaymentItem[]>(INITIAL_PAYMENTS);

  const stats = {
    totalSales: 4250,
    totalSalesChangePct: 12,
    activeListings: 3,
  };

  // Edit Profile dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: "", email: "", avatarUrl: "" });

  function openEditProfile() {
    setEditForm({
      fullName: seller.fullName,
      email: seller.email,
      avatarUrl: seller.avatarUrl,
    });
    setEditError("");
    setEditOpen(true);
  }

  const [editError, setEditError] = useState("");
  function saveEditProfile() {
    const name = editForm.fullName.trim();
    const email = editForm.email.trim();
    if (!name) {
      setEditError("Full name is required.");
      return;
    }
    if (!email) {
      setEditError("Email is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEditError("Vui lòng nhập địa chỉ email hợp lệ.");
      return;
    }
    setEditError("");
    setSeller((s) => ({
      ...s,
      fullName: name,
      email,
      avatarUrl: editForm.avatarUrl?.trim() || s.avatarUrl,
    }));
    setEditOpen(false);
  }

  // Remove payment – confirm dialog
  const [removeTarget, setRemoveTarget] = useState<PaymentItem | null>(null);

  function handleRemoveClick(item: PaymentItem) {
    if (paymentMethods.length <= 1) {
      return; // Business rule: must keep at least one payment method
    }
    setRemoveTarget(item);
  }

  function confirmRemove() {
    if (!removeTarget) return;
    const remaining = paymentMethods.filter((p) => p.id !== removeTarget.id);
    const wasDefault = removeTarget.tag === "DEFAULT";
    if (wasDefault && remaining.length > 0) {
      setPaymentMethods(
        remaining.map((p, i) => ({ ...p, tag: i === 0 ? ("DEFAULT" as const) : undefined })),
      );
    } else {
      setPaymentMethods(remaining);
    }
    setRemoveTarget(null);
  }

  function setAsDefault(item: PaymentItem) {
    if (item.tag === "DEFAULT") return;
    setPaymentMethods(
      paymentMethods.map((p) => ({
        ...p,
        tag: p.id === item.id ? ("DEFAULT" as const) : undefined,
      })),
    );
  }

  // Add payment dialog
  const [addOpen, setAddOpen] = useState(false);
  const [addType, setAddType] = useState<"VISA" | "MASTERCARD">("VISA");
  const [addLast4, setAddLast4] = useState("");
  const [addExpiry, setAddExpiry] = useState("");
  const [addError, setAddError] = useState("");

  function handleAddNew() {
    setAddType("VISA");
    setAddLast4("");
    setAddExpiry("");
    setAddError("");
    setAddOpen(true);
  }

  function confirmAdd() {
    setAddError("");
    if (addType === "VISA") {
      const last4 = addLast4.replace(/\D/g, "");
      if (last4.length !== 4) {
        setAddError("Vui lòng nhập 4 chữ số cho số thẻ.");
        return;
      }
    }
    const expValidation = validateExpiry(addExpiry.trim() || "12/26");
    if (!expValidation.valid) {
      setAddError(expValidation.message ?? "Ngày hết hạn không hợp lệ");
      return;
    }
    const id = `pm-${Date.now()}`;
    const isDefault = paymentMethods.length === 0;
    const last4 = addLast4.replace(/\D/g, "").slice(-4);
    const expiry = addExpiry.trim() || "12/26";
    const label = addType === "VISA" ? `Visa ending in ${last4}` : `Mastercard ending in ${last4}`;
    setPaymentMethods([
      ...paymentMethods,
      {
        id,
        type: addType,
        label,
        sub: `Expires ${expiry}`,
        tag: isDefault ? "DEFAULT" : undefined,
      },
    ]);
    setAddOpen(false);
  }

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
                  onClick={openEditProfile}
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
            <Button variant="link" size="sm" className="text-primary" asChild>
              <Link to="/seller/stats">View All Stats →</Link>
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
                  onClick={handleAddNew}
                >
                  + Add New
                </Button>
              </div>

              <div className="mt-4 space-y-3">
                {paymentMethods.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-lg border px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">
                        {p.type}
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
                    <div className="flex items-center gap-2">
                      {p.tag !== "DEFAULT" && paymentMethods.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={() => setAsDefault(p)}
                        >
                          Set default
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveClick(p)}
                        disabled={paymentMethods.length <= 1}
                        title={paymentMethods.length <= 1 ? "Keep at least one payment method" : "Remove"}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your name, email, or profile picture.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {editError && (
              <p className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
                {editError}
              </p>
            )}
            <div className="grid gap-2">
              <Label htmlFor="edit-fullName">Full Name *</Label>
              <Input
                id="edit-fullName"
                value={editForm.fullName}
                onChange={(e) => setEditForm((f) => ({ ...f, fullName: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-avatar">Avatar URL (optional)</Label>
              <Input
                id="edit-avatar"
                placeholder="https://..."
                value={editForm.avatarUrl}
                onChange={(e) => setEditForm((f) => ({ ...f, avatarUrl: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={saveEditProfile}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Payment Confirm Dialog */}
      <Dialog open={!!removeTarget} onOpenChange={(o) => !o && setRemoveTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Payment Method</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {removeTarget?.label ?? "this payment method"}?
              {removeTarget?.tag === "DEFAULT" && paymentMethods.length >= 2 && (
                <span className="mt-2 block text-warning">
                  Đây là phương thức mặc định. Phương thức còn lại đầu tiên sẽ thành mặc định.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmRemove}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Payment Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
            <DialogDescription>
              Add a Visa or Mastercard. Last 4 digits only (PCI safe).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {addError && (
              <p className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
                {addError}
              </p>
            )}
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select value={addType} onValueChange={(v) => setAddType(v as "VISA" | "MASTERCARD")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VISA">Visa</SelectItem>
                  <SelectItem value="MASTERCARD">Mastercard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {addType === "VISA" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="add-last4">Last 4 digits</Label>
                  <Input
                    id="add-last4"
                    placeholder="4422"
                    maxLength={4}
                    value={addLast4}
                    onChange={(e) => setAddLast4(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="add-expiry">Ngày hết hạn (MM/YY)</Label>
                  <Input
                    id="add-expiry"
                    placeholder="12/28"
                    value={addExpiry}
                    onChange={(e) => {
                      let v = e.target.value.replace(/\D/g, "");
                      if (v.length >= 2) {
                        let mm = parseInt(v.slice(0, 2), 10);
                        if (mm > 12) mm = 12;
                        if (mm < 1) mm = 1;
                        v = String(mm).padStart(2, "0") + "/" + v.slice(2, 4);
                      }
                      setAddExpiry(v);
                    }}
                    maxLength={5}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={confirmAdd}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
