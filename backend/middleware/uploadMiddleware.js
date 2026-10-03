const multer = require('multer');

// Memory storage keeps file buffers in memory for direct stream to Cloudinary or disk save
const storage = multer.memoryStorage();

// File validation filter
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const ext = file.originalname.toLowerCase();

  const isAllowedExt = /\.(jpg|jpeg|png|webp)$/i.test(ext);
  const isAllowedMime = allowedMimeTypes.includes(file.mimetype);

  if (isAllowedExt && isAllowedMime) {
    return cb(null, true);
  }

  const error = new Error('Image must be JPG, PNG, JPEG or WEBP and below 5 MB.');
  error.status = 400;
  cb(error, false);
};

// 5MB file limit
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 10, // up to 10 photos per upload batch
  },
  fileFilter,
});

module.exports = upload;
