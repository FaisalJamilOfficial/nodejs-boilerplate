const express = require("express");
const passport = require("passport");
const router = express.Router();

const users = require("../controllers/users");
const {
	verifyToken,
	verifyUser,
	verifyAdmin,
} = require("../middlewares/public/authenticator");
const { sendOtp, verifyOtp } = require("../utils/otpManager");
const { upload, uploadTemporary } = require("../middlewares/public/uploader");
const { resizeProfilePicture } = require("../middlewares/private/imageResizer");

router
	.route("/")
	.put(
		verifyToken,
		verifyUser,
		uploadTemporary.fields([{ name: "picture", maxCount: 1 }]),
		resizeProfilePicture,
		users.editUserProfile
	)
	.get(verifyToken, verifyAdmin, users.getAllUsers);
router.get("/:user", verifyToken, verifyUser, users.getUser);

router.post("/login", passport.authenticate("local"), users.login);
router.post("/signup", users.signup);

module.exports = router;
