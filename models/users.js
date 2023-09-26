var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema(
	{
		email: { type: String, default: '' },
		name: { type: String, trim: true },
		picture: { type: String, default: '' },
		source: { type: String, default: 'none' },
		spent: { type: Number, default: 0 },
		orders: { type: Number, default: 0 },
		coins: { type: Number, default: 0 },
	},
	{ timestamps: true }
);

userSchema.plugin(passportLocalMongoose, {
	usernameField: 'email',
});

const User = mongoose.model('User', userSchema);
module.exports = User;
