const { Server } = require("socket.io");
const usersController = require("../controllers/users");
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
  async emitEvent(params) {
    const { to, event, data } = params;
    const response = await this.io.to(to).emit(event, data);
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
  async emitGroupEvent(params) {
    const { event, data } = params;
    const response = await this.io.emit(event, data);
    return response;
  }

  /**
   * @param {*} httpServer http server instance
   * @param {*} app express app instance
   */
  async initializeSocket(params) {
    const { server, app } = params;
    const io = new Server(server, {
      cors: {
        origin: "*",
      },
    });
    io.on("connection", (socket) => {
      socket.on("join", async (data) => {
        console.log(data);
        console.log("---------joined------------");
        try {
          const args = { user: data, isOnline: true };
          await usersController.updateUser(args);
        } catch (error) {
          console.log(error);
        }
      });
      socket.on("join", socket.join);

      socket.on("exit", async (data) => {
        console.log(data);
        console.log("---------exited------------");
        try {
          const args = { user: data, isOnline: false };
          await usersController.updateUser(args);
        } catch (error) {
          console.log(error);
        }
      });
      socket.on("exit", socket.leave);
      socket.on("disconnect", (reason) => {
        console.log("user disconnected " + reason);
      });
    });
    global.io = io;

    // attach to app instance
    app.use((req, res, next) => {
      req.io = io;
      next();
    });
  }
}

module.exports = SocketManager;
