const { messagesModel, notificationsModel } = require("../models");
const FirebaseManager = require("../utils/FirebaseManager");

const { NOTIFICATION_TYPES } = require("../configs/enums");
const { NEW_MESSAGE } = NOTIFICATION_TYPES;

/**
 * Get user notifications
 * @param {string} user user id
 * @param {number} limit notifications limit
 * @param {number} page notifications page number
 * @returns {[object]} array of notifications
 */
exports.getAllNotifications = async (parameters) => {
	const { user } = parameters;
	let { page, limit } = parameters;
	const query = {};
	if (user) query.user = user;
	if (!limit) limit = 10;
	if (!page) page = 1;
	const totalCount = await notificationsModel.find(query).count();
	const notifications = await notificationsModel
		.find(query)
		.populate("")
		.sort({ createdAt: -1 })
		.skip((page - 1) * limit)
		.limit(limit);
	const totalPages = Math.ceil(totalCount / limit);
	return { success: true, currentPage: page, totalPages, notifications };
};

/**
 * New message notification
 * @param {string} message message id
 * @returns {null}
 */
exports.newMessageNotification = async (parameters) => {
	const { message } = parameters;
	const messageExists = await messagesModel.findOne({ _id: message }).populate([
		{
			path: "userTo",
			// populate: { path: "profile", model: "profiles" },
		},
		{
			path: "userFrom",
			// populate: { path: "profile", model: "profiles" },
		},
	]);
	if (messageExists);
	else throw new Error("Message not found!");

	const title = "New Message";
	let body = `New message from {"user":"${messageExists.userFrom._id}"} !`;
	await notificationsModel.create({
		type: NEW_MESSAGE,
		text: body,
		message: messageExists._id,
		messenger: messageExists.userFrom,
		user: messageExists.userTo,
	});
	body = `New message from ${messageExists.userFrom.name}!`;
	const fcms = [];
	messageExists.userTo.fcms.forEach(async (element) => {
		fcms.push(element.token);
	});
	await new FirebaseManager().sendNotification({ fcms, title, body });
	return;
};
