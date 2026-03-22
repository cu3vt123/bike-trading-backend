import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth.middlewares.js";
import {
  listWarehousePending,
  confirmWarehouse,
  listReInspectionOrders,
  markReInspectionDone,
  getAdminStats,
  listUsers,
  hideUser,
  unhideUser,
  listListings,
  hideListing,
  unhideListing,
  listWarehouseIntakePending,
  confirmWarehouseIntake,
  confirmWarehouseReInspection,
  listSellerSubscriptions,
  revokeSellerSubscription,
} from "../controllers/adminController.js";
import {
  adminListReviews,
  adminUpdateReview,
} from "../controllers/reviewController.js";
import {
  adminListBrands,
  adminCreateBrand,
  adminUpdateBrand,
  adminDeleteBrand,
} from "../controllers/brandsController.js";
import { wrapAsync } from "../utils/handler.js";

const adminRoutes = Router();

adminRoutes.use(requireAuth);

adminRoutes.get("/orders/warehouse-pending", requireRole(["ADMIN"]), wrapAsync(listWarehousePending));
adminRoutes.put("/orders/:id/confirm-warehouse", requireRole(["ADMIN"]), wrapAsync(confirmWarehouse));
adminRoutes.get("/orders/re-inspection", requireRole(["ADMIN", "INSPECTOR"]), wrapAsync(listReInspectionOrders));
adminRoutes.put("/orders/:id/re-inspection-done", requireRole(["ADMIN", "INSPECTOR"]), wrapAsync(markReInspectionDone));
adminRoutes.get("/dashboard/stats", requireRole(["ADMIN"]), wrapAsync(getAdminStats));
adminRoutes.get("/users", requireRole(["ADMIN"]), wrapAsync(listUsers));
adminRoutes.get("/seller-subscriptions", requireRole(["ADMIN"]), wrapAsync(listSellerSubscriptions));
adminRoutes.put("/users/:id/revoke-subscription", requireRole(["ADMIN"]), wrapAsync(revokeSellerSubscription));
adminRoutes.put("/users/:id/hide", requireRole(["ADMIN"]), wrapAsync(hideUser));
adminRoutes.put("/users/:id/unhide", requireRole(["ADMIN"]), wrapAsync(unhideUser));
adminRoutes.get(
  "/listings/pending-warehouse-intake",
  requireRole(["ADMIN", "INSPECTOR"]),
  wrapAsync(listWarehouseIntakePending),
);
adminRoutes.put(
  "/listings/:id/confirm-warehouse-intake",
  requireRole(["ADMIN"]),
  wrapAsync(confirmWarehouseIntake),
);
adminRoutes.put(
  "/listings/:id/confirm-warehouse-re-inspection",
  requireRole(["ADMIN", "INSPECTOR"]),
  wrapAsync(confirmWarehouseReInspection),
);
adminRoutes.get("/listings", requireRole(["ADMIN"]), wrapAsync(listListings));
adminRoutes.put("/listings/:id/hide", requireRole(["ADMIN"]), wrapAsync(hideListing));
adminRoutes.put("/listings/:id/unhide", requireRole(["ADMIN"]), wrapAsync(unhideListing));
adminRoutes.get("/reviews", requireRole(["ADMIN"]), wrapAsync(adminListReviews));
adminRoutes.put("/reviews/:id", requireRole(["ADMIN"]), wrapAsync(adminUpdateReview));
adminRoutes.get("/brands", requireRole(["ADMIN"]), wrapAsync(adminListBrands));
adminRoutes.post("/brands", requireRole(["ADMIN"]), wrapAsync(adminCreateBrand));
adminRoutes.put("/brands/:id", requireRole(["ADMIN"]), wrapAsync(adminUpdateBrand));
adminRoutes.delete("/brands/:id", requireRole(["ADMIN"]), wrapAsync(adminDeleteBrand));

export { adminRoutes };

