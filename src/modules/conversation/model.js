// module imports
import { model, Schema } from "mongoose";

// file imports
import { CONVERSATION_STATUSES } from "../../configs/enum.js";

// destructuring assignments
const { PENDING } = CONVERSATION_STATUSES;

// variable initializations

const conversationSchema = new Schema(
  {
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
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "messages",
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(CONVERSATION_STATUSES),
      default: PENDING,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

export default model("conversations", conversationSchema);
