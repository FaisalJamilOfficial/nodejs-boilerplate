// module imports
import { isValidObjectId } from "mongoose";

// file imports
import models from "../models/index.js";

// destructuring assignments
const { usersModel, adminsModel } = models;

/**
 * @description @description Add admin
 * @param {String} user user id
 * @returns {Object} admin data
 */
export const addAdmin = async (parameters) => {
  const { user } = parameters;
  const adminObj = {};

  if (user);
  else throw new Error("Please enter user id!|||400");
  if (isValidObjectId(user));
  else throw new Error("Please enter valid user id!|||400");
  if (await usersModel.exists({ _id: user })) adminObj.user = user;
  else throw new Error("User not found!|||404");

  const admin = await adminsModel.create(adminObj);
  return { success: true, data: admin };
};

/**
 * @description Update admin data
 * @param {String} user user id
 * @returns {Object} admin data
 */
export const updateAdmin = async (parameters) => {
  const { user } = parameters;
  const adminObj = {};
  if (user);
  else throw new Error("Please enter user id!|||400");
  if (isValidObjectId(user));
  else throw new Error("Please enter valid user id!|||400");
  const adminExists = await adminsModel.findOneAndUpdate({ user }, adminObj, {
    new: true,
  });
  if (adminExists);
  else throw new Error("Admin not found!|||404");
  return {
    success: true,
    data: adminExists,
  };
};

/**
 * @description Delete admin
 * @param {String} user user id
 * @returns {Object} admin data
 */
export const deleteAdmin = async (parameters) => {
  const { user } = parameters;
  if (user);
  else throw new Error("Please enter user id!|||400");
  if (isValidObjectId(user));
  else throw new Error("Please enter valid user id!|||400");
  const adminExists = await adminsModel.findOneAndDelete({ user });
  if (adminExists);
  else throw new Error("Admin not found!|||404");
  return {
    success: true,
    data: adminExists,
  };
};

/**
 * @description Get admin
 * @param {String} user user id
 * @returns {Object} admin data
 */
export const getAdmin = async (parameters) => {
  const { user } = parameters;
  if (user);
  else throw new Error("Please enter user id!");
  if (isValidObjectId(user));
  else throw new Error("Please enter valid user id!|||400");
  const adminExists = await adminsModel
    .findOne({ user })
    .select("-createdAt -updatedAt -__v");
  if (adminExists);
  else throw new Error("Admin not found!|||404");
  return {
    success: true,
    data: adminExists,
  };
};

/**
 * @description Get admins
 * @param {String} q search keyword
 * @param {Number} limit admins limit
 * @param {Number} page admins page number
 * @returns {Object} admin data
 */
export const getAdmins = async (parameters) => {
  const { q } = parameters;
  let { limit, page } = parameters;
  if (!limit) limit = 10;
  if (!page) page = 0;
  if (page) page = page - 1;
  const query = {};
  if (q) query.q = q;
  const admins = await adminsModel
    .find(query)
    .select("-createdAt -updatedAt -__v")
    .sort({ createdAt: -1 })
    .skip(page * limit)
    .limit(limit);
  const totalCount = await adminsModel.find(query).count();
  const totalPages = Math.ceil(totalCount / limit);
  return { success: true, totalCount, totalPages, data: admins };
};

/**
 * @description Clean DB
 * @returns {Object} success status
 */
export const cleanDB = async () => {
  return {
    success: true,
    message: "Operation completed successfully!",
  };
};
