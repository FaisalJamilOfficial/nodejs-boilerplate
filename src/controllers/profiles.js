const dayjs = require("dayjs");

const { usersModel, profilesModel } = require("../models");
const FilesDeleter = require("../utils/FilesDeleter");

/**
 * Update user profile data
 * @param {string} user user id
 * @param {string} firstname OPTIONAL user first name
 * @param {string} lastname OPTIONAL user last name
 * @param {date} birthdate OPTIONAL user birthdate
 * @param {number} longitude OPTIONAL user location longitude
 * @param {number} latitude OPTIONAL user location latitude
 * @param {string} address OPTIONAL user address
 * @param {boolean} removePicture OPTIONAL user profile picture removal option
 * @param {[object]} picture OPTIONAL user profile picture
 * @returns {boolean} user profile updation result
 */
exports.updateProfile = async (parameters) => {
	const {
		user,
		firstname,
		lastname,
		birthdate,
		longitude,
		latitude,
		address,
		removePicture,
		picture,
	} = parameters;
	const profileObj = {};

	if (firstname) profileObj.firstname = firstname;
	if (lastname) profileObj.lastname = lastname;
	if (birthdate && dayjs().isValid(birthdate)) profileObj.birthdate = birthdate;
	if (address) profileObj.address = address;
	if (Number(longitude) && Number(latitude))
		profileObj.location = {
			type: "Point",
			coordinates: [Number(longitude), Number(latitude)],
		};
	if (picture && picture[0].path) {
		if (req.user.profile.picture)
			new FilesDeleter().deleteProfilePicture({
				profilePicture: req.user.profile.picture,
			});
		profileObj.picture = picture[0].path;
	}
	if (removePicture === "true") {
		new FilesDeleter().deleteProfilePicture({
			profilePicture: req.user.profile.picture,
		});
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
};

/**
 * Update user data
 * @param {string} user user id
 * @param {string} phone OPTIONAL user phone number
 * @param {string} status OPTIONAL user status
 * @param {string} fcm OPTIONAL user firebase cloud messaging token
 * @param {string} device OPTIONAL user device id
 * @param {string} email OPTIONAL user email address
 * @param {string} newPassword OPTIONAL user new password
 * @returns {boolean} user data updation result
 */
exports.updateUser = async (parameters) => {
	const { user, phone, status, fcm, device, email, newPassword } = parameters;
	const userObj = {};
	if (phone) userObj.phone = phone;
	if (status) userObj.status = status;
	if (email) userObj.email = email;
	const userExists = await usersModel.findOne({ _id: user });
	if (newPassword) {
		await userExists.setPassword(newPassword);
		if (userExists.isPasswordSet) {
		} else userExists.isPasswordSet = true;
	}
	if (fcm && device) {
		let alreadyExists = false;
		userExists.fcms.forEach((element) => {
			if (element.device === device) {
				alreadyExists = true;
				element.fcm = fcm;
			}
		});
		if (alreadyExists) {
		} else userExists.fcms.push({ device, fcm });
	}
	await userExists.save();
	const response = await usersModel.updateOne({ _id: user }, userObj, {
		useFindAndModify: false,
		new: true,
		runValidators: true,
	});
	return response.modifiedCount === 0 ? false : true;
};
