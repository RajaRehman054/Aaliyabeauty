var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var JwtStrategy = require('passport-jwt').Strategy;
var jwt = require('jsonwebtoken');
var User = require('../models/users');

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(
	new LocalStrategy(
		{
			usernameField: 'email',
		},
		User.authenticate()
	)
);

exports.getToken = function (user) {
	return jwt.sign(user, process.env.SECRET);
};

const cookieExtractor = req => {
	let jwt = null;
	if (req && req.cookies) {
		jwt = req.cookies['jwt'];
	}
	return jwt;
};

var opts = {};
opts.jwtFromRequest = cookieExtractor;
opts.secretOrKey = process.env.SECRET;

passport.use(
	new JwtStrategy(opts, async (jwt_payload, done) => {
		try {
			const user = await User.findOne({ _id: jwt_payload._id });
			if (user) {
				return done(null, user);
			} else {
				return done(null, false);
			}
		} catch (error) {
			return error, false;
		}
	})
);

exports.verifyUser = passport.authenticate('jwt', { session: false });
