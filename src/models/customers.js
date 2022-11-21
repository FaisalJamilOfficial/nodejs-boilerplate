const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const customers = new Schema(
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
module.exports = mongoose.model("customers", customers);
