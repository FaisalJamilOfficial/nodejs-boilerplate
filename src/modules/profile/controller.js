// module imports

// file imports
import ElementModel from "./model.js";
import { ErrorHandler } from "../../middlewares/error-handler.js";

/**
 * @description Add element
 * @param {Object} elementObj element data
 * @returns {Object} element data
 */
export const addElement = async (elementObj) => {
  return await ElementModel.create(elementObj);
};

/**
 * @description Check element existence
 * @param {Object} query element data
 * @returns {Boolean} element existence status
 */
export const checkElementExistence = async (query) => {
  if (!query || Object.keys(query).length === 0)
    throw new ErrorHandler("Please enter query!", 400);
  return await ElementModel.exists(query);
};
