import multer from "multer";

import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images");
  },
  
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname); // get extension like .jpg
    const basename = path.basename(file.originalname, extension); // get name without extension
    const newFilename = basename + "-" + uniqueSuffix + extension;

    cb(null, newFilename);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1 * 1000 * 1000,
  },
});


export default upload;