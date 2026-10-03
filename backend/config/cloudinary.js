const cloudinary = require('cloudinary').v2;

const isCloudinaryConfigured = () => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET &&
    process.env.CLOUDINARY_CLOUD_NAME.trim() !== '' &&
    process.env.CLOUDINARY_API_KEY.trim() !== '' &&
    process.env.CLOUDINARY_API_SECRET.trim() !== ''
  );
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
    api_key: process.env.CLOUDINARY_API_KEY.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET.trim(),
  });
}

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
};
