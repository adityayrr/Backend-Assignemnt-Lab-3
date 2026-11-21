const validateProduct = (req, res, next) => {
  const { name, sku, category, price, quantity, reorderLevel, supplier } = req.body;

  if (req.method === 'POST') {
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'Product name is required' });
    }
    if (!sku || typeof sku !== 'string' || !sku.trim()) {
      return res.status(400).json({ message: 'SKU is required' });
    }
    if (!category || typeof category !== 'string' || !category.trim()) {
      return res.status(400).json({ message: 'Category is required' });
    }
    if (price === undefined || typeof price !== 'number' || price < 0) {
      return res.status(400).json({ message: 'Price must be a number greater than or equal to 0' });
    }
    if (quantity === undefined || typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({ message: 'Quantity must be a number greater than or equal to 0' });
    }
    if (reorderLevel === undefined || typeof reorderLevel !== 'number' || reorderLevel < 0) {
      return res.status(400).json({ message: 'Reorder level must be a number greater than or equal to 0' });
    }
    if (!supplier || typeof supplier !== 'string' || !supplier.trim()) {
      return res.status(400).json({ message: 'Supplier is required' });
    }
  } else {
    if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
      return res.status(400).json({ message: 'Product name must be a valid non-empty string' });
    }
    if (sku !== undefined && (typeof sku !== 'string' || !sku.trim())) {
      return res.status(400).json({ message: 'SKU must be a valid non-empty string' });
    }
    if (category !== undefined && (typeof category !== 'string' || !category.trim())) {
      return res.status(400).json({ message: 'Category must be a valid non-empty string' });
    }
    if (price !== undefined && (typeof price !== 'number' || price < 0)) {
      return res.status(400).json({ message: 'Price must be a number greater than or equal to 0' });
    }
    if (quantity !== undefined && (typeof quantity !== 'number' || quantity < 0)) {
      return res.status(400).json({ message: 'Quantity must be a number greater than or equal to 0' });
    }
    if (reorderLevel !== undefined && (typeof reorderLevel !== 'number' || reorderLevel < 0)) {
      return res.status(400).json({ message: 'Reorder level must be a number greater than or equal to 0' });
    }
    if (supplier !== undefined && (typeof supplier !== 'string' || !supplier.trim())) {
      return res.status(400).json({ message: 'Supplier must be a valid non-empty string' });
    }
  }

  next();
};

const validateStockUpdate = (req, res, next) => {
  const { change } = req.body;

  if (change === undefined || typeof change !== 'number' || isNaN(change)) {
    return res.status(400).json({ message: 'Stock change must be a valid number' });
  }

  next();
};

module.exports = {
  validateProduct,
  validateStockUpdate
};
