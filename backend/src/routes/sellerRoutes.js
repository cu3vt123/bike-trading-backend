import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth.middlewares.js";
import {
  dashboard,
  listMyListings,
  listMyOrders,
  getMyListing,
  createListing,
  updateListing,
  submitForInspection,
  publishListing,
  getMyRatings,
  shipDirectToBuyer,
  shipToWarehouse,
  markListingShippedToWarehouse,
} from "../controllers/sellerController.js";
import {
  checkoutSubscription,
  mockCompletePackageOrder,
  revokeSelfSubscription,
} from "../controllers/packageController.js";
import { wrapAsync } from "../utils/handler.js";

const sellerRoutes = Router();

sellerRoutes.use(requireAuth, requireRole(["SELLER"]));

sellerRoutes.get("/dashboard", wrapAsync(dashboard));
sellerRoutes.get("/ratings", wrapAsync(getMyRatings));
sellerRoutes.get("/orders", wrapAsync(listMyOrders));
sellerRoutes.put("/orders/:orderId/ship-to-buyer", wrapAsync(shipDirectToBuyer));
sellerRoutes.put("/orders/:orderId/ship-to-warehouse", wrapAsync(shipToWarehouse));
sellerRoutes.put(
  "/listings/:id/mark-shipped-to-warehouse",
  wrapAsync(markListingShippedToWarehouse),
);
sellerRoutes.get("/listings", wrapAsync(listMyListings));
sellerRoutes.get("/listings/:id", wrapAsync(getMyListing));
sellerRoutes.post("/listings", wrapAsync(createListing));
sellerRoutes.put("/listings/:id", wrapAsync(updateListing));
sellerRoutes.put("/listings/:id/publish", wrapAsync(publishListing));
sellerRoutes.put("/listings/:id/submit", wrapAsync(submitForInspection));
sellerRoutes.post("/subscription/checkout", wrapAsync(checkoutSubscription));
sellerRoutes.post(
  "/subscription/orders/:orderId/mock-complete",
  wrapAsync(mockCompletePackageOrder),
);
sellerRoutes.put("/subscription/revoke-self", wrapAsync(revokeSelfSubscription));

export { sellerRoutes };

