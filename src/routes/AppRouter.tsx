// src/routes/AppRouter.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "@/layouts/MainLayout";
import HomePage from "@/pages/HomePage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ForbiddenPage from "@/pages/ForbiddenPage";

import GuestGuard from "@/routes/GuestGuard";
import RequireAuth from "@/routes/RequireAuth";
import RequireBuyer from "@/routes/RequireBuyer";
import RequireSeller from "@/routes/RequireSeller";

// Buyer pages (Sprint 1 UI-only)
import CheckoutPage from "@/pages/CheckoutPage";
import TransactionPage from "@/pages/TransactionPage";
import FinalizePurchasePage from "@/pages/FinalizePurchasePage";
import PurchaseSuccessPage from "@/pages/PurchaseSuccessPage";

// Seller pages (Sprint 1 UI-only)
import SellerDashboardPage from "@/pages/SellerDashboardPage";
import SellerListingEditorPage from "@/pages/SellerListingEditorPage";

// Profile (auto render buyer/seller)
import ProfilePage from "@/pages/ProfilePage";

// NotFound

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages inside MainLayout */}
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="bikes/:id" element={<ProductDetailPage />} />

          {/* ✅ Profile: chỉ cần login, tự ra Buyer/Seller profile */}
          <Route element={<RequireAuth />}>
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* BUYER-only flow */}
          <Route element={<RequireBuyer />}>
            <Route path="checkout/:id" element={<CheckoutPage />} />
            <Route path="transaction/:id" element={<TransactionPage />} />
            <Route path="finalize/:id" element={<FinalizePurchasePage />} />
            <Route path="success/:id" element={<PurchaseSuccessPage />} />
          </Route>

          {/* SELLER-only flow */}
          <Route element={<RequireSeller />}>
            <Route path="seller" element={<SellerDashboardPage />} />
            <Route
              path="seller/listings/new"
              element={<SellerListingEditorPage />}
            />
            <Route
              path="seller/listings/:id/edit"
              element={<SellerListingEditorPage />}
            />
          </Route>
        </Route>

        {/* Login / Register outside MainLayout */}
        <Route
          path="/login"
          element={
            <GuestGuard>
              <LoginPage />
            </GuestGuard>
          }
        />
        <Route
          path="/register"
          element={
            <GuestGuard>
              <RegisterPage />
            </GuestGuard>
          }
        />

        {/* 403 Forbidden - wrong role */}
        <Route path="/403" element={<ForbiddenPage />} />
      </Routes>
    </BrowserRouter>
  );
}
