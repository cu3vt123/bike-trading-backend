import { Router } from "express";
import { listBikes, getBike } from "../controllers/bikesController.js";
import { wrapAsync } from "../utils/handler.js";

const bikesRoutes = Router();

bikesRoutes.get("/", wrapAsync(listBikes));
bikesRoutes.get("/:id", wrapAsync(getBike));

export { bikesRoutes };

