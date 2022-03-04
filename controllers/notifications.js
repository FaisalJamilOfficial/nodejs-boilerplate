const { messagesModel, notificationsModel } = require("../models");
const firebaseManager = require("../utils/firebaseManager");

exports.getAllNotifications = (req, res, next) => {
	try {
		const { user, type } = req.user;
		let { q, page, limit } = req.query;
		const query = { user: req.user._id };

		page = Number(page);
		limit = Number(limit);
		if (!limit) limit = 10;
		if (!page) page = 1;
		Promise.all([
			notificationsModel.find(query).count(),
			notificationsModel
				.find(query)
				.populate("user message conversation")
				.sort("-createdAt")
				.skip((page - 1) * limit)
				.limit(limit),
		]).then(([total, notifications]) => {
			const totalPages = Math.ceil(total / limit);
			res.json({ success: true, currentPage: page, totalPages, notifications });
		});
	} catch (error) {
		next(error);
	}
};

exports.newMessageNotification = async (message, callback) => {
	try {
		const existsMessage = await messagesModel
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
				// {
				// 	path: "conversation",
				// },
			]);
		if (existsMessage) {
			const title = "New Message";
			let body = `New message from {"user":"${existsMessage.userFrom._id}"} !`;
			await notificationsModel.create({
				type: "new-message",
				text: body,
				message: existsMessage._id,
				user: existsMessage.userTo,
			});
			body = `New message from ${existsMessage.userFrom.profile.firstname}!`;
			await existsMessage.userTo.fcms.forEach(async (element) => {
				await firebaseManager.sendNotification(
					element.fcm,
					title,
					body,
					existsMessage
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
