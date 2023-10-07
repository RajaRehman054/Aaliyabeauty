var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Offer = new Schema({
	name: {
		type: String,
		trim: true,
		unique: true,
	},
	starting_date: {
		type: String,
	},
	ending_date: {
		type: String,
	},
	discount: { type: Number },
	images: [{ type: String }],
	brand: { type: mongoose.Types.ObjectId, ref: 'Brand' },
	all: { type: Boolean, default: false },
});

module.exports = mongoose.model('Offer', Offer);
