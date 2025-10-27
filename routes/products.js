const express = require('express');
const router = express.Router();
const { products, getProductById, getProductsByCategory } = require('../constants/products');

// Get all products
router.get('/', (req, res) => {
  res.json({ products });
});

// Get product by ID
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = getProductById(id);
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  res.json(product);
});

// Get products by category
router.get('/category/:category', (req, res) => {
  const { category } = req.params;
  const products = getProductsByCategory(category);
  
  res.json({ products });
});

module.exports = router;
