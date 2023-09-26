var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Brand = new Schema({
	name: {
		type: String,
		trim: true,
		unique: true,
	},
});

module.exports = mongoose.model('Brand', Brand);
