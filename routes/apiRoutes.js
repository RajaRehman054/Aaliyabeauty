var express = require('express');
var router = express.Router();

var apiController = require('../controllers/apiController');
var authenticate = require('../middleware/auth');

router.get('/products/filter', apiController.getTrendingProducts);
router.get('/categories', apiController.getCategories);
router.get('/products/:name', apiController.getProductsByCategories);
router.get('/products/categories/all/:id', apiController.getSingleBrand);
router.get('/products/brand/:name', apiController.getAllProductsOfBrand);
router.get('/categories/products', apiController.getAllBrands);
router.get('/product/:name', apiController.searchProduct);
router.get('/product/single/:id', apiController.getProduct);
router.get('/product/review/:id', apiController.getProductReviews);
router.get('/offers', apiController.getOffers);
router.post('/cart/items', apiController.getCartProducts);

router.post(
	'/order/create',
	apiController.createOrderCustomer,
	authenticate.verifyUser,
	apiController.createOrderUser
);

module.exports = router;
