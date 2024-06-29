// module imports
import { isValidObjectId } from "mongoose";

// file imports
import PaymentAccountModel from "./model.js";
import * as userController from "../user/controller.js";
import { ErrorHandler } from "../../middlewares/error-handler.js";

// destructuring assignments

/**
 * @description Add paymentAccount
 * @param {Object} paymentAccountObj paymentAccount data
 * @returns {Object} paymentAccount data
 */
export const addPaymentAccount = async (paymentAccountObj) => {
  const { user } = paymentAccountObj;

  if (!user) throw new ErrorHandler("Please enter user id!", 400);
  if (!isValidObjectId(user))
    throw new ErrorHandler("Please enter valid user id!", 400);
  if (!(await userController.checkUserExistence({ _id: user })))
    throw new ErrorHandler("user not found!", 404);
  return await PaymentAccountModel.create(paymentAccountObj);
};

/**
 * @description Get paymentAccount
 * @param {Object} params paymentAccount data
 * @returns {Object} paymentAccount data
 */
export const getPaymentAccount = async (params) => {
  const { paymentAccount, user, key, value } = params;
  const query = {};
  if (paymentAccount) query._id = paymentAccount;
  if (user) query.user = user;
  if (key) query[key] = value;
  else query._id = null;
  const paymentAccountExists = await PaymentAccountModel.findOne(query).select(
    "-createdAt -updatedAt -__v"
  );
  // if (paymentAccountExists);
  // else throw new ErrorHandler("PaymentAccount not found!",404);
  return paymentAccountExists;
};
