const { NODE_ENV } = process.env;

import braintree from "braintree";

const productionGateway = {
	environment: braintree.Environment.Production,
	merchantId: "37d84f7x8np77x9q",
	publicKey: "nt56w7rcpcfjrkmm",
	privateKey: "6394cbe67f5c109b994ef8d4efe2bce5",
};

const sandboxGateway = {
	environment: braintree.Environment.Sandbox,
	merchantId: "kc6ts5mqdvkqgfgd",
	publicKey: "dfppgvm93g3zgxn2",
	privateKey: "f4558961135ce218902f706788d54214",
};

const gateway = new braintree.BraintreeGateway(
	NODE_ENV === "development" ? sandboxGateway : productionGateway
	// NODE_ENV === "production" ? sandboxGateway : productionGateway
);

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
	 * @param {string} firstName first name
	 * @param {string} lastName last name
	 * @param {string} email email address
	 * @param {string} phone phone number
	 * @param {object} creditCard credit card data
	 * @param {string} paymentMethodNonce nonce token
	 * @returns {object} paymentAccount
	 */
	async createCustomer(parameters) {
		const {
			firstName,
			lastName,
			email,
			phone,
			creditCard,
			paymentMethodNonce,
		} = parameters;
		const customerObj = {};
		if (paymentMethodNonce) customerObj.paymentMethodNonce = paymentMethodNonce;
		else throw new Error("Please enter paymentMethodNonce!");
		if (firstName) customerObj.firstName = firstName;
		if (lastName) customerObj.lastName = lastName;
		if (email) customerObj.email = email;
		if (phone) customerObj.phone = phone;
		if (creditCard) customerObj.creditCard = creditCard;
		const response = await gateway.customer.create(customerObj);
		if (response.success) {
			return response;
		} else throw new Error(response?.message);
	}

	/**
	 * Delete a customer
	 * @param {string} customerId braintree customer id
	 * @returns {object} customer data
	 */
	async deleteCustomer(parameters) {
		const { customerId } = parameters;
		return await gateway.customer.delete(customerId);
	}

	/**
	 * Create a braintree payment method
	 * @param {object} customerId braintree customer id
	 * @param {string} paymentMethodNonce nonce token
	 * @returns {object} paymentMethod
	 */
	async createPaymentMethod(parameters) {
		const { customerId, paymentMethodNonce } = parameters;
		const paymentMethodObj = {};
		if (paymentMethodNonce)
			paymentMethodObj.paymentMethodNonce = paymentMethodNonce;
		else throw new Error("Please enter paymentMethodNonce!");
		if (customerId) paymentMethodObj.customerId = customerId;
		const response = await gateway.paymentMethod.create(paymentMethodObj);
		if (response.success) {
			return response;
		} else throw new Error(response?.message);
	}

	/**
	 * Remove a payment method
	 * @param {string} token payment method token
	 * @returns {object} payment method data
	 */
	async removePaymentMethod(parameters) {
		const { token } = parameters;
		return await gateway.paymentMethod.delete(token);
	}

	/**
	 * Create a transaction
	 * @param {number} amount transaction amount in smaller units of currency
	 * @param {string} customerId braintree customer id
	 * @param {string} paymentMethodNonce nonce token
	 * @param {string} paymentMethodToken method token
	 * @param {string} deviceData OPTIONAL device data
	 * @returns {object} transaction
	 */
	async saleTransaction(parameters) {
		const {
			amount,
			customerId,
			paymentMethodNonce,
			paymentMethodToken,
			deviceData,
		} = parameters;

		const transactionObj = {
			amount: Number(amount).toFixed(2),
			customerId,
			paymentMethodToken,
			paymentMethodNonce,
			deviceData,
			options: {
				submitForSettlement: false,
			},
		};
		return await gateway.transaction.sale(transactionObj);
	}

	/**
	 * Submit transaction for settlement
	 * @param {string} transactionId braintree transaction id
	 * @param {number} amount transaction amount in smaller units of currency
	 * @returns {object} transaction
	 */
	async adjustTransaction(parameters) {
		const { transactionId, amount } = parameters;
		return await gateway.transaction.adjustAuthorization(transactionId, {
			amount,
		});
	}

	/**
	 * Adjust authorized transaction
	 * @param {string} transactionId braintree transaction id
	 * @returns {object} transaction
	 */
	async submitTransaction(parameters) {
		const { transactionId } = parameters;
		return await gateway.transaction.submitForSettlement(transactionId);
	}

	/**
	 * Void a transaction
	 * @param {string} transactionId braintree transaction id
	 * @returns {object} transaction
	 */
	async voidTransaction(parameters) {
		const { transactionId } = parameters;
		return await gateway.transaction.void(transactionId);
	}

	/**
	 * Hold a transaction
	 * @param {string} transactionId braintree transaction id
	 * @returns {object} transaction hold data
	 */
	async holdTransaction(parameters) {
		const { transactionId } = parameters;
		const hold = await gateway.transaction.holdInEscrow(transactionId);
		return hold;
	}

	/**
	 * Refund a transaction
	 * @param {string} transactionId braintree transaction id
	 * @returns {object} transaction refund data
	 */
	async refundTransaction(parameters) {
		const { transactionId } = parameters;
		return await gateway.transaction.refund(transactionId);
	}

	/**
	 * Release a transaction
	 * @param {string} transactionId braintree transaction id
	 * @returns {object} transaction refund data
	 */
	async releaseTransaction(parameters) {
		const { transactionId } = parameters;
		return await gateway.transaction.releaseFromEscrow(transactionId);
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

export default BraintreeManager;
