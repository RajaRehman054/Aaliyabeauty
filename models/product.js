var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Product = new Schema(
	{
		name: { type: String, trim: true },
		description: { type: String },
		price: { type: Number },
		quantity: { type: Number },
		discount: { type: Number },
		category: { type: mongoose.Types.ObjectId, ref: 'Category' },
		images: [{ type: String, default: [] }],
		discountedPrice: { type: Number },
		sold: { type: Number, default: 0 },
		sold_price: { type: Number, default: 0 },
		featured: { type: Boolean, default: true },
		review: { type: Number, default: 0 },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Product', Product);
