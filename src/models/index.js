// module imports

// file imports
import admins from "./admins.js";
import conversations from "./conversations.js";
import customers from "./customers.js";
import messages from "./messages.js";
import notifications from "./notifications.js";
import paymentAccounts from "./payment-accounts.js";
import users from "./users.js";
import userTokens from "./user-tokens.js";

export default {
  adminsModel: admins,
  conversationsModel: conversations,
  customersModel: customers,
  messagesModel: messages,
  notificationsModel: notifications,
  paymentAccountsModel: paymentAccounts,
  usersModel: users,
  userTokensModel: userTokens,
};
