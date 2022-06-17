const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const { CONVERSATION_STATUSES } = require("../configs/enums");
const { PENDING, ACCEPTED, REJECTED } = CONVERSATION_STATUSES;

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
			enum: [PENDING, ACCEPTED, REJECTED],
			default: PENDING,
			required: true,
			index: true,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("conversations", conversations);
