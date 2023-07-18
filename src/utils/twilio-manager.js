// module imports
import twilio from "twilio";
import otpGenerator from "otp-generator";

// file imports
import * as usersController from "../controllers/users.js";
import { getToken } from "../middlewares/authenticator.js";

// destructuring assignments
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;

// variable initializations
const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

class TwilioManager {
  constructor() {
    this.client = client;
  }

  /**
   * @description Send OTP to phone number
   * @param {String} user user id
   * @param {String} phone user phone number in INTERNATIONAL format
   * @returns {Object} token
   */
  async sendOTP(params) {
    const { user, phone } = params;

    if (phone);
    else throw new Error("Please enter phone number!|||400");

    const { data: userExists } = await usersController.getUser({ phone });

    const otp = otpGenerator.generate(6, {
      alphabets: false,
      upperCase: false,
      specialChars: false,
    });
    console.log("OTP -->", otp);
    try {
      await client.messages.create({
        body: "Backend Boilerplate verification code is: " + otp,
        from: "+19105438838",
        to: phone,
      });
    } catch (error) {
      console.log("Twilio Error", error);
    }
    const token = getToken({
      _id: user,
      phone,
      shouldValidateOTP: !user,
    });
    userExists.otp = otp;
    await userExists.save();
    return token;
  }
}

export default TwilioManager;
