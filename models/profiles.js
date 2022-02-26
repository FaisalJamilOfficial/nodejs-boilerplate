const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const profiles = new Schema(
	{
		firstname: {
			type: String,
			trim: true,
			index: true,
		},
		lastname: {
			type: String,
			trim: true,
			index: true,
		},
		location: {
			type: {
				type: String,
				enum: ["Point"],
				default: "Point",
				required: true,
			},
			coordinates: {
				type: [Number, Number],
				default: [0, 0],
				required: true,
			},
		},
		address: {
			type: String,
			trim: true,
		},
		picture: {
			type: String,
			trim: true,
		},
		user: {
			type: Schema.Types.ObjectId,
			ref: "users",
			required: true,
			index: true,
		},
	},
	{
		timestamps: true,
	}
);
module.exports = mongoose.model("profiles", profiles);
