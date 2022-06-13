const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const { PAYMENT_ACCOUNT_TYPES } = require("../configs/enums");
const { BRAINTREE, STRIPE_ACCOUNT, STRIPE_CUSTOMER } = PAYMENT_ACCOUNT_TYPES;

const paymentAccounts = new Schema(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: "users",
			required: true,
			index: true,
		},
		account: {
			type: Object,
			required: true,
		},
		type: {
			type: String,
			enum: [BRAINTREE, STRIPE_ACCOUNT, STRIPE_CUSTOMER],
			required: true,
			index: true,
		},
	},
	{
		timestamps: true,
	}
);
module.exports = mongoose.model("paymentAccounts", paymentAccounts);
