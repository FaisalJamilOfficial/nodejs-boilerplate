const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const conversations = new Schema(
	{
		userTo: {
			type: Schema.Types.ObjectId,
			ref: "users",
			required: true,
			index: true,
		},
		userFrom: {
			type: Schema.Types.ObjectId,
			ref: "users",
			required: true,
			index: true,
		},
		status: {
			type: String,
			enum: ["pending", "accepted", "rejected"],
			default: "pending",
			required: true,
			index: true,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("conversations", conversations);
