var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Otp = new Schema(
	{
		token: { type: String },
		email: { type: String, default: '' },
	},
	{ timestamps: true }
);

Otp.index({ createdAt: 1 }, { expireAfterSeconds: 60 });
module.exports = mongoose.model('Otp', Otp);
