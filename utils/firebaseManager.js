const admin = require("firebase-admin");

const serviceAccount = require("../services/backend-boilerplate-official-firebase-adminsdk-o1ajl-593da86247.json");

const connection = admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

exports.sendNotification = async (fcm, title, body, data) => {
	try {
		const payload = {
			notification: {
				title,
				body,
				sound: "default",
			},
			data,
		};
		connection
			.messaging()
			.sendToDevice([fcm], payload)
			.then((res) => console.log(res))
			.catch((error) => console.log(error));
	} catch (error) {
		console.error(error);
	}
};
