const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;

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
          return res
            .status(403)
            .json({ success: false, message: "User account deleted!" });
        req.user = user;
        return next();
      }
    }
    if (shouldReturnUserOnFailure) {
      req.user = null;
      return next();
    }
    return res.status(403).json({ success: false, message: "Invalid token!" });
  } catch (error) {
    if (shouldReturnUserOnFailure) {
      req.user = null;
      return next();
    }
    return res.status(403).json({ success: false, message: "Unauthorized!" });
  }
};

exports.verifyOTP = async (req, res, next) => {
  try {
    const { otp } = req?.user;
    const { code } = req.body;
    if (Number(code) === Number(otp)) {
      next();
    } else {
      const error = new Error("Invalid Code!");
      error.status = 400;
      return next(error);
    }
  } catch (error) {
    return next(error);
  }
};

exports.verifyAdmin = (req, res, next) => {
  if (
    (req?.user?.type === ADMIN || req?.user?.type === SUPER_ADMIN) &&
    req?.user?.status === ACTIVE
  ) {
    next();
  } else {
    const error = new Error("You are not authorized as admin!");
    error.status = 403;
    return next(error);
  }
};

exports.verifySuperAdmin = (req, res, next) => {
  if (req?.user?.type === SUPER_ADMIN && req?.user?.status === ACTIVE) {
    next();
  } else {
    const error = new Error("You are not authorized as admin!");
    error.status = 403;
    return next(error);
  }
};

exports.verifyCustomer = (req, res, next) => {
  if (req?.user?.type === CUSTOMER && req?.user?.status === ACTIVE) {
    next();
  } else {
    const error = new Error("You are not authorized as customer!");
    error.status = 403;
    return next(error);
  }
};

exports.verifyUser = (req, res, next) => {
  if (req?.user && req?.user?.status === ACTIVE) {
    next();
  } else {
    const error = new Error("You are not authorized as user!");
    error.status = 403;
    return next(error);
  }
};

exports.verifyUserToken = async (req, res, next) => {
  try {
    if (req?.user?._id) {
      next();
    } else {
      const error = new Error("You are not authorized as existing user!");
      error.status = 403;
      return next(error);
    }
  } catch (error) {
    next(error);
  }
};

exports.checkUserPhoneExists = async (req, res, next) => {
  try {
    const userExists = await usersModel.exists({ phone: req.body.phone });
    if (userExists) {
      next();
    } else next(new Error("User does not exist!"));
  } catch (error) {
    next(error);
  }
};
