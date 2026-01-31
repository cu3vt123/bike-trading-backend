import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

type Condition = "MINT_USED" | "GOOD_USED" | "FAIR_USED";
type Step = "DRAFT" | "PENDING_INSPECTION";

export default function SellerListingEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Sprint 1: local-only state
  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState<string>("");
  const [location, setLocation] = useState("");
  const [condition, setCondition] = useState<Condition>("MINT_USED");
  const [step, setStep] = useState<Step>("DRAFT");

  const isEdit = useMemo(() => !!id, [id]);

  function onSaveDraft() {
    // UI-only: không alert, chỉ giữ state
  }

  function onSubmitForInspection() {
    // UI-only: chuyển trạng thái + quay về dashboard
    setStep("PENDING_INSPECTION");
    navigate("/seller", { replace: true });
  }

  const locked = step === "PENDING_INSPECTION";

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-2xl font-bold text-slate-900">
            {isEdit ? "Edit listing" : "Create listing"}
          </div>
          <div className="mt-1 text-sm text-slate-500">
            Draft → Submit for Inspection → (Approve) Publish (later sprint).
          </div>
        </div>

        <Link
          to="/seller"
          className="inline-flex rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          ← Back to dashboard
        </Link>
      </div>

      {locked && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          This listing is <b>Pending Inspection</b>. Editing is locked (Sprint 1
          rule).
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">
              Bike details
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={locked}
                className="sm:col-span-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200 disabled:bg-slate-50"
                placeholder="Listing title"
              />
              <input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                disabled={locked}
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200 disabled:bg-slate-50"
                placeholder="Brand"
              />
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={locked}
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200 disabled:bg-slate-50"
                placeholder="Price (USD)"
              />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={locked}
                className="sm:col-span-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200 disabled:bg-slate-50"
                placeholder="Location"
              />

              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as Condition)}
                disabled={locked}
                className="sm:col-span-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200 disabled:bg-slate-50"
              >
                <option value="MINT_USED">Mint (Used)</option>
                <option value="GOOD_USED">Good (Used)</option>
                <option value="FAIR_USED">Fair (Used)</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">
              Photos checklist
            </div>
            <div className="mt-3 grid gap-2 text-sm text-slate-700">
              <label className="flex items-center gap-2">
                <input type="checkbox" disabled={locked} /> Full bike (both
                sides)
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" disabled={locked} /> Frame serial
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" disabled={locked} /> Drivetrain close-up
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" disabled={locked} /> Brakes / wheels
              </label>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="sticky top-6 rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">Actions</div>

            <button
              onClick={onSaveDraft}
              disabled={locked}
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
            >
              Save draft
            </button>

            <button
              onClick={onSubmitForInspection}
              disabled={locked}
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-200"
            >
              Submit for inspection →
            </button>

            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
              Rule: Only <b>APPROVE</b> → you can publish to marketplace (later
              sprint).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
