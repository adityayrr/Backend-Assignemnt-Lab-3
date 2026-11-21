const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { validateProduct, validateStockUpdate } = require('../middleware/validateProduct');

router.post('/', validateProduct, async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const { category, supplier, minPrice, maxPrice, search, sort } = req.query;
    const query = {};

    if (category) {
      query.category = category;
    }

    if (supplier) {
      query.supplier = supplier;
    }

    if (minPrice !== undefined && minPrice !== '') {
      query.price = query.price || {};
      query.price.$gte = Number(minPrice);
    }

    if (maxPrice !== undefined && maxPrice !== '') {
      query.price = query.price || {};
      query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const skip = (page - 1) * limit;

    const total = await Product.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    let productQuery = Product.find(query);

    if (sort) {
      productQuery = productQuery.sort(sort);
    } else {
      productQuery = productQuery.sort('-createdAt');
    }

    const products = await productQuery.skip(skip).limit(limit);

    res.status(200).json({
      total,
      page,
      totalPages,
      count: products.length,
      products
    });
  } catch (error) {
    next(error);
  }
});

router.get('/low-stock', async (req, res, next) => {
  try {
    const lowStockItems = await Product.find({
      $expr: { $lte: ['$quantity', '$reorderLevel'] }
    });
    res.status(200).json({
      count: lowStockItems.length,
      lowStockItems
    });
  } catch (error) {
    next(error);
  }
});

router.get('/summary', async (req, res, next) => {
  try {
    const summary = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          totalItems: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalStockValue: { $sum: { $multiply: ['$price', '$quantity'] } },
          avgPrice: { $avg: '$price' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.status(200).json({
      categories: summary.length,
      summary
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', validateProduct, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/stock', validateStockUpdate, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const newQuantity = product.quantity + req.body.change;
    if (newQuantity < 0) {
      return res.status(400).json({ message: 'Insufficient stock. Quantity cannot be negative.' });
    }

    product.quantity = newQuantity;
    await product.save();

    res.status(200).json({
      message: 'Stock updated',
      product
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({
      message: 'Product deleted',
      id: req.params.id
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
