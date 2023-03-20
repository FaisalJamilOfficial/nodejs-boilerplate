// module imports
import mongoose from "mongoose";

// file imports
import { PAYMENT_ACCOUNT_TYPES } from "../configs/enums.js";

// destructuring assignments
const { BRAINTREE, STRIPE_ACCOUNT, STRIPE_CUSTOMER } = PAYMENT_ACCOUNT_TYPES;

// variable initializations
const Schema = mongoose.Schema;
const model = mongoose.model;

const paymentAccountSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    account: {
      type: Object,
      required: true,
    },
    type: {
      type: String,
      enum: [BRAINTREE, STRIPE_ACCOUNT, STRIPE_CUSTOMER],
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model("paymentAccounts", paymentAccountSchema);
