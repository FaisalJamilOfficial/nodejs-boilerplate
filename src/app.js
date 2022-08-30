const dotenv = require("dotenv");
dotenv.config();
dotenv.config({
	path:
		process.env.NODE_ENV === "production"
			? ".env.production"
			: ".env.development",
});

const { MONGO_URL, NODE_ENV } = process.env;
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const logger = require("morgan");
const cors = require("cors");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

const indexRouter = require("./routes/index");
const { updateUser } = require("./controllers/users");
const errorHandler = require("./utils/ErrorHandler");

const serverFunction = async () => {
	console.log("***Server Execution Started!***");
	try {
		const app = express();
		const server = require("http").createServer(app);
		app.use(cors());

		const io = new Server(server, {
			cors: {
				origin: "*",
			},
		});
		io.on("connection", (socket) => {
			socket.on("join", (data) => {
				console.log(data);
				console.log("---------entered------------");
				try {
					const arguments = { user: data, isOnline: true };
					updateUser(arguments);
				} catch (error) {
					next(error);
				}
			});
			socket.on("join", socket.join);

			socket.on("exit", (data) => {
				console.log(data);
				console.log("---------exit------------");
				try {
					const arguments = { user: data, isOnline: false };
					updateUser(arguments);
				} catch (error) {
					next(error);
				}
			});
			socket.on("exit", socket.leave);
			socket.on("disconnect", (reason) => {
				console.log("user disconnected");
			});
		});

		app.use((req, res, next) => {
			req.io = io;
			next();
		});

		const connect = mongoose.connect(MONGO_URL, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});

		connect.then(
			(db) => {
				console.log("***Database Connected!***");
			},
			(err) => {
				console.log(err);
			}
		);

		app.use(passport.initialize());
		app.use(logger("dev"));
		app.use(express.json());
		app.use(express.urlencoded({ extended: false }));
		app.use(cookieParser());
		app.use("/public/", express.static(path.join(__dirname, "public/")));

		app.use("/api/v1", indexRouter);

		app.use(express.static(path.join(__dirname, "client/build")));
		app.get("/forgot-password/*", (req, res, next) => {
			res.sendFile(path.resolve(__dirname, "client/build/index.html"));
		});

		app.get("/*", (req, res, next) => {
			res.sendFile(path.join(__dirname, "/public/image.png"));
		});

		// catch 404 and forward to error handler
		app.use(function (req, res, next) {
			next(createError(404));
		});

		// error handler
		app.use(errorHandler);

		const port = process.env.PORT || "5002";
		server.listen(port, (err) => {
			console.log(`***App is running at port: ${port}***`);
		});
	} catch (error) {
		console.log(error);
	}
};
serverFunction();
console.log(NODE_ENV.toUpperCase());
