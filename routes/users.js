const express = require("express");
const passport = require("passport");
const router = express.Router();

const users = require("../controllers/users");
const {
	verifyToken,
	verifyUser,
	verifyAdmin,
	alterLogin,
	verifyUserToken,
} = require("../middlewares/public/authenticator");
const { sendOtp, verifyOtp } = require("../middlewares/public/otpManager");
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

router
	.route("/login")
	.post(alterLogin, passport.authenticate("local"), users.login)
	.put(verifyToken, verifyOtp, users.checkUserPhoneExists, users.login);
router.post("/signup", users.signup);
router.put(
	"/phone",
	verifyToken,
	verifyOtp,
	verifyUserToken,
	users.editUserProfile
);
router.put(
	"/password",
	alterLogin,
	passport.authenticate("local"),
	users.editUserProfile
);

router.route("/otp").post(verifyToken, verifyUser, sendOtp).put(sendOtp);

module.exports = router;
