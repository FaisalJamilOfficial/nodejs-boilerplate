const express = require("express");
const router = express.Router();

const messagesController = require("../controllers/messages");
const { verifyToken, verifyUser } = require("../middlewares/authenticator");

const { upload } = require("../middlewares/uploader");
const { ATTACHMENTS_DIRECTORY } = require("../configs/directories");
const { USER_TYPES } = require("../configs/enums");
const { ADMIN } = USER_TYPES;

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
				const { _id } = req?.user;
				const { user, userTo, text } = req.body;
				const userFrom = req?.user?.type === ADMIN ? user : _id;
				const { attachments } = req.files || {};
				const arguments = {
					...req.body,
					userFrom,
					attachments,
					socket: req.io,
				};
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
			const arguments = {
				conversation,
				limit: Number(limit),
				page: Number(page),
			};
			const response = await messagesController.chat(arguments);
			res.json(response);
		} catch (error) {
			next(error);
		}
	})
	.put(verifyToken, verifyUser, async (req, res, next) => {
		try {
			const { _id } = req?.user;
			const { user, message, text, status } = req.body;
			const user_id = req?.user?.type === ADMIN ? user : _id;
			const arguments = { user: user_id, message, text, status };
			const response = await messagesController.updateMessage(arguments);
			res.json(response);
		} catch (error) {
			next(error);
		}
	})
	.patch(verifyToken, verifyUser, async (req, res, next) => {
		try {
			const { _id } = req?.user;
			const user_id = req?.user?.type === ADMIN ? user : _id;
			const arguments = { ...req.body, userTo: user_id };
			const response = await messagesController.readMessages(arguments);
			res.json(response);
		} catch (error) {
			next(error);
		}
	});
router.get(
	"/conversations",
	verifyToken,
	verifyUser,
	async (req, res, next) => {
		try {
			const { _id } = req?.user;
			const { limit, page } = req.query;
			const user_id = req?.user?.type === ADMIN ? user : _id;
			const arguments = {
				user: user_id,
				limit: Number(limit),
				page: Number(page),
			};
			const response = await messagesController.getConversations(arguments);
			res.json(response);
		} catch (error) {
			next(error);
		}
	}
);

module.exports = router;
