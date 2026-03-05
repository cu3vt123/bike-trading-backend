import { createBrowserRouter } from "react-router-dom";

import MainLayout from "@/shared/layouts/MainLayout";
import {
  GuestRoute,
  RequireAuth,
  RequireBuyer,
  RequireSeller,
  RequireInspector,
} from "@/shared/components/common";
import { ForbiddenPage } from "@/shared/pages";

import { HomePage } from "@/features/landing";
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
} from "@/features/auth";
import { ProductDetailPage } from "@/features/bikes";
import { SupportPage, WishlistPage } from "@/features/support";
import {
  CheckoutPage,
  TransactionPage,
  FinalizePurchasePage,
  PurchaseSuccessPage,
} from "@/features/buyer";
import {
  SellerDashboardPage,
  SellerListingEditorPage,
  SellerStatsPage,
} from "@/features/seller";
import { InspectorDashboardPage } from "@/features/inspector";
import ProfilePage from "@/pages/ProfilePage";

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "bikes/:id", element: <ProductDetailPage /> },
      { path: "support", element: <SupportPage /> },
      { path: "wishlist", element: <WishlistPage /> },

      {
        element: <RequireAuth />,
        children: [{ path: "profile", element: <ProfilePage /> }],
      },

      {
        element: <RequireInspector />,
        children: [{ path: "inspector", element: <InspectorDashboardPage /> }],
      },

      {
        element: <RequireBuyer />,
        children: [
          { path: "checkout/:id", element: <CheckoutPage /> },
          { path: "transaction/:id", element: <TransactionPage /> },
          { path: "finalize/:id", element: <FinalizePurchasePage /> },
          { path: "success/:id", element: <PurchaseSuccessPage /> },
        ],
      },

      {
        element: <RequireSeller />,
        children: [
          { path: "seller", element: <SellerDashboardPage /> },
          { path: "seller/stats", element: <SellerStatsPage /> },
          { path: "seller/listings/new", element: <SellerListingEditorPage /> },
          {
            path: "seller/listings/:id/edit",
            element: <SellerListingEditorPage />,
          },
        ],
      },
    ],
  },

  {
    path: "login",
    element: (
      <GuestRoute>
        <LoginPage />
      </GuestRoute>
    ),
  },
  {
    path: "register",
    element: (
      <GuestRoute>
        <RegisterPage />
      </GuestRoute>
    ),
  },
  {
    path: "forgot-password",
    element: (
      <GuestRoute>
        <ForgotPasswordPage />
      </GuestRoute>
    ),
  },
  {
    path: "reset-password",
    element: (
      <GuestRoute>
        <ResetPasswordPage />
      </GuestRoute>
    ),
  },

  { path: "403", element: <ForbiddenPage /> },
]);
