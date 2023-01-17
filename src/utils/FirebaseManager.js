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
   * @param {[string]} fcms firebase cloud messaging user tokens array
   * @param {string} title notification title
   * @param {string} body notification body
   * @param {object} data notification data
   * @returns {null}
   */
  async sendNotifications(params) {
    const { title, body } = params;
    let { data, fcms, fcm } = params;
    data = data ?? {};
    fcms = fcms?.length > 0 ? fcms : fcm ? [fcm] : ["null"];
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
      .sendToDevice(fcms, payload)
      .then((res) => console.log(res))
      .catch((error) => console.error(error));
    return { success: true };
  }
}

module.exports = FirebaseManager;
