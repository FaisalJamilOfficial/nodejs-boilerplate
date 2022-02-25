const moment = require("moment");
const { isValidObjectId } = require("mongoose");

const { usersModel } = require("../models");
const { deleteProfilePicture } = require("../middlewares/private/deleter");

exports.updateProfile = async (req, res, next) => {
	try {
		const {
			user,
			firstName,
			lastName,
			phone,
			longitude,
			latitude,
			address,
			removePicture,
		} = req.body;
		const { picture } = req.files || {};
		const profileObj = {};

		if (firstName) profileObj.firstName = firstName;
		if (lastName) profileObj.lastName = lastName;
		if (phone) profileObj.phone = phone;
		if (address) profileObj.address = address;
		if (longitude && latitude)
			if (typeof longitude === "number" && typeof latitude === "number")
				consultant.location = {
					type: "Point",
					coordinates: [longitude, latitude],
				};
		if (picture && picture[0].path) {
			if (req.user.profile.picture)
				deleteProfilePicture(req.user.profile.picture);
			profileObj.picture = picture[0].path;
		}
		if (removePicture && removePicture === true) {
			deleteProfilePicture(req.user.profile.picture);
			profileObj.picture = "";
		}
		const response = await profilesModel.updateOne(
			{ user: user ?? req.user._id },
			profileObj,
			{
				useFindAndModify: false,
				new: true,
				runValidators: true,
			}
		);
		return response.modifiedCount === 0 ? false : true;
	} catch (error) {
		next(error);
	}
};

exports.updateUser = async (req, res, next) => {
	try {
		const { user, status, fcm, email } = req.body;
		const userObj = {};
		if (status) userObj.status = status;
		if (fcm) userObj.fcm = fcm;
		if (email) userObj.email = email;
		const response = await usersModel.updateOne(
			{ _id: user ?? req.user._id },
			userObj,
			{
				useFindAndModify: false,
				new: true,
				runValidators: true,
			}
		);
		return response.modifiedCount === 0 ? false : true;
	} catch (error) {
		next(error);
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
		return res.json({
			success: update.modifiedCount == 0 ? false : true,
			user: await usersModel.findOne({ _id: req.user._id }).populate("profile"),
		});
	} catch (error) {
		return next(error);
	}
};
