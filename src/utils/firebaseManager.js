const admin = require("firebase-admin");

const serviceAccount = require("../services/backend-boilerplate-official-firebase-adminsdk-o1ajl-593da86247.json");

const connection = admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

class FirebaseManager {
	constructor() {
		this.connection = connection;
	}

	/**
	 * Send firebase notification
	 * @param {string} fcm firebase cloud messaging user token
	 * @param {string} title notification title
	 * @param {string} body notification body
	 * @param {object} data notification data
	 * @returns {null}
	 */
	async sendNotification(parameters) {
		const { fcm, title, body, data } = parameters;
		data = data ?? {};
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
			.catch((error) => console.error(error));
		return;
	}
}

module.exports = FirebaseManager;
