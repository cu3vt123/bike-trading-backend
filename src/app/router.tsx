import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense, type ReactNode } from "react";

import MainLayout from "@/shared/layouts/MainLayout";
import {
  GuestRoute,
  RequireAuth,
  RequireBuyer,
  RequireSeller,
  RequireInspector,
  RequireAdmin,
} from "@/shared/components/common";
import { ForbiddenPage } from "@/shared/pages";
import { RouteFallback } from "@/shared/components/common/RouteFallback";

// Các trang public, auth truy cập thường xuyên: import trực tiếp
import { HomePage } from "@/features/landing";
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
} from "@/features/auth";

// Các trang ít truy cập hơn: lazy load để giảm bundle ban đầu
const ProductDetailPage = lazy(() =>
  import("@/features/bikes").then((m) => ({ default: m.ProductDetailPage })),
);
const SupportPage = lazy(() =>
  import("@/features/support").then((m) => ({ default: m.SupportPage })),
);
const WishlistPage = lazy(() =>
  import("@/features/support").then((m) => ({ default: m.WishlistPage })),
);
const CheckoutPage = lazy(() =>
  import("@/features/buyer").then((m) => ({ default: m.CheckoutPage })),
);
const TransactionPage = lazy(() =>
  import("@/features/buyer").then((m) => ({ default: m.TransactionPage })),
);
const FinalizePurchasePage = lazy(() =>
  import("@/features/buyer").then((m) => ({ default: m.FinalizePurchasePage })),
);
const PurchaseSuccessPage = lazy(() =>
  import("@/features/buyer").then((m) => ({ default: m.PurchaseSuccessPage })),
);
const SellerDashboardPage = lazy(() =>
  import("@/features/seller").then((m) => ({ default: m.SellerDashboardPage })),
);
const SellerListingEditorPage = lazy(() =>
  import("@/features/seller").then((m) => ({
    default: m.SellerListingEditorPage,
  })),
);
const SellerStatsPage = lazy(() =>
  import("@/features/seller").then((m) => ({ default: m.SellerStatsPage })),
);
const SellerPackagePage = lazy(() =>
  import("@/features/seller").then((m) => ({ default: m.SellerPackagePage })),
);
const InspectorDashboardPage = lazy(() =>
  import("@/features/inspector").then((m) => ({
    default: m.InspectorDashboardPage,
  })),
);
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const AdminDashboardPage = lazy(() => import("@/pages/AdminDashboardPage"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));

const withSuspense = (children: ReactNode) => (
  <Suspense fallback={<RouteFallback />}>{children}</Suspense>
);

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "bikes/:id", element: withSuspense(<ProductDetailPage />) },
      { path: "support", element: withSuspense(<SupportPage />) },
      { path: "wishlist", element: withSuspense(<WishlistPage />) },

      {
        element: <RequireAuth />,
        children: [
          { path: "profile", element: withSuspense(<ProfilePage />) },
          {
            path: "notifications",
            element: withSuspense(<NotificationsPage />),
          },
        ],
      },

      {
        element: <RequireInspector />,
        children: [
          {
            path: "inspector",
            element: withSuspense(<InspectorDashboardPage />),
          },
        ],
      },

      {
        element: <RequireAdmin />,
        children: [
          {
            path: "admin",
            element: withSuspense(<AdminDashboardPage />),
          },
        ],
      },

      {
        element: <RequireBuyer />,
        children: [
          {
            path: "checkout/:id",
            element: withSuspense(<CheckoutPage />),
          },
          {
            path: "transaction/:id",
            element: withSuspense(<TransactionPage />),
          },
          {
            path: "finalize/:id",
            element: withSuspense(<FinalizePurchasePage />),
          },
          {
            path: "success/:id",
            element: withSuspense(<PurchaseSuccessPage />),
          },
        ],
      },

      {
        element: <RequireSeller />,
        children: [
          {
            path: "seller",
            element: withSuspense(<SellerDashboardPage />),
          },
          {
            path: "seller/stats",
            element: withSuspense(<SellerStatsPage />),
          },
          {
            path: "seller/packages",
            element: withSuspense(<SellerPackagePage />),
          },
          {
            path: "seller/listings/new",
            element: withSuspense(<SellerListingEditorPage />),
          },
          {
            path: "seller/listings/:id/edit",
            element: withSuspense(<SellerListingEditorPage />),
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
