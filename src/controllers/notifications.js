// file imports
import models from "../models/index.js";

// destructuring assignments
const { notificationsModel } = models;

/**
 * Add notification
 * @param {String} title title
 * @param {String} description description
 * @param {String} value value
 * @returns {Object} notification data
 */
export const addNotification = async (parameters) => {
  const { user, type, message, messenger, order, launderer, customer } =
    parameters;
  const notificationObj = {};

  if (user) notificationObj.user = user;
  if (type) notificationObj.type = type;
  if (message) notificationObj.message = message;
  if (messenger) notificationObj.messenger = messenger;
  if (order) notificationObj.order = order;
  if (launderer) notificationObj.launderer = launderer;
  if (customer) notificationObj.customer = customer;

  const notification = await notificationsModel.create(notificationObj);
  return { success: true, data: notification };
};

/**
 * @description Get notifications
 * @param {String} user user id
 * @param {Number} limit notifications limit
 * @param {Number} page notifications page number
 * @returns {[Object]} array of notifications
 */
export const getNotifications = async (params) => {
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
