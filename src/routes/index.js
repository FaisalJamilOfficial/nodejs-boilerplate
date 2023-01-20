const express = require("express");
const router = express.Router();

const admins = require("./admins");
const auth = require("./auth");
const messages = require("./messages");
const users = require("./users");

router.use("/admins", admins);
router.use("/auth", auth);
router.use("/messages", messages);
router.use("/users", users);

router.use("/docs", (req, res, next) =>
  res.redirect("https://documenter.getpostman.com/view/14185057/UVkqruXK")
);
module.exports = router;
