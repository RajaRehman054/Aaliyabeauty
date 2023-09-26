const GoogleStrategy = require('passport-google-oauth2').Strategy;
const passport = require('passport');
const User = require('../models/users');
require('dotenv').config();

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: `${process.env.SERVER_URI}/users/auth/google/callback`,
			passReqToCallback: true,
		},
		async (request, accessToken, refreshToken, profile, done) => {
			try {
				let existingUser = await User.findOne({
					email: profile.emails[0].value,
				});
				if (existingUser) {
					return done(null, existingUser);
				}
				const newUser = new User({
					source: 'google',
					name: profile.displayName,
					email: profile.emails[0].value,
					picture: profile.picture,
				});
				await newUser.save();
				return done(null, newUser);
			} catch (error) {
				return done(error, false);
			}
		}
	)
);

passport.serializeUser(function (user, done) {
	done(null, user);
});

passport.deserializeUser(function (user, done) {
	done(null, user);
});
