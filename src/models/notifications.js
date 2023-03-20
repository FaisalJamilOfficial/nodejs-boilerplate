// module imports
import mongoose from "mongoose";

// file imports
import { NOTIFICATION_TYPES } from "../configs/enums.js";

// destructuring assignments
const { NEW_MESSAGE, NEW_CONVERSATION } = NOTIFICATION_TYPES;

// variable initializations
const Schema = mongoose.Schema;
const model = mongoose.model;

const notificationSchema = new Schema(
  {
    type: {
      type: String,
      enum: [NEW_MESSAGE, NEW_CONVERSATION],
      required: true,
      index: true,
    },

    text: {
      type: String,
      default: "",
    },
    message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "messages",
      index: true,
    },
    messenger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model("notifications", notificationSchema);
