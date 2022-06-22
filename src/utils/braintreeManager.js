const { BRAINTREE_MERCHANT_ID, BRAINTREE_PUBLIC_KEY, BRAINTREE_PRIVATE_KEY } =
	process.env;

const braintree = require("braintree");

const { PAYMENT_ACCOUNT_TYPES } = require("../configs/enums");
const { BRAINTREE } = PAYMENT_ACCOUNT_TYPES;

const gateway = new braintree.BraintreeGateway({
	environment: braintree.Environment.Sandbox,
	merchantId: BRAINTREE_MERCHANT_ID,
	publicKey: BRAINTREE_PUBLIC_KEY,
	privateKey: BRAINTREE_PRIVATE_KEY,
});

class BraintreeManager {
	constructor() {
		this.gateway = gateway;
	}

	/**
	 * Generate a client token
	 * @param {string} customerId OPTIONAL braintree customer id
	 * @returns {object} client token
	 */
	async generateClientToken(parameters) {
		const { customerId } = parameters;
		const clientTokenObj = { customerId };
		return await gateway.clientToken.generate(clientTokenObj);
	}

	/**
	 * Create a braintree customer account
	 * @param {string} user user id
	 * @param {string} paymentMethodNonce nonce token
	 * @returns {object} paymentAccount
	 */
	async createCustomer(parameters) {
		const { user, paymentMethodNonce } = parameters;
		const customerObj = {};
		if (paymentMethodNonce) customerObj.paymentMethodNonce = paymentMethodNonce;
		else throw new Error("Please enter paymentMethodNonce!");
		const response = await gateway.customer.create(customerObj);
		if (response.success) {
			const paymentAccountObj = {
				user,
				type: BRAINTREE,
				account: response.customer,
			};
			return await paymentAccountsModel.create(paymentAccountObj);
		} else throw new Error(response?.message);
	}

	/**
	 * Create a transaction
	 * @param {number} amount transaction amount in smaller units of currency
	 * @param {string} customerId braintree customer id
	 * @param {string} paymentMethodNonce nonce token
	 * @param {string} deviceData OPTIONAL
	 * @returns {object} transaction
	 */
	async saleTransaction(parameters) {
		const { amount, customerId, paymentMethodNonce, deviceData } = parameters;
		const transactionObj = {
			amount,
			customerId,
			paymentMethodNonce,
			deviceData,
			options: {
				submitForSettlement: true,
			},
		};
		return await gateway.transaction.sale(transactionObj);
	}

	/**
	 * Get user payment accounts
	 * @param {string} user user id
	 * @returns {[object]} array of paymentAccount
	 */
	async getAllAccounts(parameters) {
		const { user } = parameters;
		const query = {};
		if (user) query.user = user;
		return await paymentAccountsModel.find(query);
	}
}

module.exports = BraintreeManager;
