// module imports
import jwt from "jsonwebtoken";

// file imports
import UserModel from "../modules/user/model.js";

import { exceptionHandler } from "./exception-handler.js";
import { ErrorHandler } from "./error-handler.js";
import { USER_STATUSES, USER_TYPES } from "../configs/enum.js";

// destructuring assignments
const { JWT_SECRET, API_KEY } = process.env;
const { ACTIVE, DELETED } = USER_STATUSES;
const { CUSTOMER, ADMIN, SUPER_ADMIN } = USER_TYPES;

/**
 * @description Get JWT token
 * @param {String} _id user id
 * @param {String} phone user phone number
 * @param {String} otp OTP code
 * @param {String} shouldValidateOTP OTP validation check
 * @param {string | boolean } variable any variable
 * @returns {Object} JWT token
 */
export const getToken = function (params) {
  return jwt.sign(params, JWT_SECRET || "");
};

export const verifyToken = async (
  req,
  _res,
  next,
  shouldReturnUserOnFailure = false
) => {
  try {
    const token =
      (req.headers.authorization &&
        req.headers.authorization.split("Bearer")[1]) ||
      (req.signedCookies && req.signedCookies.jwt) ||
      (req.cookies && req.cookies.jwt);
    if (token) {
      const verificationObject = jwt.verify(token.trim(), JWT_SECRET || "");

      if (verificationObject.shouldValidateOTP) {
        req.user = verificationObject;
        return next();
      }
      const user = await UserModel.findOne({
        _id: verificationObject._id,
      }).select("-createdAt -updatedAt -__v -fcms");
      if (user) {
        if (user.status === DELETED)
          next(new ErrorHandler("User account deleted!", 403));
        req.user = user;
        return next();
      }
    }
    if (shouldReturnUserOnFailure) {
      req.user = null;
      return next();
    }
    next(new ErrorHandler("Invalid token!", 403));
  } catch (error) {
    if (shouldReturnUserOnFailure) {
      req.user = null;
      return next();
    }
    return next(new ErrorHandler("Unauthorized!", 401));
  }
};

export const verifyOTP = exceptionHandler(async (req, res, next) => {
  const { otp } = req.user;
  const { code } = req.body;
  const query = {};
  if (req.user?._id) query._id = req.user._id;
  else if (req.user?.phone) query.phone = req.user.phone;
  else query._id = null;
  const userExists = await UserModel.findOne(query).select("+otp");

  if (userExists && code === userExists?.otp) next();
  else if (code === otp) next();
  else return next(new ErrorHandler("Invalid Code!", 400));
});

export const verifyAdmin = (req, res, next) => {
  if (
    (req.user?.type === ADMIN || req.user?.type === SUPER_ADMIN) &&
    req.user?.status === ACTIVE
  )
    next();
  else next(new ErrorHandler("Unauthorized as admin!", 403));
};

export const verifySuperAdmin = (req, res, next) => {
  if (req.user?.type === SUPER_ADMIN && req.user?.status === ACTIVE) next();
  else next(new ErrorHandler("Unauthorized as super-admin!", 403));
};

export const verifyCustomer = (req, res, next) => {
  if (req.user?.type === CUSTOMER && req.user?.status === ACTIVE) next();
  else next(new ErrorHandler("Unauthorized as customer!", 403));
};

export const verifyUser = (req, res, next) => {
  if (req.user && req.user?.status === ACTIVE) next();
  else next(new ErrorHandler("Unauthorized as user!", 403));
};

export const verifyUserToken = (req, res, next) => {
  if (req.user?._id) next();
  else next(new ErrorHandler("Invalid user token!", 400));
};

export const checkUserPhoneExists = exceptionHandler(async (req, res, next) => {
  const userExists = await UserModel.exists({ phone: req.body.phone });
  if (userExists) next();
  else next(new ErrorHandler("User not found!", 404));
});

export const verifyKey = (req, res, next) => {
  const { api_key } = req.headers;
  if (api_key === API_KEY) next();
  else throw new ErrorHandler("Invalid API key!", 400);
};
