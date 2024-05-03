// module imports
import { model, Schema } from "mongoose";

// file imports
import { MESSAGE_STATUSES } from "../../configs/enum.js  ";

// destructuring assignments
const { UNREAD } = MESSAGE_STATUSES;

// variable initializations

const attachmentSchema = new Schema({
  path: { type: String, required: true },
  type: { type: String, required: true },
});

const messageSchema = new Schema(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "conversations",
      required: true,
      index: true,
    },
    userTo: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    userFrom: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    text: {
      type: String,
      trim: true,
    },
    attachments: [attachmentSchema],
    status: {
      type: String,
      enum: Object.values(MESSAGE_STATUSES),
      default: UNREAD,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

export default model("messages", messageSchema);
