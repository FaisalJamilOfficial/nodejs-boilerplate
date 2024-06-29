// file imports
import UserTokenModel from "./model.js";
import { ErrorHandler } from "../../middlewares/error-handler.js";

/**
 * @description Add userToken
 * @param {Object} userTokenObj userToken data
 * @returns {Object} userToken data
 */
export const addUserToken = async (userTokenObj) => {
  return await UserTokenModel.create(userTokenObj);
};

/**
 * @description Get userToken
 * @param {Object} query userToken data
 * @returns {Object} userToken data
 */
export const getUserToken = async (query) => {
  if (!query || Object.keys(query).length === 0)
    throw new ErrorHandler("Please enter query!", 400);
  const userTokenExists = await UserTokenModel.findOne(query).select(
    "-createdAt -updatedAt -__v"
  );
  // if (!userTokenExists) throw new ErrorHandler("userToken not found!", 404);
  return userTokenExists;
};
