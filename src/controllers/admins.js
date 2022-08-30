const { isValidObjectId } = require("mongoose");
const { usersModel, adminsModel } = require("../models");

/**
 * Add admin
 * @param {string} user user id
 * @returns {object} admin data
 */
exports.addAdmin = async (parameters) => {
	const { user } = parameters;
	const adminObj = {};

	if (user);
	else throw new Error("Please enter user id!");
	if (isValidObjectId(user));
	else throw new Error("Please enter valid user id!");
	if (await usersModel.exists({ _id: user })) adminObj.user = user;
	else throw new Error("user not found!");

	const admin = await adminsModel.create(adminObj);
	return { success: true, admin };
};

/**
 * Update admin data
 * @param {string} admin admin id
 * @returns {object} admin data
 */
exports.updateAdmin = async (parameters) => {
	const { admin } = parameters;
	const adminObj = {};
	if (admin);
	else throw new Error("Please enter admin id!");
	if (isValidObjectId(admin));
	else throw new Error("Please enter valid admin id!");

	return {
		success: true,
		admin: await adminsModel.findByIdAndUpdate({ _id: admin }, adminObj, {
			new: true,
		}),
	};
};

/**
 * Delete admin
 * @param {string} admin admin id
 * @returns {object} admin data
 */
exports.deleteAdmin = async (parameters) => {
	const { admin } = parameters;
	if (admin) {
	} else throw new Error("Please enter admin id!");
	const adminExists = await adminsModel.findByIdAndDelete(admin);
	if (adminExists);
	else throw new Error("Please enter valid admin id!");
	return {
		success: true,
		admin: adminExists,
	};
};

/**
 * Get admin
 * @param {string} admin admin id
 * @returns {object} admin data
 */
exports.getAdmin = async (parameters) => {
	const { admin } = parameters;
	if (admin) {
	} else throw new Error("Please enter admin id!");
	let adminExists = await adminsModel.findById(admin);
	if (adminExists);
	else throw new Error("Please enter valid admin id!");
	return {
		success: true,
		admin: adminExists,
	};
};

/**
 * Get admins
 * @param {string} q search keyword
 * @param {number} limit admins limit
 * @param {number} page admins page number
 * @returns {object} admin data
 */
exports.getAdmins = async (parameters) => {
	const { q, limit, page } = parameters;
	if (!limit) limit = 10;
	if (!page) page = 0;
	if (page) page = page - 1;
	const query = {};
	if (q) query.q = q;
	const admins = await adminsModel
		.find(query)
		.sort({ createdAt: -1 })
		.skip(page * limit)
		.limit(limit);
	const totalCount = await adminsModel.find(query).count();
	const totalPages = Math.ceil(totalCount / limit);
	return { success: true, totalCount, totalPages, admins };
};
