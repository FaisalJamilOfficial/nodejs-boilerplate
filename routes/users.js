const express = require("express");
const passport = require("passport");
const router = express.Router();

const usersController = require("../controllers/users");
const notificationsController = require("../controllers/notifications");
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
	.post(usersController.signup)
	.put(
		verifyToken,
		verifyUser,
		uploadTemporary.fields([{ name: "picture", maxCount: 1 }]),
		resizeProfilePicture,
		usersController.editUserProfile
	)
	.get(verifyToken, verifyAdmin, usersController.getAllUsers);

router
	.route("/login")
	.post(alterLogin, passport.authenticate("local"), usersController.login)
	.put(
		verifyToken,
		verifyOtp,
		usersController.checkUserPhoneExists,
		usersController.login
	);
router.put(
	"/phone",
	verifyToken,
	verifyOtp,
	verifyUserToken,
	usersController.editUserProfile
);
router.put(
	"/password",
	alterLogin,
	passport.authenticate("local"),
	usersController.editUserProfile
);

router.route("/otp").post(verifyToken, verifyUser, sendOtp).put(sendOtp);

router.get(
	"/notifications",
	verifyToken,
	verifyUser,
	notificationsController.getAllNotifications
);

router.get("/:user", verifyToken, verifyUser, usersController.getUser);

module.exports = router;
