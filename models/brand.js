var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Brand = new Schema({
	name: {
		type: String,
		trim: true,
		unique: true,
	},
	image: { type: String },
	description: { type: String },
	url: { type: String },
});

module.exports = mongoose.model('Brand', Brand);
