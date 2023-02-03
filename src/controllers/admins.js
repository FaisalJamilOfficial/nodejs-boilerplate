const { isValidObjectId } = require("mongoose");
const { usersModel, adminsModel } = require("../models");

/**
 * Add admin
 * @param {string} user user id
 * @returns {object} admin data
 */
exports.addAdmin = async (parameters) => {
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
 * Update admin data
 * @param {string} user user id
 * @returns {object} admin data
 */
exports.updateAdmin = async (parameters) => {
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
 * Delete admin
 * @param {string} user user id
 * @returns {object} admin data
 */
exports.deleteAdmin = async (parameters) => {
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
 * Get admin
 * @param {string} user user id
 * @returns {object} admin data
 */
exports.getAdmin = async (parameters) => {
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
 * Get admins
 * @param {string} q search keyword
 * @param {number} limit admins limit
 * @param {number} page admins page number
 * @returns {object} admin data
 */
exports.getAdmins = async (parameters) => {
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
 * Clean DB
 * @returns {object} success status
 */
exports.cleanDB = async () => {
  return {
    success: true,
    message: "Operation completed successfully!",
  };
};
