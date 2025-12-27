const express = require('express'); // add this
const router = express.Router();
const categoryController = require('../controllers/category.controller');

router.get('/', categoryController.getAllCategories);
router.get('/tree', categoryController.getCategoryTree);
router.get('/featured', categoryController.getFeaturedCategories);
router.get('/popular', categoryController.getPopularCategories);
router.get('/:slug', categoryController.getCategory);

module.exports = router;
