import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import ApiError from "../utils/api-error.js";

// 🔥 Allow ALL file types for tasks (controlled via size & count)
const ALLOWED_MIME = null; // null = allow all

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
    const base = file.originalname; //  DO NOT REMOVE EXTENSION

    let resourceType = "raw";

    if (file.mimetype.startsWith("image/")) {
      resourceType = "image";
    } else if (file.mimetype.startsWith("video/")) {
      resourceType = "video";
    }

    return {
      folder: "karyadesk/tasks",
      resource_type: resourceType,
      public_id: `${Date.now()}-${base}`, // now includes .pdf
    };
  },
});

// ── Avatar storage ─────────────────────────────────────────────────────────────
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
  // ✅ Allow all files OR restrict if list is defined
  if (!ALLOWED_MIME || ALLOWED_MIME.includes(file.mimetype)) {
    return cb(null, true);
  }

  cb(new ApiError(400, "Unsupported file type"), false);
}

function avatarFileFilter(_req, file, cb) {
  if (ALLOWED_AVATAR_MIME.includes(file.mimetype)) {
    return cb(null, true);
  }

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

export const uploadErrorHandler = (err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
   throw new ApiError(400, "File size exceeds 10MB limit");
  }

  if (err.code === "LIMIT_FILE_COUNT") {
    throw new ApiError(400, "Too many files uploaded (max allowed: 5 files per task)");
  }

  next(err);
}