const otpGenerator = require("otp-generator");

const { getToken } = require("../middlewares/authenticator");
const usersController = require("../controllers/users");
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
  async sendOTP(params) {
    const { user, phone } = params;

    const response = await usersController.getUser({ phone });
    const userExists = response?.data;

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
      _id: user ?? userExists?._id,
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
