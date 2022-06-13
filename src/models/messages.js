const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const { MESSAGE_STATUSES } = require("../configs/enums");
const { UNREAD, READ, DELETED } = MESSAGE_STATUSES;

const attachment = new Schema(
	{
		path: {
			type: String,
			required: true,
		},
		type: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
);

const messages = new Schema(
	{
		conversation: {
			type: Schema.Types.ObjectId,
			ref: "conversations",
			required: true,
			index: true,
		},
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
		text: {
			type: String,
			trim: true,
		},
		attachments: [attachment],
		status: {
			type: Number,
			enum: [UNREAD, READ, DELETED],
			default: UNREAD,
			required: true,
			index: true,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("messages", messages);
