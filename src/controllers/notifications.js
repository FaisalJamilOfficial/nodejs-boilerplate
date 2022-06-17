const { messagesModel, notificationsModel } = require("../models");
const firebaseManager = require("../utils/FirebaseManager");

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
	const query = { user };
	if (!limit) limit = 10;
	if (!page) page = 1;
	const totalCount = await notificationsModel.find(query).count();
	const notifications = await notificationsModel
		.find(query)
		.populate("")
		.sort("-createdAt")
		.skip((page - 1) * limit)
		.limit(limit);
	const totalPages = Math.ceil(totalCount / limit);
	return { success: true, currentPage: page, totalPages, notifications };
};

/**
 * Send new message notification
 * @param {string} message message id
 * @returns {null}
 */
exports.newMessageNotification = async (parameters) => {
	const { message } = parameters;
	const messageExists = await messagesModel.findOne({ _id: message }).populate([
		{
			path: "userTo",
			populate: { path: "profile", model: "profiles" },
		},
		{
			path: "userFrom",
			populate: { path: "profile", model: "profiles" },
		},
	]);
	if (messageExists) {
		const title = "New Message";
		let body = `New message from {"user":"${messageExists.userFrom._id}"} !`;
		await notificationsModel.create({
			type: "new-message",
			text: body,
			message: messageExists._id,
			messenger: messageExists.userFrom,
			user: messageExists.userTo,
		});
		body = `New message from ${messageExists.userFrom.profile.firstname}!`;
		await messageExists.userTo.fcms.forEach(async (element) => {
			await firebaseManager.sendNotification(element.fcm, title, body);
		});
		return;
		console.log(searchObjectsInArray(body, ["user"]));
	} else throw new Error("Message not found!");
};

/**
 * Send new message notification
 * @param {string} string text containing objects e.g '{"name":"dev"}'
 * @param {[string]} keysArray array of keys of objects in string e.g ["name"]
 * @returns {object} object of key-value pairs from string
 */
function searchObjectsInArray(parameters) {
	const { string, keysArray } = parameters;
	const strArray = string.split(" ");
	let object = {};
	keysArray.forEach((element) => {
		const obj = JSON.parse(
			strArray.find(function (str) {
				return str.includes(element);
			})
		);
		object = { ...object, ...obj };
	});
	return object;
}
