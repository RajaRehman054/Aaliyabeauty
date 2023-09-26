var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Category = new Schema({
	name: {
		type: String,
		trim: true,
	},
	brand: {
		type: mongoose.Types.ObjectId,
		ref: 'Brand',
	},
});

module.exports = mongoose.model('Category', Category);
