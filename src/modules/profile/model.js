// module imports
import { model, Schema } from "mongoose";

// variable initializations

const customerSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model("customers", customerSchema);
