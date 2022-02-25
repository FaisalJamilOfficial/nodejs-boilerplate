const { isValidObjectId } = require("mongoose");
const otpGenerator = require("otp-generator");

const { getToken } = require("../middlewares/public/authenticator");
const { profilesModel, usersModel } = require("../models");
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;

const client = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// PHONE NUMBER MUST BE IN INTERNATIONAL FORMAT!
exports.sendOtp = async (req, res, next) => {
	let { _id } = req.user;
	const { phone } = req.body;

	if (phone) {
	} else return next(new Error("Please enter phone number!"));
	if (_id)
		if (isValidObjectId(_id))
			if (await usersModel.exists({ _id })) {
			} else return next(new Error("User not found!"));
		else return next(new Error("Invalid user id!"));
	else {
		const existsProfile = await profilesModel.findOne({ phone });
		if (existsProfile) _id = existsProfile.user;
		else return next(new Error("User with phone number does not exist!"));
	}
	try {
		const otp = otpGenerator.generate(6, {
			alphabets: false,
			upperCase: false,
			specialChars: false,
		});
		console.log("OTP----->", otp);

		client.messages
			.create({
				body: "Backend Boilerplate Verification Code is: " + otp,
				from: "+19105438838",
				to: phone,
			})
			.then(() => {
				const token = getToken({ _id, phone, otp, otpValidation: true });

				res.json({
					success: true,
					token,
				});
			});
	} catch (error) {
		return next(error);
	}
};

exports.verifyOtp = (req, res, next) => {
	const { otp } = req.user;
	const { code } = req.body;
	if (Number(code) === Number(otp)) {
		next();
	} else {
		err = new Error("Invalid Code!");
		err.status = 400;
		return next(err);
	}
};
