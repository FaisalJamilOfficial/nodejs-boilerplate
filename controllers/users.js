const { isValidObjectId } = require("mongoose");
const moment = require("moment");

const { getToken } = require("../middlewares/public/authenticator");
const { usersModel } = require("../models");
const { deleteProfilePicture } = require("../middlewares/private/deleter");

exports.register = async (userData) => {
	try {
		const { phone, firstName, lastName, email, username, type } = userData;
		let user = {};
		if (phone) user.phone = phone;
		if (firstName) user.firstName = firstName;
		if (lastName) user.lastName = lastName;
		if (email) user.email = email;
		if (username) user.username = username;
		if (type) user.type = type;
		user = await usersModel.create(user);
		return user;
	} catch (error) {
		throw error;
	}
};

exports.editProfile = async (userData) => {
	try {
		const { firstName, lastName, profilePicture } = userData;
		if (firstName) userData.firstName = firstName;
		if (lastName) userData.lastName = lastName;
		if (profilePicture && profilePicture[0].path)
			userData.profilePicture = profilePicture[0].path;
		const update = await usersModel.updateOne({ _id: userData._id }, userData, {
			useFindAndModify: false,
			new: true,
			runValidators: true,
		});
		if (update.modifiedCount === 0) throw new Error("User updation failed!");
		else return { success: true };
	} catch (error) {
		throw error;
	}
};

exports.login = async (req, res, next) => {
	try {
		const user = await usersModel.findOne({ phone: req.user.phone });
		if (user) {
			const token = getToken({ _id: user._id });
			res.json({ success: true, user, token });
		} else next(new Error("User does not exist!"));
	} catch (error) {
		next(error);
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
			res.json({
				success: true,
				profilePicture: profilePicture[0].originalname,
			});
		} else next(new Error("Profile picture not found!"));
	} catch (error) {
		next(error);
	}
};

exports.removeProfilePicture = async (req, res, next) => {
	try {
		const user = await usersModel.findOne({ _id: req.user._id });
		const profilePicture = user.profilePicture;
		user.profilePicture = "";
		await user.save();
		if (profilePicture) deleteProfilePicture(profilePicture);
		res.json({
			success: true,
		});
	} catch (error) {
		next(error);
	}
};

exports.changeStatus = async (req, res, next) => {
	const { user, status } = req.body;
	if (user && req.user.type != "admin")
		return next(new Error("Unauthorized to deactivate user!"));
	if (isValidObjectId(user)) {
		const update = await usersModel.updateOne(
			{ _id: user ? user : req.user._id },
			{ status },
			{
				useFindAndModify: false,
				new: true,
				runValidators: true,
			}
		);
		res.json({ success: update.modifiedCount == 0 ? false : true });
	} else next(new Error("Please enter valid user id!"));
};

exports.changeState = async (user, state) => {
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
};

exports.changePhone = async (req, res, next) => {
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
	res.json({ success: update.modifiedCount == 0 ? false : true });
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
			res.json({ success: true, users, currentPage: page, totalPages });
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
		res.json({ success: update.modifiedCount == 0 ? false : true });
	} catch (error) {
		next(error);
	}
};
