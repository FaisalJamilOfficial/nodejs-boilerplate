const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userTokens = new Schema({
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
	expireAt: {
		type: Date,
		default: null,
	},
});
userTokens.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
module.exports = mongoose.model("userTokens", userTokens);
