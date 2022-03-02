const moment = require("moment");
const { isValidObjectId } = require("mongoose");

const { getToken } = require("../middlewares/public/authenticator");
const { usersModel, profilesModel } = require("../models");
const profilesController = require("./profiles");

exports.signup = async (req, res, next) => {
	try {
		const { username, email, password, phone, type } = req.body;
		const userObj = {};
		if (username) userObj.username = username;
		if (email) userObj.email = email;
		if (type) userObj.type = type;
		if (phone) userObj.phone = phone;
		var user = await usersModel.register(new usersModel(userObj), password);
		const profileObj = {};
		profileObj.user = user._id;
		const profile = await profilesModel.create(profileObj);
		user.profile = profile._id;
		await user.save();
		const token = getToken({ _id: user._id });
		return res.json({
			success: true,
			user: await usersModel.findOne({ _id: user._id }).populate("profile"),
			token,
		});
	} catch (error) {
		if (user) await user.remove();
		next(error);
	}
};

exports.login = async (req, res, next) => {
	try {
		const { _id, phone } = req.user;
		const query = { status: "active" };
		if (phone) query.phone = phone;
		else if (_id) query._id = _id;
		const userExists = await usersModel.findOne(query).populate("profile");
		if (userExists) {
		} else return next(new Error("User deleted!"));

		const token = getToken({ _id: userExists._id });
		return res.json({
			success: true,
			user: userExists,
			token,
		});
	} catch (error) {
		next(error);
	}
};

exports.editUserProfile = async (req, res, next) => {
	try {
		const { user } = req.body;
		if (user) {
			if (req.user.type === "admin")
				if (isValidObjectId(user))
					if (await usersModel.exists({ _id: user })) {
					} else return next(new Error("User not found!"));
				else return next(new Error("Please enter valid user id!"));
			else return next(new Error("Unauthorized as ADMIN!"));
		}
		const responseUserUpdate = await profilesController.updateUser(
			req,
			res,
			next
		);
		const responseProfileUpdate = await profilesController.updateProfile(
			req,
			res,
			next
		);
		return res.json({
			success: responseProfileUpdate && responseUserUpdate,
			user: await usersModel.findOne({ _id: req.user._id }).populate("profile"),
		});
	} catch (error) {
		next(error);
	}
};

exports.setState = async (user, state) => {
	try {
		if (!user) throw new Error("Please enter user id!");
		if (!isValidObjectId(user)) throw new Error("Please enter valid user id!");
		if (state) {
			const update = await usersModel.updateOne(
				{ _id: user },
				{ state },
				{
					useFindAndModify: false,
					new: true,
					runValidators: true,
				}
			);
			return { success: update.modifiedCount == 0 ? false : true };
		}
		throw new Error("Please enter user state!");
	} catch (error) {
		throw error;
	}
};

exports.checkUserPhoneExists = async (req, res, next) => {
	try {
		const exists = await usersModel.exists({ phone: req.body.phone });
		if (exists) {
			next();
		} else next(new Error("User does not exist!"));
	} catch (error) {
		next(error);
	}
};

exports.getUser = async (req, res, next) => {
	try {
		const { user } = req.params;
		if (user)
			if (isValidObjectId(user)) {
				const response = await usersModel
					.findOne({ _id: user })
					.populate("profile");
				if (response)
					return res.json({
						success: "true",
						user: response,
					});
				else return next(new Error("User not found!"));
			} else return next(new Error("Please enter valid user id!"));
		else return next(new Error("Please enter user id!"));
	} catch (error) {
		next(error);
	}
};

exports.getAllUsers = async (req, res, next) => {
	let { q, page, limit, type, status } = req.query;
	const { _id } = req.user;
	const query = {};
	if (type) query.type = type;
	if (status) query.status = status;
	if (q) {
		query.$or = [
			{ username: { $regex: q, $options: "i" } },
			{ phone: { $regex: q, $options: "i" } },
		];
	}
	query._id = { $ne: _id };
	page = Number(page);
	limit = Number(limit);
	if (!limit) limit = 10;
	if (!page) page = 1;
	try {
		const total = await usersModel.find({ ...query }).count();
		const users = await usersModel
			.find({ ...query })
			.skip((page - 1) * limit)
			.limit(limit);
		return res
			.status(400)
			.json({ success: true, totalPages: Math.ceil(total / limit), users });
	} catch (error) {
		next(error);
	}
};
