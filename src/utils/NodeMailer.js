const { EMAIL_USER, PASS_APP, CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN } =
	process.env;

const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
	process.env.CLIENT_ID, // ClientID
	process.env.CLIENT_SECRET, // Client Secret
	"https://developers.google.com/oauthplayground" // Redirect URL
);

oauth2Client.setCredentials({
	refresh_token: process.env.REFRESH_TOKEN,
});
const accessToken = oauth2Client.getAccessToken();

const transporter = nodemailer.createTransport({
	host: "smtp.gmail.com",
	port: 465,
	secure: true,
	auth: {
		type: "OAuth2",
		user: EMAIL_USER,
		clientId: CLIENT_ID,
		clientSecret: CLIENT_SECRET,
		refreshToken: REFRESH_TOKEN,
		accessToken,
	},
	tls: {
		rejectUnauthorized: false,
	},
});
// const transporter = nodemailer.createTransport({
// 	host: "smtp.gmail.com",
// 	port: 587,
// 	secure: false, // true for 465, false for other ports
// 	auth: {
// 		user: EMAIL_USER,
// 		pass: PASS_APP,
// 	},
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
	async sendEmail(parameters) {
		const { to, subject, text, html } = parameters;
		const response = await transporter.sendMail({
			from: `BACKEND BOILERPLATE <${EMAIL_USER}>`,
			to,
			subject,
			text,
			html,
		});
		return response;
	}
}

module.exports = NodeMailer;
