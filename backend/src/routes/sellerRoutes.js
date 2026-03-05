import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth.middlewares.js";
import {
  dashboard,
  listMyListings,
  getMyListing,
  createListing,
  updateListing,
  submitForInspection,
} from "../controllers/sellerController.js";
import { wrapAsync } from "../utils/handler.js";

const sellerRoutes = Router();

sellerRoutes.use(requireAuth, requireRole(["SELLER"]));

sellerRoutes.get("/dashboard", wrapAsync(dashboard));
sellerRoutes.get("/listings", wrapAsync(listMyListings));
sellerRoutes.get("/listings/:id", wrapAsync(getMyListing));
sellerRoutes.post("/listings", wrapAsync(createListing));
sellerRoutes.put("/listings/:id", wrapAsync(updateListing));
sellerRoutes.put("/listings/:id/submit", wrapAsync(submitForInspection));

export { sellerRoutes };

