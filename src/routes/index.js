// module imports
import express from "express";

// file imports
import admins from "./admins.js";
import auth from "./auth.js";
import messages from "./messages.js";
import users from "./users.js";

// variable initializations
const router = express.Router();

router.use("/admins", admins);
router.use("/auth", auth);
router.use("/messages", messages);
router.use("/users", users);

router.use("/docs", (_req, res) =>
  res.redirect("https://documenter.getpostman.com/view/14185057/UVkqruXK")
);

export default router;
