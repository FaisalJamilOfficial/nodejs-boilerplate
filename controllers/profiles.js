const moment = require("moment");
const { isValidObjectId } = require("mongoose");

const { usersModel, profilesModel } = require("../models");
const { deleteProfilePicture } = require("../middlewares/private/deleter");

exports.updateProfile = async (req, res, next) => {
	try {
		const {
			user,
			firstName,
			lastName,
			longitude,
			latitude,
			address,
			removePicture,
		} = req.body;
		const { picture } = req.files || {};
		const profileObj = {};
		console.log("req.files", req.files);

		if (firstName) profileObj.firstName = firstName;
		if (lastName) profileObj.lastName = lastName;
		if (address) profileObj.address = address;
		if (Number(longitude) && Number(latitude))
			profileObj.location = {
				type: "Point",
				coordinates: [Number(longitude), Number(latitude)],
			};
		if (picture && picture[0].path) {
			if (req.user.profile.picture)
				deleteProfilePicture(req.user.profile.picture);
			profileObj.picture = picture[0].path;
		}
		if (removePicture === "true") {
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
		const { user, phone, status, fcm, email, newPassword } = req.body;
		const userObj = {};
		if (phone) userObj.phone = phone;
		if (status) userObj.status = status;
		if (fcm) userObj.fcm = fcm;
		if (email) userObj.email = email;
		if (newPassword) {
			const existsUser = await usersModel.findOne({ _id: req.user._id });
			console.log("existsUser", existsUser);
			await existsUser.setPassword(newPassword);
			await existsUser.save();
		}
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
