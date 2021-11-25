const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const passportLocalMongoose = require("passport-local-mongoose");

const users = new Schema(
	{
		phone: {
			type: String,
			trim: true,
			required: true,
			unique: true,
			index: true,
		},
		firstName: {
			type: String,
			trim: true,
			required: true,
			index: true,
		},
		lastName: {
			type: String,
			trim: true,
			required: true,
			index: true,
		},
		email: {
			type: String,
			trim: true,
			required: true,
			unique: true,
			validate: {
				validator: function (v) {
					return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
				},
				message: (props) => `${props.value} is not a valid email address!`,
			},
			index: true,
		},
		profilePicture: {
			type: String,
			trim: true,
		},
		fcm: {
			type: String,
			default: "",
		},
		status: {
			type: String,
			enum: ["active", "in-active", "deleted"],
			default: "active",
			index: true,
		},
		state: {
			type: String,
			enum: ["online", "offline", "oncall"],
			default: "online",
			index: true,
		},
	},
	{
		timestamps: true,
	}
);
users.plugin(passportLocalMongoose);
module.exports = mongoose.model("users", users);
