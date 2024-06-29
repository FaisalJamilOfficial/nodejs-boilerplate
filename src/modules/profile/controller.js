// module imports

// file imports
import ProfileModel from "./model.js";
import { ErrorHandler } from "../../middlewares/error-handler.js";

/**
 * @description Add profile
 * @param {Object} profileObj profile data
 * @returns {Object} profile data
 */
export const addProfile = async (profileObj) => {
  return await ProfileModel.create(profileObj);
};

/**
 * @description Check profile existence
 * @param {Object} query profile data
 * @returns {Boolean} profile existence status
 */
export const checkProfileExistence = async (query) => {
  if (!query || Object.keys(query).length === 0)
    throw new ErrorHandler("Please enter query!", 400);
  return await ProfileModel.exists(query);
};
