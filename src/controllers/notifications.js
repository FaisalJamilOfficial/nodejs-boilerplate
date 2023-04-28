// file imports
import models from "../models/index.js";
import FirebaseManager from "../utils/firebase-manager.js";
import { NOTIFICATION_TYPES } from "../configs/enums.js";

// destructuring assignments
const { messagesModel, notificationsModel } = models;
const { NEW_MESSAGE } = NOTIFICATION_TYPES;

/**
 * @description Get user notifications
 * @param {String} user user id
 * @param {Number} limit notifications limit
 * @param {Number} page notifications page number
 * @returns {[Object]} array of notifications
 */
export const getAllNotifications = async (params) => {
  const { user } = params;
  let { page, limit } = params;
  const query = {};
  if (user) query.user = user;
  if (!limit) limit = 10;
  if (!page) page = 1;
  const notifications = await notificationsModel.aggregate([
    { $match: query },
    { $sort: { createdAt: -1 } },
    { $project: { createdAt: 0, updatedAt: 0, __v: 0 } },
    {
      $facet: {
        totalCount: [{ $count: "totalCount" }],
        data: [{ $skip: page * limit }, { $limit: limit }],
      },
    },
    { $unwind: "$totalCount" },
    {
      $project: {
        totalCount: "$totalCount.totalCount",
        totalPages: {
          $ceil: {
            $divide: ["$totalCount.totalCount", limit],
          },
        },
        data: 1,
      },
    },
  ]);
  return {
    success: true,
    data: [],
    totalCount: 0,
    totalPages: 0,
    ...notifications[0],
  };
};

/**
 * @description send new message notification
 * @param {String} message message id
 * @returns {null}
 */
export const sendNewMessageNotification = async (params) => {
  const { message } = params;
  const messageExists = await messagesModel
    .findById(message)
    .populate(["userTo", "userFrom"]);
  if (messageExists);
  else throw new Error("Message not found!|||404");

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
  await new FirebaseManager().sendNotification({
    fcms,
    title,
    body,
    data: {
      type: NEW_MESSAGE,
      // message: JSON.stringify(messageExists)
    },
  });
  return { success: true, message: "Message notification sent successfully!" };
};
