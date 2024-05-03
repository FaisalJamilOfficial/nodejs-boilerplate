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
 * @description Get element
 * @param {Object} query element data
 * @returns {Object} element data
 */
export const getElement = async (query) => {
  if (!query || Object.keys(query).length === 0)
    throw new ErrorHandler("Please enter query!", 400);
  const elementExists = await ElementModel.findOne(query).select(
    "-createdAt -updatedAt -__v"
  );
  // if (!elementExists) throw new ErrorHandler("element not found!", 404);
  return elementExists;
};
