const SocketManager = require("../utils/SocketManager");
const { isValidObjectId } = require("mongoose");

const { usersModel, messagesModel, conversationsModel } = require("../models");
const notificationsController = require("./notifications");

const { CONVERSATION_STATUSES, MESSAGE_STATUSES } = require("../configs/enums");
const { PENDING, ACCEPTED, REJECTED } = CONVERSATION_STATUSES;
const { READ } = MESSAGE_STATUSES;

/**
 * Add message
 * @param {string} userFrom sender user id
 * @param {string} userTo receiver user id
 * @param {string} text message text
 * @param {[object]} attachments message attachments
 * @returns {object} message data
 */
exports.addMessage = async (params) => {
  const { userFrom, userTo, text, attachments, conversation } = params;
  const messageObj = {};

  if (userTo);
  else throw new Error("Please enter userTo id!|||400");
  if (isValidObjectId(userTo));
  else throw new Error("Please enter valid userTo id!|||400");
  if (await usersModel.exists({ _id: userTo })) messageObj.userTo = userTo;
  else throw new Error("userTo not found!|||404");

  if (userFrom);
  else throw new Error("Please enter userFrom id!|||400");
  if (isValidObjectId(userFrom));
  else throw new Error("Please enter valid userFrom id!|||400");
  if (await usersModel.exists({ _id: userFrom }))
    messageObj.userFrom = userFrom;
  else throw new Error("userFrom not found!|||404");

  if (conversation);
  else throw new Error("Please enter conversation id!|||400");
  if (isValidObjectId(conversation));
  else throw new Error("Please enter valid conversation id!|||400");
  if (
    await conversationsModel.exists({
      _id: conversation,
    })
  )
    messageObj.conversation = conversation;
  else throw new Error("conversation not found!|||404");

  if (text) messageObj.text = text;

  if (attachments) {
    messageObj.attachments = [];
    attachments.forEach((attachment) => {
      if (attachment.path)
        messageObj.attachments.push({
          path: attachment.filename,
          type: attachment.mimetype,
        });
    });
  }

  const message = await messagesModel.create(messageObj);

  return { success: true, data: message };
};

/**
 * Get chat messages
 * @param {string} conversation conversation id
 * @param {number} limit messages limit
 * @param {number} page messages page number
 * @param {string} text message text
 * @param {[object]} attachments OPTIONAL message attachments
 * @returns {object} message data
 */
exports.chat = async (params) => {
  const { conversation } = params;
  let { page, limit } = params;
  if (!limit) limit = 10;
  if (!page) page = 0;
  if (page) page = page - 1;
  const query = {};
  if (conversation) query.conversation = conversation;
  else throw new Error("Please enter conversation id!|||400");
  const messages = await messagesModel
    .find(query)
    .select("-createdAt -updatedAt -__v")
    .sort({ createdAt: -1 })
    .skip(page * limit)
    .limit(limit);
  const totalCount = await messagesModel.find(query).count();
  const totalPages = Math.ceil(totalCount / limit);
  return { success: true, totalCount, totalPages, data: messages };
};

/**
 * Update message data
 * @param {string} message message id
 * @param {string} text message text
 * @param {string} status message status
 * @returns {object} message data
 */
exports.updateMessage = async (params) => {
  const { message, text, status } = params;
  const messageObj = {};
  if (message);
  else throw new Error("Please enter message id!|||400");
  if (isValidObjectId(message));
  else throw new Error("Please enter valid message id!|||400");
  if (text) messageObj.text = text;
  if (status) messageObj.status = status;
  const messageExists = await messagesModel.findByIdAndUpdate(
    { _id: message },
    messageObj,
    {
      new: true,
    }
  );
  if (messageExists);
  else throw new Error("Message not found!|||404");
  return {
    success: true,
    data: messageExists,
  };
};

/**
 * Delete message
 * @param {string} message message id
 * @returns {object} message data
 */
exports.deleteMessage = async (params) => {
  const { message } = params;
  if (message);
  else throw new Error("Please enter message id!");
  const messageExists = await messagesModel.findByIdAndDelete(message);
  if (messageExists);
  else throw new Error("Please enter valid message id!");
  return {
    success: true,
    data: messageExists,
  };
};

/**
 * Get user conversations
 * @param {string} user user id
 * @param {number} limit conversations limit
 * @param {number} page conversations page number
 * @returns {[object]} array of conversations
 */
exports.getConversations = async (params) => {
  const { user } = params;
  let { limit, page } = params;
  if (!limit) limit = 10;
  if (!page) page = 0;
  if (page) page = page - 1;
  const query = {};
  if (user) query.$or = [{ userTo: user }, { userFrom: user }];
  const conversations = await conversationsModel
    .find(query)
    .select("-createdAt -updatedAt -__v")
    .sort({ createdAt: -1 })
    .skip(page * limit)
    .limit(limit);
  const totalCount = await conversationsModel.find(query).count();
  return {
    success: true,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    data: conversations,
  };
};

/**
 * Send message
 * @param {string} userFrom sender user id
 * @param {string} userTo receiver user id
 * @param {string} text message text
 * @param {[object]} attachments message attachments
 * @returns {object} message data
 */
exports.send = async (params) => {
  const { userFrom, userTo } = params;
  let conversation;
  const query = {
    $or: [
      { $and: [{ userTo: userFrom }, { userFrom: userTo }] },
      { $and: [{ userFrom }, { userTo }] },
    ],
  };

  let conversationExists = await conversationsModel.findOne(query);
  if (conversationExists) {
    conversation = conversationExists._id;
    if (conversationExists.status === PENDING) {
      if (userFrom.equals(conversationExists.userTo)) {
        conversationExists.status = ACCEPTED;
        await conversationExists.save();
      }
    } else if (conversationExists.status === REJECTED)
      throw new Error("Conversation request rejected!");
  } else {
    const conversationObj = {};
    conversationObj.userTo = userTo;
    conversationObj.userFrom = userFrom;
    conversationExists = await conversationsModel.create(conversationObj);
    conversation = conversationExists._id;
  }

  const args = { ...params, conversation };
  const responseMessage = await this.addMessage(args);
  const message = responseMessage.message;

  await new SocketManager().emitEvent({
    to: message.userTo,
    event: "newMessage_" + message._id,
    data: message,
  });

  await notificationsController.newMessageNotification({
    message: message._id,
  });

  return { success: true, data: message };
};

/**
 * read all messages
 * @param {string} conversation message id
 * @param {string} userTo user id
 * @returns {object} message data
 */
exports.readMessages = async (params) => {
  const { conversation, userTo } = params;
  const messageObj = { status: READ };
  if (userTo);
  else throw new Error("Please enter userTo id!");
  if (await usersModel.exists({ _id: userTo }));
  else throw new Error("Please enter valid userTo id!");
  if (conversation);
  else throw new Error("Please enter conversation id!");
  if (await conversationsModel.exists({ _id: conversation }));
  else throw new Error("Please enter valid conversation id!");
  await messagesModel.updateMany({ conversation, userTo }, messageObj);
  return {
    success: true,
    message: "messages read successfully!",
  };
};
