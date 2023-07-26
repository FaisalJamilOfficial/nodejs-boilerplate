// module imports
import nodemailer from "nodemailer";
// import { google } from "googleapis";

// destructuring assignments
const {
  BASE_URL,
  EMAIL_USER,
  // CLIENT_ID,
  // CLIENT_SECRET,
  // REFRESH_TOKEN,
  PASS_APP,
  APP_TITLE,
} = process.env;

// variable initializations
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: EMAIL_USER,
    pass: PASS_APP,
  },
});
// const OAuth2 = google.auth.OAuth2;
// const oauth2Client = new OAuth2(
//   CLIENT_ID, // ClientID
//   CLIENT_SECRET, // Client Secret
//   "https://developers.google.com/oauthplayground" // Redirect URL
// ).setCredentials({
//   refresh_token: process.env.REFRESH_TOKEN,
// });
// const accessToken = oauth2Client.getAccessToken();
// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 465,
//   secure: true,
//   auth: {
//     type: "OAuth2",
//     user: EMAIL_USER,
//     clientId: CLIENT_ID,
//     clientSecret: CLIENT_SECRET,
//     refreshToken: REFRESH_TOKEN,
//     accessToken,
//   },
//   tls: {
//     rejectUnauthorized: false,
//   },
// });

class NodeMailer {
  constructor() {
    this.transporter = transporter;
  }

  /**
   * @description Send email
   * @param {String} to receiver email address
   * @param {String} subject email subject
   * @param {String} text email text
   * @param {Object} html email html
   * @returns {Object} email response
   */
  async sendEmail(params) {
    const { to, subject, text, html } = params;
    return await transporter.sendMail({
      from: `BACKEND BOILERPLATE <${EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
  }

  /**
   * @description Get reset password email template
   * @param {String} user user id
   * @param {String} token user token
   * @returns {Object} email template
   */
  getResetPasswordEmailTemplate(params) {
    const { user, token } = params;
    const link = `${BASE_URL}reset-password/?user=${user}&token=${token}`;
    return `
Please click on the link below to reset your password, 
${link}
Please note that this link will expire after 10 minutes.

If you didn't do this, contact us here ${EMAIL_USER}`;
  }

  /**
   * @description Get email verification email template
   * @param {String} user user id
   * @param {String} token user token
   * @returns {Object} email template
   */
  getEmailVerificationEmailTemplate(params) {
    const { user, token } = params;
    const link = `${process.env.BASE_URL}api/v1/users/emails?user=${user}&token=${token}`;
    return `
Please click on the link below to verify your email address, 
${link}
Please note that this link will expire after 10 minutes.

If you didn't do this, contact us here ${EMAIL_USER}`;
  }

  /**
   * @description Get user welcome email template
   * @param {String} name user name
   * @returns {Object} email template
   */
  getWelcomeUserEmailTemplate(params) {
    const { name } = params;
    return `Hi ${name},
  Thanks for signing up for the ${APP_TITLE}! You’re joining an amazing community of beauty lovers. From now on you’ll enjoy:
  Exciting new product announcementsSpecial offers and exclusive dealsOur unique take on the latest beauty trends
  Want more? Follow us on social media and get your daily dose of advice, behind-the-scenes looks and beauty inspiration:
  Like us on Facebook / Follow us on Instagram
  Best,
  Doctor of Computer 😇`;
  }

  /**
   * @description Get reset password email template
   * @param {String} name user name
   * @param {String} otp otp code
   * @returns {Object} email template
   */
  getOTPSendingEmailTemplate(params) {
    const { name, otp } = params;
    return `Dear ${name},
Your One Time Password (OTP) is ${otp}. Please do not share this password with anyone.
Please note that this password will expire after 10 minutes.
  
If you didn't do this, contact us here ${EMAIL_USER}`;
  }
}

export default NodeMailer;
