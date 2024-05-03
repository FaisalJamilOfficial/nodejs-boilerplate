// module imports
import dotenv from "dotenv";

// file imports
import { ENVIRONMENTS } from "../configs/enum.js";

// destructuring assignments
const { PRODUCTION } = ENVIRONMENTS;

dotenv.config();
dotenv.config({
  path:
    process.env.NODE_ENV === PRODUCTION
      ? ".env.production"
      : ".env.development",
});
