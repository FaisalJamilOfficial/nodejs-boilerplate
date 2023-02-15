// module imports
import mongoose from "mongoose";

// variable initializations
const Schema = mongoose.Schema;

const customers = new Schema(
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

export default mongoose.model("customers", customers);
