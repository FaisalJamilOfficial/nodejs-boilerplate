// module imports
// import dotenv from "dotenv";
import http from "http";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import chalk from "chalk";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import { applySpeedGooseCacheLayer, SharedCacheStrategies } from "speedgoose";

// file imports
import "./.bin/www.js";
import indexRouter from "./routes/index.js";
import SocketManager from "./utils/socket-manager.js";
import errorHandler from "./middlewares/error-handler.js";
// import { ENVIRONMENTS } from "./configs/enums.js";

// destructuring assignments
const { NODE_ENV, MONGO_URL } = process.env;
// const { PRODUCTION } = ENVIRONMENTS;

// variable initializations
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const serverFunction = async () => {
  console.log(chalk.hex("#00BFFF")("***Server Execution Started!***"));

  try {
    const app = express();
    const server = http.createServer(app);
    mongoose.set("strictQuery", false);
    app.use(cors());

    new SocketManager().initializeSocket({ server, app });

    const connect = mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    connect.then(
      (db) => {
        applySpeedGooseCacheLayer(mongoose, {
          sharedCacheStrategy: SharedCacheStrategies.IN_MEMORY,
          defaultTtl: 60 * 60 * 24,
        });
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

    app.use(logger("dev"));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use("/public/", express.static(path.join(__dirname, "public/")));

    app.use("/api/v1", indexRouter);

    // app.use(express.static(path.join(__dirname, "client/build")));
    app.get("/reset-password", (req, res, next) => {
      res.sendFile(path.join(__dirname, "public/reset-password.html"));
    });

    app.get("/", (req, res, next) => {
      res.sendFile(path.join(__dirname, "/public/image.png"));
    });

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
      next(new Error("Not Found|||404"));
    });

    // error handler
    app.use(errorHandler);
  } catch (error) {
    console.log(error);
  }
};

// dotenv.config();
// dotenv.config({
//   path:
//     NODE_ENV === PRODUCTION
//       ? ".env.production"
//       : ".env.development",
// });

serverFunction();
console.log(chalk.hex("#607070")(chalk.underline(NODE_ENV.toUpperCase())));
