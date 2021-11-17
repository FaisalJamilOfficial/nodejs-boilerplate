const otpGenerator = require("otp-generator");

const { getToken } = require("./authenticator");
const {
	TWILIO_ACCOUNT_SID,
	TWILIO_AUTH_TOKEN,
} = require("../../services/config");

const client = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

exports.sendOtp = async (req, res, next) => {
	console.log("PHONE NUMBER MUST BE IN INTERNATIONAL FORMAT!");
	const { phone } = req.body;
	try {
		const otp = otpGenerator.generate(6, {
			alphabets: false,
			upperCase: false,
			specialChars: false,
		});
		client.messages
			.create({
				body: "Your App verification code is: " + otp,
				from: "+13158401425",
				to: phone,
			})
			.then(() => {
				var token = getToken({ phone, otp, otpValidation: true });

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
	const { otp, phone } = req.user;
	const { code } = req.body;
	if (Number(code) === Number(otp)) {
		const token = getToken({ phone, otp, otpValidation: true });
		res.json({
			success: true,
			token,
		});
	} else {
		err = new Error("Invalid Code!");
		err.status = 400;
		return next(err);
	}
};
