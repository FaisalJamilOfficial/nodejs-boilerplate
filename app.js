require("dotenv").config();
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
var passport = require("passport");

const logger = require("morgan");
const cors = require("cors");
const json = require("morgan-json");

const socketio = require("socket.io");
const mongoose = require("mongoose");
const fs = require("fs");

const usersController = require("./controllers/users");

const accessLogStream = fs.createWriteStream(
	path.join(__dirname, "access.log"),
	{
		flags: "a",
	}
);
const indexRouter = require("./routes/index");
const { MONGO_URL } = process.env;
const errorHandler = require("./middlewares/public/errorHandler");

const app = express();
const server = require("http").createServer(app);

const io = socketio(server);
io.on("connection", (socket) => {
	socket.on("join", (data) => {
		console.log(data);
		console.log("---------entered------------");
		try {
			usersController.changeState(data, "online");
		} catch (error) {
			next(error);
		}
	});
	socket.on("join", socket.join);

	socket.on("exit", (data) => {
		console.log(data);
		console.log("---------exit------------");
		try {
			usersController.changeState(data, "offline");
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
		console.log("***DB Connected!***");
	},
	(err) => {
		console.log(err);
	}
);

app.use(cors());
const format = json({
	url: ":url",
	address: ":remote-addr",
	user: ":remote-user",
	time: ":date[clf]",
	method: ":method",
	status: ":status",
});

app.use(passport.initialize());
app.use(logger(format, { stream: accessLogStream }));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/v1", indexRouter);

app.get("/*", (req, res, next) => {
	res.json({ message: "server is working", success: true });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(errorHandler);

module.exports = app;
