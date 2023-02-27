// file imports
import * as models from "../models/index.js";
import * as usersController from "./users.js";
import * as customersController from "./customers.js";
import * as adminsController from "./admins.js";
import NodeMailer from "../utils/node-mailer.js";
import { USER_TYPES, USER_STATUSES } from "../configs/enums.js";

// destructuring assignments
const { usersModel, userTokensModel } = models;
const { CUSTOMER, ADMIN } = USER_TYPES;
const { ACTIVE } = USER_STATUSES;
const {
  sendEmail,
  getEmailVerificationEmailTemplate,
  getResetPasswordEmailTemplate,
  getWelcomeUserEmailTemplate,
} = new NodeMailer();

/**
 * @description Register user
 * @param {String} email user email address
 * @param {String} password user password
 * @param {String} phone user phone number
 * @param {String} type user type
 * @returns {Object} user data with token
 */
export const register = async (params) => {
  let user;
  const { type } = params;
  const userResponse = await usersController.addUser({ ...params });
  if (userResponse?.success) user = userResponse?.data;
  else throw new Error("User creation failed!");

  const profileObj = { user: user._id };
  let profileResponse;
  const userObj = {};
  userObj.user = user._id;
  userObj.type = type;

  if (type === CUSTOMER) {
    profileResponse = await customersController.addCustomer(profileObj);
    userObj.customer = profileResponse?.data._id;
  } else if (type === ADMIN) {
    profileResponse = await adminsController.addAdmin(profileObj);
    userObj.admin = profileResponse?.data._id;
  }
  if (profileResponse?.success) await usersController.updateUser(userObj);
  else throw new Error("User profile creation failed!");

  const token = user.getSignedjwtToken();
  return {
    success: true,
    token,
  };
};

/**
 * @description Login user
 * @param {String} email user email address
 * @param {String} password user password
 * @param {String} type user type
 * @returns {Object} user data with token
 */
export const login = async (params) => {
  const { email, password, type } = params;

  const query = {};

  if (email && password) query.email = email;
  else throw new Error("Please enter login credentials!|||400");

  const userExists = await usersModel.findOne(query).populate();
  if (userExists);
  else throw new Error("User not registered!|||404");

  if (userExists.type === type);
  else throw new Error("Invalid type login credentials!|||401");

  if (await userExists.validatePassword(password));
  else throw new Error("Invalid password!|||401");

  if (userExists.status === ACTIVE);
  else throw new Error(`User ${userExists.status}!|||403`);

  await usersModel.updateOne(
    { _id: userExists._id },
    { lastLogin: new Date() }
  );

  const token = userExists.getSignedjwtToken();
  return {
    success: true,
    token,
  };
};

/**
 * @description Send reset password email
 * @param {String} email user email address
 * @returns {Object} user password reset result
 */
export const emailResetPassword = async (params) => {
  const { email } = params;
  const tokenExpirationTime = new Date();
  tokenExpirationTime.setMinutes(tokenExpirationTime.getMinutes() + 10);
  const emailTokenResponse = await this.generateEmailToken({
    email,
    tokenExpirationTime,
  });
  const { user, token } = emailTokenResponse?.data;
  const args = {};
  args.to = email;
  args.subject = "Password reset";
  args.text = getResetPasswordEmailTemplate({ user, token });
  await sendEmail(args);
  return {
    success: true,
    message: "Password reset link sent to your email address!",
  };
};

/**
 * @description Send email verification email
 * @param {String} email user email address
 * @returns {Object} user email verification result
 */
export const emailVerifyEmail = async (params) => {
  const { email } = params;
  const tokenExpirationTime = new Date();
  tokenExpirationTime.setMinutes(tokenExpirationTime.getMinutes() + 10);
  const emailTokenResponse = await this.generateEmailToken({
    email,
    tokenExpirationTime,
  });
  const { user, token } = emailTokenResponse?.data;
  const args = {};
  args.to = email;
  args.subject = "Email verification";
  args.text = getEmailVerificationEmailTemplate({ user, token });
  await new NodeMailer().sendEmail(args);

  return {
    success: true,
    message: "Email verification link sent to your email address!",
  };
};

/**
 * @description Send welcome email
 * @param {String} email user email address
 * @param {String} name user name
 * @returns {Object} user welcome result
 */
export const emailWelcomeUser = async (params) => {
  const { email, name } = params;
  const args = {};
  args.to = email;
  args.subject = "Greetings";
  args.text = getWelcomeUserEmailTemplate({ name });
  await new NodeMailer().sendEmail(args);
  return {
    success: true,
    message: "Welcome email to your email address!",
  };
};

/**
 * @description Generate user email token
 * @param {String} email user email address
 * @param {Date} tokenExpirationTime email token expiration time
 * @returns {Object} user email token
 */
export const generateEmailToken = async (params) => {
  const { email, tokenExpirationTime } = params;
  const userExists = await usersModel.findOne({ email });
  if (userExists);
  else throw new Error("User with given email doesn't exist!|||404");
  let userTokenExists = await userTokensModel.findOne({
    user: userExists._id,
  });
  if (userTokenExists);
  else {
    const userTokenObj = {};
    userTokenObj.user = userExists._id;
    userTokenObj.token = userExists.getSignedjwtToken();
    userTokenObj.expireAt = tokenExpirationTime;
    const UserTokensModel = userTokensModel;
    userTokenExists = await new UserTokensModel(userTokenObj).save();
  }
  return {
    success: true,
    data: userTokenExists,
  };
};

/**
 * @description Reset user password
 * @param {String} user user id
 * @param {String} password user password
 * @param {String} token reset password token
 * @returns {Object} user password reset result
 */
export const resetPassword = async (params) => {
  const { password, user, token } = params;

  const userExists = await usersModel.findById(user);
  if (userExists);
  else throw new Error("Invalid link!|||400");

  const userTokenExists = await userTokensModel.findOne({
    user,
    token,
  });
  if (userTokenExists);
  else throw new Error("Invalid or expired link!|||400");

  await userExists.setPassword(password);
  await userTokenExists.delete();

  return { success: true, message: "Password reset successfully!" };
};

/**
 * @description Email user email
 * @param {String} user user id
 * @param {String} token user email token
 * @returns {Object} user email verification result
 */
export const verifyUserEmail = async (params) => {
  const { user, token } = params;

  const userExists = await usersModel.findById(user);
  if (userExists);
  else throw new Error("Invalid link!|||400");

  const userTokenExists = await userTokensModel.findOne({
    user,
    token,
  });
  if (userTokenExists);
  else throw new Error("Invalid or expired link!|||400");

  userExists.isEmailVerified = true;
  await userExists.save();
  await userTokenExists.delete();

  return { success: true, message: "Email verified successfully!" };
};

/**
 * @description register super admin
 * @param {String} email user email address
 * @param {String} password user password
 * @param {String} type user type
 * @returns {Object} user data with token
 */
export const addAdmin = async (params) => {
  const { email, password, type } = params;

  const userObj = {};
  if (email) userObj.email = email;
  if (password) userObj.password = password;
  if (type) userObj.type = type;
  const userResponse = await usersController.addUser(userObj);
  const user = userResponse?.data;
  const token = user.getSignedjwtToken();
  return {
    success: true,
    // data: user,
    token,
  };
};
