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
   * Send email
   * @param {string} to receiver email address
   * @param {string} subject email subject
   * @param {string} text email text
   * @param {object} html email html
   * @returns {object} email response
   */
  async sendEmail(params) {
    const { to, subject, text, html } = params;
    const response = await transporter.sendMail({
      from: `BACKEND BOILERPLATE <${EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
    return response;
  }

  /**
   * Get reset password email template
   * @param {string} user user id
   * @param {string} token user token
   * @returns {object} email template
   */
  getResetPasswordEmailTemplate(params) {
    const { user, token } = params;
    const link = `${BASE_URL}forgot-password/reset?user=${user}&token=${token}`;
    return `
To reset your password, click on this link 
${link}
Link will expire in 10 minutes.

If you didn't do this, contact us here ${EMAIL_USER}`;
  }

  /**
   * Get email verification email template
   * @param {string} user user id
   * @param {string} token user token
   * @returns {object} email template
   */
  getEmailVerificationEmailTemplate(params) {
    const { user, token } = params;
    const link = `${process.env.BASE_URL}api/v1/users/emails?user=${user}&token=${token}`;
    return `
  To verify your email address, click on this link 
  ${link}
  Link will expire in 10 minutes.

  If you didn't do this, contact us here ${EMAIL_USER}`;
  }

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
}

export default NodeMailer;
