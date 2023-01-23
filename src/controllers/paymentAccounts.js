const { isValidObjectId } = require("mongoose");
const { paymentAccountsModel, usersModel } = require("../models");

/**
 * Add paymentAccount
 * @param {string} user user id
 * @returns {object} paymentAccount data
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
 * Get paymentAccount
 * @param {string} paymentAccount paymentAccount id
 * @param {string} user user id
 * @returns {object} paymentAccount data
 */
exports.getPaymentAccount = async (params) => {
  const { paymentAccount, user, key, value } = params;
  const query = {};
  if (paymentAccount) query._id = paymentAccount;
  if (user) query.user = user;
  if (key) query.key = value;
  else query._id = null;
  const paymentAccountExists = await paymentAccountsModel.findOne(query);
  return {
    success: true,
    data: paymentAccountExists,
  };
};

/**
 * Get paymentAccounts
 * @param {string} q search keyword
 * @param {number} limit paymentAccounts limit
 * @param {number} page paymentAccounts page number
 * @returns {object} paymentAccount data
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
    .sort({ createdAt: -1 })
    .skip(page * limit)
    .limit(limit);
  const totalCount = await paymentAccountsModel.find(query).count();
  const totalPages = Math.ceil(totalCount / limit);
  return { success: true, totalCount, totalPages, data: paymentAccounts };
};
