var passport = require('passport');
var nodemailer = require('nodemailer');
var mongoose = require('mongoose');

var authenticate = require('../middleware/auth');
var asyncHandler = require('../middleware/asyncHandler');
var ErrorHandler = require('../utils/error');

var User = require('../models/users');
var Otp = require('../models/otp');
var Review = require('../models/review');
var Product = require('../models/product');
var Order = require('../models/order');

exports.register = async (req, res, next) => {
	var exists = await User.findOne({
		email: req.body.email,
	});
	if (exists) {
		next(new ErrorHandler('Email already associated with an account', 409));
	} else {
		try {
			const user = await User.register(
				new User({
					email: req.body.email,
					name: req.body.name,
				}),
				req.body.password
			);
			if (user) {
				try {
					await user.save();
					passport.authenticate('local')(req, res, () => {
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
		status: 'Logged In Successfully.',
	});
});

exports.signInGoogle = asyncHandler(async (req, res) => {
	let token = authenticate.getToken({ _id: req.user._id });
	res.cookie('jwt', token, {
		maxAge: 7 * 24 * 60 * 60 * 1000,
		httpOnly: true,
		secure: process.env.ENV === 'production' ? true : false,
	});
	res.redirect(`${process.env.CLIENT_URI}`);
});

exports.getUser = asyncHandler(async (req, res) => {
	res.json({ user: req.user });
});

exports.logOut = asyncHandler(async (req, res, next) => {
	res.clearCookie('jwt');
	res.status(200).json({ message: 'User logged out.' });
});

exports.getOtp = asyncHandler(async (req, res, next) => {
	var exists = await User.findOne({
		email: req.params.email,
		source: 'none',
	});
	if (!exists) {
		next(new ErrorHandler('Email does not exist', 404));
	} else {
		var existing = await Otp.findOne({ email: req.params.email });
		if (existing) {
			await Otp.deleteOne({ email: req.params.email });
		}
		var a = Math.floor(1000 + Math.random() * 9000).toString();
		var code = a.substring(-2);
		await Otp.create({ token: code, email: req.params.email });
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
			to: req.params.email,
			subject: 'OTP Verification',
			text: `Your four-digit verification code is: ${code}`,
		};
		transport.sendMail(mailOptions, function (err, info) {
			if (err) {
				next(new ErrorHandler('Internal Server Error', 500));
			} else {
				res.status(200).json({
					message: 'Code sent to the email.',
					expiresIn: '1-min',
				});
			}
		});
	}
});

exports.verifyOtp = asyncHandler(async (req, res, next) => {
	let otp = req.params.otp;
	let email = req.params.email;
	let doc = await Otp.findOne({ email: email });
	if (doc && otp === doc.token) {
		await Otp.deleteOne({ email: email });
		res.status(200).json({ message: 'Email verified successfully.' });
	} else {
		res.status(404).json({ message: 'Invalid or Expired token' });
	}
});

exports.passwordReset = asyncHandler(async (req, res, next) => {
	let user = await User.findOne({ email: req.body.email });
	let newUser = await user.setPassword(req.body.password);
	newUser.save();
	res.status(200).json({ message: 'Password reset successfully.' });
});

exports.addCustomerReview = asyncHandler(async (req, res, next) => {
	if (req.cookies['jwt']) {
		return next();
	}
	const { rating, description, email, name, product } = req.body;
	await Review.create({
		name,
		rating,
		description,
		email,
		product,
	});
	var ratings = await Review.aggregate([
		{ $match: { product: new mongoose.Types.ObjectId(product) } },
		{
			$group: {
				_id: 'none',
				ratings: { $avg: '$rating' },
			},
		},
	]);
	await Product.findByIdAndUpdate(product, {
		review: ratings[0].ratings,
	});
	res.status(201).json({ message: 'Customer review added.' });
});

exports.addUserReview = asyncHandler(async (req, res) => {
	const { rating, description, email, name, product } = req.body;
	await Review.create({
		name,
		rating,
		description,
		email,
		product,
		picture: email === req.user.email ? req.user.picture : null,
	});
	var ratings = await Review.aggregate([
		{ $match: { product: new mongoose.Types.ObjectId(product) } },
		{
			$group: {
				_id: 'none',
				ratings: { $avg: '$rating' },
			},
		},
	]);
	await Product.findByIdAndUpdate(product, {
		review: ratings[0].ratings,
	});
	res.status(201).json({ message: 'Customer review added.' });
});

exports.getOrders = asyncHandler(async (req, res, next) => {
	let orders = await Order.find({ user: req.user.id });
	res.status(200).json(orders);
});

exports.editProfile = asyncHandler(async (req, res, next) => {
	let exists = await User.findOne({ email: req.body.email });
	if (exists && req.user.id !== exists.id) {
		return res.status(401).send('Unauthorized');
	}
	let update = {
		name: req.body.name,
		email: req.body.email,
		picture: req.uploadedUrls.length > 0 ? req.uploadedUrls[0] : '',
	};
	await User.findByIdAndUpdate(req.user.id, update);
	res.status(200).json({ success: true });
});

exports.deductCoins = asyncHandler(async (req, res, next) => {
	await User.findByIdAndUpdate(req.user.id, {
		$inc: {
			coins: -req.body.coins,
		},
	});
	res.status(200).json({ success: true });
});
