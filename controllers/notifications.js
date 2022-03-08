const { messagesModel, notificationsModel } = require("../models");
const firebaseManager = require("../utils/firebaseManager");

exports.getAllNotifications = async (req, res, next) => {
	try {
		const { user, type } = req.user;
		let { q, page, limit } = req.query;
		const query = { user: req.user._id };

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
		res.json({ success: true, currentPage: page, totalPages, notifications });
	} catch (error) {
		next(error);
	}
};

exports.newMessageNotification = async (message, callback) => {
	try {
		const messageExists = await messagesModel
			.findOne({ _id: message })
			.populate([
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
				await firebaseManager.sendNotification(
					element.fcm,
					title,
					body,
					messageExists
				);
			});
			// callback();
			return;
			console.log(searchObjectsInArray(body, ["user"]));
		} else throw new Error("Message not found!");
	} catch (error) {
		throw error;
	}
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
