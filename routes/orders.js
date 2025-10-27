const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder
} = require('../controllers/orderController');

// Create a new order
router.post('/', createOrder);

// Get all orders (with optional query filters: userId, status, productId)
router.get('/', getOrders);

// Get order by ID
router.get('/:id', getOrderById);

// Update order
router.patch('/:id', updateOrder);

// Delete order
router.delete('/:id', deleteOrder);

module.exports = router;
