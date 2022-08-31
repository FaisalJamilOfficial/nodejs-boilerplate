const otpGenerator = require("otp-generator");

const { getToken } = require("../middlewares/authenticator");
const { usersModel } = require("../models");
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;

const client = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

class TwilioManager {
	constructor() {
		this.client = client;
	}

	/**
	 * Send OTP to phone number
	 * @param {string} user user id
	 * @param {string} phone user phone number in INTERNATIONAL format
	 * @returns {object} token
	 */
	async sendOTP(parameters) {
		const { user, phone } = parameters;

		let userExists;
		if (phone) userExists = await usersModel.findOne({ phone });
		else return next(new Error("Please enter phone number!"));

		const otp = otpGenerator.generate(6, {
			alphabets: false,
			upperCase: false,
			specialChars: false,
		});
		console.log("OTP -->", otp);

		// await client.messages.create({
		// 	body: "Backend Boilerplate verification code is: " + otp,
		// 	from: "+19105438838",
		// 	to: phone,
		// });

		const token = getToken({
			_id: user,
			phone,
			otp,
			shouldValidateOTP: true,
		});
		return {
			success: true,
			token,
		};
	}
}

module.exports = TwilioManager;
