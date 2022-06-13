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

const sendEmail = async (email, subject, text, html) => {
	try {
		const transporter = nodemailer.createTransport({
			host: "smtp.gmail.com",
			port: 465,
			secure: true,
			auth: {
				type: "OAuth2",
				user: process.env.EMAIL_USER,
				clientId: process.env.CLIENT_ID,
				clientSecret: process.env.CLIENT_SECRET,
				refreshToken: process.env.REFRESH_TOKEN,
				accessToken,
			},
			tls: {
				rejectUnauthorized: false,
			},
		});

		const response = await transporter.sendMail({
			from: `BACKEND BOILERPLATE <${process.env.EMAIL_USER}>`,
			to: email,
			subject,
			text,
			html,
		});
		return response;
	} catch (error) {
		throw error;
	}
};

module.exports = sendEmail;
