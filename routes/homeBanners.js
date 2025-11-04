const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  uploadHomeBanner,
  getHomeBanners,
  deleteHomeBanner,
} = require('../controllers/homeBannerController');

// Configure multer for file upload (store in memory)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

// Upload a new home banner
router.post('/', upload.single('image'), uploadHomeBanner);

// Get all home banners
router.get('/', getHomeBanners);

// Delete a home banner
router.delete('/:id', deleteHomeBanner);

module.exports = router;
