const { isValidObjectId } = require("mongoose");

const { usersModel, messagesModel, conversationsModel } = require("../models");
const notificationsController = require("../controllers/notifications");

const { CONVERSATION_STATUSES } = require("../configs/enums");
const { PENDING, ACCEPTED, REJECTED } = CONVERSATION_STATUSES;

/**
 * Send message
 * @param {string} user user id
 * @param {string} userTo receiver user id
 * @param {string} text message text
 * @param {[object]} attachments message attachments
 * @returns {object} message data
 */
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

	await notificationsController.newMessageNotification({
		message: message._id,
	});

	return { success: true, message };
};

/**
 * Get chat messages
 * @param {string} conversation conversation id
 * @param {number} limit messages limit
 * @param {number} page messages page number
 * @param {string} text message text
 * @param {[object]} attachments OPTIONAL message attachments
 * @returns {object} message data
 */
exports.chat = async (parameters) => {
	const { conversation, limit, page } = parameters;
	if (!limit) limit = 10;
	if (!page) page = 0;
	if (page) page = page - 1;
	const query = {};
	if (conversation) query = { conversation };
	else throw new Error("Please enter conversation id!");
	const messages = await messagesModel
		.find(query)
		.sort({ createdAt: -1 })
		.skip(page * limit)
		.limit(limit);
	const totalCount = await messagesModel.find(query).count();
	const totalPages = Math.ceil(totalCount / limit);
	return { success: true, totalCount, totalPages, messages };
};

/**
 * Update message data
 * @param {string} message message id
 * @param {string} text message text
 * @param {string} status message status
 * @returns {object} message data
 */
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

/**
 * Get user chatters
 * @param {string} user user id
 * @param {number} limit chatters limit
 * @param {number} page chatters page number
 * @returns {[object]} array of chatters
 */
exports.getChatters = async (parameters) => {
	const { user, limit, page } = parameters;
	if (!limit) limit = 10;
	if (!page) page = 0;
	if (page) page = page - 1;
	const query = {};
	if (user) query.$or = { $or: [{ userTo: user }, { userFrom: user }] };
	const chatters = await conversationsModel
		.find(query)
		.sort({ createdAt: -1 })
		.skip(page * limit)
		.limit(limit);
	const totalCount = await conversationsModel.find(query).count();
	return {
		success: true,
		totalCount,
		totalPages: Math.ceil(totalCount / limit),
		chatters,
	};
};
