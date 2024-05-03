// module imports

// file imports
import FirebaseManager from "../../utils/firebase-manager.js";
import SocketManager from "../../utils/socket-manager.js";
import ElementModel from "./model.js";
import * as userController from "../user/controller.js";
import { ErrorHandler } from "../../middlewares/error-handler.js";
import {
  NOTIFICATION_STATUSES,
  NOTIFICATION_TYPES,
  SOCKET_EVENTS,
} from "../../configs/enum.js";

// destructuring assignments
const { READ } = NOTIFICATION_STATUSES;
const { NEW_MESSAGE_, CONVERSATIONS_UPDATED } = SOCKET_EVENTS;
const { NEW_MESSAGE } = NOTIFICATION_TYPES;

/**
 * @description Add element
 * @param {Object} elementObj element data
 * @returns {Object} element data
 */
export const addElement = async (elementObj) => {
  return await ElementModel.create(elementObj);
};

/**
 * @description Add elements
 * @param {Object[]} elements elements data
 * @returns {Object} element data
 */
export const addElements = async (elements) => {
  return await ElementModel.create(elements);
};

/**
 * @description Get elements
 * @param {Object} params elements fetching parameters
 * @returns {Object[]} elements data
 */
export const getElements = async (params) => {
  const { user } = params;
  let { page, limit } = params;
  const query = {};
  if (user) query.user = user;
  page = page - 1 || 0;
  limit = limit || 10;
  const [result] = await ElementModel.aggregate([
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
  return { data: [], totalCount: 0, totalPages: 0, ...result };
};

/**
 * @description notify users
 * @param {Object} params notify users parameters
 */
export const notifyUsers = async (params) => {
  const {
    query,
    user,
    socketData,
    firebaseData,
    event,
    notificationData,
    title,
    body,
    type,
    isGrouped,
    useFirebase,
    useDatabase,
    useSocket,
  } = params;

  const fcms = [];
  let usersExist = [];

  if (isGrouped) {
    if (useFirebase) {
      const queryObj = query ?? {};
      queryObj.limit = Math.pow(2, 32);
      const { data } = await userController.getElements(queryObj);
      usersExist = data;
      usersExist.forEach(async (element) => {
        element.fcms.forEach((e) => fcms.push(e.token));
      });
    }
    if (useSocket)
      // socket event emission
      await new SocketManager().emitGroupEvent({ event, data: socketData });
  } else {
    if (useFirebase) {
      const userExists = await userController.getElementById(user || "");
      userExists?.fcms.forEach((e) => fcms.push(e.token));
    }
    if (useSocket)
      // socket event emission
      await new SocketManager().emitEvent({
        to: user,
        event,
        data: socketData,
      });
  }
  if (useFirebase)
    // firebase notification emission
    await new FirebaseManager().multicast({
      fcms,
      title,
      body,
      data: firebaseData ? { ...firebaseData, type } : { type },
    });
  if (useDatabase)
    if (notificationData) {
      // database notification creation
      if (type) notificationData.type = type;
      if (isGrouped) {
        const elements = usersExist?.map((element) => {
          return { ...notificationData, user: element._id };
        });
        await addElements(elements);
      } else await addElement(notificationData);
    }
};

/**
 * @description read all notifications
 * @param {String} user user id
 */
export const readNotifications = async (user) => {
  const notificationObj = { status: READ };
  if (!user) throw new ErrorHandler("Please enter user id!", 400);
  if (!(await userController.checkElementExistence({ _id: user })))
    throw new ErrorHandler("Please enter valid user id!", 400);
  await ElementModel.updateMany({ user }, notificationObj);
};

/**
 * @description send new message notification
 * @param {Object} params notification parameters
 */
export const sendNewMessageNotification = async (params) => {
  const { username, notificationData, conversationData, messageData } = params;
  await notifyUsers({
    user: notificationData.user,
    type: NEW_MESSAGE,
    useSocket: true,
    event: NEW_MESSAGE_ + messageData?.conversation,
    socketData: messageData,
    useFirebase: true,
    title: "New Message",
    body: `New message from ${username}`,
    useDatabase: true,
    notificationData,
  });
  await notifyUsers({
    useSocket: true,
    event: CONVERSATIONS_UPDATED,
    socketData: conversationData,
    user: notificationData.user,
  });
};
