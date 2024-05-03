// module imports
import { model, Schema } from "mongoose";

// variable initializations

const userTokenSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true,
    ref: "users",
  },
  token: {
    type: String,
    required: true,
  },
  expireAt: {
    type: Date,
    default: null,
  },
});

userTokenSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

export default model("userTokens", userTokenSchema);
