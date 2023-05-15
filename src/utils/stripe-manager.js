// module imports
import _stripe from "stripe";

// file imports
import * as paymentAccountsController from "../controllers/paymentAccounts.js";
import { PAYMENT_ACCOUNT_TYPES } from "../configs/enums.js";

// destructuring assignments
const { STRIPE_SECRET_KEY, STRIPE_ENDPOINT_SECRET } = process.env;
const { STRIPE_ACCOUNT, STRIPE_CUSTOMER } = PAYMENT_ACCOUNT_TYPES;

// variable initializations
const stripe = _stripe(STRIPE_SECRET_KEY);
const CURRENCY = "usd";

class StripeManager {
  constructor() {
    this.stripe = stripe;
  }

  /**
   * @description Create stripe token
   * @param {String} number card number
   * @param {String} expMonth expiry month
   * @param {String} expYear expiry year
   * @param {String} cvc card cvc
   * @param {String} name user name
   * @returns {Object} stripe token
   */
  async createToken(params) {
    const { number, expMonth, expYear, cvc, name } = params;
    const card = {};
    if (number) card.number = number;
    if (typeof expMonth === "number") card.expMonth = expMonth;
    if (typeof expYear === "number") card.expYear = expYear;
    if (cvc) card.cvc = cvc;
    if (name) card.name = name;
    return await stripe.tokens.create({ card });
  }

  /**
   * @description Delete stripe customer
   * @param {String} customerId stripe customer id
   * @returns {Object} stripe customer deletion response
   */
  async deleteCustomer(params) {
    const { customerId } = params;
    if (customerId);
    return await stripe.customers.del(customerId);
  }

  /**
   * @description Refund stripe charge
   * @param {String} charge stripe charge id
   * @returns {Object} stripe charge refund response
   */
  async createRefund(params) {
    const { charge } = params;
    const refundObj = {};
    if (charge) refundObj.charge = charge;
    return await stripe.refunds.create(refundObj);
  }

  /**
   * @description Create stripe charge
   * @param {String} customer stripe customer id
   * @param {String} amount charge amount in currency smallest unit
   * @param {String} currency amount currency e.g "usd"
   * @param {String} source stripe source token
   * @param {String} description charge description
   * @returns {Object} stripe charge response
   */
  async createCharge(params) {
    const { customer, amount, currency, source, description } = params;
    const chargeObj = {
      currency: currency ?? CURRENCY,
      customer,
      amount,
      source,
      description,
    };

    return await stripe.charges.create(chargeObj);
  }

  /**
   * @description Create stripe customer source with customer existence check
   * @param {String} source stripe source token
   * @param {String} cardHolderName user card title
   * @param {String} user user id
   * @param {String} email OPTIONAL user email address
   * @returns {Object} paymentAccount
   */
  async createCustomerSourceWithCheck(params) {
    const { source, cardHolderName, user, email, phone } = params;

    const { data: paymentAccountExists } =
      await paymentAccountsController.getPaymentAccount({ user });

    let userStripeId;

    if (paymentAccountExists)
      userStripeId = paymentAccountExists.account.stripeId;
    else {
      const customerObj = {};
      if (email) customerObj.email = email;
      if (phone) customerObj.phone = phone;
      const customer = await stripe.customers.create(customerObj);
      userStripeId = customer?.id;
    }
    const card = await stripe.customers.createSource(userStripeId, {
      source,
    });

    card.cardHolderName = cardHolderName;
    const paymentAccountObj = {
      user,
      type: STRIPE_CUSTOMER,
      account: card,
    };
    const { data: paymentAccount } =
      await paymentAccountsController.addPaymentAccount(paymentAccountObj);
    return paymentAccount;
  }

  /**
   * @description Create stripe customer
   * @param {String} user OPTIONAL user id
   * @param {String} email OPTIONAL user email address
   * @param {String} phone OPTIONAL user phone number
   * @returns {Object} stripe customer data
   */
  async createCustomer(params) {
    const { user, email, phone } = params;
    const customerObj = { user, email, phone };
    return await stripe.customers.create(customerObj);
  }

  /**
   * @description Create stripe express account with account existence check
   * @param {String} user user id
   * @param {String} email user email address
   * @returns {Object} paymentAccount
   */
  async createAccountWithCheck(params) {
    const { user, email } = params;
    const { data: paymentAccountExists } =
      await paymentAccountsController.getPaymentAccount({ user });

    if (paymentAccountExists) return paymentAccountExists;
    else {
      const account = await stripe.accounts.create({
        email,
        type: "express",
        capabilities: {
          card_payments: {
            requested: true,
          },
          transfers: {
            requested: true,
          },
        },
      });
      const paymentAccountObj = {
        user,
        type: STRIPE_ACCOUNT,
        account,
      };

      const { data: paymentAccount } =
        await paymentAccountsController.addPaymentAccount(paymentAccountObj);
      return paymentAccount;
    }
  }

  /**
   * @description Create stripe account sign up link
   * @param {String} account stripe account id
   * @param {String} refreshUrl redirect url for link expiration or invalidity
   * @param {String} returnUrl redirect url for completion or incompletion linked flow
   * @returns {Object} stripe account link
   */
  async createAccountLink(params) {
    const { account, refreshUrl, returnUrl } = params;
    const accountLinkObj = {
      account,
      refreshUrl, // "https://example.com/reauth"
      returnUrl, // "https://example.com/return"
      type: "account_onboarding",
    };
    return await stripe.accountLinks.create(accountLinkObj);
  }

  /**
   * @description Create stripe topUp
   * @param {String} amount topUp amount in smaller units of currency
   * @param {String} currency amount currency e.g "usd"
   * @param {String} description OPTIONAL topUp description
   * @param {String} statementDescriptor OPTIONAL statement description e.g "Top-up"
   * @returns {Object} stripe topUp response
   */
  async createTopUp(params) {
    const { amount, currency, description, statementDescriptor } = params;
    const topUpObj = {
      amount,
      currency: currency ?? CURRENCY,
      description,
      statementDescriptor,
    };
    return await stripe.topUps.create(topUpObj);
  }

  /**
   * @description Create stripe transfer
   * @param {String} user user id
   * @param {String} amount transfer amount in smaller units of currency
   * @param {String} currency amount currency e.g "usd"
   * @param {String} destination destination stripe account
   * @param {String} description OPTIONAL transfer description
   * @returns {Object} stripe transfer response
   */
  async createTransfer(params) {
    const { user, amount, currency, description } = params;
    const { data: paymentAccountExists } =
      await paymentAccountsController.getPaymentAccount({ user });
    const transferObj = {
      amount,
      currency: currency ?? CURRENCY,
      destination: paymentAccountExists?.account?._id,
      description,
    };
    if (paymentAccountExists)
      transferObj.destination = paymentAccountExists.account.id;

    return await stripe.transfers.create(transferObj);
  }

  /**
   * @description Construct stripe webhook event
   * @param {String} rawBody body from stripe request
   * @param {String} signature stripe signature from request headers
   * @param {String} endpointSecret stripe CLI webhook secret
   * @returns {Object} stripe webhook event
   */
  async constructWebhooksEvent(params) {
    const { rawBody, signature, account } = params;
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      STRIPE_ENDPOINT_SECRET
    );

    if (event.type === "account.external_account.created")
      // const { data: paymentAccountExists } =
      await paymentAccountsController.getPaymentAccount({
        key: "account.id",
        value: account,
      });

    return event;
  }
}

exports.constructWebhooksEvent = async (req, res, next) => {
  try {
    const endpointSecret = STRIPE_ENDPOINT_SECRET;
    const signature = req.headers["stripe-signature"];

    const args = { rawBody: req.body, signature, endpointSecret };
    const event = await new StripeManager().constructWebhooksEvent(args);

    console.log("EVENT TYPE: ", JSON.stringify(event.type));
    if (event.type === "account.external_account.created")
      // const { data: paymentAccountExists } =
      await paymentAccountsController.getPaymentAccount({
        key: "account.id",
        value: req?.body?.account,
      });
    return res.status(200).send({
      success: true,
      message: "Done",
      event,
    });
  } catch (error) {
    console.log(JSON.stringify(error));
    next(error);
  }
};

export default StripeManager;
