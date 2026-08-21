const Category = require("../models/Category");

async function listCategories(req, res, next) {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ categories });
  } catch (err) {
    next(err);
  }
}

module.exports = { listCategories };
