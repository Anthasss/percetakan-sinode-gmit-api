const prisma = require('../lib/prisma');
const { isValidProductId, getProductById } = require('../constants/products');
const s3Client = require('../lib/s3Client');
const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');

const BUCKET_NAME = process.env.S3_BUCKET_NAME;
const PUBLIC_URL_BASE = process.env.S3_PUBLIC_URL_BASE;

// Create a new order
const createOrder = async (req, res) => {
  const uploadedFiles = [];
  
  try {
    const { userId, productId, price, status, orderSpecifications } = req.body;

    // Validate required fields
    if (!userId || !productId || !status || !orderSpecifications) {
      return res.status(400).json({ 
        error: 'userId, productId, status, and orderSpecifications are required' 
      });
    }

    // Parse productId to number (FormData sends everything as strings)
    const parsedProductId = parseInt(productId);
    
    if (isNaN(parsedProductId)) {
      return res.status(400).json({ error: 'Product ID must be a valid number' });
    }

    // Validate product ID
    if (!isValidProductId(parsedProductId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Parse orderSpecifications if it's a string
    let parsedOrderSpecs;
    try {
      parsedOrderSpecs = typeof orderSpecifications === 'string' 
        ? JSON.parse(orderSpecifications) 
        : orderSpecifications;
    } catch (error) {
      return res.status(400).json({ error: 'Invalid orderSpecifications JSON' });
    }

    // Handle file uploads if files are present
    if (req.files && req.files.length > 0) {
      // Validate file types
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf'];
      for (const file of req.files) {
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return res.status(400).json({ 
            error: 'Invalid file type. Only JPEG, PNG, WebP, and PDF files are allowed' 
          });
        }
      }

      // Create order first to get the generated ID
      const order = await prisma.order.create({
        data: {
          userId,
          productId: parsedProductId,
          price: price || 0,
          status,
          orderSpecifications: parsedOrderSpecs,
        }
      });

      const orderId = order.id;

      // Upload files to S3 using the order ID
      const fileMetadata = [];
      for (const file of req.files) {
        const fileExtension = file.originalname.split('.').pop();
        const objectKey = `orders/${orderId}/${crypto.randomUUID()}.${fileExtension}`;

        const uploadParams = {
          Bucket: BUCKET_NAME,
          Key: objectKey,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: 'public-read',
        };

        await s3Client.send(new PutObjectCommand(uploadParams));
        uploadedFiles.push(objectKey); // Track for cleanup if update fails

        const publicUrl = `${PUBLIC_URL_BASE}/${objectKey}`;
        fileMetadata.push({
          objectKey,
          publicUrl,
          fileName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
        });
      }

      // Add files to orderSpecifications
      parsedOrderSpecs.files = fileMetadata;

      // Update order with file metadata
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          orderSpecifications: parsedOrderSpecs,
        }
      });

      res.status(201).json(updatedOrder);
    } else {
      // Create order without files
      const order = await prisma.order.create({
        data: {
          userId,
          productId: parsedProductId,
          price: price || 0,
          status,
          orderSpecifications: parsedOrderSpecs,
        }
      });

      res.status(201).json(order);
    }
  } catch (error) {
    console.error('Error creating order:', error);

    // Cleanup uploaded files if they exist (file upload failed after order creation)
    if (uploadedFiles.length > 0) {
      console.log('Cleaning up uploaded files due to error...');
      for (const objectKey of uploadedFiles) {
        try {
          await s3Client.send(new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: objectKey,
          }));
        } catch (deleteError) {
          console.error(`Failed to delete ${objectKey}:`, deleteError);
        }
      }
    }

    res.status(500).json({ error: 'Failed to create order', details: error.message });
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

    // Get order to access files
    const order = await prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Delete associated files from S3 if they exist
    if (order.orderSpecifications && order.orderSpecifications.files) {
      const files = order.orderSpecifications.files;
      
      for (const file of files) {
        try {
          await s3Client.send(new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: file.objectKey,
          }));
          console.log(`Deleted file: ${file.objectKey}`);
        } catch (s3Error) {
          console.error(`Error deleting file ${file.objectKey}:`, s3Error);
          // Continue deleting other files even if one fails
        }
      }
    }

    // Delete order from database
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
