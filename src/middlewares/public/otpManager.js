const { isValidObjectId } = require("mongoose");
const otpGenerator = require("otp-generator");

const { getToken } = require("./authenticator");
const { profilesModel, usersModel } = require("../../models");
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;

const client = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// PHONE NUMBER MUST BE IN INTERNATIONAL FORMAT!
exports.sendOtp = async (req, res, next) => {
	try {
		const { phone } = req.body;
		const _id = req?.user?._id;

		if (phone) {
		} else return next(new Error("Please enter phone number!"));

		const otp = otpGenerator.generate(6, {
			alphabets: false,
			upperCase: false,
			specialChars: false,
		});
		console.log("OTP----->", otp);

		// await client.messages.create({
		// 	body: "Backend Boilerplate verification code is: " + otp,
		// 	from: "+19105438838",
		// 	to: phone,
		// });
		const token = getToken({ _id, phone, otp, otpValidation: true });
		res.json({
			success: true,
			token,
		});
	} catch (error) {
		return next(error);
	}
};

exports.verifyOtp = async (req, res, next) => {
	try {
		const { otp, phone } = req.user;
		const { code } = req.body;
		if (Number(code) === Number(otp)) {
			if (phone) req.body.phone = phone;
			next();
		} else {
			err = new Error("Invalid Code!");
			err.status = 400;
			return next(err);
		}
	} catch (error) {
		return next(error);
	}
};
