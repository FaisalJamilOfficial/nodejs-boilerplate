const { isValidObjectId } = require("mongoose");
const { usersModel, passwordTokensModel } = require("../models");
const usersController = require("../controllers/users");
const tenantsController = require("../controllers/tenants");
const managersController = require("../controllers/managers");
const adminsController = require("../controllers/admins");
const NodeMailer = require("../utils/NodeMailer");
const { USER_TYPES, USER_STATUSES } = require("../configs/enums");
const { TENANT, MANAGER, ADMIN, SUPER_ADMIN } = USER_TYPES;
const { ACTIVE } = USER_STATUSES;

/**
 * Signup user
 * @param {string} email user email address
 * @param {string} password user password
 * @param {string} phone user phone number
 * @param {string} type user type
 * @returns {object} user data with token
 */
exports.signup = async (parameters) => {
	try {
		var user;
		var profile;
		const { type } = parameters;
		const userResponse = await usersController.addUser({ ...parameters });
		if (userResponse?.success) user = userResponse?.user;
		else throw new Error("User creation failed!");

		const profileObj = { user: user._id };
		let profileResponse;
		const userObj = {};
		userObj.user = user._id;

		if (type === TENANT) {
			profileResponse = await tenantsController.addTenant(profileObj);
			userObj.type = TENANT;
			userObj.tenant = profileResponse?.tenant._id;
			profile = profileResponse?.tenant;
		} else if (type === MANAGER) {
			profileResponse = await managersController.addManager(profileObj);
			userObj.type = MANAGER;
			userObj.manager = profileResponse?.manager._id;
			profile = profileResponse?.manager;
		} else if (type === ADMIN) {
			profileResponse = await adminsController.addAdmin(profileObj);
			userObj.type = ADMIN;
			userObj.admin = profileResponse?.admin._id;
			profile = profileResponse?.admin;
		}
		if (profileResponse?.success) await usersController.updateUser(userObj);
		else throw new Error("Profile creation failed!");

		const token = user.getSignedjwtToken();
		return {
			success: true,
			user: await usersModel.findById(user._id).populate(user.type),
			token,
		};
	} catch (error) {
		if (user) await user.remove();
		if (profile) await profile.remove();
		throw error;
	}
};

/**
 * Login user
 * @param {string} email user email address
 * @param {string} password user password
 * @param {string} type user type
 * @returns {object} user data with token
 */
exports.login = async (parameters) => {
	const { email, password, type } = parameters;

	const query = {};

	if (email && password) query.email = email;
	else throw new Error("Please enter login credentials!");

	const userExists = await usersModel.findOne(query).populate();
	if (userExists);
	else throw new Error("User not registered!");

	if (userExists.type === type);
	else throw new Error("Invalid type login credentials!");

	if (await userExists.validatePassword(password));
	else throw new Error("Invalid login credentials!");

	if (userExists.status === ACTIVE);
	else throw new Error(`User ${userExists.status}!`);

	const token = userExists.getSignedjwtToken();
	return {
		success: true,
		user: userExists,
		token,
	};
};

/**
 * Send reset password email
 * @param {string} email user email address
 * @returns {object} user password reset result
 */
exports.emailResetPassword = async (parameters) => {
	const { email } = parameters;
	const userExists = await usersModel.findOne({ email });
	if (userExists);
	else throw new Error("User with given email doesn't exist!");

	let passwordTokenExists = await passwordTokensModel.findOne({
		user: userExists._id,
	});
	if (passwordTokenExists);
	else {
		const passwordTokenObj = {};
		passwordTokenObj.user = userExists._id;
		passwordTokenObj.token = userExists.getSignedjwtToken();
		passwordTokenExists = await new passwordTokensModel(
			passwordTokenObj
		).save();
	}

	const link = `${process.env.BASE_URL}forgot-password/reset?user=${userExists._id}&token=${passwordTokenExists.token}`;
	const body = `
To reset your password, click on this link 
${link}
Link will expire in 10 minutes.

If you didn't do this, click here backendboilerplate@gmail.com`;
	const arguments = {};
	arguments.to = userExists.email;
	arguments.subject = "Password reset";
	arguments.body = body;
	await new NodeMailer().sendEmail(arguments);

	return {
		success: true,
		message: "Password reset link sent to your email address!",
	};
};

/**
 * Reset user password
 * @param {string} user user id
 * @param {string} password user password
 * @param {string} token reset password token
 * @returns {object} user password reset result
 */
exports.resetPassword = async (parameters) => {
	const { password, user, token } = parameters;

	const userExists = await usersModel.findById(user);
	if (userExists);
	else throw new Error("Invalid link!");

	const passwordTokenExists = await passwordTokensModel.findOne({
		user,
		token,
	});
	if (passwordTokenExists);
	else throw new Error("Invalid or expired link !");

	await userExists.setPassword(password);
	await passwordTokenExists.delete();

	return { success: true, message: "Password reset sucessfully!" };
};

exports.getUserByPhone = async (parameters) => {
	const { phone } = parameters;
	const userExists = await usersModel.findOne({ phone });
	if (userExists);
	else throw new Error("User does not exist!");
	return { success: true, user: userExists };
};
/**
 * Signup user
 * @param {string} email user email address
 * @param {string} password user password
 * @param {string} type user type
 * @returns {object} user data with token
 */
exports.addSuperAdmin = async (parameters) => {
	const { email, password, SECRET } = parameters;
	if (
		SECRET === "K#=d9V|}P:;UD}H1y<s..7*0~yh&e(Gj+8w63RUlz2|NMy$2wLb/<tOJ]|oHcp$"
	);
	else throw new Error(`Invalid SECRET!`);
	const userObj = {};
	userObj.type = SUPER_ADMIN;
	if (email) userObj.email = email;
	else userObj.email = "super_admin@gmail.com";
	if (password) userObj.password = password;
	else userObj.password = "abc.123!";
	const userResponse = await usersController.addUser(userObj);
	const user = userResponse?.user;
	const token = user.getSignedjwtToken();
	return {
		success: true,
		user,
		token,
	};
};
