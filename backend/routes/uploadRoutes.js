const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const upload = require('../middleware/uploadMiddleware');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');
const { protect, authorize } = require('../middleware/authMiddleware');
const adminOnly = authorize('Admin');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Helper to upload buffer to Cloudinary
const uploadToCloudinary = (fileBuffer, folder = 'takkunu-booku') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// Helper to save buffer to local disk
const saveToLocalDisk = async (file) => {
  const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
  const cleanName = path
    .basename(file.originalname, ext)
    .replace(/[^a-zA-Z0-9_-]/g, '_');
  const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e6)}-${cleanName}${ext}`;
  const filePath = path.join(uploadsDir, uniqueName);

  await fs.promises.writeFile(filePath, file.buffer);

  return {
    url: `/uploads/${uniqueName}`,
    publicId: `local_${uniqueName}`,
  };
};

// Process an array of uploaded files
const processFiles = async (files, folder) => {
  const results = [];
  const useCloudinary = isCloudinaryConfigured();

  for (const file of files) {
    if (useCloudinary) {
      try {
        const cloudResult = await uploadToCloudinary(file.buffer, folder);
        results.push(cloudResult);
        continue;
      } catch (err) {
        console.warn('Cloudinary upload error, falling back to local storage:', err.message);
      }
    }
    // Local storage fallback
    const localResult = await saveToLocalDisk(file);
    results.push(localResult);
  }

  return results;
};

// @desc    Upload multiple photos (Hotels / Rooms)
// @route   POST /api/upload/multiple
// @access  Private/Admin
router.post('/multiple', protect, adminOnly, (req, res) => {
  upload.array('images', 10)(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Image must be JPG, PNG, JPEG or WEBP and below 5 MB.',
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one photo to upload.',
      });
    }

    try {
      const folder = req.body.folder || 'takkunu-booku';
      const images = await processFiles(req.files, folder);

      res.status(200).json({
        success: true,
        message: `Successfully uploaded ${images.length} photo(s)`,
        images,
      });
    } catch (uploadError) {
      console.error('Upload processing error:', uploadError);
      res.status(500).json({
        success: false,
        message: 'Failed to process photo uploads. Please try again.',
      });
    }
  });
});

// @desc    Upload single photo
// @route   POST /api/upload/single
// @access  Private/Admin
router.post('/single', protect, adminOnly, (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Image must be JPG, PNG, JPEG or WEBP and below 5 MB.',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select an image file to upload.',
      });
    }

    try {
      const folder = req.body.folder || 'takkunu-booku';
      const [image] = await processFiles([req.file], folder);

      res.status(200).json({
        success: true,
        message: 'Photo uploaded successfully',
        image,
      });
    } catch (uploadError) {
      console.error('Upload processing error:', uploadError);
      res.status(500).json({
        success: false,
        message: 'Failed to process photo upload.',
      });
    }
  });
});

// @desc    Delete a photo by publicId
// @route   DELETE /api/upload/:publicId
// @access  Private/Admin
router.delete('/:publicId', protect, adminOnly, async (req, res) => {
  try {
    const { publicId } = req.params;

    if (publicId.startsWith('local_')) {
      const fileName = publicId.replace('local_', '');
      const filePath = path.join(uploadsDir, fileName);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
      return res.json({ success: true, message: 'Local photo deleted' });
    }

    if (isCloudinaryConfigured()) {
      await cloudinary.uploader.destroy(publicId);
      return res.json({ success: true, message: 'Cloudinary photo deleted' });
    }

    res.json({ success: true, message: 'Photo deleted' });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete photo' });
  }
});

module.exports = router;
