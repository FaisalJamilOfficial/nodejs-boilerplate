// module imports
import admin from "firebase-admin";

// file imports
import serviceAccount from "../services/backend-boilerplate-official-firebase-adminsdk-o1ajl-593da86247.json" assert { type: "json" };

// variable initializations
const connection = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

class FirebaseManager {
  constructor() {
    this.connection = connection;
  }

  /**
   * @description Send firebase notification
   * @param {[String]} fcms firebase cloud messaging user tokens array
   * @param {String} title notification title
   * @param {String} body notification body
   * @param {Object} data notification data
   */
  async notify(params) {
    const { title, body } = params;
    let { data, fcms, fcm } = params;
    let response = null;
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
      .then((res) => (response = res))
      .catch((error) => console.error(error));
    console.log("response", response);
  }
}

export default FirebaseManager;
