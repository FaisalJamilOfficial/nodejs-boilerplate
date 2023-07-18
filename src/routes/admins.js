// module imports
import express from "express";

// file imports
import * as adminsController from "../controllers/admins.js";
import { verifyToken, verifyAdmin } from "../middlewares/authenticator.js";
import { exceptionHandler } from "../middlewares/exception-handler.js";

// destructuring assignments
const { SECRET } = process.env;

// variable initializations
const router = express.Router();

router.delete(
  "/clean/DB",
  verifyToken,
  verifyAdmin,
  exceptionHandler(async (req, res) => {
    const { secret } = req.headers;
    if (secret === SECRET);
    else throw new Error("Invalid SECRET!|||400");
    await adminsController.cleanDB();
    res.json({
      message: "Operation completed successfully!",
    });
  })
);

export default router;
