// module imports
import { isValidObjectId } from "mongoose";

// file imports
import * as models from "../models/index.js";

// destructuring assignments
const { paymentAccountsModel, usersModel } = models;

/**
 * @description Add paymentAccount
 * @param {String} user user id
 * @returns {Object} paymentAccount data
 */
exports.addPaymentAccount = async (params) => {
  const { user, account, type } = params;
  const paymentAccountObj = {};

  if (user);
  else throw new Error("Please enter user id!");
  if (isValidObjectId(user));
  else throw new Error("Please enter valid user id!");
  if (await usersModel.exists({ _id: user })) paymentAccountObj.user = user;
  else throw new Error("user not found!");
  if (account) paymentAccountObj.account = account;
  if (type) paymentAccountObj.type = type;

  const paymentAccount = await paymentAccountsModel.create(paymentAccountObj);
  return { success: true, data: paymentAccount };
};

/**
 * @description Get paymentAccount
 * @param {String} paymentAccount paymentAccount id
 * @param {String} user user id
 * @returns {Object} paymentAccount data
 */
exports.getPaymentAccount = async (params) => {
  const { paymentAccount, user, key, value } = params;
  const query = {};
  if (paymentAccount) query._id = paymentAccount;
  if (user) query.user = user;
  if (key) query.key = value;
  else query._id = null;
  const paymentAccountExists = await paymentAccountsModel
    .findOne(query)
    .select("-createdAt -updatedAt -__v");
  if (paymentAccountExists);
  else throw new Error("PaymentAccount not found!|||404");
  return {
    success: true,
    data: paymentAccountExists,
  };
};

/**
 * @description Get paymentAccounts
 * @param {String} q search keyword
 * @param {Number} limit paymentAccounts limit
 * @param {Number} page paymentAccounts page number
 * @returns {Object} paymentAccount data
 */
exports.getPaymentAccounts = async (params) => {
  const { user } = params;
  let { limit, page } = params;
  if (!limit) limit = 10;
  if (!page) page = 0;
  if (page) page = page - 1;
  const query = {};
  if (user) query.user = user;
  const paymentAccounts = await paymentAccountsModel
    .find(query)
    .select("-createdAt -updatedAt -__v")
    .sort({ createdAt: -1 })
    .skip(page * limit)
    .limit(limit);
  const totalCount = await paymentAccountsModel.find(query).count();
  const totalPages = Math.ceil(totalCount / limit);
  return { success: true, totalCount, totalPages, data: paymentAccounts };
};
