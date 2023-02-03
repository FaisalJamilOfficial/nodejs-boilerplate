const braintree = require("braintree");
const {
  NODE_ENV,
  BRAINTREE_MERCHANT_ID,
  BRAINTREE_PUBLIC_KEY,
  BRAINTREE_PRIVATE_KEY,
} = process.env;
const { ENVIRONMENTS } = require("../configs/enums");
const { DEVELOPMENT } = ENVIRONMENTS;
const paymentAccountsController = require("../controllers/paymentAccounts");

const productionGateway = {
  environment: braintree.Environment.Production,
  merchantId: BRAINTREE_MERCHANT_ID,
  publicKey: BRAINTREE_PUBLIC_KEY,
  privateKey: BRAINTREE_PRIVATE_KEY,
};

const sandboxGateway = {
  environment: braintree.Environment.Sandbox,
  merchantId: BRAINTREE_MERCHANT_ID,
  publicKey: BRAINTREE_PUBLIC_KEY,
  privateKey: BRAINTREE_PRIVATE_KEY,
};

const gateway = new braintree.BraintreeGateway(
  NODE_ENV === DEVELOPMENT ? sandboxGateway : productionGateway
  // NODE_ENV === PRODUCTION ? sandboxGateway : productionGateway
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
  async generateClientToken(params) {
    const { customerId } = params;
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
  async createCustomer(params) {
    const {
      firstName,
      lastName,
      email,
      phone,
      creditCard,
      paymentMethodNonce,
    } = params;
    const customerObj = {
      firstName,
      lastName,
      email,
      phone,
      creditCard,
      paymentMethodNonce,
    };
    const response = await gateway.customer.create(customerObj);
    if (response.success) return response;
    else throw new Error(response?.message);
  }

  /**
   * Delete a customer
   * @param {string} customerId braintree customer id
   * @returns {object} customer data
   */
  async deleteCustomer(params) {
    const { customerId } = params;
    return await gateway.customer.delete(customerId);
  }

  /**
   * Create a braintree payment method
   * @param {object} customerId braintree customer id
   * @param {string} paymentMethodNonce nonce token
   * @returns {object} paymentMethod
   */
  async createPaymentMethod(params) {
    const { customerId, paymentMethodNonce } = params;
    const paymentMethodObj = { customerId, paymentMethodNonce };
    const response = await gateway.paymentMethod.create(paymentMethodObj);
    if (response.success) return response;
    else throw new Error(response?.message);
  }

  /**
   * Remove a payment method
   * @param {string} token payment method token
   * @returns {object} payment method data
   */
  async removePaymentMethod(params) {
    const { token } = params;
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
  async saleTransaction(params) {
    const {
      amount,
      customerId,
      paymentMethodNonce,
      paymentMethodToken,
      deviceData,
    } = params;

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
  async adjustTransaction(params) {
    const { transactionId, amount } = params;
    return await gateway.transaction.adjustAuthorization(transactionId, {
      amount,
    });
  }

  /**
   * Adjust authorized transaction
   * @param {string} transactionId braintree transaction id
   * @returns {object} transaction
   */
  async submitTransaction(params) {
    const { transactionId } = params;
    return await gateway.transaction.submitForSettlement(transactionId);
  }

  /**
   * Void a transaction
   * @param {string} transactionId braintree transaction id
   * @returns {object} transaction
   */
  async voidTransaction(params) {
    const { transactionId } = params;
    return await gateway.transaction.void(transactionId);
  }

  /**
   * Hold a transaction
   * @param {string} transactionId braintree transaction id
   * @returns {object} transaction hold data
   */
  async holdTransaction(params) {
    const { transactionId } = params;
    const hold = await gateway.transaction.holdInEscrow(transactionId);
    return hold;
  }

  /**
   * Refund a transaction
   * @param {string} transactionId braintree transaction id
   * @returns {object} transaction refund data
   */
  async refundTransaction(params) {
    const { transactionId } = params;
    return await gateway.transaction.refund(transactionId);
  }

  /**
   * Release a transaction
   * @param {string} transactionId braintree transaction id
   * @returns {object} transaction refund data
   */
  async releaseTransaction(params) {
    const { transactionId } = params;
    return await gateway.transaction.releaseFromEscrow(transactionId);
  }

  /**
   * Get user payment accounts
   * @param {string} user user id
   * @returns {[object]} array of paymentAccount
   */
  async getAllAccounts(params) {
    const { user } = params;
    const query = {};
    if (user) query.user = user;
    return await paymentAccountsController.getPaymentAccounts(query);
  }
}

export default BraintreeManager;
