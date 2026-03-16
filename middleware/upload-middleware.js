const multer = require("multer");
const path = require("path");

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname),
    );
  },
});

// file filter function
const checkFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// const multer = multer({ storage, fileFilter: checkFileFilter });
// multer middleware
module.exports = multer({
  storage,
  fileFilter: checkFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // limit file size to 5MB
});
