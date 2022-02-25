const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, text, html) => {
	try {
		const transporter = nodemailer.createTransport({
			host: "smtp.gmail.com",
			service: "gmail",
			port: 587,
			secure: true,
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS,
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
