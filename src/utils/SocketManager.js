// const admin = require("firebase-admin");
// const serviceAccount = require("../services/backend-boilerplate-official-firebase-adminsdk-o1ajl-593da86247.json");
// const connection = admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
// });

class SocketManager {
  constructor() {
    this.io = global.io;
    // this.connection = connection;
  }

  /**
   * Emit event
   * @param {string} to event listener
   * @param {string} event event title
   * @param {object} data event data
   * @returns {object} socket response
   */
  async emitEvent(parameters) {
    const { to, event, data } = parameters;
    let response = await io.to(to).emit(event, data);
    // response = await connection
    // 	.firestore()
    // 	.collection("socket")
    // 	.doc(to)
    // 	.set(
    // 		JSON.parse(
    // 			JSON.stringify({
    // 				type: event,
    // 				data,
    // 			})
    // 		)
    // 	);
    return response;
  }

  /**
   * Emit event
   * @param {string} event event title
   * @param {object} data event data
   * @returns {object} socket response
   */
  async emitGroupEvent(parameters) {
    const { event, data } = parameters;
    let response = await io.emit(event, data);
    return response;
  }
}

module.exports = SocketManager;
