const { isValidObjectId } = require("mongoose");
const moment = require("moment");

const { getToken } = require("../middlewares/public/authenticator");
const { usersModel } = require("../models");
const { deleteProfilePicture } = require("../middlewares/private/deleter");

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
				return res.status(400).json({
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
		const token = getToken({ _id: req.user._id });
		return res.status(400).json({ success: true, user: req.user, token });
	} catch (error) {
		return next(error);
	}
};

exports.setProfilePicture = async (req, res, next) => {
	try {
		const { profilePicture } = req.files || {};

		if (profilePicture && profilePicture[0].path) {
			const user = await usersModel.findOne({ _id: req.user._id });
			const existsProfilePicture = user.profilePicture;
			user.profilePicture = profilePicture[0].path;
			await user.save();
			if (existsProfilePicture) deleteProfilePicture(existsProfilePicture);
			return res.status(400).json({
				success: true,
				profilePicture: profilePicture[0].originalname,
			});
		} else return next(new Error("Please add profile picture!"));
	} catch (error) {
		next(error);
	}
};

exports.removeProfilePicture = async (req, res, next) => {
	try {
		const user = await usersModel.findOne({ _id: req.user._id });
		if (user.profilePicture) deleteProfilePicture(user.profilePicture);
		else return next(new Error("Profile picture not yet set!"));
		user.profilePicture = "";
		await user.save();

		return res.status(400).json({
			success: true,
		});
	} catch (error) {
		return next(error);
	}
};

exports.editProfile = async (req, res, next) => {
	try {
		const { firstName, lastName } = req.body;
		const user = {};
		if (firstName) user.firstName = firstName;
		if (lastName) user.lastName = lastName;
		const update = await usersModel.updateOne({ _id: req.user._id }, user, {
			useFindAndModify: false,
			new: true,
			runValidators: true,
		});
		return res.status(400).json({
			success: update.modifiedCount == 0 ? false : true,
			user: update.modifiedCount == 0 ? null : user,
		});
	} catch (error) {
		return next(error);
	}
};

exports.changeStatus = async (req, res, next) => {
	try {
		const { user, status } = req.body;
		if (user)
			if (isValidObjectId(user)) {
				if (req.user.type != "admin")
					return next(new Error("Unauthorized to change user status!"));
			} else return next(new Error("Please enter valid user id!"));

		const update = await usersModel.updateOne(
			{ _id: user ? user : req.user._id },
			{ status },
			{
				useFindAndModify: false,
				new: true,
				runValidators: true,
			}
		);
		return res
			.status(400)
			.json({ success: update.modifiedCount == 0 ? false : true });
	} catch (error) {
		return next(error);
	}
};

exports.changeState = async (user, state) => {
	try {
		if (user && isValidObjectId(user))
			throw new Error("Please enter valid user id!");
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

exports.changePhone = async (req, res, next) => {
	try {
		const { phone } = req.user;
		const update = await usersModel.updateOne(
			{ _id: req.user._id },
			{ phone },
			{
				useFindAndModify: false,
				new: true,
				runValidators: true,
			}
		);
		return res
			.status(400)
			.json({ success: update.modifiedCount == 0 ? false : true });
	} catch (error) {
		return next(error);
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

exports.setFcm = async (req, res, next) => {
	try {
		const { fcm } = req.body;
		const update = await usersModel.updateOne({ _id: req.user._id }, { fcm });
		res.status(400).json({ success: update.modifiedCount == 0 ? false : true });
	} catch (error) {
		next(error);
	}
};
