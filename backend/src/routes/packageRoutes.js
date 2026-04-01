import { Router } from "express";
import { listPackages } from "../controllers/packageController.js";
import { wrapAsync } from "../utils/handler.js";

const packageRoutes = Router();
packageRoutes.get("/", wrapAsync(listPackages));

export { packageRoutes };
