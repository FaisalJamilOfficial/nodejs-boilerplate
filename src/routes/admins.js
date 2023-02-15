// module imports
import express from "express";

// file imports
import * as adminsController from "../controllers/admins.js";
import { verifyToken, verifyAdmin } from "../middlewares/authenticator.js";
import { asyncHandler } from "../middlewares/async-handler.js";

// destructuring assignments
const { SECRET } = process.env;

// variable initializations
const router = express.Router();

router.delete(
  "/clean/DB",
  verifyToken,
  verifyAdmin,
  asyncHandler(async (req, res) => {
    const { secret } = req.headers;
    if (secret === SECRET);
    else throw new Error("Invalid SECRET!|||400");
    const response = await adminsController.cleanDB();
    res.json(response);
  })
);

export default router;
