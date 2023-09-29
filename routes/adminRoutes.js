var express = require('express');
var router = express.Router();
var passport = require('passport');

var authenticate = require('../middleware/authAdmin');
var adminController = require('../controllers/adminController');
var AWS = require('../utils/aws');

router.post('/register', adminController.register);
router.post(
	'/login',
	passport.authenticate('local-admin'),
	adminController.signIn
);

//TODO : Random
router.get('/users', authenticate.verifyAdmin, adminController.getUsers);
router.get(
	'/users/search',
	authenticate.verifyAdmin,
	adminController.searchUser
);
router.get('/dashboard', authenticate.verifyAdmin, adminController.bestSellers);

//TODO: Offers
router.get('/offers', authenticate.verifyAdmin, adminController.getAllOffers);
router.get(
	'/offer/:id',
	authenticate.verifyAdmin,
	adminController.getSingleOffer
);
router.post(
	'/offer/add',
	authenticate.verifyAdmin,
	AWS.multerUpload.array('images'),
	AWS.returnedUrls,
	adminController.addOffer
);
router.patch(
	'/offer/edit/:id',
	authenticate.verifyAdmin,
	AWS.multerUpload.array('images'),
	AWS.returnedUrls,
	adminController.editOffer
);
router.delete(
	'/offer/delete/:id',
	authenticate.verifyAdmin,
	adminController.deleteOffer
);

//TODO : Categories
router.get(
	'/category/search',
	authenticate.verifyAdmin,
	adminController.searchCategory
);
router.get(
	'/category/all',
	authenticate.verifyAdmin,
	adminController.getAllCategories
);
router.get(
	'/category',
	authenticate.verifyAdmin,
	adminController.getCategories
);
router.get(
	'/category/:id',
	authenticate.verifyAdmin,
	adminController.getSingleCategory
);
router.get(
	'/category/brand/:id',
	authenticate.verifyAdmin,
	adminController.getCategoriesOfBrand
);
router.post(
	'/category/add',
	authenticate.verifyAdmin,
	adminController.addCategory
);
router.patch(
	'/category/edit/:id',
	authenticate.verifyAdmin,
	adminController.editCategory
);
router.delete(
	'/category/delete/:id',
	authenticate.verifyAdmin,
	adminController.deleteCategory
);

//TODO : Products
router.get(
	'/product/search',
	authenticate.verifyAdmin,
	adminController.searchProduct
);
router.get(
	'/product/:id',
	authenticate.verifyAdmin,
	adminController.getSingleProduct
);
router.get('/product', authenticate.verifyAdmin, adminController.getProducts);
router.post(
	'/product/add',
	authenticate.verifyAdmin,
	AWS.multerUpload.array('images'),
	AWS.returnedUrls,
	adminController.addProduct
);
router.patch(
	'/product/edit/:id',
	authenticate.verifyAdmin,
	AWS.multerUpload.array('images'),
	AWS.returnedUrls,
	adminController.editProduct
);
router.delete(
	'/product/delete/:id',
	authenticate.verifyAdmin,
	adminController.deleteProduct
);

//TODO: Orders
router.get('/orders', authenticate.verifyAdmin, adminController.getOrders);
router.get(
	'/order/:id',
	authenticate.verifyAdmin,
	adminController.getSingleOrder
);
router.get(
	'/orders/search',
	authenticate.verifyAdmin,
	adminController.searchOrder
);
router.patch(
	'/order/edit/:id',
	authenticate.verifyAdmin,
	adminController.completeOrder
);
router.delete(
	'/order/delete/:id',
	authenticate.verifyAdmin,
	adminController.deleteProduct
);

//TODO : Brands
router.get(
	'/brand/search',
	authenticate.verifyAdmin,
	adminController.searchBrand
);
router.get(
	'/brand/all',
	authenticate.verifyAdmin,
	adminController.getAllBrands
);
router.get('/brand', authenticate.verifyAdmin, adminController.getBrands);
router.get(
	'/brand/:id',
	authenticate.verifyAdmin,
	adminController.getSingleBrand
);
router.post('/brand/add', authenticate.verifyAdmin, adminController.addBrand);
router.patch(
	'/brand/edit/:id',
	authenticate.verifyAdmin,
	adminController.editBrand
);
router.delete(
	'/brand/delete/:id',
	authenticate.verifyAdmin,
	adminController.deleteBrand
);

module.exports = router;
