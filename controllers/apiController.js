var nodemailer = require('nodemailer');
var asyncHandler = require('../middleware/asyncHandler');

var User = require('../models/users');
var Order = require('../models/order');
var Product = require('../models/product');
var Category = require('../models/category');
var Brand = require('../models/brand');
var Review = require('../models/review');
var Offer = require('../models/offers');

exports.createOrderCustomer = asyncHandler(async (req, res, next) => {
	if (req.cookies['jwt']) {
		return next();
	}
	for (let i = 0; i < req.body.items.length; i++) {
		await Product.findByIdAndUpdate(req.body.items[i].id, {
			$inc: {
				sold: req.body.items[i].quantity,
				sold_price: req.body.items[i].price,
			},
		});
	}
	const order = await Order.create(req.body);
	let transport = nodemailer.createTransport({
		host: 'smtp.gmail.com',
		port: 465,
		secure: true,
		auth: {
			user: process.env.EMAIL,
			pass: process.env.EMAIL_PASSWORD,
		},
	});
	const mailOptions = {
		from: process.env.EMAIL,
		to: req.body.email,
		subject: `Order Confirmation #${order.order_id}`,
		text: `Your order with order-id: ${order.order_id} has been confirmed and will be delivered to you in 6-7 working days.`,
	};
	transport.sendMail(mailOptions, function (err, info) {
		if (err) {
			next(new ErrorHandler('Internal Server Error', 500));
		} else {
			res.status(201).json({
				message: 'Order created successfully.',
				orderId: order.order_id,
			});
		}
	});
});

exports.createOrderUser = asyncHandler(async (req, res, next) => {
	await User.findByIdAndUpdate(req.user._id, {
		$inc: {
			orders: 1,
			spent: req.body.total,
			coins: Math.round(req.body.total),
		},
	});
	for (let i = 0; i < req.body.items.length; i++) {
		await Product.findByIdAndUpdate(req.body.items[i].id, {
			$inc: {
				sold: req.body.items[i].quantity,
				sold_price: req.body.items[i].price,
			},
		});
	}
	const order = await Order.create({ ...req.body, user: req.user._id });
	let transport = nodemailer.createTransport({
		host: 'smtp.gmail.com',
		port: 465,
		secure: true,
		auth: {
			user: process.env.EMAIL,
			pass: process.env.EMAIL_PASSWORD,
		},
	});
	const mailOptions = {
		from: process.env.EMAIL,
		to: req.body.email,
		subject: `Order Confirmation #${order.order_id}`,
		text: `Your order with order-id: ${order.order_id} has been confirmed and will be delivered to you in 6-7 working days.`,
	};
	transport.sendMail(mailOptions, function (err, info) {
		if (err) {
			next(new ErrorHandler('Internal Server Error', 500));
		} else {
			res.status(201).json({
				message: 'Order created successfully.',
				orderId: order.order_id,
			});
		}
	});
});

exports.getCategories = asyncHandler(async (req, res, next) => {
	const categories = await Category.find({}).populate('brand');
	res.status(200).json(categories);
});

exports.getTrendingProducts = asyncHandler(async (req, res, next) => {
	let { nature } = req.query;
	if (nature === 'latest' || nature === undefined) {
		const products = await Product.find({})
			.sort({ createdAt: -1 })
			.limit(10)
			.populate('category');
		return res.status(200).json({ products });
	} else if (nature === 'topselling') {
		const products = await Product.find({})
			.sort({ sold: -1 })
			.limit(10)
			.populate('category');
		return res.status(200).json({ products });
	} else {
		const products = await Product.find({ featured: true })
			.limit(10)
			.populate('category');
		return res.status(200).json({ products });
	}
});

exports.getProductsByCategories = asyncHandler(async (req, res, next) => {
	const category = await Category.find({ name: req.params.name }).select(
		'id'
	);
	const products = await Product.find({
		category: { $in: category },
	}).populate({
		path: 'category',
		populate: {
			path: 'brand',
			model: 'Brand',
		},
	});
	res.status(200).json(products);
});

exports.getAllProductsOfBrand = asyncHandler(async (req, res, next) => {
	const brand = await Brand.findOne({ name: req.params.name });
	const category = await Category.find({ brand: brand.id }).select('id');
	const products = await Product.find({
		category: { $in: category },
	}).populate({
		path: 'category',
		populate: {
			path: 'brand',
			model: 'Brand',
		},
	});
	res.status(200).json(products);
});

exports.searchProduct = asyncHandler(async (req, res, next) => {
	let query = req.query.name;
	var products = await Product.find({
		name: { $regex: new RegExp(query, 'i') },
	});
	res.status(200).json(products);
});

exports.getProductReviews = asyncHandler(async (req, res, next) => {
	const reviews = await Review.find({ product: req.params.id });
	res.status(200).json(reviews);
});

exports.getProduct = asyncHandler(async (req, res, next) => {
	const product = await Product.findById(req.params.id);
	res.status(200).json(product);
});

exports.getOffer = asyncHandler(async (req, res, next) => {
	const offers = await Offer.findById(req.params.id);
	res.status(200).json(offers);
});

exports.getOffersOfBrand = asyncHandler(async (req, res, next) => {
	const offers = await Offer.find({ brand: req.params.id });
	res.status(200).json(offers);
});

exports.getGlobalOffers = asyncHandler(async (req, res, next) => {
	const offers = await Offer.find({ all: true });
	res.status(200).json(offers);
});

exports.getAllOffers = asyncHandler(async (req, res, next) => {
	const offers = await Offer.find({});
	res.status(200).json(offers);
});

exports.getCartProducts = asyncHandler(async (req, res, next) => {
	let { array } = req.body;
	var data = [];
	for (let index = 0; index < array.length; index++) {
		let product = await Product.findById(array[index]).populate('category');
		data.push(product);
	}
	res.status(200).json(data);
});

exports.getAllBrands = asyncHandler(async (req, res, next) => {
	var data = [];
	const brands = await Brand.find({});
	for (let index = 0; index < brands.length; index++) {
		let categories = await Category.find({ brand: brands[index].id });
		data.push({ brand: brands[index], categories });
	}
	res.status(200).json(data);
});

exports.getSingleBrand = asyncHandler(async (req, res, next) => {
	const brand = await Brand.findById(req.params.id);
	const categories = await Category.find({ brand: req.params.id }).populate(
		'brand'
	);
	res.status(200).json(brand, categories);
});
