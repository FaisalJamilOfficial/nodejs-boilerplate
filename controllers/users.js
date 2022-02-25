const moment = require("moment");
const { isValidObjectId } = require("mongoose");

const { getToken } = require("../middlewares/public/authenticator");
const { usersModel } = require("../models");
const { updateProfile } = require("./profiles");

exports.signup = async (req, res, next) => {
	try {
		const { username, password, type } = req.body;
		const user = {};
		if (username) user.username = username;
		if (type) user.type = type;
		usersModel.register(new usersModel(user), password, async (error, user) => {
			if (error) {
				return next(error);
			} else if (user) {
				var token = getToken({ _id: user._id });
				return res.json({
					success: true,
					token,
					user,
				});
			}
		});
	} catch (error) {
		return next(error);
	}
};

exports.login = async (req, res, next) => {
	try {
		if (req.user) {
			if (req.user.status === "deleted")
				return next(new Error("User deleted!"));
		}
		const token = getToken({ _id: req.user._id });
		return res.json({ success: true, user: req.user, token });
	} catch (error) {
		return next(error);
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
		const responseProfileUpdate = updateProfile(req, res, next);
		const responseUserUpdate = updateUser(req, res, next);
		return res.json({
			success: responseProfileUpdate && responseUserUpdate,
			user: await usersModel.findOne({ _id: req.user._id }).populate("profile"),
		});
	} catch (error) {
		return next(error);
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

exports.checkUserExists = async (req, res, next) => {
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
				return res.json({
					success: "true",
					user: response,
				});
			} else return next(new Error("Please enter valid user id!"));
		else return next(new Error("Please enter user id!"));
	} catch (error) {
		next(error);
	}
};

exports.getAllUsers = (req, res, next) => {
	let { q, page, limit, type } = req.query;
	const { _id } = req.user;
	const query = {};
	if (type) query.type = type;
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
		Promise.all([
			usersModel.find({ ...query }).count(),
			usersModel
				.find({ ...query })
				.skip((page - 1) * limit)
				.limit(limit),
		]).then(([total, users]) => {
			const totalPages = Math.ceil(total / limit);
			return res
				.status(400)
				.json({ success: true, users, currentPage: page, totalPages });
		});
	} catch (error) {
		next(error);
	}
};
