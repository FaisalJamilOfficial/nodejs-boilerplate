// module imports
import http from "http";
import express from "express";
import path from "path";
import logger from "morgan";
import cors from "cors";
import chalk from "chalk";
import mongoose from "mongoose";
import { fileURLToPath } from "url";

// file imports
import "./bin/www.js";
import indexRouter from "./routes/index.js";
import SocketManager from "./utils/socket-manager.js";
import errorHandler from "./middlewares/error-handler.js";

// destructuring assignments
const { NODE_ENV, MONGO_URL } = process.env;

// variable initializations
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const serverFunction = async () => {
  console.log(chalk.hex("#00BFFF")("***Server Execution Started!***"));

  try {
    const app = express();
    const server = http.createServer(app);
    mongoose.set("strictQuery", false);
    app.use(
      cors({
        origin: ["http://localhost:3000", "https://admin.app.com"],
        credentials: true,
      })
    );

    new SocketManager().initializeSocket({ server, app });

    const connect = mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    connect.then(
      (_db) => {
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
    app.use("/public/", express.static(path.join(__dirname, "public/")));

    app.use("/api/v1", indexRouter);

    app.get("/reset-password", (_req, res) => {
      res.sendFile(path.join(__dirname, "public/reset-password.html"));
    });

    app.get("/", (_req, res) => {
      res.sendFile(path.join(__dirname, "/public/image.png"));
    });

    // catch 404 and forward to error handler
    app.use(function (_req, _res, next) {
      next(new Error("Not Found|||404"));
    });

    // error handler
    app.use(errorHandler);
  } catch (error) {
    console.log(error);
  }
};

serverFunction();
console.log(chalk.hex("#607070")(chalk.underline(NODE_ENV.toUpperCase())));
