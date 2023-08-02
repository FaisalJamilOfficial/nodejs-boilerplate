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
    const { title, body, imageUrl } = params;
    let { data, fcms, fcm } = params;
    data = data ?? {};
    fcms = fcms?.length > 0 ? fcms : fcm ? [fcm] : ["null"];
    const payload = {
      notification: {
        title,
        body,
        image: imageUrl ?? "https://nodejs.org/static/images/logo.svg",
        sound: "default",
      },
      data,
    };
    connection
      .messaging()
      .sendToDevice(fcms, payload)
      .then((response) => {
        console.log("response", response);
        console.log("response.results", response.results);
      })
      .catch((error) => console.error(error));
  }

  /**
   * Send multicast firebase notification
   * @param {[string]} fcms firebase cloud messaging user token
   * @param {string} title notification title
   * @param {string} body notification body
   * @param {object} data notification data
   * @param {String} topicName notification topic
   * @param {String} imageUrl notification image url
   * @returns {null}
   */
  async multicast(parameters) {
    const { topicName, title, body, imageUrl } = parameters;
    let { fcms, data } = parameters;
    if (fcms && fcms.length > 0);
    else fcms = ["null"];
    data = data ?? {};
    const message = {
      tokens: fcms,
      notification: {
        title,
        body,
      },
      data,
      android: {
        notification: {
          imageUrl: imageUrl ?? "https://nodejs.org/static/images/logo.svg",
        },
      },
      apns: {
        payload: {
          aps: {
            "mutable-content": 1,
          },
        },
        fcm_options: {
          image: imageUrl ?? "https://nodejs.org/static/images/logo.svg",
        },
      },
      webpush: {
        headers: {
          image: imageUrl ?? "https://nodejs.org/static/images/logo.svg",
        },
      },
      topic: topicName,
    };
    connection
      .messaging()
      .sendMulticast(message)
      .then((res) => console.log(res))
      .catch((error) => console.error(error));
  }
}

export default FirebaseManager;
