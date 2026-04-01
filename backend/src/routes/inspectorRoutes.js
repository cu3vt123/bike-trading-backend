import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth.middlewares.js";
import {
  pendingListings,
  getListing,
  approve,
  reject,
  needUpdate,
} from "../controllers/inspectorController.js";
import { wrapAsync } from "../utils/handler.js";

const inspectorRoutes = Router();

inspectorRoutes.use(requireAuth, requireRole(["INSPECTOR", "ADMIN"]));

inspectorRoutes.get("/pending-listings", wrapAsync(pendingListings));
inspectorRoutes.get("/listings/:id", wrapAsync(getListing));
inspectorRoutes.put("/listings/:id/approve", wrapAsync(approve));
inspectorRoutes.put("/listings/:id/reject", wrapAsync(reject));
inspectorRoutes.put("/listings/:id/need-update", wrapAsync(needUpdate));

export { inspectorRoutes };

