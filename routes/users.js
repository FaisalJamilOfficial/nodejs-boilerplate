const express = require("express");
const router = express.Router();

const users = require("../controllers/users");
const {
	verifyToken,
	verifyAdmin,
} = require("../middlewares/public/authenticator");
const { sendOtp, verifyOtp } = require("../middlewares/public/otpManager");
const {
	upload,
	PROFILE_PICTURES_DIRECTORY,
} = require("../middlewares/public/uploader");
const { resizeProfilePicture } = require("../middlewares/private/imageResizer");

router.post("/login", verifyToken, verifyOtp, users.login);
router.post("/register", verifyToken, verifyOtp, users.register);
router
	.route("/profilePicture")
	.put(
		verifyToken,
		upload(PROFILE_PICTURES_DIRECTORY).fields([
			{ name: "profilePicture", maxCount: 1 },
		]),
		resizeProfilePicture,
		users.setProfilePicture
	)
	.patch(verifyToken, users.removeProfilePicture);
module.exports = router;
