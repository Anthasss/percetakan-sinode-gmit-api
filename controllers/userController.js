const prisma = require('../lib/prisma');
const { isValidProductId, getProductById } = require('../constants/products');

// Create or get user (called when user logs in with Auth0)
const createOrGetUser = async (req, res) => {
  try {
    const { id, name } = req.body; // id should be Auth0 sub

    if (!id || !name) {
      return res.status(400).json({ error: 'User id and name are required' });
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { id }
    });

    // If user doesn't exist, create them
    if (!user) {
      user = await prisma.user.create({
        data: { id, name }
      });
    }

    res.json(user);
  } catch (error) {
    console.error('Error creating/getting user:', error);
    res.status(500).json({ error: 'Failed to create/get user' });
  }
};

// Get user by ID with their orders
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

// Update user role (admin only)
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role }
    });

    res.json(user);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
};

module.exports = {
  createOrGetUser,
  getUserById,
  updateUserRole
};
