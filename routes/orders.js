const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  updateOrderPrice
} = require('../controllers/orderController');

// Configure multer for file upload (store in memory)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size per file
    files: 10, // Maximum 10 files per order
  },
});

// Create a new order (with optional file uploads)
router.post('/', upload.array('files', 10), createOrder);

// Get all orders (with optional query filters: userId, status, productId)
router.get('/', getOrders);

// Get order by ID
router.get('/:id', getOrderById);

// Update order price only
router.patch('/:id/price', updateOrderPrice);

// Update order
router.patch('/:id', updateOrder);

// Delete order
router.delete('/:id', deleteOrder);

module.exports = router;
