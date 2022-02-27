const { isValidObjectId } = require("mongoose");
const moment = require("moment");
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
			.populate("userFrom userTo");
		if (existsMessage) {
			const title = "New Message";
			const body = `New message from ${existsMessage.userFrom._id}!`;

			await notificationsModel.create({
				type: "new-message",
				text: body,
				message: existsMessage._id,
				user: existsMessage.userTo._id,
			});
			await firebaseManager.sendNotification(
				existsMessage.userTo.fcm,
				title,
				body,
				existsMessage
			);
			// callback();
			return;
		}
	} catch (error) {
		return error;
	}
};
