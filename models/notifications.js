const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notifications = new Schema(
	{
		type: {
			type: String,
			enum: ["new-message", "new-conversation"],
			required: true,
			index: true,
		},

		text: {
			type: String,
			default: "",
		},
		message: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "messages",
			index: true,
		},
		messenger: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "users",
			index: true,
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "users",
			index: true,
		},
	},
	{
		timestamps: true,
	}
);
module.exports = mongoose.model("notifications", notifications);
