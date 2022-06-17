const { messagesModel, notificationsModel } = require("../models");
const firebaseManager = require("../utils/FirebaseManager");

exports.getAllNotifications = async (parameters) => {
	const { user, type, q } = parameters;
	let { page, limit } = parameters;
	const query = { user };

	page = Number(page);
	limit = Number(limit);
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

exports.newMessageNotification = async (message, callback) => {
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
		// callback();
		return;
		console.log(searchObjectsInArray(body, ["user"]));
	} else throw new Error("Message not found!");
};

function searchObjectsInArray(string, keysArray) {
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
