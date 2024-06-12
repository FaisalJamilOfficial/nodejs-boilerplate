// module imports
import { model, Schema } from "mongoose";

// file imports
import { PAYMENT_ACCOUNT_TYPES } from "../../configs/enum.js";

// destructuring assignments

// variable initializations

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
      enum: Object.values(PAYMENT_ACCOUNT_TYPES),
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model("payment_accounts", paymentAccountSchema);
