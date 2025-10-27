const express = require('express');
const router = express.Router();
const {
  createOrGetUser,
  getUserById,
  updateUserRole
} = require('../controllers/userController');

// Create or get user (for Auth0 login)
router.post('/', createOrGetUser);

// Get user by ID with their orders
router.get('/:id', getUserById);

// Update user role (admin only - you should add auth middleware)
router.patch('/:id/role', updateUserRole);

module.exports = router;
