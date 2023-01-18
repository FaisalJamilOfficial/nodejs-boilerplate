const dotenv = require("dotenv");
const { ENVIRONMENTS } = require("./configs/enums");
const { PRODUCTION } = ENVIRONMENTS;
dotenv.config();
dotenv.config({
  path:
    process.env.NODE_ENV === PRODUCTION
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
const mongoose = require("mongoose");
const chalk = require("chalk");

const indexRouter = require("./routes/index");
const SocketManager = require("./utils/SocketManager");
const errorHandler = require("./utils/ErrorHandler");

const serverFunction = async () => {
  console.log(chalk.hex("#00BFFF")("***Server Execution Started!***"));
  try {
    const app = express();
    const server = require("http").createServer(app);
    app.use(cors());

    new SocketManager().initializeSocket({ server, app });

    const connect = mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    connect.then(
      (db) => {
        const port = process.env.PORT || "5002";
        server.listen(port, (err) => {
          if (err) console.log(err);
          else
            console.log(
              `***App is running at port: ${chalk.underline(port)}***`
            );
        });
        console.log(chalk.hex("#01CDEF")("***Database Connected!***"));
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
  } catch (error) {
    console.log(error);
  }
};
serverFunction();
console.log(chalk.hex("#607070")(chalk.underline(NODE_ENV.toUpperCase())));
