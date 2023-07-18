// module imports
import _stripe from "stripe";

// file imports
import * as paymentAccountsController from "../controllers/payment-accounts.js";
import * as usersController from "../controllers/users.js";
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

    const paymentAccountExists =
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
    const paymentAccount = await paymentAccountsController.addPaymentAccount(
      paymentAccountObj
    );
    return paymentAccount;
  }

  /**
   * @description Create stripe customer
   * @param {String} id OPTIONAL user id
   * @param {String} email OPTIONAL user email address
   * @param {String} phone OPTIONAL user phone number
   * @returns {Object} stripe customer data
   */
  async createCustomer(params) {
    const { id, email, phone } = params;
    const customerObj = { id, email, phone };
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
    const paymentAccountExists =
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

      const paymentAccount = await paymentAccountsController.addPaymentAccount(
        paymentAccountObj
      );
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
  async createAccountLink(parameters) {
    const { account, refreshURL, returnURL, email, user } = parameters;

    const paymentAccountExists =
      await paymentAccountsController.getPaymentAccount({ user });

    let accountObj;
    if (paymentAccountExists) accountObj = paymentAccountExists.account;
    else {
      accountObj = await stripe.accounts.create({
        type: "custom",
        country: "US",
        email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
      const paymentAccountObj = {
        user,
        account: accountObj,
        type: STRIPE_CUSTOMER,
      };
      await paymentAccountsController.addPaymentAccount(paymentAccountObj);
    }
    const accountLinkObj = {
      account: account ?? accountObj.id,
      refresh_url: refreshURL ?? "https://app.page.link/stripefailed",
      return_url: returnURL ?? "https://app.page.link/stripesuccess",
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
    const paymentAccountExists =
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
   * Create stripe payment intent
   * @param {String} customer customer id
   * @param {String} amount payment amount
   * @param {String} currency payment currency
   * @param {[String]} payment_method_types payment method types
   * @returns {Object} stripe payment intent object
   */
  async createPaymentIntent(params) {
    const { amount, currency, paymentMethodTypes, customer, paymentMethod } =
      params;
    const paymentIntentObj = {
      amount: amount * 100,
      currency: currency ?? "usd",
      // confirmation_method: "manual",
      capture_method: "manual",
      setup_future_usage: "on_session",
      customer,
    };
    if (paymentMethod) {
      paymentIntentObj.payment_method = paymentMethod;
      paymentIntentObj.confirm = true;
      paymentIntentObj.off_session = true;
    }
    if (paymentMethodTypes)
      paymentIntentObj.payment_method_types = paymentMethodTypes;
    return await stripe.paymentIntents.create(paymentIntentObj);
  }

  /**
   * Capture payment intent
   * @param {String} paymentIntent payment intent id
   * @param {String} amount payment amount
   * @returns {Object} capture payment intent object
   */
  async capturePaymentIntent(params) {
    const { paymentIntent, amount } = params;
    const paymentIntentObj = {
      amount_to_capture: amount * 100,
    };
    return await stripe.paymentIntents.capture(paymentIntent, paymentIntentObj);
  }

  /**
   * Cancel payment intent
   * @param {String} paymentIntent payment intent id
   * @returns {Object} cancel payment intent object
   */
  async cancelPaymentIntent(params) {
    const { paymentIntent } = params;
    return await stripe.paymentIntents.cancel(paymentIntent);
  }

  /**
   * Refund payment intent
   * @param {String} paymentIntent payment intent id
   * @returns {Object} refund payment intent object
   */
  async refundPaymentIntent(params) {
    const { paymentIntent } = params;
    return await stripe.refunds.create({ payment_intent: paymentIntent });
  }

  /**
   * Get customer sources
   * @param {String} customer customer id
   * @returns {[object]} stripe customer sources
   */
  async getCustomerSources(params) {
    const { customer, limit, startingAfter, endingBefore } = params;
    return await stripe.paymentMethods.list({
      customer,
      type: "card",
      limit,
      starting_after: startingAfter,
      ending_before: endingBefore,
    });
  }

  /**
   * @description Construct stripe webhook event
   * @param {String} rawBody body from stripe request
   * @param {String} signature stripe signature from request headers
   * @param {String} endpointSecret stripe CLI webhook secret
   * @returns {Object} stripe webhook event
   */
  async constructWebhooksEvent(parameters) {
    const { rawBody, signature } = parameters;

    const rawBodyString = JSON.stringify(rawBody, null, 2);

    const header = stripe.webhooks.generateTestHeaderString({
      payload: rawBodyString,
      secret: STRIPE_ENDPOINT_SECRET,
    });

    const event = stripe.webhooks.constructEvent(
      rawBodyString,
      signature ?? header,
      STRIPE_ENDPOINT_SECRET
    );

    if (event.type === "account.external_account.created") {
      console.log("EVENT: ", JSON.stringify(event));

      const paymentAccountExists =
        await paymentAccountsController.getPaymentAccount({
          key: "account.id",
          value: rawBody.account,
        });
      await usersController.updateUser({
        user: paymentAccountExists.user,
        isStripeConnected: true,
      });
    }
    return event;
  }
}

export const constructWebhooksEvent = async (params) => {
  const { request } = params;
  const signature = request.headers["stripe-signature"];
  console.log("SIGNATURE: ", JSON.stringify(signature));

  const args = { rawBody: request.body };

  const event = await new StripeManager().constructWebhooksEvent(args);

  return {
    message: "Done",
    event,
  };
};

export default StripeManager;
