const { isValidObjectId } = require("mongoose");
const { usersModel, customersModel } = require("../models");

/**
 * Add customer
 * @param {string} user user id
 * @returns {object} customer data
 */
exports.addCustomer = async (params) => {
  const { user } = params;
  const customerObj = {};

  if (user);
  else throw new Error("Please enter user id!|||400");
  if (isValidObjectId(user));
  else throw new Error("Please enter valid user id!|||400");
  if (await usersModel.exists({ _id: user })) customerObj.user = user;
  else throw new Error("user not found!|||404");

  const customer = await customersModel.create(customerObj);
  return { success: true, data: customer };
};

/**
 * Update customer data
 * @param {string} user user id
 * @returns {object} customer data
 */
exports.updateCustomer = async (params) => {
  const { user } = params;
  const customerObj = {};
  if (user);
  else throw new Error("Please enter user id!|||400");
  if (isValidObjectId(user));
  else throw new Error("Please enter valid user id!|||400");
  const customerExists = await customersModel.findOneAndUpdate(
    { user },
    customerObj,
    {
      new: true,
    }
  );
  if (customerExists);
  else throw new Error("Customer not found!|||404");
  return {
    success: true,
    data: customerExists,
  };
};

/**
 * Delete customer
 * @param {string} user user id
 * @returns {object} customer data
 */
exports.deleteCustomer = async (params) => {
  const { user } = params;
  if (user);
  else throw new Error("Please enter user id!|||400");
  if (isValidObjectId(user));
  else throw new Error("Please enter valid user id!|||400");
  const customerExists = await customersModel.findOneAndDelete({ user });
  if (customerExists);
  else throw new Error("Customer not found!|||404");
  return {
    success: true,
    data: customerExists,
  };
};

/**
 * Get customer
 * @param {string} user user id
 * @returns {object} customer data
 */
exports.getCustomer = async (params) => {
  const { user } = params;
  if (user);
  else throw new Error("Please enter user id!|||400");
  if (isValidObjectId(user));
  else throw new Error("Please enter valid user id!|||400");
  const customerExists = await customersModel
    .findOne({ user })
    .select("-createdAt -updatedAt -__v");
  if (customerExists);
  else throw new Error("Customer not found!|||404");
  return {
    success: true,
    data: customerExists,
  };
};

/**
 * Get customers
 * @param {string} q search keyword
 * @param {number} limit customers limit
 * @param {number} page customers page number
 * @returns {object} customer data
 */
exports.getCustomers = async (params) => {
  const { q } = params;
  let { limit, page } = params;
  if (!limit) limit = 10;
  if (!page) page = 0;
  if (page) page = page - 1;
  const query = {};
  if (q) query.q = q;
  const customers = await customersModel
    .find(query)
    .select("-createdAt -updatedAt -__v")
    .sort({ createdAt: -1 })
    .skip(page * limit)
    .limit(limit);
  const totalCount = await customersModel.find(query).count();
  const totalPages = Math.ceil(totalCount / limit);
  return { success: true, totalCount, totalPages, data: customers };
};
