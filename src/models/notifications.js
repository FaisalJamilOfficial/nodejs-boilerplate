const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const { NOTIFICATION_TYPES } = require("../configs/enums");
const { NEW_MESSAGE, NEW_CONVERSATION } = NOTIFICATION_TYPES;

const notifications = new Schema(
	{
		type: {
			type: String,
			enum: [NEW_MESSAGE, NEW_CONVERSATION],
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
