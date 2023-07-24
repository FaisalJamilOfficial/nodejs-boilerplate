// module imports
import mongoose from "mongoose";

// file imports
import { NOTIFICATION_TYPES, NOTIFICATION_STATUSES } from "../configs/enums.js";

// destructuring assignments
const { NEW_MESSAGE, NEW_CONVERSATION } = NOTIFICATION_TYPES;
const { UNREAD, READ } = NOTIFICATION_STATUSES;

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
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: [READ, UNREAD],
      default: UNREAD,
    },
  },
  {
    timestamps: true,
  }
);

export default model("notifications", notificationSchema);
