import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import ApiError from "../utils/api-error.js";

const ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

const ALLOWED_AVATAR_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

// ── Task attachments storage ───────────────────────────────────────────────────
const taskStorage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {
    const base = file.originalname.replace(/\.[^/.]+$/, "");
    return {
      folder: "karyadesk/tasks",
      resource_type: "auto",
      public_id: `${Date.now()}-${base}`,
    };
  },
});

// ── Avatar storage ─────────────────────────────────────────────────────────────
// Cloudinary returns url + public_id on req.file automatically
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {
    const base = file.originalname.replace(/\.[^/.]+$/, "");
    return {
      folder: "karyadesk/avatars", 
      resource_type: "image", 
      public_id: `avatar-${Date.now()}-${base}`,
      transformation: [
        { width: 400, height: 400, crop: "fill", gravity: "face" },
        
      ],
    };
  },
});

// ── File filters ───────────────────────────────────────────────────────────────
function taskFileFilter(_req, file, cb) {
  if (ALLOWED_MIME.includes(file.mimetype)) return cb(null, true);
  cb(new Error("Unsupported file type"));
}

function avatarFileFilter(_req, file, cb) {
  if (ALLOWED_AVATAR_MIME.includes(file.mimetype)) return cb(null, true);
  cb(
    new ApiError(400, "Only image files are allowed (jpeg/png/webp/gif)"),
    false,
  );
}

// ── Exported multer instances ─────────────────────────────────────────────────
export const uploadTaskAttachments = multer({
  storage: taskStorage,
  fileFilter: taskFileFilter,
  limits: {
    files: 5,
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

export const uploadAvatar = multer({
  storage: avatarStorage, 
  fileFilter: avatarFileFilter,
  limits: {
    files: 1, 
    fileSize: 2 * 1024 * 1024, // 2MB
  },
});
