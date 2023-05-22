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
export const addAdmin = async (params) => {
  const { user } = params;
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
export const updateAdmin = async (params) => {
  const { user } = params;
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
export const deleteAdmin = async (params) => {
  const { user } = params;
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
export const getAdmin = async (params) => {
  const { user } = params;
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
 * @param {Number} limit admins limit
 * @param {Number} page admins page number
 * @returns {Object} admin data
 */
export const getAdmins = async (params) => {
  let { limit, page } = params;
  if (!limit) limit = 10;
  if (!page) page = 0;
  if (page) page = page - 1;
  const query = {};
  const admins = await adminsModel.aggregate([
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
    ...admins[0],
  };
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
