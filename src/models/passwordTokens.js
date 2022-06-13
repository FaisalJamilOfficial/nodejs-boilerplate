const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const passwordTokens = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		required: true,
		index: true,
		ref: "users",
	},
	token: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
		expires: 3600,
	},
});

module.exports = mongoose.model("passwordTokens", passwordTokens);
