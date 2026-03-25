import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { fileURLToPath } from "url";
import multer from "multer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const listingsDir = path.join(__dirname, "../../uploads/listings");

const allowedExt = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function ensureListingsDir() {
  fs.mkdirSync(listingsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    ensureListingsDir();
    cb(null, listingsDir);
  },
  filename(_req, file, cb) {
    const raw = path.extname(file.originalname || "").toLowerCase();
    const ext = allowedExt.has(raw) ? raw : ".jpg";
    cb(null, `${randomUUID()}${ext}`);
  },
});

export const listingImagesUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
  fileFilter(_req, file, cb) {
    const okMime = /^image\/(jpeg|png|webp|gif)$/i.test(file.mimetype);
    if (!okMime) {
      cb(new Error("INVALID_IMAGE_TYPE"));
      return;
    }
    cb(null, true);
  },
});
