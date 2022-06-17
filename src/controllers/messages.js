const { isValidObjectId } = require("mongoose");

const { usersModel, messagesModel, conversationsModel } = require("../models");
const notificationsController = require("../controllers/notifications");

const { CONVERSATION_STATUSES } = require("../configs/enums");
const { PENDING, ACCEPTED, REJECTED } = CONVERSATION_STATUSES;

exports.send = async (parameters) => {
	const { user, userTo, text, attachments } = parameters;
	const messageObj = { userFrom: user };
	const query = {
		$or: [
			{ $and: [{ userTo: user }, { userFrom: userTo }] },
			{ $and: [{ userFrom: user }, { userTo: userTo }] },
		],
	};

	if (text) {
		messageObj.text = text;
	}

	if (userTo) {
		if (isValidObjectId(userTo)) {
			const userToExists = await usersModel.exists({ _id: userTo });
			if (userToExists) messageObj.userTo = userTo;
			else throw new Error("userTo not found!");
		} else throw new Error("Please enter valid userTo id!");
	} else throw new Error("Please enter userTo id!");

	const conversationExists = await conversationsModel.findOne(query);
	if (conversationExists) {
		messageObj.conversation = conversationExists._id;
		if (conversationExists.status === PENDING) {
			if (user.equals(conversationExists.userTo)) {
				conversationExists.status = ACCEPTED;
				await conversationExists.save();
			} else if (conversationExists.status === REJECTED) {
				throw new Error("Conversation request rejected!");
			}
		}
	} else {
		const conversationObj = {};
		conversationObj.userTo = userTo;
		conversationObj.userFrom = user;
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

	return { success: true, message };
};

exports.chat = async (parameters) => {
	const { conversation, limit, page } = parameters;
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
		const totalPages = Math.ceil(totalCount / limit);
		return { success: true, totalCount, totalPages, messages };
	} else throw new Error("Please enter conversation id!");
};

exports.updateMessage = async (parameters) => {
	const { message, text, status } = parameters;
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
		{ _id: message, userFrom: user },
		messageObj
	);
	return {
		success: response.modifiedCount === 0 ? false : true,
		message: await messagesModel.findOne({ _id: message }),
	};
};

exports.getChatters = async (parameters) => {
	const { user, limit, page } = parameters;
	limit = Number(limit);
	page = Number(page);
	if (!limit) limit = 10;
	if (!page) page = 0;
	if (page) page = page - 1;
	const query = {
		$or: [{ userTo: user }, { userFrom: user }],
	};
	const chatters = await conversationsModel
		.find(query)
		.sort({ createdAt: -1 })
		.skip(page * limit)
		.limit(limit);
	const totalCount = await conversationsModel.find(query).count();
	return {
		success: true,
		totalPages: Math.ceil(totalCount / limit),
		chatters,
	};
};
