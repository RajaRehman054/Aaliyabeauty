var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Review = new Schema({
	name: { type: String },
	email: { type: String, default: '' },
	rating: { type: Number },
	description: { type: String },
	product: { type: mongoose.Types.ObjectId, ref: 'Product' },
	picture: { type: String, default: null },
});

module.exports = mongoose.model('Review', Review);
