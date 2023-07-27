// module imports
import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

// file imports
import { ENVIRONMENTS } from "../configs/enums.js";

// destructuring assignments
const { NODE_ENV, PLAID_CLIENT_ID, PLAID_SECRET } = process.env;
const { PRODUCTION } = ENVIRONMENTS;

// variable initializations
const configuration = new Configuration({
  basePath:
    NODE_ENV === PRODUCTION
      ? PlaidEnvironments.production
      : PlaidEnvironments.development,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": PLAID_CLIENT_ID,
      "PLAID-SECRET": PLAID_SECRET,
    },
  },
});

const client = new PlaidApi(configuration);

class PlaidManager {
  constructor() {
    this.client = client;
  }

  /**
   * Generate a link token
   * @param {string} clientUserId client user id
   * @param {string} clientName client name
   * @param {[string]} products products
   * @param {string} language language
   * @param {string} webhook webhook URL
   * @param {string} redirectURI redirect URI
   * @param {[string]} countryCodes country codes
   * @returns {object} link token
   */
  async generateLinkToken(parameters) {
    const {
      clientUserId,
      clientName,
      products,
      language,
      webhook,
      redirectURI,
      countryCodes,
    } = parameters;
    const request = {
      user: {
        // This should correspond to a unique id for the current user.
        client_user_id: clientUserId,
      },
      client_name: clientName ?? "Plaid Test App",
      products: products ?? ["transactions"],
      language: language ?? "en",
      webhook: webhook ?? "https://app.com/plaid/webhook",
      redirect_uri: redirectURI ?? "https://app.page.link/plaid",
      country_codes: countryCodes ?? ["US"],
    };
    return await client.linkTokenCreate(request);
  }

  /**
   * Exchange public token
   * @param {string} publicToken public token
   * @returns {object} link token
   */
  async exchangePublicToken(parameters) {
    const { publicToken } = parameters;
    const linkTokenObj = { public_token: publicToken };
    return await client.itemPublicTokenExchange(linkTokenObj);
  }

  /**
   * Create processor token
   * @param {string} token public token
   * @returns {object} link token
   */
  async createProcessorToken(parameters) {
    const { accessToken, accountID, processor } = parameters;
    const request = {
      access_token: accessToken,
      account_id: accountID,
      processor: processor ?? "alpaca",
    };
    return await client.processorTokenCreate(request);
  }
}

export default PlaidManager;
