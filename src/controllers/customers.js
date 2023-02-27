// module imports
import { isValidObjectId } from "mongoose";

// file imports
import * as models from "../models/index.js";

// destructuring assignments
const { usersModel, customersModel } = models;

/**
 * @description Add customer
 * @param {String} user user id
 * @returns {Object} customer data
 */
export const addCustomer = async (params) => {
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
 * @description Update customer data
 * @param {String} user user id
 * @returns {Object} customer data
 */
export const updateCustomer = async (params) => {
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
 * @description Delete customer
 * @param {String} user user id
 * @returns {Object} customer data
 */
export const deleteCustomer = async (params) => {
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
 * @description Get customer
 * @param {String} user user id
 * @returns {Object} customer data
 */
export const getCustomer = async (params) => {
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
 * @description Get customers
 * @param {String} q search keyword
 * @param {Number} limit customers limit
 * @param {Number} page customers page number
 * @returns {Object} customer data
 */
export const getCustomers = async (params) => {
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
