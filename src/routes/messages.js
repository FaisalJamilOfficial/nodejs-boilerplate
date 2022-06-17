const express = require("express");
const router = express.Router();

const messagesController = require("../controllers/messages");
const { verifyToken, verifyUser } = require("../middlewares/authenticator");

const { upload } = require("../middlewares/uploader");
const { ATTACHMENTS_DIRECTORY } = require("../configs/directories");

router
	.route("/")
	.post(
		verifyToken,
		verifyUser,
		upload(ATTACHMENTS_DIRECTORY).fields([
			{ name: "attachments", maxCount: 10 },
		]),
		async (req, res, next) => {
			try {
				const { _id: user } = req.user;
				const { userTo, text } = req.body;
				const { attachments } = req.files || {};
				const arguments = { user, userTo, text, attachments };
				const response = await messagesController.send(arguments);
				res.json(response);
			} catch (error) {
				next(error);
			}
		}
	)
	.get(verifyToken, verifyUser, async (req, res, next) => {
		try {
			const { conversation, limit, page } = req.query;
			const arguments = { conversation, limit, page };
			const response = await messagesController.chat(arguments);
			res.json(response);
		} catch (error) {
			next(error);
		}
	})
	.put(verifyToken, verifyUser, async (req, res, next) => {
		try {
			const { message, text, status } = req.body;
			const arguments = { message, text, status };
			const response = await messagesController.updateMessage(arguments);
			res.json(response);
		} catch (error) {
			next(error);
		}
	});
router.get("/chatters", verifyToken, verifyUser, async (req, res, next) => {
	try {
		const { _id: user } = req.user;
		const { limit, page } = req.query;
		const arguments = { user, limit, page };
		const response = await messagesController.getChatters(arguments);
		res.json(response);
	} catch (error) {
		next(error);
	}
});

module.exports = router;
