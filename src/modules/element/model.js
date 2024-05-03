// module imports
import { model, Schema } from "mongoose";

// variable initializations

const elementSchema = new Schema(
  { title: { type: String } },
  { timestamps: true }
);

export default model("elements", elementSchema);
