import { Router } from "express";
import { listBrands } from "../controllers/brandsController.js";
import { wrapAsync } from "../utils/handler.js";

const brandsRoutes = Router();

/** Public: danh sách brands active (cho seller form, homepage) */
brandsRoutes.get("/", wrapAsync(listBrands));

export { brandsRoutes };
