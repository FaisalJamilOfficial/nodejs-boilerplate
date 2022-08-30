const { isValidObjectId } = require("mongoose");
const { usersModel, managersModel } = require("../models");

/**
 * Add manager
 * @param {string} user user id
 * @returns {object} manager data
 */
exports.addManager = async (parameters) => {
	const { user } = parameters;
	const managerObj = {};

	if (user);
	else throw new Error("Please enter user id!");
	if (isValidObjectId(user));
	else throw new Error("Please enter valid user id!");
	if (await usersModel.exists({ _id: user })) managerObj.user = user;
	else throw new Error("user not found!");

	const manager = await managersModel.create(managerObj);
	return { success: true, manager };
};

/**
 * Update manager data
 * @param {string} manager manager id
 * @returns {object} manager data
 */
exports.updateManager = async (parameters) => {
	const { manager } = parameters;
	const managerObj = {};
	if (manager);
	else throw new Error("Please enter manager id!");
	if (isValidObjectId(manager));
	else throw new Error("Please enter valid manager id!");

	return {
		success: true,
		manager: await managersModel.findByIdAndUpdate(
			{ _id: manager },
			managerObj,
			{
				new: true,
			}
		),
	};
};

/**
 * Delete manager
 * @param {string} manager manager id
 * @returns {object} manager data
 */
exports.deleteManager = async (parameters) => {
	const { manager } = parameters;
	if (manager) {
	} else throw new Error("Please enter manager id!");
	const managerExists = await managersModel.findByIdAndDelete(manager);
	if (managerExists);
	else throw new Error("Please enter valid manager id!");
	return {
		success: true,
		manager: managerExists,
	};
};

/**
 * Get manager
 * @param {string} manager manager id
 * @returns {object} manager data
 */
exports.getManager = async (parameters) => {
	const { manager } = parameters;
	if (manager) {
	} else throw new Error("Please enter manager id!");
	let managerExists = await managersModel.findById(manager);
	if (managerExists);
	else throw new Error("Please enter valid manager id!");
	return {
		success: true,
		manager: managerExists,
	};
};

/**
 * Get managers
 * @param {string} q search keyword
 * @param {number} limit managers limit
 * @param {number} page managers page number
 * @returns {object} manager data
 */
exports.getManagers = async (parameters) => {
	const { q, limit, page } = parameters;
	if (!limit) limit = 10;
	if (!page) page = 0;
	if (page) page = page - 1;
	const query = {};
	if (q) query.q = q;
	const managers = await managersModel
		.find(query)
		.sort({ createdAt: -1 })
		.skip(page * limit)
		.limit(limit);
	const totalCount = await managersModel.find(query).count();
	const totalPages = Math.ceil(totalCount / limit);
	return { success: true, totalCount, totalPages, managers };
};
