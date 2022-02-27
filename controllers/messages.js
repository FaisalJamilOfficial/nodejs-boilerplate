const { isValidObjectId } = require("mongoose");

const { usersModel, messagesModel, conversationsModel } = require("../models");
const notificationsController = require("../controllers/notifications");

exports.send = async (req, res, next) => {
	try {
		const { userTo, text } = req.body;
		const { attachments } = req.files || {};
		const messageObj = { userFrom: req.user._id };
		const query = {
			$or: [
				{ $and: [{ userTo: req.user._id }, { userFrom: userTo }] },
				{ $and: [{ userFrom: req.user._id }, { userTo: userTo }] },
			],
		};

		if (text) {
			messageObj.text = text;
		}

		if (userTo) {
			if (isValidObjectId(userTo)) {
				const existsUserTo = await usersModel.exists({ _id: userTo });
				if (existsUserTo) messageObj.userTo = userTo;
				else throw new Error("userTo not found!");
			} else throw new Error("Please enter valid userTo id!");
		} else throw new Error("Please enter userTo id!");

		const existsConversation = await conversationsModel.findOne(query);
		if (existsConversation) {
			messageObj.conversation = existsConversation._id;
			if (existsConversation.status === "pending") {
				if (req.user._id.equals(existsConversation.userTo)) {
					existsConversation.status = "accepted";
					await existsConversation.save();
				} else if (existsConversation.status === "rejected") {
					return next(new Error("Conversation request rejected!"));
				}
			}
		} else {
			const conversationObj = {};
			conversationObj.userTo = userTo;
			conversationObj.userFrom = req.user._id;
			const conversation = await conversationsModel.create(conversationObj);
			messageObj.conversation = conversation._id;
		}

		if (attachments) {
			messageObj.attachments = [];
			attachments.forEach((attachment) => {
				if (attachment.path)
					messageObj.attachments.push({
						path: attachment.filename,
						type: attachment.mimetype,
					});
			});
		}

		const message = await messagesModel.create(messageObj);

		req.io.emit("newMessage_" + message.conversation, {
			message,
		});

		await notificationsController.newMessageNotification(message._id);

		res.json({ success: true, message });
	} catch (error) {
		next(error);
	}
};

exports.chat = async (req, res, next) => {
	try {
		const { conversation } = req.query;
		let { limit, page } = req.query;
		limit = Number(limit);
		page = Number(page);
		if (!limit) limit = 10;
		if (!page) page = 0;
		if (page) page = page - 1;
		if (conversation) {
			const query = { conversation };
			const messages = await messagesModel
				.find(query)
				.sort({ createdAt: -1 })
				.skip(page * limit)
				.limit(limit);
			const totalCount = await messagesModel.find(query).count();
			res.json({
				success: true,
				totalPages: Math.ceil(totalCount / limit),
				messages,
			});
		} else next(new Error("Please enter conversation id!"));
	} catch (error) {
		next(error);
	}
};

exports.updateMessage = async (req, res, next) => {
	try {
		const { message, text, status } = req.body;
		const messageObj = {};
		if (message) {
			if (isValidObjectId(message)) messageObj._id = message;
			else throw new Error("Please enter valid message id!");
		} else throw new Error("Please enter message id!");
		if (text) {
			messageObj.text = text;
		}
		if (status) {
			messageObj.status = status;
		}
		const response = await messagesModel.updateOne(
			{ _id: message, userFrom: req.user._id },
			messageObj
		);
		res.json({
			success: response.modifiedCount === 0 ? false : true,
			message: await messagesModel.findOne({ _id: message }),
		});
	} catch (error) {
		next(error);
	}
};

exports.getChatters = async (req, res, next) => {
	try {
		let { limit, page } = req.query;
		limit = Number(limit);
		page = Number(page);
		if (!limit) limit = 10;
		if (!page) page = 0;
		if (page) page = page - 1;
		const query = {
			$or: [{ userTo: req.user._id }, { userFrom: req.user._id }],
		};
		const chatters = await conversationsModel
			.find(query)
			.sort({ createdAt: -1 })
			.skip(page * limit)
			.limit(limit);
		const totalCount = await conversationsModel.find(query).count();
		res.json({
			success: true,
			totalPages: Math.ceil(totalCount / limit),
			chatters,
		});
	} catch (error) {
		next(error);
	}
};
