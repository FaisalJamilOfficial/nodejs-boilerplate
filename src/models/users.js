const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const {
	USER_STATUSES,
	USER_TYPES,
	GEO_JSON_TYPES,
} = require("../configs/enums");
const { ACTIVE, DELETED } = USER_STATUSES;
const { TENANT, MANAGER, ADMIN, SUPER_ADMIN, MULTI } = USER_TYPES;
const {
	POINT,
	LINESTRING,
	POLYGON,
	MULTIPOINT,
	MULTILINESTRING,
	MULTIPOLYGON,
} = GEO_JSON_TYPES;

const fcm = {
	device: { type: String, required: [true, "Please enter FCM device id!"] },
	token: { type: String, required: [true, "Please enter FCM token!"] },
};

const users = new Schema(
	{
		email: {
			type: String,
			lowercase: true,
			trim: true,
			required: [true, "Please enter email address!"],
			unique: [true, "Email must be unique!"],
			validate: {
				validator: function (v) {
					return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
				},
				message: (props) => `${props.value} is not a valid email address!`,
			},
			index: true,
		},
		password: {
			type: String,
			required: [true, "Please enter password!"],
			minlength: [6, "Password must be atleast 6 characters"],
			maxlength: [1024, "Password cannot excede 1024 characters"],
			select: false,
		},
		phone: {
			type: String,
			trim: true,
			index: true,
		},
		firstName: {
			type: String,
			trim: true,
		},
		lastName: {
			type: String,
			trim: true,
		},
		name: {
			type: String,
			trim: true,
		},
		image: {
			type: String,
			trim: true,
		},
		fcms: [fcm],
		location: {
			type: {
				type: String,
				enum: [
					POINT,
					LINESTRING,
					POLYGON,
					MULTIPOINT,
					MULTILINESTRING,
					MULTIPOLYGON,
				],
				default: POINT,
				required: true,
			},
			coordinates: {
				type: [Number],
				default: [0, 0],
				required: true,
			},
		},
		type: {
			type: String,
			enum: [TENANT, MANAGER, ADMIN, SUPER_ADMIN, MULTI],
			required: [true, "Please enter user type!"],
			index: true,
		},
		status: {
			type: String,
			enum: [ACTIVE, DELETED],
			default: "active",
			index: true,
		},
		isOnline: {
			type: Boolean,
			default: false,
			index: true,
		},
		isPasswordSet: {
			type: Boolean,
			default: true,
			select: false,
			required: true,
		},
		lastLogin: {
			type: Date,
			select: false,
		},
		tenant: {
			type: Schema.Types.ObjectId,
			ref: "tenants",
			select: false,
			index: true,
		},
		manager: {
			type: Schema.Types.ObjectId,
			ref: "managers",
			select: false,
			index: true,
		},
		admin: {
			type: Schema.Types.ObjectId,
			ref: "admins",
			select: false,
			index: true,
		},
		isTenant: {
			type: Boolean,
			select: false,
			default: false,
		},
		isManager: {
			type: Boolean,
			select: false,
			default: false,
		},
		isAdmin: {
			type: Boolean,
			select: false,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

users.methods.getSignedjwtToken = function () {
	return jwt.sign({ _id: this._id, type: this.type }, process.env.JWT_SECRET);
};

users.methods.populate = async function (field) {
	return await mongoose
		.model("users", users)
		.findById(this._id)
		.populate(field ?? this.type);
};

users.methods.setPassword = async function (newPassword) {
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(newPassword, salt);
	this.save();
};

users.methods.validatePassword = async function (enteredPassword) {
	const userExists = await mongoose
		.model("users", users)
		.findById(this._id, { password: 1 })
		.select("+password");
	const isMatched = await bcrypt.compare(enteredPassword, userExists.password);
	return isMatched;
};

users.plugin(aggregatePaginate);
module.exports = mongoose.model("users", users);
