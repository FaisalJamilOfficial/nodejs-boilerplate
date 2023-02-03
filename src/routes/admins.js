const express = require("express");
const router = express.Router();
const { SECRET } = process.env;

const adminsController = require("../controllers/admins");
const { verifyToken, verifyAdmin } = require("../middlewares/authenticator");
const { asyncHandler } = require("../middlewares/asyncHandler");
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

module.exports = router;
