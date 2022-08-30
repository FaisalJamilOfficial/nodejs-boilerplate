const { isValidObjectId } = require("mongoose");
const { usersModel, tenantsModel } = require("../models");

/**
 * Add tenant
 * @param {string} user user id
 * @returns {object} tenant data
 */
exports.addTenant = async (parameters) => {
	const { user } = parameters;
	const tenantObj = {};

	if (user);
	else throw new Error("Please enter user id!");
	if (isValidObjectId(user));
	else throw new Error("Please enter valid user id!");
	if (await usersModel.exists({ _id: user })) tenantObj.user = user;
	else throw new Error("user not found!");

	const tenant = await tenantsModel.create(tenantObj);
	return { success: true, tenant };
};

/**
 * Update tenant data
 * @param {string} tenant tenant id
 * @returns {object} tenant data
 */
exports.updateTenant = async (parameters) => {
	const { tenant } = parameters;
	const tenantObj = {};
	if (tenant);
	else throw new Error("Please enter tenant id!");
	if (isValidObjectId(tenant));
	else throw new Error("Please enter valid tenant id!");

	return {
		success: true,
		tenant: await tenantsModel.findByIdAndUpdate({ _id: tenant }, tenantObj, {
			new: true,
		}),
	};
};

/**
 * Delete tenant
 * @param {string} tenant tenant id
 * @returns {object} tenant data
 */
exports.deleteTenant = async (parameters) => {
	const { tenant } = parameters;
	if (tenant) {
	} else throw new Error("Please enter tenant id!");
	const tenantExists = await tenantsModel.findByIdAndDelete(tenant);
	if (tenantExists);
	else throw new Error("Please enter valid tenant id!");
	return {
		success: true,
		tenant: tenantExists,
	};
};

/**
 * Get tenant
 * @param {string} tenant tenant id
 * @returns {object} tenant data
 */
exports.getTenant = async (parameters) => {
	const { tenant } = parameters;
	if (tenant) {
	} else throw new Error("Please enter tenant id!");
	let tenantExists = await tenantsModel.findById(tenant);
	if (tenantExists);
	else throw new Error("Please enter valid tenant id!");
	return {
		success: true,
		tenant: tenantExists,
	};
};

/**
 * Get tenants
 * @param {string} q search keyword
 * @param {number} limit tenants limit
 * @param {number} page tenants page number
 * @returns {object} tenant data
 */
exports.getTenants = async (parameters) => {
	const { q, limit, page } = parameters;
	if (!limit) limit = 10;
	if (!page) page = 0;
	if (page) page = page - 1;
	const query = {};
	if (q) query.q = q;
	const tenants = await tenantsModel
		.find(query)
		.sort({ createdAt: -1 })
		.skip(page * limit)
		.limit(limit);
	const totalCount = await tenantsModel.find(query).count();
	const totalPages = Math.ceil(totalCount / limit);
	return { success: true, totalCount, totalPages, tenants };
};
