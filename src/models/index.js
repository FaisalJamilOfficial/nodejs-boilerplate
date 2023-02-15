// module imports
import { clearCachedResultsForModel } from "speedgoose";

// file imports
import admins from "./admins.js";
import conversations from "./conversations.js";
import customers from "./customers.js";
import messages from "./messages.js";
import notifications from "./notifications.js";
import paymentAccounts from "./payment-accounts.js";
import users from "./users.js";
import userTokens from "./user-tokens.js";

const models = {
  adminsModel: admins,
  conversationsModel: conversations,
  customersModel: customers,
  messagesModel: messages,
  notificationsModel: notifications,
  paymentAccountsModel: paymentAccounts,
  usersModel: users,
  userTokensModel: userTokens,
};

function clearModelCacheWhenChanged(model) {
  model.watch().on("change", () => {
    clearCachedResultsForModel(model.modelName);
    console.log(`=> Cache cleared for model <${model.modelName}>`);
  });
}

Object.values(models).forEach((element) => clearModelCacheWhenChanged(element));

export default models;
