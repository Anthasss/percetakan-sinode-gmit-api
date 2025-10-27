const prisma = require('../lib/prisma');
const { isValidProductId, getProductById } = require('../constants/products');

// Create a new order
const createOrder = async (req, res) => {
  try {
    const { userId, productId, price, status, orderSpecifications } = req.body;

    // Validate required fields
    if (!userId || !productId || !status || !orderSpecifications) {
      return res.status(400).json({ 
        error: 'userId, productId, status, and orderSpecifications are required' 
      });
    }

    // Validate product ID
    if (!isValidProductId(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        userId,
        productId,
        price: price || 0,
        status,
        orderSpecifications
      }
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

// Get all orders (with optional filters)
const getOrders = async (req, res) => {
  try {
    const { userId, status, productId } = req.query;

    const where = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;
    if (productId) where.productId = parseInt(productId);

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Enrich orders with product information
    const enrichedOrders = orders.map(order => ({
      ...order,
      product: getProductById(order.productId)
    }));

    res.json(enrichedOrders);
  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Add product information
    const enrichedOrder = {
      ...order,
      product: getProductById(order.productId)
    };

    res.json(enrichedOrder);
  } catch (error) {
    console.error('Error getting order:', error);
    res.status(500).json({ error: 'Failed to get order' });
  }
};

// Update order
const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, status, orderSpecifications } = req.body;

    const data = {};
    if (price !== undefined) data.price = price;
    if (status) data.status = status;
    if (orderSpecifications) data.orderSpecifications = orderSpecifications;

    const order = await prisma.order.update({
      where: { id },
      data
    });

    res.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
};

// Delete order
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.order.delete({
      where: { id }
    });

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
};

// Update only the price of an order
const updateOrderPrice = async (req, res) => {
  try {
    const { id } = req.params;
    const { price } = req.body;

    if (price === undefined || price === null) {
      return res.status(400).json({ error: 'Price is required' });
    }

    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({ error: 'Price must be a positive number' });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { price }
    });

    res.json(order);
  } catch (error) {
    console.error('Error updating order price:', error);
    res.status(500).json({ error: 'Failed to update order price' });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  updateOrderPrice
};
