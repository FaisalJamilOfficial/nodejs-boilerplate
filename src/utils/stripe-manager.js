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
   * Create stripe token
   * @param {string} number card number
   * @param {string} expMonth expiry month
   * @param {string} expYear expiry year
   * @param {string} cvc card cvc
   * @param {string} name user name
   * @returns {object} stripe token
   */
  async createToken(params) {
    const { number, expMonth, expYear, cvc, name } = params;
    const card = {};
    if (number) card.number = number;
    else throw new Error("Please enter number!");
    if (typeof expMonth === "number") card.expMonth = expMonth;
    else throw new Error("Please enter expMonth!");
    if (typeof expYear === "number") card.expYear = expYear;
    else throw new Error("Please enter expYear!");
    if (cvc) card.cvc = cvc;
    else throw new Error("Please enter cvc!");
    if (name) card.name = name;
    else throw new Error("Please enter name!");
    return await stripe.tokens.create({ card });
  }

  /**
   * Delete stripe customer
   * @param {string} customerId stripe customer id
   * @returns {object} stripe customer deletion response
   */
  async deleteCustomer(params) {
    const { customerId } = params;
    if (customerId);
    else throw new Error("Please enter customerId!");
    return await stripe.customers.del(customerId);
  }

  /**
   * Refund stripe charge
   * @param {string} charge stripe charge id
   * @returns {object} stripe charge refund response
   */
  async createRefund(params) {
    const { charge } = params;
    const refundObj = {};
    if (charge) refundObj.charge = charge;
    else throw new Error("Please enter charge id!");
    return await stripe.refunds.create(refundObj);
  }

  /**
   * Create stripe charge
   * @param {string} customer stripe customer id
   * @param {string} amount charge amount in currency smallest unit
   * @param {string} currency amount currency e.g "usd"
   * @param {string} source stripe source token
   * @param {string} description charge description
   * @returns {object} stripe charge response
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
   * Create stripe customer source with customer existence check
   * @param {string} source stripe source token
   * @param {string} cardHolderName user card title
   * @param {string} user user id
   * @param {string} email OPTIONAL user email address
   * @returns {object} paymentAccount
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
      if (customer) userStripeId = customer.id;
      else throw new Error("Stripe customer creation failed!");
    }
    const card = await stripe.customers.createSource(userStripeId, {
      source,
    });

    if (card) {
      card.cardHolderName = cardHolderName;
      const paymentAccountObj = {
        user,
        type: STRIPE_CUSTOMER,
        account: card,
      };
      const { data: paymentAccount } =
        await paymentAccountsController.addPaymentAccount(paymentAccountObj);
      return paymentAccount;
    } else throw new Error("Stripe source creation failed!");
  }

  /**
   * Create stripe customer
   * @param {string} user OPTIONAL user id
   * @param {string} email OPTIONAL user email address
   * @param {string} phone OPTIONAL user phone number
   * @returns {object} stripe customer data
   */
  async createCustomer(params) {
    const { user, email, phone } = params;
    const customerObj = { user, email, phone };
    return await stripe.customers.create(customerObj);
  }

  /**
   * Create stripe express account with account existence check
   * @param {string} user user id
   * @param {string} email user email address
   * @returns {object} paymentAccount
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
      if (account) {
        const paymentAccountObj = {
          user,
          type: STRIPE_ACCOUNT,
          account,
        };

        const { data: paymentAccount } =
          await paymentAccountsController.addPaymentAccount(paymentAccountObj);
        return paymentAccount;
      } else throw new Error("Stripe account creation failed!");
    }
  }

  /**
   * Create stripe account sign up link
   * @param {string} account stripe account id
   * @param {string} refreshUrl redirect url for link expiration or invalidity
   * @param {string} returnUrl redirect url for completion or incompletion linked flow
   * @returns {object} stripe account link
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
   * Create stripe topUp
   * @param {string} amount topUp amount in smaller units of currency
   * @param {string} currency amount currency e.g "usd"
   * @param {string} description OPTIONAL topUp description
   * @param {string} statementDescriptor OPTIONAL statement description e.g "Top-up"
   * @returns {object} stripe topUp response
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
   * Create stripe transfer
   * @param {string} user user id
   * @param {string} amount transfer amount in smaller units of currency
   * @param {string} currency amount currency e.g "usd"
   * @param {string} destination destination stripe account
   * @param {string} description OPTIONAL transfer description
   * @returns {object} stripe transfer response
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
   * Construct stripe webhook event
   * @param {string} rawBody body from stripe request
   * @param {string} signature stripe signature from request headers
   * @param {string} endpointSecret stripe CLI webhook secret
   * @returns {object} stripe webhook event
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
