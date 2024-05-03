// module imports
import { model, Schema } from "mongoose";

// file imports
import {
  NOTIFICATION_TYPES,
  NOTIFICATION_STATUSES,
} from "../../configs/enum.js";

// destructuring assignments
const { UNREAD } = NOTIFICATION_STATUSES;

// variable initializations

const notificationSchema = new Schema(
  {
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPES),
      required: true,
      index: true,
    },
    text: {
      type: String,
      default: "",
    },
    message: {
      type: Schema.Types.ObjectId,
      ref: "messages",
      index: true,
    },
    messenger: {
      type: Schema.Types.ObjectId,
      ref: "users",
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(NOTIFICATION_STATUSES),
      default: UNREAD,
    },
  },
  {
    timestamps: true,
  }
);

export default model("notifications", notificationSchema);
