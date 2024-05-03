// module imports
import { isValidObjectId, Types } from "mongoose";

// file imports
import ElementModel from "./model.js";
import * as conversationController from "../conversation/controller.js";
import * as userController from "../user/controller.js";
import { sendNewMessageNotification } from "../notification/controller.js";
import { MESSAGE_STATUSES } from "../../configs/enum.js";
import { ErrorHandler } from "../../middlewares/error-handler.js";

// destructuring assignments
const { READ } = MESSAGE_STATUSES;
const { ObjectId } = Types;

/**
 * @description Add element
 * @param {Object} elementObj element data
 * @returns {Object} element data
 */
export const addElement = async (elementObj) => {
  return await ElementModel.create(elementObj);
};

/**
 * @description Update element data
 * @param {String} element element id
 * @param {Object} elementObj element data
 * @returns {Object} element data
 */
export const updateElementById = async (element, elementObj) => {
  if (!element) throw new ErrorHandler("Please enter element id!", 400);
  if (!isValidObjectId(element))
    throw new ErrorHandler("Please enter valid element id!", 400);
  const elementExists = await ElementModel.findByIdAndUpdate(
    element,
    elementObj,
    { new: true }
  );
  if (!elementExists) throw new ErrorHandler("element not found!", 404);
  return elementExists;
};

/**
 * @description Get elements
 * @param {Object} params elements fetching parameters
 * @returns {Object[]} elements data
 */
export const getElements = async (params) => {
  const { conversation } = params;
  let { page, limit, user1, user2 } = params;
  page = page - 1 || 0;
  limit = limit || 10;
  const query = {};
  if (conversation)
    query.conversation =
      typeof conversation === "string"
        ? new ObjectId(conversation)
        : conversation;
  else if (user1 && user2) {
    if (typeof user1 === "string") user1 = new ObjectId(user1);
    if (typeof user2 === "string") user2 = new ObjectId(user2);
    query.$or = [
      { $and: [{ userTo: user1 }, { userFrom: user2 }] },
      { $and: [{ userFrom: user1 }, { userTo: user2 }] },
    ];
  } else throw new ErrorHandler("Please enter conversation id!", 400);
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
        totalPages: { $ceil: { $divide: ["$totalCount.totalCount", limit] } },
        data: 1,
      },
    },
  ]);
  return { data: [], totalCount: 0, totalPages: 0, ...result };
};

/**
 * @description Send message
 * @param {Object} params send message data
 * @returns {Object} message data
 */
export const send = async (params) => {
  const { username } = params;

  const conversation = await conversationController.addElement(params);

  const message = await addElement({
    ...params,
    conversation: conversation._id,
  });

  conversation.lastMessage = message._id;
  await conversation.save();

  conversation.lastMessage = message;

  const notificationData = {
    user: message.userTo.toString(),
    message: message._id.toString(),
    messenger: message.userFrom.toString(),
  };

  const args = {
    username,
    notificationData,
    messageData: message,
    conversationData: conversation,
  };
  await sendNewMessageNotification(args);

  return message;
};

/**
 * @description read all messages
 * @param {Object} params read messages data
 */
export const readMessages = async (params) => {
  const { conversation, userTo } = params;
  const messageObj = { status: READ };
  if (!userTo) throw new ErrorHandler("Please enter userTo id!", 400);
  if (!(await userController.checkElementExistence({ _id: userTo })))
    throw new ErrorHandler("Please enter valid userTo id!", 400);
  if (!conversation)
    throw new ErrorHandler("Please enter conversation id!", 400);
  if (!(await conversationController.getElementById(conversation)))
    throw new ErrorHandler("Please enter valid conversation id!", 400);
  await ElementModel.updateMany({ conversation, userTo }, messageObj);
};
