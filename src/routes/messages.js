const express = require("express");
const router = express.Router();

const messagesController = require("../controllers/messages");
const {
	verifyToken,
	verifyUser,
} = require("../middlewares/public/authenticator");

const { upload } = require("../middlewares/public/uploader");
const { ATTACHMENTS_DIRECTORY } = require("../configs/directories");

router
	.route("/")
	.post(
		verifyToken,
		verifyUser,
		upload(ATTACHMENTS_DIRECTORY).fields([
			{ name: "attachments", maxCount: 10 },
		]),
		messagesController.send
	)
	.get(verifyToken, verifyUser, messagesController.chat)
	.put(verifyToken, verifyUser, messagesController.updateMessage);
router.get(
	"/chatters",
	verifyToken,
	verifyUser,
	messagesController.getChatters
);

module.exports = router;
