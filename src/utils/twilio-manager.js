// module imports
// import twilio from "twilio";
// import otpGenerator from "otp-generator";

// file imports
import * as userController from "../modules/user/controller.js";
import { getToken } from "../middlewares/authenticator.js";
import { ErrorHandler } from "../middlewares/error-handler.js";

// destructuring assignments
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, APP_TITLE } = process.env;

// variable initializations
// const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

class TwilioManager {
  constructor() {
    // this.client = client;
  }

  /**
   * @description Send OTP to phone number
   * @param {String} user user id
   * @param {String} phone user phone number in INTERNATIONAL format
   * @returns {Object} token
   */
  async sendOTP(params) {
    const { user, phone, phoneCode } = params;

    if (!phone) throw new ErrorHandler("Please enter phone number!", 400);

    const query = {};
    if (user) query.user = user;
    else query.phone = phone;

    const userExists = await userController.getElement(query);

    const otp = "111111";
    // const otp = otpGenerator.generate(6, {
    //   specialChars: false,
    //   lowerCaseAlphabets: false,
    //   upperCaseAlphabets: false,
    // });
    console.log("OTP -->", otp);
    const message = `${APP_TITLE} verification code is: ${otp}`;
    await this.send({ phone, message });
    const tokenObj = {
      _id: user ?? userExists?._id,
      phone,
      phoneCode,
      shouldValidateOTP: true,
    };
    if (userExists) {
      userExists.otp = otp;
      await userExists.save();
    } else tokenObj.otp = otp;
    return getToken(tokenObj);
  }

  /**
   * @description Send OTP to phone number
   * @param {String} phone user phone number in INTERNATIONAL format
   * @param {String} message message text
   * @returns {Object} token
   */
  async send(params) {
    const { phone, message } = params;
    if (!phone) throw new ErrorHandler("Please enter phone number!", 400);
    try {
      // await client.messages.create({
      //   body: message,
      //   from: "+19105438838",
      //   to: phone,
      // });
    } catch (error) {
      console.log("Twilio Error =>", error);
    }
  }
}

export default TwilioManager;
