var express = require('express');
var router = express.Router();
var passport = require('passport');

var authenticate = require('../middleware/auth');
var userController = require('../controllers/userController');
var AWS = require('../utils/aws');
require('../middleware/googleAuth');

// ? User Routes //

// TODO: Profiling routes
router.get('/user', authenticate.verifyUser, userController.getUser);
router.get('/user/orders', authenticate.verifyUser, userController.getOrders);
router.get('/otp/:email', userController.getOtp);
router.get('/verify/otp/:email/:otp', userController.verifyOtp);
router.get('/logout', authenticate.verifyUser, userController.logOut);
router.post('/register', userController.register);
router.post('/login', passport.authenticate('local'), userController.signIn);
router.patch('/reset/password', userController.passwordReset);
router.patch(
	'/profile/edit',
	authenticate.verifyUser,
	AWS.multerUpload.array('images'),
	AWS.returnedUrls,
	userController.editProfile
);
router.patch(
	'/profile/coins',
	authenticate.verifyUser,
	userController.deductCoins
);

//TODO: Misc routes
router.post(
	'/review/add',
	userController.addCustomerReview,
	authenticate.verifyUser,
	userController.addUserReview
);

// TODO: Google Auth routes
router.get(
	'/auth/google',
	passport.authenticate('google', { scope: ['email', 'profile'] })
);
router.get(
	'/auth/google/callback',
	passport.authenticate('google', {
		successRedirect: '/users/auth/google/success',
		failureRedirect: '/users/auth/google/failure',
	})
);
router.get('/auth/google/failure', (req, res) => {
	res.json({ message: 'Unable to authenticate' });
});
router.get('/auth/google/success', userController.signInGoogle);

module.exports = router;
