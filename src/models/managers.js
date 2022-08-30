const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const managers = new Schema(
	{
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
module.exports = mongoose.model("managers", managers);
