const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;

const { asyncHandler } = require("./asyncHandler");
const { usersModel } = require("../models");

const { USER_STATUSES, USER_TYPES } = require("../configs/enums");
const { ACTIVE, DELETED } = USER_STATUSES;
const { CUSTOMER, ADMIN, SUPER_ADMIN } = USER_TYPES;

/**
 * Get JWT token
 * @param {string} _id user id
 * @param {string} phone user phone number
 * @param {string} otp OTP code
 * @param {string} shouldValidateOTP OTP validation check
 * @param {string | boolean } variable any variable
 * @returns {object} JWT token
 */
exports.getToken = function (params) {
  return jwt.sign(params, process.env.JWT_SECRET);
};

exports.verifyToken = async (
  req,
  res,
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
      const verificationObject = jwt.verify(token.trim(), JWT_SECRET);

      if (verificationObject.shouldValidateOTP) {
        req.user = verificationObject;
        return next();
      }
      const user = await usersModel
        .findOne({ _id: verificationObject._id })
        .select("-createdAt -updatedAt -__v");
      if (user) {
        if (user.status === DELETED)
          next(new Error("User account deleted!|||403"));
        req.user = user;
        return next();
      }
    }
    if (shouldReturnUserOnFailure) {
      req.user = null;
      return next();
    }
    next(new Error("Invalid token!|||403"));
  } catch (error) {
    if (shouldReturnUserOnFailure) {
      req.user = null;
      return next();
    }
    return next(new Error("Unauthorized!|||401"));
  }
};

exports.verifyOTP = async (req, res, next) => {
  try {
    const { otp } = req?.user;
    const { code } = req.body;
    if (Number(code) === Number(otp)) next();
    else return next(new Error("Invalid Code!|||400"));
  } catch (error) {
    return next(error);
  }
};

exports.verifyAdmin = (req, res, next) => {
  if (
    (req?.user?.type === ADMIN || req?.user?.type === SUPER_ADMIN) &&
    req?.user?.status === ACTIVE
  )
    next();
  else return next(new Error("Unauthorized as admin!|||403"));
};

exports.verifySuperAdmin = (req, res, next) => {
  if (req?.user?.type === SUPER_ADMIN && req?.user?.status === ACTIVE) next();
  else return next(new Error("Unauthorized as super-admin!|||403"));
};

exports.verifyCustomer = (req, res, next) => {
  if (req?.user?.type === CUSTOMER && req?.user?.status === ACTIVE) next();
  else return next(new Error("Unauthorized as customer!|||403"));
};

exports.verifyUser = (req, res, next) => {
  if (req?.user && req?.user?.status === ACTIVE) next();
  else return next(new Error("Unauthorized as user!|||403"));
};

exports.verifyUserToken = async (req, res, next) => {
  if (req?.user?._id) next();
  else return next(new Error("Invalid user token!|||400"));
};

exports.checkUserPhoneExists = asyncHandler(async (req, res, next) => {
  const userExists = await usersModel.exists({ phone: req.body.phone });
  if (userExists) next();
  else next(new Error("User not found!|||404"));
});
