// file imports
import NodeMailer from "../../utils/node-mailer.js";
import * as userController from "../user/controller.js";
import * as userTokenController from "../user-token/controller.js";
import * as profileController from "../profile/controller.js";
import { USER_TYPES, USER_STATUSES } from "../../configs/enum.js";
import { ErrorHandler } from "../../middlewares/error-handler.js";

// destructuring assignments
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
 * @param {Object} params user registration data
 * @returns {String} user token
 */
export const register = async (params) => {
  const { type } = params;
  const user = await userController.addUser(params);

  const profileObj = { user: user._id };
  const userObj = {};
  userObj.type = type;

  if (type === CUSTOMER)
    userObj.profile = (await profileController.addProfile(profileObj))._id;
  else if (type === ADMIN) userObj.isAdmin = true;

  await userController.updateUserById(user._id, userObj);

  return user.getSignedjwtToken();
};

/**
 * @description Login user
 * @param {Object} params user login data
 * @returns {Object} user token
 */
export const login = async (params) => {
  const { email, password, type } = params;

  const query = {};

  if (email && password) query.email = email;
  else throw new ErrorHandler("Please enter login credentials!", 400);

  const userExists = await userController.getUser(query);
  if (!userExists) throw new ErrorHandler("User not registered!", 404);

  if (userExists.type !== type) throw new ErrorHandler("User not found!", 404);

  if (!(await userExists.validatePassword(password)))
    throw new ErrorHandler("Invalid password!", 401);

  if (userExists.status !== ACTIVE)
    throw new ErrorHandler(`User ${userExists.status}!`, 403);

  await userController.updateUser(
    { _id: userExists._id },
    { lastLogin: new Date() }
  );

  return userExists.getSignedjwtToken();
};

/**
 * @description Send reset password email
 * @param {Object} params user email data
 * @returns {Object} user password reset data
 */
export const emailResetPassword = async (params) => {
  const { email } = params;
  const tokenExpirationTime = new Date();
  tokenExpirationTime.setMinutes(tokenExpirationTime.getMinutes() + 10);
  const { user, token } = await generateEmailToken({
    email,
    tokenExpirationTime,
  });
  const args = {};
  args.to = email;
  args.subject = "Password reset";
  args.text = getResetPasswordEmailTemplate({ user, token });
  return await sendEmail(args);
};

/**
 * @description Send email verification email
 * @param {Object} params user email data
 * @returns {Object} user email verification data
 */
export const emailVerifyEmail = async (params) => {
  const { email } = params;
  const tokenExpirationTime = new Date();
  tokenExpirationTime.setMinutes(tokenExpirationTime.getMinutes() + 10);
  const { user, token } = await generateEmailToken({
    email,
    tokenExpirationTime,
  });
  const args = {};
  args.to = email;
  args.subject = "Email verification";
  args.text = getEmailVerificationEmailTemplate({ user, token });
  return await new NodeMailer().sendEmail(args);
};

/**
 * @description Send welcome email
 * @param {Object} params user email data
 * @returns {Object} user welcome data
 */
export const emailWelcomeUser = async (params) => {
  const { email, name } = params;
  const args = {};
  args.to = email;
  args.subject = "Greetings";
  args.text = getWelcomeUserEmailTemplate({ name });
  return await new NodeMailer().sendEmail(args);
};

/**
 * @description Generate user email token
 * @param {Object} params user token generation data
 * @returns {Object} user token data
 */
export const generateEmailToken = async (params) => {
  const { email, tokenExpirationTime } = params;
  const userExists = await userController.getUser({ email });
  if (!userExists)
    throw new ErrorHandler("User with given email doesn't exist!", 404);
  let userTokenExists = await userTokenController.getUserToken({
    user: userExists._id,
  });
  if (!userTokenExists) {
    const userTokenObj = {};
    userTokenObj.user = userExists._id;
    userTokenObj.token = userExists.getSignedjwtToken();
    userTokenObj.expireAt = tokenExpirationTime;

    userTokenExists = await userTokenController.addUserToken(userTokenObj);
  }
  return userTokenExists;
};

/**
 * @description Reset user password
 * @param {Object} params user password reset data
 */
export const resetPassword = async (params) => {
  const { password, user, token } = params;

  const userExists = await userController.getUserById(user);
  if (!userExists) throw new ErrorHandler("Invalid link!", 400);

  const userTokenExists = await userTokenController.getUserToken({
    user,
    token,
  });
  if (!userTokenExists) throw new ErrorHandler("Invalid or expired link!", 400);

  await userExists.setPassword(password);
  await userTokenExists.deleteOne();
};

/**
 * @description Email user email
 * @param {Object} params user email verification data
 */
export const verifyUserEmail = async (params) => {
  const { user, token } = params;

  const userExists = await userController.getUserById(user);
  if (!userExists) throw new ErrorHandler("Invalid link!", 400);

  const userTokenExists = await userTokenController.getUserToken({
    user,
    token,
  });
  if (!userTokenExists) throw new ErrorHandler("Invalid or expired link!", 400);

  userExists.isEmailVerified = true;
  await userExists.save();
  await userTokenExists.deleteOne();
};
