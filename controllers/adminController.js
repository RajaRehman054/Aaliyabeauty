var passport = require('passport');

var authenticate = require('../middleware/authAdmin');
var asyncHandler = require('../middleware/asyncHandler');
var ErrorHandler = require('../utils/error');
var AWS = require('../utils/aws');

var Admin = require('../models/admin');
var Category = require('../models/category');
var Product = require('../models/product');
var Offer = require('../models/offers');
var User = require('../models/users');
var Order = require('../models/order');
var Brand = require('../models/brand');

exports.register = async (req, res, next) => {
	var exists = await Admin.findOne({ email: req.body.email });
	if (exists) {
		next(new ErrorHandler('Email already associated with an account', 409));
	} else {
		try {
			const admin = await Admin.register(
				new Admin({
					email: req.body.email,
					name: req.body.name,
				}),
				req.body.password
			);
			if (admin) {
				try {
					await admin.save();
					passport.authenticate('local-admin')(req, res, () => {
						res.status(201).json({
							success: true,
							status: 'Registration Successful!',
						});
					});
				} catch (error) {
					return next(error);
				}
			}
		} catch (error) {
			return next(error);
		}
	}
};

exports.signIn = asyncHandler(async (req, res) => {
	let token = authenticate.getToken({ _id: req.user._id });
	res.cookie('jwt', token, {
		maxAge: 7 * 24 * 60 * 60 * 1000,
		httpOnly: true,
		secure: process.env.ENV === 'production' ? true : false,
	});
	res.status(200).json({
		success: true,
		status: 'Logged In successfully',
	});
});

exports.addCategory = asyncHandler(async (req, res) => {
	let image = req.uploadedUrls.length > 0 ? req.uploadedUrls[0] : null;
	await Category.create({
		name: req.body.name,
		brand: req.body.brand,
		image,
	});
	res.status(201).json({ message: 'Category added successfully' });
});

exports.getAllCategories = asyncHandler(async (req, res) => {
	const categories = await Category.find({}).populate('brand');
	res.status(200).json({ categories });
});

exports.getSingleCategory = asyncHandler(async (req, res) => {
	const category = await Category.findById(req.params.id).populate('brand');
	res.status(200).json({ category });
});

exports.getCategoriesOfBrand = asyncHandler(async (req, res) => {
	const category = await Category.find({ brand: req.params.id });
	res.status(200).json({ category });
});

exports.editCategory = asyncHandler(async (req, res) => {
	let category = await Category.findById(req.params.id);
	let image = req.uploadedUrls.length > 0 ? req.uploadedUrls[0] : null;
	if (category.image !== null) {
		await AWS.deleteImages([category.image]);
	}
	let update = { name: req.body.name, brand: req.body.brand, image };
	await Category.findByIdAndUpdate(req.params.id, update);
	res.status(200).json({ message: 'Edited successfully' });
});

exports.deleteCategory = asyncHandler(async (req, res) => {
	let category = await Category.findById(req.params.id);
	if (category.image !== null) {
		await AWS.deleteImages([category.image]);
	}
	await Product.deleteMany({ category: req.params.id });
	await Category.findByIdAndDelete(req.params.id);
	res.status(200).json({ message: 'Deleted Successfully' });
});

exports.getCategories = asyncHandler(async (req, res, next) => {
	const categories = [];
	const totalCategories = await Category.countDocuments();
	const page = parseInt(req.query.page) || 1;
	const perPage = 20;
	const totalPages = Math.ceil(totalCategories / perPage);
	const tempCategories = await Category.find({})
		.populate('brand')
		.skip((page - 1) * perPage)
		.limit(perPage);
	for (let index = 0; index < tempCategories.length; index++) {
		let category = await Product.countDocuments({
			category: tempCategories[index].id,
		});
		categories.push({
			data: tempCategories[index],
			totalProducts: category,
		});
	}
	res.json({
		totalPages,
		totalCategories,
		categories,
		perPage,
		currentPage: page,
	});
});

exports.searchCategory = asyncHandler(async (req, res, next) => {
	let query = req.query.name;
	var category = await Category.find({
		name: { $regex: new RegExp(query, 'i') },
	}).populate('brand');
	res.status(200).json(category);
});

exports.addProduct = asyncHandler(async (req, res) => {
	let images = req.uploadedUrls;
	let discountedPrice = req.body.price * (req.body.discount / 100);
	discountedPrice = Math.round(req.body.price - discountedPrice);
	await Product.create({ ...req.body, discountedPrice, images });
	res.status(201).json({ message: 'Product added successfully' });
});

exports.editProduct = asyncHandler(async (req, res) => {
	let product = await Product.findById(req.params.id);
	if (product.images.length > 0) {
		await AWS.deleteImages(product.images);
	}
	let images = req.uploadedUrls;
	let discountedPrice = req.body.price * (req.body.discount / 100);
	discountedPrice = Math.round(req.body.price - discountedPrice);
	let update = { ...req.body, discountedPrice, images };
	await Product.findByIdAndUpdate(req.params.id, update);
	res.status(200).json({ message: 'Edited successfully' });
});

exports.deleteProduct = asyncHandler(async (req, res) => {
	let product = await Product.findById(req.params.id);
	if (product.images.length > 0) {
		await AWS.deleteImages(product.images);
	}
	await Product.findByIdAndDelete(req.params.id);
	res.status(200).json({ message: 'Deleted Successfully' });
});

exports.getSingleProduct = asyncHandler(async (req, res) => {
	const product = await Product.findById(req.params.id).populate('category');
	res.status(200).json({ product });
});

exports.getProducts = asyncHandler(async (req, res, next) => {
	const totalProducts = await Product.countDocuments();
	const page = parseInt(req.query.page) || 1;
	const perPage = 20;
	const totalPages = Math.ceil(totalProducts / perPage);
	const products = await Product.find({})
		.skip((page - 1) * perPage)
		.limit(perPage)
		.populate('category');
	res.json({
		totalPages,
		totalProducts,
		products,
		perPage,
		currentPage: page,
	});
});

exports.searchProduct = asyncHandler(async (req, res, next) => {
	let query = req.query.name;
	var product = await Product.find({
		name: { $regex: new RegExp(query, 'i') },
	}).populate('category');
	res.status(200).json(product);
});

exports.addOffer = asyncHandler(async (req, res, next) => {
	let images = req.uploadedUrls;
	await Offer.create({ ...req.body, images });
	res.status(201).json({ message: 'Offer created' });
});

exports.getAllOffers = asyncHandler(async (req, res) => {
	const offers = await Offer.find({});
	res.status(200).json({ offers });
});

exports.getSingleOffer = asyncHandler(async (req, res) => {
	const offer = await Offer.findById(req.params.id);
	res.status(200).json({ offer });
});

exports.editOffer = asyncHandler(async (req, res) => {
	let images = req.uploadedUrls;
	await Offer.findByIdAndUpdate(req.params.id, { ...req.body, images });
	res.status(201).json({ message: 'Offer edited' });
});

exports.deleteOffer = asyncHandler(async (req, res) => {
	let offer = await Offer.findById(req.params.id);
	if (offer.images.length > 0) {
		await AWS.deleteImages(offer.images);
	}
	await Offer.findByIdAndDelete(req.params.id);
	res.status(200).json({ message: 'Deleted Successfully' });
});

exports.getUsers = asyncHandler(async (req, res, next) => {
	const totalUsers = await User.countDocuments();
	const page = parseInt(req.query.page) || 1;
	const perPage = 20;
	const totalPages = Math.ceil(totalUsers / perPage);
	const users = await User.find({})
		.skip((page - 1) * perPage)
		.limit(perPage);
	res.json({
		totalPages,
		totalUsers,
		users,
		perPage,
		currentPage: page,
	});
});

exports.searchUser = asyncHandler(async (req, res, next) => {
	let query = req.query.name;
	var user = await User.find({
		name: { $regex: new RegExp(query, 'i') },
	});
	res.status(200).json(user);
});

exports.completeOrder = asyncHandler(async (req, res, next) => {
	await Order.findByIdAndUpdate(req.params.id, {
		status: 'completed',
	});
	res.status(200).json({ message: 'order status changed' });
});

exports.getOrders = asyncHandler(async (req, res, next) => {
	const totalOrders = await Order.countDocuments();
	const page = parseInt(req.query.page) || 1;
	const perPage = 20;
	const totalPages = Math.ceil(totalOrders / perPage);
	const orders = await Order.find({})
		.skip((page - 1) * perPage)
		.limit(perPage);
	res.json({
		totalPages,
		totalOrders,
		orders,
		perPage,
		currentPage: page,
	});
});

exports.bestSellers = asyncHandler(async (req, res, next) => {
	let products = await Product.find({}).sort({ sold: -1 }).limit(4);
	res.status(200).json({ products });
});

exports.deleteOrder = asyncHandler(async (req, res) => {
	await Order.findByIdAndDelete(req.params.id);
	res.status(200).json({ message: 'Deleted Successfully' });
});

exports.getSingleOrder = asyncHandler(async (req, res) => {
	const order = await Order.findById(req.params.id);
	res.status(200).json({ order });
});

exports.searchOrder = asyncHandler(async (req, res, next) => {
	let query = req.query.name;
	var order = await Order.find({
		name: { $regex: new RegExp(query, 'i') },
	});
	res.status(200).json(order);
});

//TODO : brands
exports.addBrand = asyncHandler(async (req, res) => {
	let image = req.uploadedUrls.length > 0 ? req.uploadedUrls[0] : null;
	await Brand.create({
		name: req.body.name,
		image,
		url: req.body.url,
		description: req.body.description,
	});
	res.status(201).json({ message: 'Brand added successfully' });
});

exports.getAllBrands = asyncHandler(async (req, res) => {
	const brands = await Brand.find({});
	res.status(200).json({ brands });
});

exports.getSingleBrand = asyncHandler(async (req, res) => {
	const brand = await Brand.findById(req.params.id);
	res.status(200).json({ brand });
});

exports.editBrand = asyncHandler(async (req, res) => {
	let brand = await Brand.findById(req.params.id);
	let image = req.uploadedUrls.length > 0 ? req.uploadedUrls[0] : null;
	if (brand.image !== null) {
		await AWS.deleteImages([brand.image]);
	}
	let update = { ...req.body, image };
	await Brand.findByIdAndUpdate(req.params.id, update);
	res.status(200).json({ message: 'Edited successfully' });
});

exports.deleteBrand = asyncHandler(async (req, res) => {
	let brand = await Brand.findById(req.params.id);
	let categories = await Category.find({ brand: req.params.id }).select(
		'id image'
	);
	categories.forEach(async element => {
		if (element.image) {
			await AWS.deleteImages([element.image]);
		}
	});
	await Product.deleteMany({ category: { $in: categories } });
	await Category.deleteMany({ brand: req.params.id });
	await Brand.findByIdAndDelete(req.params.id);
	if (brand.image !== null) {
		await AWS.deleteImages([brand.image]);
	}
	res.status(200).json({ message: 'Deleted Successfully' });
});

exports.getBrands = asyncHandler(async (req, res, next) => {
	const finalData = [];
	const totalBrand = await Brand.countDocuments();
	const page = parseInt(req.query.page) || 1;
	const perPage = 20;
	const totalPages = Math.ceil(totalBrand / perPage);
	const brands = await Brand.find({})
		.skip((page - 1) * perPage)
		.limit(perPage);
	for (let index = 0; index < brands.length; index++) {
		let categories = await Category.find({
			brand: brands[index].id,
		}).select('id');
		let data = await Product.countDocuments({
			category: { $in: categories },
		});
		finalData.push({
			data: brands[index],
			totalProducts: data,
		});
	}
	res.json({
		totalPages,
		totalBrand,
		brands: finalData,
		perPage,
		currentPage: page,
	});
});

exports.searchBrand = asyncHandler(async (req, res, next) => {
	let query = req.query.name;
	var brands = await Brand.find({
		name: { $regex: new RegExp(query, 'i') },
	});
	res.status(200).json(brands);
});
