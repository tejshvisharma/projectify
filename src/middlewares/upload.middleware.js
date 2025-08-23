import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {
    // keep names clean; Cloudinary will append extension automatically
    const base = file.originalname.replace(/\.[^/.]+$/, "");
    return {
      folder: "projectify/tasks", // Cloudinary folder
      resource_type: "auto", // auto-detect (image/pdf/video)
      public_id: `${Date.now()}-${base}`,
    };
  },
});

function fileFilter(_req, file, cb) {
  if (ALLOWED_MIME.includes(file.mimetype)) return cb(null, true);
  cb(new Error("Unsupported file type"));
}

export const uploadTaskAttachments = multer({
  storage,
  fileFilter,
  limits: {
    files: 5, // max 5 files per request
    fileSize: 10 * 1024 * 1024, // 10MB each
  },
});
