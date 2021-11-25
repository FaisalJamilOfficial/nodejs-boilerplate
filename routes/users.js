const express = require("express");
const passport = require("passport");
const router = express.Router();

const users = require("../controllers/users");
const {
	verifyToken,
	verifyAdmin,
} = require("../middlewares/public/authenticator");
const { sendOtp, verifyOtp } = require("../middlewares/public/otpManager");
const { upload, uploadTemporary } = require("../middlewares/public/uploader");
const { resizeProfilePicture } = require("../middlewares/private/imageResizer");

router.post("/login", passport.authenticate("local"), users.login);
router.post("/signup", users.signup);
router
	.route("/profilePicture")
	.post(
		verifyToken,
		uploadTemporary.fields([{ name: "profilePicture", maxCount: 1 }]),
		resizeProfilePicture,
		users.setProfilePicture
	)
	.put(verifyToken, users.removeProfilePicture);
module.exports = router;
