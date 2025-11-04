const express = require('express');
const router = express.Router();
const {
  getAllImages,
  getImagesByPrefix,
  uploadImage,
  upload,
} = require('../controllers/storageController');

// Get all images from object storage
// Query params: maxKeys (optional), continuationToken (optional for pagination)
router.get('/images', getAllImages);

// Get images by prefix
// URL params: prefix (required)
// Query params: maxKeys (optional), continuationToken (optional)
router.get('/images/:prefix', getImagesByPrefix);

// Upload an image
// Body: multipart/form-data with 'file' and 'fileName' fields
router.post('/images', upload.single('file'), uploadImage);

module.exports = router;
