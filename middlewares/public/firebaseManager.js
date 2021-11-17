const admin = require("firebase-admin");

const serviceAccount = require("../../services/hopeing-backend-firebase-adminsdk-h8m6j-6d8c3c66b9.json");

const connection = admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

exports.sendNotification = async (fcm, title, body) => {
	const payload = {
		notification: {
			title,
			body,
			sound: "default",
		},
	};
	connection
		.messaging()
		.sendToDevice([fcm], payload)
		.then((res) => console.log(res))
		.catch((error) => console.log(error));
};
