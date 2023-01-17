const { STRIPE_SECRET_KEY, STRIPE_ENDPOINT_SECRET } = process.env;

const stripe = require("stripe")(STRIPE_SECRET_KEY);
const CURRENCY = "usd";

const {
  paymentAccountsModel,
  profilesModel,
  usersModel,
} = require("../models");

const { PAYMENT_ACCOUNT_TYPES } = require("../configs/enums");
const { STRIPE_ACCOUNT, STRIPE_CUSTOMER } = PAYMENT_ACCOUNT_TYPES;

class StripeManager {
  constructor() {
    this.stripe = stripe;
  }

  /**
   * Create stripe token
   * @param {string} number card number
   * @param {string} exp_month expiry month
   * @param {string} exp_year expiry year
   * @param {string} cvc card cvc
   * @param {string} name user name
   * @returns {object} stripe token
   */
  async createToken(params) {
    const { number, exp_month, exp_year, cvc, name } = params;
    const card = {};
    if (number) card.number = number;
    else throw new Error("Please enter number!");
    if (typeof exp_month === "number") card.exp_month = exp_month;
    else throw new Error("Please enter exp_month!");
    if (typeof exp_year === "number") card.exp_year = exp_year;
    else throw new Error("Please enter exp_year!");
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
    const chargeObj = { currency: CURRENCY };
    if (amount) chargeObj.amount = amount;
    else throw new Error("Please enter amount!");
    // if (currency) chargeObj.currency = currency;
    // else throw new Error("Please enter currency!");
    if (source) chargeObj.source = source;
    else throw new Error("Please enter source token!");
    if (customer) chargeObj.customer = customer;
    else throw new Error("Please enter customer_id!");
    if (description) chargeObj.description = description;
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
    if (source);
    else throw new Error("Please enter source token!");

    if (cardHolderName);
    else throw new Error("Please enter cardHolderName!");

    const paymentAccountExists = await paymentAccountsModel.exists({ user });
    let userStripeID;

    if (paymentAccountExists)
      userStripeID = paymentAccountExists.account.stripeID;
    else {
      const customerObj = {};
      if (email) customerObj.email = email;
      if (phone) customerObj.phone = phone;
      const customer = await stripe.customers.create(customerObj);
      if (customer) userStripeID = customer.id;
      else throw new Error("Stripe customer creation failed!");
    }
    const card = await stripe.customers.createSource(userStripeID, {
      source,
    });

    if (card) {
      card.cardHolderName = cardHolderName;
      const paymentAccountObj = {
        user,
        type: STRIPE_CUSTOMER,
        account: card,
      };
      const paymentAccount = await paymentAccountsModel.create(
        paymentAccountObj
      );

      return paymentAccount;
    } else throw new Error("Stripe source creation failed!");
  }

  /**
   * Create stripe express account with account existence check
   * @param {string} user user id
   * @param {string} email user email address
   * @returns {object} paymentAccount
   */
  async createAccountWithCheck(params) {
    const { user, email } = params;
    const paymentAccountExists = await paymentAccountsModel.findOne({
      user,
    });

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
        const paymentAccount = await paymentAccountsModel.create(
          paymentAccountObj
        );
        await profilesModel.updateOne(
          { user },
          { paymentAccount, isStripeConnected: true }
        );
        return paymentAccount;
      } else throw new Error("Stripe account creation failed!");
    }
  }

  /**
   * Create stripe account sign up link
   * @param {string} account stripe account id
   * @param {string} refresh_url redirect url for link expiration or invalidity
   * @param {string} return_url redirect url for completion or incompletion linked flow
   * @returns {object} stripe account link
   */
  async createAccountLink(params) {
    const { account, refresh_url, return_url } = params;
    const accountLinkObj = {
      account,
      refresh_url, // "https://example.com/reauth"
      return_url, // "https://example.com/return"
      type: "account_onboarding",
    };
    return await stripe.accountLinks.create(accountLinkObj);
  }

  /**
   * Create stripe topup
   * @param {string} amount topup amount in smaller units of currency
   * @param {string} currency amount currency e.g "usd"
   * @param {string} description OPTIONAL topup description
   * @param {string} statement_descriptor OPTIONAL statement description e.g "Top-up"
   * @returns {object} stripe topup response
   */
  async createTopup(params) {
    const { amount, currency, description, statement_descriptor } = params;
    const topupObj = {
      amount,
      currency: CURRENCY,
      description,
      statement_descriptor,
    };
    return await stripe.topups.create(topupObj);
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
    const paymentAccountExists = await paymentAccountsModel.findOne({ user });
    const transferObj = {
      amount,
      currency: CURRENCY,
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

    if (event.type === "account.external_account.created") {
      const paymentAccountExists = await paymentAccountsModel.findOne({
        "account.id": account,
      });
      await usersModel.updateOne(
        { _id: paymentAccountExists.user },
        { isStripeConnected: true }
      );
    }
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
    return await paymentAccountsModel.find(query);
  }
}

exports.constructWebhooksEvent = async (req, res, next) => {
  try {
    const endpointSecret = STRIPE_ENDPOINT_SECRET;
    const signature = req.headers["stripe-signature"];

    const args = { rawBody: req.body, signature, endpointSecret };
    const event = await new StripeManager().constructWebhooksEvent(args);

    console.log("EVENT TYPE: ", JSON.stringify(event.type));
    if (event.type === "account.external_account.created") {
      const paymentAccountExists = await paymentAccountsModel.findOne({
        "account.id": req.body.account,
      });
      await usersModel.updateOne(
        { _id: paymentAccountExists.user },
        { isStripeAccountCreated: true }
      );
    }
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

module.exports = StripeManager;
