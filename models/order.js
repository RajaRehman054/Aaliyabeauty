var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var orderSchema = new Schema(
	{
		name: { type: String },
		order_id: { type: Number, unique: true },
		email: { type: String },
		number: { type: String },
		address: { type: String },
		city: { type: String },
		region: { type: String },
		country: { type: String },
		method: { type: String, enum: ['pickup', 'online'] },
		items: {
			type: [
				{
					id: {
						type: mongoose.Types.ObjectId,
						ref: 'Product',
					},
					quantity: {
						type: Number,
					},
					price: {
						type: Number,
					},
				},
			],
		},
		total: { type: Number },
		delivery_charges: { type: Number, default: 0 },
		status: {
			type: String,
			enum: ['pending', 'completed'],
			default: 'pending',
		},
		card_number: { type: String },
		card_name: { type: String },
		card_cvv: { type: Number },
		card_date: { type: String },
		user: { type: mongoose.Types.ObjectId, ref: 'User' },
		payment: { type: String, default: 'card', enum: ['cod', 'card'] },
	},
	{ timestamps: true }
);

orderSchema.pre('save', async function (next) {
	if (!this.order_id) {
		this.order_id = await generateUniqueNumbers(Order);
	}
	next();
});

const generateUniqueNumbers = async model => {
	while (true) {
		const candidateNumber = Math.floor(1000000 + Math.random() * 9000000);
		const existingDocument = await model.findOne({
			oder_id: candidateNumber,
		});
		if (!existingDocument) {
			return candidateNumber;
		}
	}
};

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
