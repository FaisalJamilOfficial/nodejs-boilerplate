const { isValidObjectId } = require("mongoose");
const { usersModel, customersModel } = require("../models");

/**
 * Add customer
 * @param {string} user user id
 * @returns {object} customer data
 */
exports.addCustomer = async (parameters) => {
	const { user } = parameters;
	const customerObj = {};

	if (user);
	else throw new Error("Please enter user id!");
	if (isValidObjectId(user));
	else throw new Error("Please enter valid user id!");
	if (await usersModel.exists({ _id: user })) customerObj.user = user;
	else throw new Error("user not found!");

	const customer = await customersModel.create(customerObj);
	return { success: true, customer };
};

/**
 * Update customer data
 * @param {string} user user id
 * @returns {object} customer data
 */
exports.updateCustomer = async (parameters) => {
	const { user } = parameters;
	const customerObj = {};
	if (user);
	else throw new Error("Please enter user id!");
	if (isValidObjectId(user));
	else throw new Error("Please enter valid user id!");

	return {
		success: true,
		customer: await customersModel.findOneAndUpdate({ user }, customerObj, {
			new: true,
		}),
	};
};

/**
 * Delete customer
 * @param {string} customer customer id
 * @returns {object} customer data
 */
exports.deleteCustomer = async (parameters) => {
	const { customer } = parameters;
	if (customer) {
	} else throw new Error("Please enter customer id!");
	const customerExists = await customersModel.findByIdAndDelete(customer);
	if (customerExists);
	else throw new Error("Please enter valid customer id!");
	return {
		success: true,
		customer: customerExists,
	};
};

/**
 * Get customer
 * @param {string} customer customer id
 * @returns {object} customer data
 */
exports.getCustomer = async (parameters) => {
	const { customer } = parameters;
	if (customer) {
	} else throw new Error("Please enter customer id!");
	let customerExists = await customersModel.findById(customer);
	if (customerExists);
	else throw new Error("Please enter valid customer id!");
	return {
		success: true,
		customer: customerExists,
	};
};

/**
 * Get customers
 * @param {string} q search keyword
 * @param {number} limit customers limit
 * @param {number} page customers page number
 * @returns {object} customer data
 */
exports.getCustomers = async (parameters) => {
	const { q } = parameters;
	let { limit, page } = parameters;
	if (!limit) limit = 10;
	if (!page) page = 0;
	if (page) page = page - 1;
	const query = {};
	if (q) query.q = q;
	const customers = await customersModel
		.find(query)
		.sort({ createdAt: -1 })
		.skip(page * limit)
		.limit(limit);
	const totalCount = await customersModel.find(query).count();
	const totalPages = Math.ceil(totalCount / limit);
	return { success: true, totalCount, totalPages, customers };
};
